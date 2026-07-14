#!/usr/bin/env python3
"""Structural and data-quality validation for the MaterialBox catalogue."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

from catalog_v2_seed import BASE_CATEGORIES, ENTITY_TYPES


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

    missing_images = []
    image_stats = Counter()
    image_extensions = (".webp", ".jpg", ".jpeg", ".png")
    for item in materials:
        folder = ROOT / "assets" / "images" / "materials" / item["id"]
        present = {
            image_type: any(
                (folder / f"{image_type}_{slot:02d}{extension}").is_file()
                for slot in range(1, 4)
                for extension in image_extensions
            )
            for image_type in ("macro", "micro", "structure")
        }
        for key, exists in present.items():
            image_stats[f"{key}_present" if exists else f"{key}_missing"] += 1
        if not any(present.values()):
            missing_images.append(item["id"])
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
            "missing_all_images": len(missing_images),
            "missing_engineering_data": len(missing_data),
            "pending_review": len(pending_review),
        },
        "entity_counts": dict(sorted(entity_counts.items())),
        "category_counts": dict(sorted(category_counts.items())),
        "image_stats": dict(sorted(image_stats.items())),
        "passed_items": passed,
        "warnings": warnings,
        "errors": errors,
        "missing_image_ids": missing_images,
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
    print(f"材料: {summary['materials']} | 专题: {summary['collections']} | 全部缺图: {summary['missing_all_images']}")
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
