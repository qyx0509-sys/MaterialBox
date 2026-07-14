#!/usr/bin/env python3
"""Migrate the legacy MaterialBox catalogue to the variable-depth V2 model.

The migration is idempotent: existing IDs are retained, existing reviewed content
is not deleted, and seed records are only inserted when their IDs are absent.
Run this script before sync_materials_data.py when applying the V2 seed catalogue.
"""

from __future__ import annotations

import argparse
import json
from copy import deepcopy
from pathlib import Path

from catalog_v2_seed import (
    COLLECTION_SPECS,
    EXISTING_PATH_OVERRIDES,
    EXISTING_RELATIONS,
    ID_ALIASES,
    build_seed_records,
)


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MATERIALS_PATH = PROJECT_ROOT / "materials.json"
COLLECTIONS_PATH = PROJECT_ROOT / "collections.json"
UNKNOWN = "暂无可靠数据"
DISCLAIMER = "材料参数会因牌号、加工状态、测试标准和温度发生变化，本网站数据用于学习和初步选材，不替代正式材料标准或供应商数据表。"
ENGINEERING_FIELDS = (
    "density",
    "melting_point",
    "service_temperature",
    "tensile_strength",
    "elastic_modulus",
    "thermal_conductivity",
    "electrical_resistivity",
    "hardness",
    "hardness_condition",
    "corrosion_resistance",
    "cost_level",
)

FAMILY_IDS = {
    "steel", "cast_iron", "aluminum_alloy", "magnesium_alloy", "titanium_alloy", "copper_alloy", "nickel_alloy",
    "polyethylene", "polypropylene", "polystyrene", "polyamide", "polycarbonate", "pom", "pet", "pbt", "peek",
    "polyimide", "pps", "ptfe", "lcp", "epoxy_resin", "refractory", "wood", "paper",
}
SUBFAMILY_IDS = {"stainless_steel", "tool_steel", "high_speed_steel", "nickel_superalloy", "cobalt_superalloy"}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def unique_list(values):
    output = []
    for value in values or []:
        if value in (None, "") or value in output:
            continue
        output.append(value)
    return output


def path_categories(path):
    return (
        path[0] if path else "未分类",
        path[1] if len(path) > 1 else "未分类",
        path[2] if len(path) > 2 else (path[-1] if path else "未分类"),
    )


def entity_type_for_existing(material):
    item_id = material["id"]
    if item_id in EXISTING_RELATIONS:
        return EXISTING_RELATIONS[item_id][2]
    if item_id in FAMILY_IDS:
        return "family"
    if item_id in SUBFAMILY_IDS:
        return "subfamily"
    return material.get("entity_type") or "material"


def description_for_seed(seed, parent_name):
    kind = seed["entity_type"]
    name = seed["name_cn"]
    if kind == "family":
        return f"{name}是材料分类树中的材料家族，用于组织相关子体系、具体材料、牌号和产品形态。"
    if kind == "subfamily":
        return f"{name}是{parent_name or '所属材料家族'}中的子体系，具体组成和性能需结合下级材料或牌号判断。"
    if kind == "grade":
        return f"{name}是{parent_name or '所属材料体系'}中的常用工程牌号；具体性能随标准、状态、尺寸和测试条件变化。"
    if kind == "variant":
        return f"{name}是基于{parent_name or '基础材料'}形成的改性或用途变体，需结合配方、增强比例和加工状态选材。"
    if kind == "form":
        return f"{name}是{parent_name or '基础材料'}的一种产品形态，形态和制造过程会影响最终性能与用途。"
    return f"{name}属于{parent_name or '相应材料体系'}，本条目用于建立规范分类、关系和后续工程数据扩展入口。"


