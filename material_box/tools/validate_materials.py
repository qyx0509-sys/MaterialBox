#!/usr/bin/env python3
"""Structural and data-quality validation for the MaterialBox catalogue."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

from catalog_v2_seed import BASE_CATEGORIES, ENTITY_TYPES
from image_policy import (
    IMAGE_TYPES,
    build_image_inventory,
    evaluate_material_images,
    validate_policy as validate_image_policy,
)


ROOT = Path(__file__).resolve().parents[1]
REPORT_PATH = ROOT / "validation-report.json"
PRECISE_NUMBER = re.compile(r"\d+(?:\.\d+)?\s*(?:g/cm|kg/m|MPa|GPa|W/|Ω|℃|HV|HB|HRC|Shore)", re.I)
VALID_DATA_TYPES = {"measured", "typical", "literature", "category_reference", "estimated", "unavailable"}


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def validate(materials, collections):
    errors = []
    warnings = []
    passed = []
    top_categories = {item["name"] for item in BASE_CATEGORIES}
    ids = [str(item.get("id", "")).strip() for item in materials]
    counts = Counter(ids)
    duplicate_ids = sorted(item_id for item_id, count in counts.items() if item_id and count > 1)
    if duplicate_ids:
        errors.append(f"重复ID: {', '.join(duplicate_ids)}")
    else:
        passed.append("所有材料ID唯一")
    by_id = {item_id: item for item_id, item in zip(ids, materials) if item_id}

    for index, item in enumerate(materials):
        prefix = item.get("id") or f"第{index + 1}条"
        if not item.get("id"):
            errors.append(f"{prefix}: ID不能为空")
        if not str(item.get("name_cn", "")).strip():
            errors.append(f"{prefix}: 中文名不能为空")
        if item.get("entity_type") not in ENTITY_TYPES:
            errors.append(f"{prefix}: entity_type非法: {item.get('entity_type')}")
        parent_id = item.get("parent_id", "")
        canonical_id = item.get("canonical_material_id", "")
        if parent_id and parent_id not in by_id:
            errors.append(f"{prefix}: parent_id不存在: {parent_id}")
        if canonical_id and canonical_id not in by_id:
            errors.append(f"{prefix}: canonical_material_id不存在: {canonical_id}")
        path = item.get("taxonomy_path") or []
        if not path or path[0] not in top_categories:
            errors.append(f"{prefix}: taxonomy_path缺失或一级分类非法")
        elif item.get("category_1") != path[0]:
            errors.append(f"{prefix}: category_1与taxonomy_path不一致")
        if parent_id in by_id:
            parent_path = by_id[parent_id].get("taxonomy_path") or []
            if parent_path and path[: len(parent_path)] != parent_path:
                warnings.append(f"{prefix}: 父级为跨分类关系或路径非直接前缀 ({parent_id})")
        for related_id in item.get("related_material_ids") or []:
            if related_id not in by_id:
                errors.append(f"{prefix}: related_material_id不存在: {related_id}")
        data_type = item.get("engineering_data_type", "unavailable")
        if data_type not in VALID_DATA_TYPES:
            warnings.append(f"{prefix}: engineering_data_type不规范: {data_type}")
        engineering = item.get("engineering_properties") or {}
        has_precise = any(PRECISE_NUMBER.search(str(value or "")) for value in engineering.values())
        sources = item.get("data_sources") or []
        records = item.get("property_records") or []
        record_sources = [record.get("source") for record in records if isinstance(record, dict) and record.get("source")]
        if has_precise and not sources and not record_sources:
            warnings.append(f"{prefix}: 存在精确数值但来源待补充")
        if item.get("entity_type") in {"family", "subfamily"} and has_precise and data_type not in {"category_reference", "unavailable"}:
            warnings.append(f"{prefix}: 家族条目含数值，应确认并标记为类别参考")
        for record in records:
            if not isinstance(record, dict):
                errors.append(f"{prefix}: property_records条目必须是对象")
                continue
            minimum = record.get("min")
            maximum = record.get("max")
            if isinstance(minimum, (int, float)) and isinstance(maximum, (int, float)) and minimum > maximum:
                errors.append(f"{prefix}: {record.get('property')}最小值大于最大值")
            if (minimum is not None or maximum is not None) and not record.get("unit"):
                warnings.append(f"{prefix}: {record.get('property')}数值记录缺少单位")

    for start in by_id:
        visited = set()
        current = start
        while current and current in by_id:
            if current in visited:
                errors.append(f"父子关系循环: {start} -> {current}")
                break
            visited.add(current)
            current = by_id[current].get("parent_id", "")
    if not any("父子关系循环" in error for error in errors):
        passed.append("父子关系无循环")

    names = defaultdict(list)
    for item in materials:
        names[item.get("name_cn", "")].append(item.get("id", ""))
    duplicate_names = {name: values for name, values in names.items() if name and len(values) > 1}
    for name, values in sorted(duplicate_names.items()):
        warnings.append(f"同名材料待核对: {name} ({', '.join(values)})")

    collection_ids = set()
    for collection in collections:
        collection_id = collection.get("id", "")
        if not collection_id or collection_id in collection_ids:
            errors.append(f"专题ID为空或重复: {collection_id}")
        collection_ids.add(collection_id)
        for item_id in collection.get("material_ids") or []:
            if item_id not in by_id:
                errors.append(f"专题{collection_id}引用不存在材料: {item_id}")
    for item in materials:
        for collection_id in item.get("application_collections") or []:
            if collection_id not in collection_ids:
                errors.append(f"{item['id']}: 引用不存在专题: {collection_id}")
    if len(collections) >= 20:
        passed.append(f"专题集合数量达标: {len(collections)}")

    policy_path = ROOT / "image-policy.json"
    try:
        image_policy = read_json(policy_path)
    except (OSError, json.JSONDecodeError) as exc:
        image_policy = {
            "image_types": list(IMAGE_TYPES),
            "default": {"required": ["macro"], "recommended": [], "optional": ["micro", "structure"], "not_applicable": [], "allow_inherited": True, "reason": "安全默认策略"},
            "category_rules": {}, "entity_rules": {}, "category_entity_rules": {}, "material_overrides": {},
        }
        errors.append(f"配图策略读取失败: {exc}")
    policy_errors = validate_image_policy(image_policy, materials)
    errors.extend(f"配图策略: {error}" for error in policy_errors)
    inventory = build_image_inventory(ROOT, materials)
    missing_images = []
    missing_all_images = []
    image_stats = Counter()
    image_policy_results = []
    image_policy_reminders = []
    image_metadata_reminders = []
    image_policy_stats = Counter(materials_total=len(materials))
    for item in materials:
        material_id = item["id"]
        folder = ROOT / "assets" / "images" / "materials" / material_id
        present = inventory.get(material_id, {image_type: False for image_type in IMAGE_TYPES})
        for key, exists in present.items():
            image_stats[f"{key}_present" if exists else f"{key}_missing"] += 1
        result = evaluate_material_images(ROOT, item, materials, image_policy, inventory)
        if result["policy_complete"]:
            image_policy_stats["policy_complete"] += 1
        if result["missing_required"]:
            image_policy_stats["missing_required"] += 1
            missing_images.append(material_id)
            warnings.append(f"{material_id}: 缺少策略必需图片 ({', '.join(result['missing_required'])})")
        if result["missing_recommended"]:
            image_policy_stats["missing_recommended"] += 1
            image_policy_reminders.append(f"{material_id}: 建议补充图片 ({', '.join(result['missing_recommended'])})")
        if result["using_inherited_images"]:
            image_policy_stats["using_inherited_images"] += 1
        if result["own_images_complete"]:
            image_policy_stats["own_images_complete"] += 1
        if result["family_reference_only"]:
            image_policy_reminders.append(f"{material_id}: family 当前仅以继承图满足必需项，建议补专属参考图")
        if not result["own_images"] and not result["inherited_images"]:
            missing_all_images.append(material_id)
        image_policy_results.append({
            "material_id": material_id,
            "required": result["required"],
            "recommended": result["recommended"],
            "optional": result["optional"],
            "not_applicable": result["not_applicable"],
            "own_images": result["own_images"],
            "inherited_images": result["inherited_images"],
            "inherited_from": result["inherited_from"],
            "missing_required": result["missing_required"],
            "missing_recommended": result["missing_recommended"],
            "policy_complete": result["policy_complete"],
            "own_images_complete": result["own_images_complete"],
            "policy_status": result["policy_status"],
        })
        metadata_path = folder / "metadata.json"
        try:
            metadata = read_json(metadata_path) if metadata_path.is_file() else {}
        except json.JSONDecodeError:
            metadata = {}
            image_metadata_reminders.append(f"{material_id}: metadata.json 格式无效")
        metadata_groups = metadata.get("images", metadata) if isinstance(metadata, dict) else {}
        for image_type in result["own_images"]:
            entries = metadata_groups.get(image_type, []) if isinstance(metadata_groups, dict) else []
            if not isinstance(entries, list) or not entries:
                image_metadata_reminders.append(f"{material_id}.{image_type}: 正式图片缺少元数据记录")
                continue
            if not any((entry.get("source") or entry.get("sourceUrl")) for entry in entries if isinstance(entry, dict)):
                image_metadata_reminders.append(f"{material_id}.{image_type}: 图片来源待补充")
            if not any(entry.get("license") for entry in entries if isinstance(entry, dict)):
                image_metadata_reminders.append(f"{material_id}.{image_type}: 图片许可证待补充")
    missing_data = [
        item["id"] for item in materials
        if not item.get("property_records") and all(value in {None, "", "暂无数据", "暂无可靠数据"} for value in (item.get("engineering_properties") or {}).values())
    ]
    pending_review = [item["id"] for item in materials if not (item.get("data_quality") or {}).get("reviewed")]

    entity_counts = Counter(item.get("entity_type", "unknown") for item in materials)
    category_counts = Counter((item.get("taxonomy_path") or ["未分类"])[0] for item in materials)
    report = {
        "summary": {
            "materials": len(materials),
            "collections": len(collections),
            "passed": len(passed),
            "warnings": len(warnings),
            "errors": len(errors),
            "missing_all_images": len(missing_all_images),
            "missing_required_images": image_policy_stats["missing_required"],
            "missing_recommended_images": image_policy_stats["missing_recommended"],
            "image_policy_complete": image_policy_stats["policy_complete"],
            "missing_engineering_data": len(missing_data),
            "pending_review": len(pending_review),
        },
        "entity_counts": dict(sorted(entity_counts.items())),
        "category_counts": dict(sorted(category_counts.items())),
        "image_stats": dict(sorted(image_stats.items())),
        "image_policy_stats": dict(image_policy_stats),
        "image_policy_results": image_policy_results,
        "image_policy_reminders": image_policy_reminders,
        "image_metadata_reminders": image_metadata_reminders,
        "passed_items": passed,
        "warnings": warnings,
        "errors": errors,
        "missing_image_ids": missing_images,
        "missing_all_image_ids": missing_all_images,
        "missing_data_ids": missing_data,
        "pending_review_ids": pending_review,
    }
    return report


def main():
    parser = argparse.ArgumentParser(description="Validate MaterialBox data")
    parser.add_argument("--quiet", action="store_true", help="Only print the summary")
    args = parser.parse_args()
    materials = read_json(ROOT / "materials.json")
    collections = read_json(ROOT / "collections.json") if (ROOT / "collections.json").exists() else []
    report = validate(materials, collections)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    summary = report["summary"]
    print("材料数据校验")
    print(f"通过项: {summary['passed']} | 警告项: {summary['warnings']} | 错误项: {summary['errors']}")
    print(f"材料: {summary['materials']} | 专题: {summary['collections']} | 配图策略已满足: {summary['image_policy_complete']}")
    print(f"缺必需图: {summary['missing_required_images']} | 缺建议图: {summary['missing_recommended_images']}")
    print(f"缺工程数据: {summary['missing_engineering_data']} | 待审核: {summary['pending_review']}")
    if not args.quiet:
        for error in report["errors"]:
            print(f"[错误] {error}")
        for warning in report["warnings"][:40]:
            print(f"[警告] {warning}")
        if len(report["warnings"]) > 40:
            print(f"... 其余 {len(report['warnings']) - 40} 条警告见 validation-report.json")
    raise SystemExit(1 if report["errors"] else 0)


if __name__ == "__main__":
    main()
