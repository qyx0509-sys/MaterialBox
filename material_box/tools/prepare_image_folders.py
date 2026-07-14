#!/usr/bin/env python3
"""Create one local image folder per material and refresh the ID reference CSV."""

from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
IMAGE_ROOT = ROOT / "assets" / "images" / "materials"


def main():
    materials = json.loads((ROOT / "materials.json").read_text(encoding="utf-8"))
    IMAGE_ROOT.mkdir(parents=True, exist_ok=True)
    for material in materials:
        (IMAGE_ROOT / material["id"]).mkdir(parents=True, exist_ok=True)
    csv_path = IMAGE_ROOT / "材料ID对照表.csv"
    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["material_id", "中文名", "英文名", "实体类型", "父级ID", "分类路径"])
        for material in materials:
            writer.writerow([
                material["id"],
                material.get("name_cn", ""),
                material.get("name_en", ""),
                material.get("entity_type", "material"),
                material.get("parent_id", ""),
                " > ".join(material.get("taxonomy_path") or []),
            ])
    print(f"图片文件夹: {len(materials)} 个")
    print(f"ID对照表: {csv_path}")


if __name__ == "__main__":
    main()

