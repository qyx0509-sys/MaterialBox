#!/usr/bin/env python3
"""Generate a policy-based image plan without downloading or modifying images."""

from __future__ import annotations

import argparse
import csv
import json
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

from image_policy import (
    IMAGE_TYPES,
    build_image_inventory,
    evaluate_material_images,
    read_json,
    validate_policy,
)


ROOT = Path(__file__).resolve().parents[1]


def metadata_image_types(root: Path, material_id: str) -> list[str]:
    path = root / "assets" / "images" / "materials" / material_id / "metadata.json"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return []
    source = data.get("images", data) if isinstance(data, dict) else {}
    return [image_type for image_type in IMAGE_TYPES if isinstance(source, dict) and bool(source.get(image_type))]


def build_plan(root: Path) -> dict:
    materials = read_json(root / "materials.json")
    policy = read_json(root / "image-policy.json")
    errors = validate_policy(policy, materials)
    if errors:
        raise ValueError("；".join(errors))
    inventory = build_image_inventory(root, materials)
    by_id = {item["id"]: item for item in materials}
    items = []
    category_stats: dict[str, Counter] = defaultdict(Counter)
    for material in materials:
        result = evaluate_material_images(root, material, materials, policy, inventory)
        inherited_from = {
            image_type: {
                "material_id": parent_id,
                "name_cn": (by_id.get(parent_id) or {}).get("name_cn", parent_id),
            }
            for image_type, parent_id in result["inherited_from"].items()
        }
        row = {
            "material_id": material["id"],
            "name_cn": material.get("name_cn", ""),
            "name_en": material.get("name_en", ""),
            "category_1": material.get("category_1", ""),
            "entity_type": material.get("entity_type", ""),
            "parent_id": material.get("parent_id", ""),
            "required_images": result["required"],
            "recommended_images": result["recommended"],
            "optional_images": result["optional"],
            "not_applicable_images": result["not_applicable"],
            "own_images": result["own_images"],
            "inherited_images": result["inherited_images"],
            "inherited_from": inherited_from,
            "metadata_images": metadata_image_types(root, material["id"]),
            "missing_required": result["missing_required"],
            "missing_recommended": result["missing_recommended"],
            "policy_status": result["policy_status"],
            "policy_reason": result["policy_reason"],
            "policy_complete": result["policy_complete"],
            "own_images_complete": result["own_images_complete"],
        }
        items.append(row)
        stats = category_stats[row["category_1"]]
        stats["materials"] += 1
        stats["policy_complete"] += int(result["policy_complete"])
        stats["missing_required"] += int(bool(result["missing_required"]))
        stats["missing_recommended"] += int(bool(result["missing_recommended"]))
        stats["using_inherited_images"] += int(result["using_inherited_images"])
    summary = {
        "materials_total": len(items),
        "policy_complete": sum(int(item["policy_complete"]) for item in items),
        "missing_required": sum(int(bool(item["missing_required"])) for item in items),
        "missing_recommended": sum(int(bool(item["missing_recommended"])) for item in items),
        "using_inherited_images": sum(int(bool(item["inherited_images"])) for item in items),
        "own_images_complete": sum(int(item["own_images_complete"]) for item in items),
    }
    return {
        "schema_version": "1.0",
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "summary": summary,
        "category_stats": {key: dict(value) for key, value in sorted(category_stats.items())},
        "items": items,
    }


def csv_text(value) -> str:
    if isinstance(value, list):
        return "; ".join(map(str, value))
    if isinstance(value, dict):
        return "; ".join(f"{key}:{item.get('material_id', item)}" for key, item in value.items())
    if isinstance(value, bool):
        return "是" if value else "否"
    return str(value or "")


def write_outputs(root: Path, plan: dict) -> None:
    (root / "image-plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    fields = [
        "material_id", "name_cn", "name_en", "category_1", "entity_type", "parent_id",
        "required_images", "recommended_images", "optional_images", "not_applicable_images",
        "own_images", "inherited_images", "missing_required", "missing_recommended",
        "policy_status", "policy_reason",
    ]
    with (root / "image-plan.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for item in plan["items"]:
            writer.writerow({field: csv_text(item.get(field)) for field in fields})


def print_summary(plan: dict) -> None:
    summary = plan["summary"]
    print("材料配图计划")
    print(
        f"材料：{summary['materials_total']} | 策略已满足：{summary['policy_complete']} | "
        f"缺必需图：{summary['missing_required']} | 缺建议图：{summary['missing_recommended']} | "
        f"使用继承图：{summary['using_inherited_images']}"
    )
    for category, stats in plan["category_stats"].items():
        print(
            f"- {category}: {stats['policy_complete']}/{stats['materials']} 已满足，"
            f"{stats['missing_required']} 缺必需图，{stats['missing_recommended']} 缺建议图"
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="生成 MaterialBox 配图计划")
    parser.add_argument("--check", action="store_true", help="只计算并显示，不写入计划文件")
    args = parser.parse_args()
    try:
        plan = build_plan(ROOT)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise SystemExit(f"配图计划生成失败：{exc}") from exc
    print_summary(plan)
    if args.check:
        print("检查模式未写入任何文件。")
        return
    write_outputs(ROOT, plan)
    print(f"已生成：{ROOT / 'image-plan.json'}")
    print(f"已生成：{ROOT / 'image-plan.csv'}")
    print("未运行图片检索、下载或生成，也未修改任何图片和元数据。")


if __name__ == "__main__":
    main()