def empty_wood_properties():
    return {
        "scientific_name": "",
        "family": "",
        "genus": "",
        "origin": [],
        "wood_type": "",
        "heartwood_color": "",
        "grain": "",
        "air_dry_density": UNKNOWN,
        "moisture_condition": "数据需注明含水率",
        "longitudinal_tensile_strength": UNKNOWN,
        "longitudinal_compressive_strength": UNKNOWN,
        "bending_strength": UNKNOWN,
        "elastic_modulus": UNKNOWN,
        "radial_shrinkage": UNKNOWN,
        "tangential_shrinkage": UNKNOWN,
        "durability_class": UNKNOWN,
        "outdoor_suitability": UNKNOWN,
    }


def normalize_material(material, *, is_seed=False, parent_name=""):
    item = deepcopy(material)
    item_id = str(item.get("id", "")).strip()
    item["id"] = item_id
    path = list(item.get("taxonomy_path") or EXISTING_PATH_OVERRIDES.get(item_id) or [])
    if not path:
        path = [item.get("category_1", "未分类"), item.get("category_2", "未分类"), item.get("category_3", item.get("name_cn", "未分类"))]
    item["taxonomy_path"] = unique_list(path)
    item["category_1"], item["category_2"], item["category_3"] = path_categories(item["taxonomy_path"])

    relation = EXISTING_RELATIONS.get(item_id)
    item["entity_type"] = item.get("entity_type") or entity_type_for_existing(item)
    if relation and not is_seed:
        item["parent_id"], item["canonical_material_id"], item["entity_type"] = relation
    else:
        item["parent_id"] = item.get("parent_id", "") or ""
        item["canonical_material_id"] = item.get("canonical_material_id") or item_id

    item["name_cn"] = str(item.get("name_cn", "")).strip()
    item["name_en"] = str(item.get("name_en", "")).strip()
    item["abbreviation"] = str(item.get("abbreviation", "")).strip()
    aliases = item.get("aliases") or []
    if item["name_cn"] == "木材":
        aliases.extend(["木头", "wood", "timber", "原木", "板材"])
    if item_id == "polyamide":
        aliases.extend(["尼龙", "nylon", "PA"])
    if item_id == "glass_fiber_composite":
        aliases.extend(["玻璃钢", "FRP", "GFRP"])
    item["aliases"] = unique_list(aliases)

    if is_seed and not item.get("description"):
        item["description"] = description_for_seed(item, parent_name)
    item["description"] = item.get("description") or "分类说明待补充。"
    item["composition_or_structure"] = item.get("composition_or_structure") or "具体组成或结构需按材料品种、牌号、状态及相应标准核验。"

    list_fields = (
        "classification_basis", "material_states", "product_forms", "key_properties", "mechanical_properties",
        "thermal_properties", "electrical_properties", "optical_properties", "magnetic_properties", "advantages",
        "limitations", "applications", "processing_methods", "typical_products", "related_materials",
        "related_material_ids", "tags", "application_collections", "data_sources",
    )
    for field in list_fields:
        item[field] = unique_list(item.get(field) or [])
    if not item["classification_basis"]:
        basis = ["材料学分类"]
        if item["entity_type"] == "grade":
            basis.append("工程牌号")
        elif item["entity_type"] == "variant":
            basis.append("改性或用途")
        elif item["entity_type"] == "form":
            basis.append("产品形态")
        else:
            basis.append("组成与结构")
        item["classification_basis"] = basis

    item["standard_designations"] = list(item.get("standard_designations") or [])
    item["heat_treatments"] = list(item.get("heat_treatments") or [])
    item["property_records"] = list(item.get("property_records") or [])
    item["images"] = item.get("images") if isinstance(item.get("images"), dict) else {"macro": [], "micro": [], "structure": []}
    for image_type in ("macro", "micro", "structure"):
        item["images"].setdefault(image_type, [])

    engineering = dict(item.get("engineering_properties") or {})
    for field in ENGINEERING_FIELDS:
        value = engineering.get(field, item.get(field))
        if value in (None, "", "待补充", "待评估", "暂无数据"):
            value = UNKNOWN
        engineering[field] = value
        item[field] = value
    item["engineering_properties"] = engineering
    has_engineering_value = any(engineering[field] != UNKNOWN for field in ENGINEERING_FIELDS)
    current_data_type = item.get("engineering_data_type")
    if item["entity_type"] in {"family", "subfamily"} and has_engineering_value:
        item["engineering_data_type"] = "category_reference"
    else:
        item["engineering_data_type"] = current_data_type or ("typical" if has_engineering_value else "unavailable")
    item["engineering_condition_note"] = item.get("engineering_condition_note") or (
        "类别参考值，仅用于建立量级认知；具体牌号、状态和测试条件可能存在显著差异。"
        if item["engineering_data_type"] == "category_reference"
        else "具体数值应结合牌号、材料状态、产品形态、测试温度与数据来源使用。"
    )

    item["performance_scores"] = dict(item.get("performance_scores") or {})
    if item["performance_scores"]:
        item["performance_score_source"] = item.get("performance_score_source") or "参考评分（待审核）"
    else:
        item["performance_score_source"] = "待审核"

    notes = str(item.get("notes", "")).strip()
    item["notes"] = notes if DISCLAIMER in notes else f"{notes} {DISCLAIMER}".strip()
    item["difficulty_level"] = item.get("difficulty_level") or "进阶"
    source_count = len(item["data_sources"]) + sum(bool(record.get("source")) for record in item["property_records"] if isinstance(record, dict))
    quality = dict(item.get("data_quality") or {})
    quality["status"] = quality.get("status") or ("partial" if source_count == 0 else "reviewed")
    quality["reviewed"] = bool(quality.get("reviewed", False))
    quality["source_count"] = source_count
    item["data_quality"] = quality

    if "木材" in item["taxonomy_path"] or item_id in {"plywood", "mdf"}:
        wood = empty_wood_properties()
        wood.update(item.get("wood_properties") or {})
        if "针叶材" in item["taxonomy_path"]:
            wood["wood_type"] = "针叶材"
        elif "阔叶材" in item["taxonomy_path"]:
            wood["wood_type"] = "阔叶材"
        item["wood_properties"] = wood

    return item


