#!/usr/bin/env python3
"""Build MaterialBox image maps and attribution files from local metadata."""

from __future__ import annotations

import argparse
import csv
import json
import re
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
IMAGE_TYPES = ("macro", "micro", "structure")
IMAGE_EXTENSIONS = (".webp", ".jpg", ".jpeg", ".png")
MATERIAL_ID = re.compile(r"^[a-z0-9][a-z0-9_-]*$")
ORIGIN_ORDER = {"manual": 0, "reviewed": 1, "generated": 2, "legacy": 3}


def read_json(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def atomic_json(path: Path, value) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def image_src(root: Path, path: Path) -> str:
    return path.relative_to(root).as_posix()


def normalized_entry(entry, *, src: str, material_name: str, image_type: str, origin: str = "manual") -> dict:
    entry = entry if isinstance(entry, dict) else {}
    return {
        "src": src,
        "alt": entry.get("alt") or f"{material_name}{'结构示意图' if image_type == 'structure' else image_type + '图'}",
        "caption": entry.get("caption") or entry.get("title") or "",
        "source": entry.get("source") or "",
        "author": entry.get("author") or "",
        "license": entry.get("license") or "",
        "licenseUrl": entry.get("licenseUrl") or "",
        "sourceUrl": entry.get("sourceUrl") or entry.get("filePage") or "",
        "accessed_at": entry.get("accessed_at") or entry.get("retrievedAt") or "",
        "origin": entry.get("origin") or origin,
    }


def metadata_entries(data) -> dict[str, list[dict]]:
    result = {image_type: [] for image_type in IMAGE_TYPES}
    if isinstance(data, dict):
        source = data.get("images") if isinstance(data.get("images"), dict) else data
        for image_type in IMAGE_TYPES:
            value = source.get(image_type, []) if isinstance(source, dict) else []
            if isinstance(value, str):
                value = [{"src": value}]
            if isinstance(value, list):
                result[image_type] = [item for item in value if isinstance(item, dict)]
    elif isinstance(data, list):
        for item in data:
            if not isinstance(item, dict):
                continue
            image_type = item.get("type", "macro")
            status = item.get("reviewStatus", "")
            path_text = item.get("file") or item.get("src") or ""
            if image_type in result and status in {"approved", "selected", "accepted"} and "/candidates/" not in path_text:
                result[image_type].append(item)
    return result


def find_existing_image(directory: Path, image_type: str, slot: int) -> Path | None:
    stem = f"{image_type}_{slot:02d}"
    for extension in IMAGE_EXTENSIONS:
        candidate = directory / f"{stem}{extension}"
        if candidate.is_file():
            return candidate
    return None


def collect_material_images(root: Path = ROOT) -> tuple[dict, list[dict]]:
    root = Path(root).resolve()
    materials = read_json(root / "materials.json", [])
    names = {item.get("id"): item.get("name_cn", item.get("id", "")) for item in materials if isinstance(item, dict)}
    image_root = root / "assets" / "images" / "materials"
    image_map: dict[str, dict[str, list[dict]]] = {}
    attributions: list[dict] = []
    for material_id, material_name in names.items():
        if not material_id or not MATERIAL_ID.fullmatch(material_id):
            continue
        directory = image_root / material_id
        metadata = metadata_entries(read_json(directory / "metadata.json", {}))
        record = {image_type: [] for image_type in IMAGE_TYPES}
        for image_type in IMAGE_TYPES:
            metadata_by_name = {}
            for item in metadata[image_type]:
                key = Path(str(item.get("src") or item.get("file") or "")).name.lower()
                if key:
                    metadata_by_name[key] = item
            seen: set[str] = set()
            for slot in range(1, 4):
                path = find_existing_image(directory, image_type, slot)
                if not path:
                    continue
                src = image_src(root, path)
                if src in seen:
                    continue
                seen.add(src)
                meta = metadata_by_name.get(path.name.lower(), {})
                entry = normalized_entry(meta, src=src, material_name=material_name, image_type=image_type)
                record[image_type].append(entry)
                attributions.append({"materialId": material_id, "materialName": material_name, "type": image_type, **entry})
            record[image_type].sort(key=lambda item: (ORIGIN_ORDER.get(item.get("origin", "manual"), 9), item["src"]))
        if any(record[image_type] for image_type in IMAGE_TYPES):
            image_map[material_id] = record
    return image_map, attributions


def generated_javascript(image_map: dict) -> str:
    payload = json.dumps(image_map, ensure_ascii=False, indent=2)
    return f"""// AUTO-GENERATED by tools/image_catalog.py. Do not edit manually.
(function () {{
  const generated = {payload};
  const merge = window.MaterialBoxMergeImageMaps || function (base, incoming) {{
    const output = {{ ...(base || {{}}) }};
    Object.entries(incoming || {{}}).forEach(([materialId, groups]) => {{
      const current = output[materialId] || {{}};
      output[materialId] = {{ ...current }};
      [\"macro\", \"micro\", \"structure\"].forEach((type) => {{
        const values = [...(current[type] || []), ...(groups[type] || [])];
        const seen = new Set();
        output[materialId][type] = values.filter((item) => item && item.src && !seen.has(item.src) && seen.add(item.src));
      }});
    }});
    return output;
  }};
  window.MATERIAL_IMAGE_GENERATED_MAP = generated;
  window.MATERIAL_IMAGE_MAP = merge(window.MATERIAL_IMAGE_MAP || {{}}, generated);
}})();
"""


def generate_image_outputs(root: Path = ROOT) -> dict:
    root = Path(root).resolve()
    image_map, attributions = collect_material_images(root)
    (root / "material-images.generated.js").write_text(generated_javascript(image_map), encoding="utf-8")
    atomic_json(root / "image-attribution.json", attributions)
    (root / "image-attribution.js").write_text(
        "// AUTO-GENERATED by tools/image_catalog.py.\nwindow.MATERIAL_IMAGE_ATTRIBUTIONS = "
        + json.dumps(attributions, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    fields = ["materialId", "materialName", "type", "caption", "alt", "author", "source", "license", "licenseUrl", "sourceUrl", "accessed_at", "src", "origin"]
    with (root / "image-attribution.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for item in attributions:
            writer.writerow({field: item.get(field, "") for field in fields})
    return {"materials": len(image_map), "images": len(attributions)}


def import_reviewed_pipeline(root: Path = ROOT) -> dict:
    """Import only already-applied images from the legacy 图片 pipeline."""
    from PIL import Image, ImageOps

    root = Path(root).resolve()
    legacy_root = root / "图片"
    legacy_images = legacy_root / "assets" / "images" / "materials"
    if not legacy_images.exists():
        return {"materials": 0, "images": 0}
    imported_materials: set[str] = set()
    imported_images = 0
    for metadata_path in legacy_images.glob("*/metadata.json"):
        material_id = metadata_path.parent.name
        if not MATERIAL_ID.fullmatch(material_id):
            continue
        legacy_data = read_json(metadata_path, {})
        entries = metadata_entries(legacy_data)
        target_dir = root / "assets" / "images" / "materials" / material_id
        target_dir.mkdir(parents=True, exist_ok=True)
        target_metadata = {"materialId": material_id, "images": metadata_entries(read_json(target_dir / "metadata.json", {}))}
        for image_type in IMAGE_TYPES:
            for index, entry in enumerate(entries[image_type][:3], start=1):
                legacy_src = str(entry.get("src") or entry.get("file") or "")
                source = legacy_root / legacy_src
                if not source.is_file() or "/candidates/" in legacy_src.replace("\\", "/"):
                    continue
                target = target_dir / f"{image_type}_{index:02d}.webp"
                if not target.exists():
                    with Image.open(source) as opened:
                        image = ImageOps.exif_transpose(opened).convert("RGB")
                        image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
                        image.save(target, "WEBP", quality=85, method=6)
                meta = normalized_entry(entry, src=image_src(root, target), material_name=legacy_data.get("name", material_id) if isinstance(legacy_data, dict) else material_id, image_type=image_type, origin="reviewed")
                meta["origin"] = "reviewed"
                if not meta["accessed_at"]:
                    meta["accessed_at"] = date.today().isoformat()
                target_metadata["images"][image_type] = [item for item in target_metadata["images"][image_type] if Path(str(item.get("src", ""))).name != target.name]
                target_metadata["images"][image_type].append(meta)
                imported_materials.add(material_id)
                imported_images += 1
        atomic_json(target_dir / "metadata.json", target_metadata)
    generate_image_outputs(root)
    return {"materials": len(imported_materials), "images": imported_images}


def main() -> None:
    parser = argparse.ArgumentParser(description="生成 MaterialBox 图片映射与署名清单")
    parser.add_argument("--import-reviewed", action="store_true", help="导入 图片/ 中已审核采用的图片")
    args = parser.parse_args()
    if args.import_reviewed:
        imported = import_reviewed_pipeline(ROOT)
        print(f"已导入审核图片：{imported['materials']} 个材料，{imported['images']} 张。")
    result = generate_image_outputs(ROOT)
    print(f"图片映射已生成：{result['materials']} 个材料，{result['images']} 张图片。")


if __name__ == "__main__":
    main()
