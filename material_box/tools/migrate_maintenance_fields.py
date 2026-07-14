#!/usr/bin/env python3
"""One-time migration for MaterialBox maintenance metadata.

The migration is intentionally conservative: it preserves recorded values,
removes known category-level placeholders, normalizes sources, and gives every
record an explicit maintenance status. It never changes material order or IDs.
"""

from __future__ import annotations

import json
import shutil
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
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
SCORE_FIELDS = ("strength", "heat", "corrosion", "processability", "cost", "lightweight")
MISSING_TEXT = {
    "",
    "暂无数据",
    "暂无可靠数据",
    "待补充",
    "待评估",
    "未提供",
    "unknown",
    "null",
    "undefined",
}
GENERIC_BY_FIELD = {
    "density": {"较低", "较高", "低密度", "高密度"},
    "melting_point": {"较低", "较高", "高熔点", "低熔点"},
    "service_temperature": {"中高温", "常温使用", "常温至中温", "高温", "低温"},
    "tensile_strength": {"各向异性", "受状态影响"},
    "elastic_modulus": {"各向异性", "受状态影响"},
    "thermal_conductivity": {"较低", "较高", "低", "高"},
    "electrical_resistivity": {"较低", "较高", "低", "高"},
}
DISCLAIMER = "材料参数会因牌号、加工状态、测试标准和温度发生变化，本网站数据用于学习和初步选材，不替代正式材料标准或供应商数据表。"


def is_recorded(value) -> bool:
    return value is not None and str(value).strip() not in MISSING_TEXT


def normalize_engineering_value(key: str, value) -> str:
    text = "" if value is None else str(value).strip()
    if text in MISSING_TEXT or "通常" in text or text in GENERIC_BY_FIELD.get(key, set()):
        return "暂无数据"
    return text


def normalize_source(source) -> dict:
    if isinstance(source, str):
        source = {"title": source}
    source = source if isinstance(source, dict) else {}
    return {
        "title": str(source.get("title") or source.get("name") or "").strip(),
        "publisher": str(source.get("publisher") or source.get("organization") or "").strip(),
        "url": str(source.get("url") or source.get("sourceUrl") or "").strip(),
        "accessed_at": str(source.get("accessed_at") or source.get("retrievedAt") or "").strip(),
        "note": str(source.get("note") or "").strip(),
    }


def normalize_image_list(value) -> list:
    if isinstance(value, str):
        value = [value]
    if not isinstance(value, list):
        return []
    output = []
    for item in value:
        src = item if isinstance(item, str) else item.get("src", "") if isinstance(item, dict) else ""
        src = str(src).replace("\\", "/")
        if not src.startswith("assets/images/materials/"):
            continue
        output.append(item)
    return output[:3]


def migrate(materials: list[dict]) -> dict:
    counts = {"materials": len(materials), "cleared_placeholders": 0, "sources": 0}
    for material in materials:
        engineering = dict(material.get("engineering_properties") or {})
        recorded_count = 0
        for key in ENGINEERING_FIELDS:
            before = engineering.get(key, material.get(key, ""))
            after = normalize_engineering_value(key, before)
            if after == "暂无数据" and is_recorded(before):
                counts["cleared_placeholders"] += 1
            if after != "暂无数据":
                recorded_count += 1
            engineering[key] = after
            material[key] = after
        material["engineering_properties"] = engineering

        sources = [normalize_source(item) for item in material.get("data_sources", [])]
        sources = [item for item in sources if any(item.values())]
        material["data_sources"] = sources
        counts["sources"] += len(sources)

        status = material.get("data_status")
        if status not in {"待补充", "待核验", "已核验"}:
            if material.get("data_quality", {}).get("reviewed") and sources:
                status = "已核验"
            elif recorded_count >= 4 or sources:
                status = "待核验"
            else:
                status = "待补充"
        material["data_status"] = status
        material["updated_at"] = str(material.get("updated_at") or "")

        quality = dict(material.get("data_quality") or {})
        quality["reviewed"] = status == "已核验"
        quality["source_count"] = len(sources)
        material["data_quality"] = quality

        scores = material.get("performance_scores")
        if not isinstance(scores, dict) or not all(isinstance(scores.get(key), (int, float)) for key in SCORE_FIELDS):
            material["performance_scores"] = {}
            material["performance_score_source"] = ""
        else:
            material["performance_score_source"] = "已录入评分"

        images = material.get("images") if isinstance(material.get("images"), dict) else {}
        material["images"] = {
            image_type: normalize_image_list(images.get(image_type, []))
            for image_type in ("macro", "micro", "structure")
        }

        notes = str(material.get("notes") or "").strip()
        material["notes"] = notes if DISCLAIMER in notes else "\n".join(filter(None, [notes, DISCLAIMER]))
    return counts


def main() -> None:
    source = ROOT / "materials.json"
    materials = json.loads(source.read_text(encoding="utf-8"))
    if not isinstance(materials, list):
        raise SystemExit("materials.json 顶层必须是数组。")
    stamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    backup = ROOT / "backups" / f"maintenance_migration_{stamp}"
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copy2(source, backup / source.name)
    counts = migrate(materials)
    temporary = source.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(materials, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(source)
    print(f"迁移完成：{counts['materials']} 条材料。")
    print(f"已移除推测性占位参数：{counts['cleared_placeholders']} 项。")
    print(f"结构化参考来源：{counts['sources']} 条。")
    print(f"原始数据备份：{backup}")


if __name__ == "__main__":
    main()
