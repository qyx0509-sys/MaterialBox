#!/usr/bin/env python3
"""Fetch candidate MaterialBox material images from Wikimedia Commons.

Usage examples:
  python tools/fetch_material_images.py
  python tools/fetch_material_images.py --limit-materials 10 --max-images 2
  python tools/fetch_material_images.py --material steel --force

The script downloads candidate macro images only. Microstructure images usually need
manual expert review, so use metadata/review outputs before adding them to
material-images.js.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
MATERIALS_JSON = ROOT / "materials.json"
ASSET_ROOT = ROOT / "assets" / "images" / "materials"
REVIEW_JSON = ROOT / "review-images.json"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "MaterialBoxImageFetcher/1.0 (static learning project)"


def clean_html(value: str) -> str:
    value = re.sub(r"<[^>]+>", "", value or "")
    return html.unescape(value).strip()


def request_json(url: str, retries: int = 3, delay: float = 1.0) -> dict[str, Any]:
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=25) as response:
                return json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            last_error = exc
            time.sleep(delay * (attempt + 1))
    raise RuntimeError(f"Request failed after {retries} attempts: {last_error}")


def download_file(url: str, target: Path, retries: int = 3, delay: float = 1.0) -> bool:
    if target.exists():
        return False
    target.parent.mkdir(parents=True, exist_ok=True)
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=35) as response:
                target.write_bytes(response.read())
            return True
        except (urllib.error.URLError, TimeoutError) as exc:
            last_error = exc
            time.sleep(delay * (attempt + 1))
    print(f"  download failed: {url} ({last_error})")
    return False


def material_keywords(material: dict[str, Any], by_id: dict[str, dict[str, Any]]) -> list[str]:
    base = material.get("name_en") or material.get("name_cn") or material["id"]
    abbr = material.get("abbreviation") or ""
    path = material.get("taxonomy_path") or []
    category = " ".join(path[-3:]) or material.get("category_2") or material.get("category_1") or ""
    parent = by_id.get(material.get("parent_id", ""), {})
    parent_name = parent.get("name_en") or parent.get("name_cn") or ""
    raw = [
        f"{base} material sample",
        f"{base} material texture",
        f"{base} sheet",
        f"{base} pellets",
        f"{base} ceramic",
        f"{base} {category}",
        f"{base} {parent_name} material",
        f"{material.get('name_cn', '')} {parent.get('name_cn', '')} 材料",
    ]
    if abbr:
        raw.extend([f"{abbr} material", f"{abbr} sample"])
    seen: set[str] = set()
    result: list[str] = []
    for item in raw:
        item = re.sub(r"\s+", " ", item).strip()
        key = item.lower()
        if item and key not in seen:
            seen.add(key)
            result.append(item)
    return result


def commons_search(query: str, limit: int = 8) -> list[dict[str, Any]]:
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": "6",
        "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|mime|extmetadata",
        "format": "json",
        "formatversion": "2",
    }
    url = COMMONS_API + "?" + urllib.parse.urlencode(params)
    data = request_json(url)
    pages = data.get("query", {}).get("pages", [])
    return pages if isinstance(pages, list) else []


def page_to_candidate(page: dict[str, Any]) -> dict[str, Any] | None:
    imageinfo = (page.get("imageinfo") or [{}])[0]
    if imageinfo.get("mime") != "image/jpeg":
        return None
    url = imageinfo.get("url")
    if not url:
        return None
    meta = imageinfo.get("extmetadata") or {}

    def meta_value(key: str) -> str:
        value = meta.get(key, {}).get("value", "")
        return clean_html(value)

    return {
        "downloadUrl": url,
        "sourceUrl": meta_value("ImageDescription") or page.get("title", ""),
        "filePage": f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(page.get('title', '').replace(' ', '_'))}",
        "author": meta_value("Artist"),
        "license": meta_value("LicenseShortName") or meta_value("UsageTerms"),
        "licenseUrl": meta_value("LicenseUrl"),
        "source": "Wikimedia Commons",
        "title": page.get("title", ""),
    }


def load_existing_metadata(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return []


def process_material(material: dict[str, Any], by_id: dict[str, dict[str, Any]], max_images: int, delay: float, force: bool) -> dict[str, Any]:
    material_id = material["id"]
    target_dir = ASSET_ROOT / material_id
    target_dir.mkdir(parents=True, exist_ok=True)
    metadata_path = target_dir / "metadata.json"
    metadata = [] if force else load_existing_metadata(metadata_path)
    existing_urls = {item.get("downloadUrl") for item in metadata}

    print(f"Searching {material_id} - {material.get('name_cn', '')}")
    for keyword in material_keywords(material, by_id):
        if len(metadata) >= max_images:
            break
        print(f"  query: {keyword}")
        try:
            pages = commons_search(keyword)
        except RuntimeError as exc:
            print(f"  search failed: {exc}")
            continue
        time.sleep(delay)
        for page in pages:
            if len(metadata) >= max_images:
                break
            candidate = page_to_candidate(page)
            if not candidate or candidate["downloadUrl"] in existing_urls:
                continue
            index = len(metadata) + 1
            target = target_dir / f"macro_{index:02d}.jpg"
            downloaded = download_file(candidate["downloadUrl"], target)
            time.sleep(delay)
            record = {
                "materialId": material_id,
                "materialName": material.get("name_cn", ""),
                "entityType": material.get("entity_type", "material"),
                "parentId": material.get("parent_id", ""),
                "taxonomyPath": material.get("taxonomy_path", []),
                "type": "macro",
                "file": str(target.relative_to(ROOT)).replace("\\", "/"),
                "alt": f"{material.get('name_cn', material_id)}候选宏观图",
                "source": candidate["source"],
                "author": candidate["author"],
                "license": candidate["license"],
                "licenseUrl": candidate["licenseUrl"],
                "sourceUrl": candidate["filePage"],
                "downloadUrl": candidate["downloadUrl"],
                "title": candidate["title"],
                "downloaded": downloaded,
                "reviewStatus": "pending",
            }
            metadata.append(record)
            existing_urls.add(candidate["downloadUrl"])
            print(f"  saved: {record['file']}")
    metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    return {
        "materialId": material_id,
        "name": material.get("name_cn", ""),
        "entityType": material.get("entity_type", "material"),
        "taxonomyPath": material.get("taxonomy_path", []),
        "images": metadata,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--materials", default=str(MATERIALS_JSON), help="Path to materials.json")
    parser.add_argument("--material", action="append", help="Only fetch selected material id; can be repeated")
    parser.add_argument("--limit-materials", type=int, default=0, help="Limit number of materials processed")
    parser.add_argument("--max-images", type=int, default=3, help="Max macro candidates per material")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay between API/download requests")
    parser.add_argument("--force", action="store_true", help="Regenerate metadata and overwrite candidate numbering")
    args = parser.parse_args()

    materials = json.loads(Path(args.materials).read_text(encoding="utf-8"))
    by_id = {item["id"]: item for item in materials}
    if args.material:
        wanted = set(args.material)
        materials = [item for item in materials if item.get("id") in wanted]
    if args.limit_materials:
        materials = materials[: args.limit_materials]

    review = [process_material(item, by_id, args.max_images, args.delay, args.force) for item in materials]
    REVIEW_JSON.write_text(json.dumps(review, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Review file written: {REVIEW_JSON.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