def assign_nearest_parents(materials):
    by_id = {item["id"]: item for item in materials}
    path_to_ids = {}
    for item in materials:
        path_to_ids.setdefault(tuple(item["taxonomy_path"]), []).append(item["id"])

    for item in materials:
        if item["parent_id"] and item["parent_id"] in by_id:
            continue
        path = item["taxonomy_path"]
        parent_id = ""
        for end in range(len(path) - 1, 0, -1):
            candidates = path_to_ids.get(tuple(path[:end]), [])
            candidates = [candidate for candidate in candidates if candidate != item["id"]]
            if candidates:
                parent_id = candidates[0]
                break
        item["parent_id"] = parent_id


def searchable_text(material):
    values = [
        material.get("name_cn", ""), material.get("name_en", ""), material.get("abbreviation", ""),
        " ".join(material.get("taxonomy_path") or []), material.get("description", ""),
    ]
    for field in ("aliases", "tags", "applications", "typical_products", "processing_methods", "material_states", "product_forms"):
        values.extend(str(value) for value in material.get(field, []) if value)
    return " ".join(values).lower()


def build_collections(materials):
    explicit = {
        "biomedical_materials": {"medical_titanium_alloy", "ti_6al_4v_eli", "cobalt_chromium_alloy", "peek", "medical_peek", "cf_peek", "hydroxyapatite_peek", "pla", "pga", "plga", "pcl", "hydroxyapatite", "bioglass", "biodegradable_magnesium_alloy"},
        "lithium_ion_battery": {"lifepo4", "ncm", "graphite_anode", "silicon_carbon_anode", "battery_electrolyte", "battery_separator", "aluminum_alloy", "copper_alloy"},
        "sodium_ion_battery": {"activated_carbon", "graphite_anode", "battery_electrolyte", "battery_separator", "aluminum_alloy", "copper_alloy"},
        "solid_state_battery": {"lifepo4", "ncm", "graphite_anode", "silicon_carbon_anode", "alumina_ceramic", "battery_separator"},
        "hydrogen_fuel_cell": {"stainless_steel", "titanium_alloy", "nickel_alloy", "ptfe", "pvdf", "graphite", "carbon_fiber"},
        "photovoltaic_materials": {"silicon", "crystalline_silicon_pv", "perovskite_solar", "ito", "tempered_glass"},
        "supercapacitor_materials": {"activated_carbon", "graphene", "carbon_nanotube", "carbon_aerogel"},
        "semiconductor_materials": {"silicon", "gallium_arsenide", "gallium_nitride", "silicon_carbide_semiconductor"},
        "nanomaterials": {"graphene", "carbon_nanotube", "nano_silver", "nano_titanium_dioxide", "polymer_nanocomposite", "fullerene"},
        "biodegradable_materials": {"pla", "pga", "plga", "pcl", "pbs", "pbat", "pha", "phb", "starch_plastic", "cellulose_material", "biodegradable_magnesium_alloy"},
        "aerospace_materials": {"titanium_alloy", "ti_tc4", "al_2024", "al_7075", "inconel_718", "gh4169", "carbon_fiber_epoxy", "cf_peek_composite", "sic_cmc", "carbon_carbon"},
        "electronic_packaging": {"aluminum_nitride_ceramic", "alumina_ceramic", "silicon_carbide_semiconductor", "copper_alloy", "cu_cucrzr", "ito", "lcp", "polyimide"},
        "construction_materials": {"portland_cement", "concrete", "brick", "gypsum_board", "asphalt", "waterproof_membrane", "plywood", "mdf", "osb", "glulam", "clt"},
        "interior_materials": {"wood", "plywood", "mdf", "hdf", "particleboard", "coating_paint", "natural_stone", "tempered_glass"},
        "textile_apparel": {"cotton_fiber", "hemp_fiber", "wool", "polyester_fiber", "nylon_fiber", "leather", "aramid_fiber_composite"},
        "packaging_materials": {"paper", "ldpe", "lldpe", "hdpe", "polypropylene", "pet", "petg", "aluminum_alloy"},
        "additive_manufacturing": {"peek", "pa12", "pla", "abs", "ti_tc4", "al_6061", "inconel_718", "stainless_steel"},
        "high_temperature": {"nickel_superalloy", "cobalt_superalloy", "inconel_600", "inconel_625", "inconel_718", "gh4169", "k418", "sic_ceramic", "sic_cmc", "carbon_carbon", "peek", "polyimide"},
        "corrosion_resistant": {"stainless_steel", "ss_316l", "ss_2205", "titanium_alloy", "nickel_alloy", "inconel_625", "hastelloy_c276", "ptfe", "pvdf"},
        "automotive_lightweight": {"aluminum_alloy", "magnesium_alloy", "titanium_alloy", "carbon_fiber_epoxy", "glass_fiber_composite", "gf_pp", "lgf_pp"},
        "new_energy_vehicle": {"lifepo4", "ncm", "graphite_anode", "silicon_carbon_anode", "battery_separator", "aluminum_alloy", "copper_alloy", "ndfeb"},
        "sustainable_materials": {"wood", "bamboo", "paper", "cotton_fiber", "hemp_fiber", "pla", "pha", "starch_plastic", "cellulose_material", "natural_fiber_composite"},
        "marine_engineering": {"al_5083", "stainless_steel", "ss_316l", "ss_2205", "titanium_alloy", "cupronickel", "cu_b30", "coating_paint"},
    }
    collections = []
    all_ids = {item["id"] for item in materials}
    for collection_id, name, description, keywords in COLLECTION_SPECS:
        ids = set(explicit.get(collection_id, set())) & all_ids
        for item in materials:
            text = " ".join(str(value) for value in (item.get("applications") or []) if value).lower()
            if any(keyword.lower() in text for keyword in keywords):
                ids.add(item["id"])
        collections.append({"id": collection_id, "name_cn": name, "description": description, "keywords": keywords, "material_ids": sorted(ids)})
    return collections


