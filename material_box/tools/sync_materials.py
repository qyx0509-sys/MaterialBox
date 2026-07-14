#!/usr/bin/env python3
"""Validate materials.json and generate the static JavaScript data mirrors.

materials.json is the only hand-maintained material data source.  This module is
also imported by the local material manager, so generation stays identical for
command-line and browser-based maintenance.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from catalog_v2_seed import BASE_CATEGORIES, ID_ALIASES


ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FIELDS = ("id", "name_cn", "name_en", "category_1", "category_2", "category_3")


class MaterialSyncError(RuntimeError):
    """Raised when the editable JSON source cannot be safely synchronized."""


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise MaterialSyncError(f"找不到数据文件：{path}") from exc
    except json.JSONDecodeError as exc:
        raise MaterialSyncError(f"JSON 格式错误：第 {exc.lineno} 行，第 {exc.colno} 列，{exc.msg}") from exc


def atomic_write(path: Path, content: str) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(content, encoding="utf-8")
    temporary.replace(path)


def timestamped_directory(parent: Path, prefix: str = "sync") -> Path:
    stamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    target = parent / f"{prefix}_{stamp}"
    counter = 1
    while target.exists():
        target = parent / f"{prefix}_{stamp}_{counter:02d}"
        counter += 1
    target.mkdir(parents=True, exist_ok=False)
    return target


def validate_materials(materials) -> list[str]:
    errors: list[str] = []
    if not isinstance(materials, list):
        return ["materials.json 顶层必须是数组。"]
    seen: set[str] = set()
    for index, material in enumerate(materials, start=1):
        if not isinstance(material, dict):
            errors.append(f"第 {index} 条材料不是对象。")
            continue
        material_id = str(material.get("id", "")).strip()
        if not material_id:
            errors.append(f"第 {index} 条材料缺少 id。")
        elif material_id in seen:
            errors.append(f"材料 id 重复：{material_id}")
        seen.add(material_id)
        for field in REQUIRED_FIELDS:
            value = material.get(field)
            if value is None or (isinstance(value, str) and not value.strip()):
                errors.append(f"{material_id or f'第 {index} 条'} 缺少必需字段 {field}。")
    return errors


def js_assignment(name: str, value) -> str:
    return f"window.{name} = {json.dumps(value, ensure_ascii=False, indent=2)};\n"


def build_categories(materials):
    examples = defaultdict(lambda: defaultdict(list))
    for material in materials:
        path = material.get("taxonomy_path") or []
        if not path:
            continue
        top = path[0]
        branch = path[1] if len(path) > 1 else "其他"
        if material.get("entity_type") in {"material", "grade", "variant", "form"} and len(examples[top][branch]) < 5:
            examples[top][branch].append(material.get("name_cn", material["id"]))
    categories = []
    for base in BASE_CATEGORIES:
        top = base["name"]
        branches = list(dict.fromkeys([*base["branches"], *examples[top].keys()]))
        categories.append(
            {
                "name": top,
                "description": base["description"],
                "subcategories": [
                    {"name": branch, "examples": examples[top].get(branch, [])}
                    for branch in branches
                ],
            }
        )
    return categories


def backup_generated_files(root: Path) -> Path | None:
    existing = [root / name for name in ("materials.js", "collections.js") if (root / name).exists()]
    if not existing:
        return None
    backup = timestamped_directory(root / "backups")
    for path in existing:
        shutil.copy2(path, backup / path.name)
    return backup


def run_extended_validation(root: Path) -> None:
    validator = root / "tools" / "validate_materials.py"
    if not validator.exists():
        return
    result = subprocess.run([sys.executable, str(validator), "--quiet"], cwd=root, check=False)
    if result.returncode:
        raise MaterialSyncError("扩展数据校验失败，未生成 materials.js。请查看 validation-report.json。")


def sync_materials(
    root: Path = ROOT,
    *,
    create_backup: bool = True,
    extended_validation: bool = True,
) -> dict:
    root = Path(root).resolve()
    materials = read_json(root / "materials.json")
    errors = validate_materials(materials)
    if errors:
        raise MaterialSyncError("\n".join(errors[:30]))
    collections_path = root / "collections.json"
    collections = read_json(collections_path) if collections_path.exists() else []
    if not isinstance(collections, list):
        raise MaterialSyncError("collections.json 顶层必须是数组。")
    if extended_validation:
        run_extended_validation(root)

    backup = backup_generated_files(root) if create_backup else None
    categories = build_categories(materials)
    materials_js = (
        "// AUTO-GENERATED by tools/sync_materials.py.\n"
        "// Edit materials.json and run the sync tool. Do not edit this file manually.\n\n"
        + js_assignment("MATERIAL_ID_ALIASES", ID_ALIASES)
        + js_assignment("MATERIAL_CATEGORIES", categories)
        + js_assignment("MATERIALS_DATA", materials)
    )
    collections_js = (
        "// AUTO-GENERATED by tools/sync_materials.py.\n"
        "// Application collections are generated from collections.json.\n\n"
        + js_assignment("MATERIAL_COLLECTIONS", collections)
    )
    atomic_write(root / "materials.js", materials_js)
    atomic_write(root / "collections.js", collections_js)
    return {
        "materials": len(materials),
        "collections": len(collections),
        "backup": str(backup) if backup else "",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="同步 MaterialBox 材料数据")
    parser.add_argument("--no-backup", action="store_true", help="不备份旧的生成文件")
    parser.add_argument("--skip-extended-validation", action="store_true")
    args = parser.parse_args()
    try:
        result = sync_materials(
            create_backup=not args.no_backup,
            extended_validation=not args.skip_extended_validation,
        )
    except MaterialSyncError as exc:
        print(f"同步失败：\n{exc}", file=sys.stderr)
        raise SystemExit(1) from exc
    print(f"同步成功：materials.js 已生成，共 {result['materials']} 条材料。")
    print(f"专题数据：{result['collections']} 个。")
    if result["backup"]:
        print(f"旧生成文件备份：{result['backup']}")


if __name__ == "__main__":
    main()