def apply_collection_links(materials, collections):
    by_id = {item["id"]: item for item in materials}
    for item in materials:
        item["application_collections"] = []
    for collection in collections:
        for item_id in collection["material_ids"]:
            if item_id in by_id:
                by_id[item_id]["application_collections"].append(collection["id"])


def main():
    parser = argparse.ArgumentParser(description="Migrate MaterialBox materials.json to V2")
    parser.add_argument("--dry-run", action="store_true", help="Report counts without writing files")
    args = parser.parse_args()

    legacy = read_json(MATERIALS_PATH)
    if not isinstance(legacy, list):
        raise SystemExit("materials.json 顶层必须是数组")

    migrated = [normalize_material(item) for item in legacy]
    by_id = {item["id"]: item for item in migrated}
    position_by_id = {item["id"]: index for index, item in enumerate(migrated)}
    seed_records = build_seed_records()
    seed_ids = {seed["id"] for seed in seed_records}
    if len(seed_ids) != len(seed_records):
        raise SystemExit("V2 种子中存在重复ID")

    for seed in seed_records:
        if seed["id"] in by_id:
            current = deepcopy(by_id[seed["id"]])
            for field in ("name_cn", "name_en", "abbreviation", "entity_type", "parent_id", "canonical_material_id", "taxonomy_path"):
                current[field] = deepcopy(seed.get(field, current.get(field)))
            for field in ("aliases", "product_forms", "standard_designations", "tags", "applications"):
                current[field] = unique_list([*(current.get(field) or []), *(seed.get(field) or [])])
            for field in ("material_states", "heat_treatments"):
                current[field] = deepcopy(seed.get(field) or [])
            if "钢" in (seed.get("taxonomy_path") or []) and not seed.get("heat_treatments"):
                current["tags"] = [tag for tag in current.get("tags", []) if tag != "可热处理"]
            parent_name = by_id.get(seed.get("parent_id", ""), {}).get("name_cn", "")
            item = normalize_material(current, is_seed=True, parent_name=parent_name)
            migrated[position_by_id[item["id"]]] = item
            by_id[item["id"]] = item
            continue
        parent_name = by_id.get(seed.get("parent_id", ""), {}).get("name_cn", "")
        item = normalize_material(seed, is_seed=True, parent_name=parent_name)
        migrated.append(item)
        by_id[item["id"]] = item
        position_by_id[item["id"]] = len(migrated) - 1

    # Re-normalize after all parents exist so generated descriptions and paths are stable.
    assign_nearest_parents(migrated)
    collections = build_collections(migrated)
    apply_collection_links(migrated, collections)

    # Stable ordering keeps all 98 legacy IDs first, then taxonomy path and entity identity.
    legacy_order = {item["id"]: index for index, item in enumerate(legacy)}
    migrated.sort(key=lambda item: (0, legacy_order[item["id"]]) if item["id"] in legacy_order else (1, "/".join(item["taxonomy_path"]), item["name_cn"]))

    print(f"旧记录: {len(legacy)}")
    print(f"新增记录: {len(migrated) - len(legacy)}")
    print(f"迁移后总数: {len(migrated)}")
    print(f"专题集合: {len(collections)}")
    print(f"旧ID映射: {len(ID_ALIASES)}")
    if args.dry_run:
        return
    write_json(MATERIALS_PATH, migrated)
    write_json(COLLECTIONS_PATH, collections)
    print(f"已写入: {MATERIALS_PATH}")
    print(f"已写入: {COLLECTIONS_PATH}")


if __name__ == "__main__":
    main()
