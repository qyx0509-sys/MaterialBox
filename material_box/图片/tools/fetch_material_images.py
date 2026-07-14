#!/usr/bin/env python3
"""MaterialBox macro-image batch fetcher.

Workflow
--------
1. fetch: search Wikimedia Commons and download review candidates.
2. review: open review-images.html and export review-selections.json.
3. apply: copy approved candidates to macro_01.jpg and generate
   material-images.generated.js plus image-attribution.csv.
4. status: inspect pipeline progress.

The script deliberately uses the Wikimedia Commons API instead of scraping
search-engine result pages. It stores source/author/license metadata with every
candidate so the website can keep attribution information.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import os
import re
import shutil
import sys
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlparse

try:
    import requests
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "缺少 requests。请先运行：python -m pip install -r tools/requirements.txt"
    ) from exc

try:
    from PIL import Image, ImageOps, UnidentifiedImageError
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "缺少 Pillow。请先运行：python -m pip install -r tools/requirements.txt"
    ) from exc

COMMONS_API = "https://commons.wikimedia.org/w/api.php"
DEFAULT_IMAGE_WIDTH = 1600
DEFAULT_MIN_EDGE = 500
ALLOWED_LICENSE_PREFIXES = (
    "cc0",
    "public domain",
    "pd-",
    "cc by",
    "cc-by",
    "cc by-sa",
    "cc-by-sa",
)

NEGATIVE_WORDS = {
    "logo", "icon", "symbol", "map", "flag", "coat of arms", "portrait",
    "screenshot", "graph", "chart", "plot", "chemical structure",
    "molecular structure", "formula", "equation", "diagram", "scheme",
    "book cover", "poster", "stamp", "coin", "banknote", "text only",
}

CATEGORY_SUFFIXES: dict[str, list[str]] = {
    "金属材料": ["material sample", "alloy plate bar sheet"],
    "高分子材料": ["polymer pellets material sample", "plastic granules sheet"],
    "无机非金属材料": ["material sample", "ceramic glass specimen"],
    "复合材料": ["composite material sample", "composite laminate panel"],
    "功能材料": ["material sample", "wafer film powder specimen"],
    "新能源材料": ["battery material powder sample", "energy material specimen"],
    "生物医用材料": ["biomaterial sample", "medical material specimen"],
    "纳米材料": ["nanomaterial powder sample", "material specimen"],
    "传统与天然材料": ["raw material texture", "material sample close up"],
    "纺织与日用品材料": ["fiber fabric material close up", "raw material sample"],
    "建筑与装饰材料": ["building material sample texture", "construction material close up"],
}

SUBCATEGORY_SUFFIXES: dict[str, list[str]] = {
    "通用塑料": ["resin pellets", "plastic granules"],
    "工程塑料": ["engineering plastic pellets", "plastic rod sheet"],
    "特种工程塑料": ["polymer pellets", "machined plastic stock"],
    "橡胶": ["rubber sheet material", "rubber sample"],
    "树脂": ["resin material sample", "cured resin"],
    "陶瓷材料": ["ceramic specimen", "ceramic component"],
    "玻璃材料": ["glass material sample", "glass sheet"],
    "半导体材料": ["semiconductor wafer", "crystal material sample"],
    "磁性材料": ["magnetic material sample", "magnet ferrite"],
    "光电材料": ["optoelectronic material film", "material sample"],
    "智能材料": ["smart material sample", "actuator material"],
    "锂电池材料": ["battery powder material", "electrode material sample"],
    "光伏材料": ["photovoltaic material wafer", "solar cell material"],
    "碳基纳米材料": ["carbon nanomaterial powder", "material sample"],
    "天然纤维": ["natural fiber close up", "fiber raw material"],
    "合成纤维": ["synthetic fiber close up", "fiber material"],
    "木质板材": ["wood panel sample", "board texture"],
}

# Ambiguous short abbreviations are never used alone.
AMBIGUOUS_ABBREVIATIONS = {
    "PE", "PP", "PC", "PA", "PI", "PS", "PET", "PBT", "PU", "EP",
    "Si", "C/C", "ITO", "LCP", "PLA", "PPS", "ABS",
}

HTML_TAG_RE = re.compile(r"<[^>]+>")
SAFE_NAME_RE = re.compile(r"[^a-zA-Z0-9._-]+")


@dataclass
class Candidate:
    id: str
    file: str
    alt: str
    title: str
    source: str
    author: str
    license: str
    licenseUrl: str
    sourceUrl: str
    originalUrl: str
    query: str
    score: float
    width: int
    height: int
    sha256: str
    approved: bool = False


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    text = value.get("value", "") if isinstance(value, dict) else str(value)
    text = HTML_TAG_RE.sub(" ", text)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def safe_filename(value: str) -> str:
    value = SAFE_NAME_RE.sub("_", value).strip("._")
    return value or "material"


def read_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def load_materials(path: Path) -> list[dict[str, Any]]:
    data = read_json(path)
    if not isinstance(data, list) or not data:
        raise ValueError(f"材料数据无效或为空：{path}")
    required = {"id", "name_cn", "name_en"}
    for index, item in enumerate(data):
        if not isinstance(item, dict) or not required.issubset(item):
            raise ValueError(f"第 {index + 1} 条材料缺少必要字段：{required}")
    return data


def material_queries(material: dict[str, Any], max_queries: int = 3) -> list[str]:
    name_en = clean_text(material.get("name_en"))
    name_cn = clean_text(material.get("name_cn"))
    abbreviation = clean_text(material.get("abbreviation"))
    category = clean_text(material.get("category_1"))
    subcategory = clean_text(material.get("category_2"))

    bases: list[str] = []
    if name_en:
        bases.append(name_en)
    if abbreviation and abbreviation not in AMBIGUOUS_ABBREVIATIONS and len(abbreviation) >= 3:
        bases.append(f"{name_en} {abbreviation}".strip())
    if name_cn:
        bases.append(name_cn)

    suffixes = SUBCATEGORY_SUFFIXES.get(subcategory, []) + CATEGORY_SUFFIXES.get(category, [])
    if not suffixes:
        suffixes = ["material sample", "material texture"]

    queries: list[str] = []
    for base in bases[:2]:
        for suffix in suffixes:
            query = f"{base} {suffix}".strip()
            if query not in queries:
                queries.append(query)
            if len(queries) >= max_queries:
                return queries
    return queries[:max_queries]


def token_set(material: dict[str, Any]) -> set[str]:
    fields = [
        material.get("name_en", ""), material.get("name_cn", ""),
        material.get("abbreviation", ""), material.get("category_2", ""),
        material.get("category_3", ""),
    ]
    fields.extend(material.get("aliases") or [])
    tokens: set[str] = set()
    for value in fields:
        for token in re.findall(r"[a-zA-Z0-9]+|[\u4e00-\u9fff]{2,}", str(value).lower()):
            if len(token) >= 3 or re.search(r"[\u4e00-\u9fff]", token):
                tokens.add(token)
    return tokens


def candidate_score(
    material: dict[str, Any], title: str, description: str, categories: Iterable[str], query: str
) -> float:
    haystack = " ".join([title, description, *categories]).lower()
    score = 0.0
    for token in token_set(material):
        if token.lower() in haystack:
            score += 3.0 if token.lower() in title.lower() else 1.25
    for word in NEGATIVE_WORDS:
        if word in haystack:
            score -= 4.5
    if any(word in haystack for word in ("sample", "specimen", "material", "plate", "sheet", "pellet", "powder", "fiber", "texture")):
        score += 1.5
    query_tokens = [t for t in re.findall(r"[a-zA-Z]{4,}", query.lower()) if t not in {"material", "sample"}]
    score += sum(0.35 for token in query_tokens if token in haystack)
    return round(score, 3)


def license_allowed(license_name: str, allow_other: bool) -> bool:
    if allow_other:
        return bool(license_name)
    normalized = license_name.strip().lower()
    return any(normalized.startswith(prefix) for prefix in ALLOWED_LICENSE_PREFIXES)


class CommonsClient:
    def __init__(self, user_agent: str, timeout: float = 30.0, delay: float = 0.45):
        self.timeout = timeout
        self.delay = max(0.0, delay)
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": user_agent,
            "Accept": "application/json",
        })
        self._last_request_at = 0.0

    def _throttle(self) -> None:
        elapsed = time.monotonic() - self._last_request_at
        if elapsed < self.delay:
            time.sleep(self.delay - elapsed)

    def get(self, url: str, **kwargs: Any) -> requests.Response:
        self._throttle()
        for attempt in range(4):
            try:
                response = self.session.get(url, timeout=self.timeout, **kwargs)
                self._last_request_at = time.monotonic()
                if response.status_code in {429, 500, 502, 503, 504}:
                    retry_after = float(response.headers.get("Retry-After", 0) or 0)
                    time.sleep(max(retry_after, 1.5 * (2 ** attempt)))
                    continue
                response.raise_for_status()
                return response
            except requests.RequestException:
                if attempt == 3:
                    raise
                time.sleep(1.5 * (2 ** attempt))
        raise RuntimeError("请求重试失败")

    def search(self, query: str, limit: int, thumb_width: int) -> list[dict[str, Any]]:
        params = {
            "action": "query",
            "format": "json",
            "formatversion": "2",
            "generator": "search",
            "gsrsearch": query,
            "gsrnamespace": "6",
            "gsrlimit": str(min(max(limit, 1), 50)),
            "prop": "imageinfo|categories",
            "iiprop": "url|mime|size|extmetadata",
            "iiurlwidth": str(thumb_width),
            "cllimit": "20",
            "origin": "*",
        }
        response = self.get(COMMONS_API, params=params)
        payload = response.json()
        if "error" in payload:
            raise RuntimeError(payload["error"].get("info", "Commons API 返回错误"))
        return payload.get("query", {}).get("pages", []) or []


def image_url_from_info(info: dict[str, Any]) -> str:
    return clean_text(info.get("thumburl")) or clean_text(info.get("url"))


def commons_candidates(
    client: CommonsClient,
    material: dict[str, Any],
    query: str,
    search_limit: int,
    thumb_width: int,
    allow_other_licenses: bool,
) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for page in client.search(query, search_limit, thumb_width):
        infos = page.get("imageinfo") or []
        if not infos:
            continue
        info = infos[0]
        metadata = info.get("extmetadata") or {}
        mime = clean_text(info.get("mime")).lower()
        image_url = image_url_from_info(info)
        if not image_url or mime not in {"image/jpeg", "image/png", "image/webp"}:
            continue

        license_name = clean_text(metadata.get("LicenseShortName"))
        if not license_allowed(license_name, allow_other_licenses):
            continue

        title = clean_text(page.get("title")).removeprefix("File:")
        description = clean_text(metadata.get("ImageDescription"))
        categories = [clean_text(item.get("title")).removeprefix("Category:") for item in (page.get("categories") or [])]
        author = clean_text(metadata.get("Artist")) or clean_text(metadata.get("Credit"))
        source_url = clean_text(info.get("descriptionurl"))
        original_url = clean_text(info.get("url"))
        score = candidate_score(material, title, description, categories, query)

        results.append({
            "title": title,
            "image_url": image_url,
            "source_url": source_url,
            "original_url": original_url,
            "author": author,
            "license": license_name,
            "license_url": clean_text(metadata.get("LicenseUrl")),
            "description": description,
            "query": query,
            "score": score,
            "api_width": int(info.get("thumbwidth") or info.get("width") or 0),
            "api_height": int(info.get("thumbheight") or info.get("height") or 0),
        })
    return results


def normalized_jpeg(
    response_content: bytes,
    destination: Path,
    max_edge: int,
    min_edge: int,
) -> tuple[int, int, str]:
    temp = destination.with_suffix(".download")
    temp.write_bytes(response_content)
    try:
        with Image.open(temp) as opened:
            image = ImageOps.exif_transpose(opened)
            if min(image.size) < min_edge:
                raise ValueError(f"图片尺寸过小：{image.size[0]}×{image.size[1]}")
            if image.mode in {"RGBA", "LA"} or (image.mode == "P" and "transparency" in image.info):
                background = Image.new("RGB", image.size, "white")
                alpha = image.convert("RGBA")
                background.paste(alpha, mask=alpha.getchannel("A"))
                image = background
            else:
                image = image.convert("RGB")
            image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
            destination.parent.mkdir(parents=True, exist_ok=True)
            image.save(destination, format="JPEG", quality=88, optimize=True, progressive=True)
            width, height = image.size
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError("下载内容不是有效图片") from exc
    finally:
        temp.unlink(missing_ok=True)

    digest = hashlib.sha256(destination.read_bytes()).hexdigest()
    return width, height, digest


def relative_web_path(path: Path, project_root: Path) -> str:
    return path.resolve().relative_to(project_root.resolve()).as_posix()


def merge_review_entry(review: list[dict[str, Any]], entry: dict[str, Any]) -> None:
    for index, old in enumerate(review):
        if old.get("materialId") == entry.get("materialId"):
            review[index] = entry
            return
    review.append(entry)


def fetch_one_material(
    *,
    client: CommonsClient,
    material: dict[str, Any],
    project_root: Path,
    output_root: Path,
    candidate_limit: int,
    search_limit: int,
    max_queries: int,
    thumb_width: int,
    max_edge: int,
    min_edge: int,
    overwrite: bool,
    allow_other_licenses: bool,
) -> dict[str, Any]:
    material_id = safe_filename(str(material["id"]))
    candidate_dir = output_root / material_id / "candidates"
    candidate_dir.mkdir(parents=True, exist_ok=True)

    if overwrite:
        for old_file in candidate_dir.glob("macro_candidate_*.jpg"):
            old_file.unlink(missing_ok=True)

    queries = material_queries(material, max_queries=max_queries)
    raw_candidates: list[dict[str, Any]] = []
    seen_urls: set[str] = set()
    for query in queries:
        try:
            found = commons_candidates(
                client, material, query, search_limit, thumb_width, allow_other_licenses
            )
        except Exception as exc:
            print(f"  ! 搜索失败：{query}：{exc}", file=sys.stderr)
            continue
        for item in found:
            url = item["image_url"]
            if url not in seen_urls:
                seen_urls.add(url)
                raw_candidates.append(item)
        if len(raw_candidates) >= candidate_limit * 4:
            break

    raw_candidates.sort(key=lambda item: item["score"], reverse=True)
    selected_pool = raw_candidates[: max(candidate_limit * 4, candidate_limit)]

    saved: list[Candidate] = []
    seen_hashes: set[str] = set()
    for item in selected_pool:
        if len(saved) >= candidate_limit:
            break
        filename = f"macro_candidate_{len(saved) + 1:02d}.jpg"
        destination = candidate_dir / filename
        try:
            response = client.get(item["image_url"], stream=False)
            content_type = response.headers.get("Content-Type", "").lower()
            if content_type and "image" not in content_type:
                raise ValueError(f"响应不是图片：{content_type}")
            width, height, digest = normalized_jpeg(
                response.content, destination, max_edge=max_edge, min_edge=min_edge
            )
            if digest in seen_hashes:
                destination.unlink(missing_ok=True)
                continue
            seen_hashes.add(digest)
        except Exception as exc:
            destination.unlink(missing_ok=True)
            print(f"  ! 下载失败：{item['title']}：{exc}", file=sys.stderr)
            continue

        candidate = Candidate(
            id=f"{material_id}-macro-{len(saved) + 1:02d}",
            file=relative_web_path(destination, project_root),
            alt=f"{material['name_cn']}宏观图片候选 {len(saved) + 1}",
            title=item["title"],
            source="Wikimedia Commons",
            author=item["author"],
            license=item["license"],
            licenseUrl=item["license_url"],
            sourceUrl=item["source_url"],
            originalUrl=item["original_url"],
            query=item["query"],
            score=item["score"],
            width=width,
            height=height,
            sha256=digest,
        )
        saved.append(candidate)

    return {
        "materialId": material["id"],
        "name": material["name_cn"],
        "nameEn": material.get("name_en", ""),
        "category": material.get("category_1", ""),
        "subcategory": material.get("category_2", ""),
        "queries": queries,
        "images": [asdict(item) for item in saved],
    }


def select_materials(
    materials: list[dict[str, Any]],
    ids: list[str] | None,
    category: str | None,
    max_materials: int | None,
) -> list[dict[str, Any]]:
    chosen = materials
    if ids:
        requested = {item.strip() for item in ids if item.strip()}
        chosen = [m for m in chosen if m["id"] in requested or m["name_cn"] in requested]
    if category:
        chosen = [m for m in chosen if m.get("category_1") == category]
    if max_materials is not None:
        chosen = chosen[: max(0, max_materials)]
    return chosen


def load_review(path: Path) -> list[dict[str, Any]]:
    data = read_json(path, default=[])
    return data if isinstance(data, list) else []


def apply_candidate(
    project_root: Path,
    output_root: Path,
    material: dict[str, Any],
    image: dict[str, Any],
) -> dict[str, Any]:
    source = project_root / image["file"]
    if not source.exists():
        raise FileNotFoundError(f"候选图片不存在：{source}")

    material_dir = output_root / safe_filename(str(material["id"]))
    material_dir.mkdir(parents=True, exist_ok=True)
    destination = material_dir / "macro_01.jpg"
    shutil.copy2(source, destination)

    record = {
        "src": relative_web_path(destination, project_root),
        "alt": f"{material['name_cn']}宏观外观图片",
        "caption": image.get("title") or f"{material['name_cn']}宏观外观",
        "source": image.get("source", "Wikimedia Commons"),
        "author": image.get("author", ""),
        "license": image.get("license", ""),
        "licenseUrl": image.get("licenseUrl", ""),
        "sourceUrl": image.get("sourceUrl", ""),
        "originalUrl": image.get("originalUrl", ""),
        "retrievedAt": time.strftime("%Y-%m-%d"),
        "sha256": image.get("sha256", ""),
    }
    metadata_path = material_dir / "metadata.json"
    metadata = read_json(metadata_path, default={}) or {}
    metadata.update({
        "materialId": material["id"],
        "name": material["name_cn"],
        "macro": [record],
    })
    write_json(metadata_path, metadata)
    return record


def collect_metadata(output_root: Path) -> dict[str, dict[str, Any]]:
    image_map: dict[str, dict[str, Any]] = {}
    if not output_root.exists():
        return image_map
    for metadata_path in output_root.glob("*/metadata.json"):
        data = read_json(metadata_path, default={}) or {}
        material_id = data.get("materialId") or metadata_path.parent.name
        macro = data.get("macro") if isinstance(data.get("macro"), list) else []
        micro = data.get("micro") if isinstance(data.get("micro"), list) else []
        structure = data.get("structure") if isinstance(data.get("structure"), list) else []
        image_map[str(material_id)] = {"macro": macro, "micro": micro, "structure": structure}
    return dict(sorted(image_map.items()))


def write_generated_image_map(path: Path, image_map: dict[str, dict[str, Any]]) -> None:
    payload = json.dumps(image_map, ensure_ascii=False, indent=2)
    content = (
        "// Auto-generated by tools/fetch_material_images.py.\n"
        "// Manual entries in material-images.js are preserved; generated entries override\n"
        "// matching material IDs only. Re-run the apply command to refresh this file.\n"
        "window.MATERIAL_IMAGE_MAP = Object.assign(\n"
        "  {},\n"
        "  window.MATERIAL_IMAGE_MAP || {},\n"
        f"  {payload}\n"
        ");\n"
    )
    path.write_text(content, encoding="utf-8")


def write_attribution_csv(path: Path, image_map: dict[str, dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=[
            "material_id", "type", "file", "caption", "source", "author",
            "license", "license_url", "source_url", "original_url", "retrieved_at",
        ])
        writer.writeheader()
        for material_id, groups in image_map.items():
            for image_type in ("macro", "micro", "structure"):
                for item in groups.get(image_type, []) or []:
                    writer.writerow({
                        "material_id": material_id,
                        "type": image_type,
                        "file": item.get("src", ""),
                        "caption": item.get("caption", ""),
                        "source": item.get("source", ""),
                        "author": item.get("author", ""),
                        "license": item.get("license", ""),
                        "license_url": item.get("licenseUrl", ""),
                        "source_url": item.get("sourceUrl", ""),
                        "original_url": item.get("originalUrl", ""),
                        "retrieved_at": item.get("retrievedAt", ""),
                    })


def normalize_selection_payload(data: Any) -> dict[str, str]:
    selections: dict[str, str] = {}
    if not isinstance(data, list):
        return selections
    for item in data:
        if not isinstance(item, dict):
            continue
        material_id = str(item.get("materialId", "")).strip()
        selected = str(item.get("selectedFile", "")).strip()
        if material_id and selected:
            selections[material_id] = selected
            continue
        for image in item.get("images") or []:
            if image.get("approved") and image.get("file"):
                selections[material_id] = str(image["file"])
                break
    return selections


def ensure_index_script(index_path: Path, generated_filename: str) -> bool:
    if not index_path.exists():
        return False
    text = index_path.read_text(encoding="utf-8")
    script_tag = f'<script src="{generated_filename}"></script>'
    if script_tag in text:
        return False
    anchor = '<script src="material-images.js"></script>'
    if anchor not in text:
        return False
    text = text.replace(anchor, f"{anchor}\n    {script_tag}", 1)
    index_path.write_text(text, encoding="utf-8")
    return True


def command_fetch(args: argparse.Namespace) -> int:
    project_root = args.project_root.resolve()
    materials_path = project_root / args.materials
    review_path = project_root / args.review
    output_root = project_root / args.output_root
    generated_path = project_root / args.generated_map

    materials = load_materials(materials_path)
    selected = select_materials(materials, args.material, args.category, args.max_materials)
    if not selected:
        print("没有匹配到材料。请检查 --material 或 --category。", file=sys.stderr)
        return 2

    contact = args.contact or os.environ.get("MATERIALBOX_CONTACT", "contact-not-configured")
    user_agent = args.user_agent or f"MaterialBoxImageFetcher/1.0 (educational project; {contact})"
    if contact == "contact-not-configured":
        print("提示：建议通过 --contact 填写邮箱或项目主页，以符合 Wikimedia User-Agent 规范。")

    client = CommonsClient(user_agent=user_agent, timeout=args.timeout, delay=args.delay)
    review = load_review(review_path)
    total = len(selected)

    for index, material in enumerate(selected, start=1):
        print(f"[{index}/{total}] {material['name_cn']} / {material['name_en']}")
        material_dir = output_root / safe_filename(str(material["id"]))
        existing = next(material_dir.glob("candidates/macro_candidate_*.jpg"), None) if material_dir.exists() else None
        if existing and not args.overwrite:
            old_entry = next((x for x in review if x.get("materialId") == material["id"]), None)
            if old_entry:
                print("  - 已有候选图，跳过（使用 --overwrite 可重新获取）")
                continue

        entry = fetch_one_material(
            client=client,
            material=material,
            project_root=project_root,
            output_root=output_root,
            candidate_limit=args.limit,
            search_limit=args.search_limit,
            max_queries=args.max_queries,
            thumb_width=args.thumb_width,
            max_edge=args.max_edge,
            min_edge=args.min_edge,
            overwrite=args.overwrite,
            allow_other_licenses=args.allow_other_licenses,
        )
        merge_review_entry(review, entry)
        review.sort(key=lambda item: next((i for i, m in enumerate(materials) if m["id"] == item.get("materialId")), 10**9))
        write_json(review_path, review)
        print(f"  - 保存 {len(entry['images'])} 张候选图")

        if args.auto_apply and entry["images"]:
            apply_candidate(project_root, output_root, material, entry["images"][0])
            print("  - 已自动采用排名第 1 的候选图")

    if args.auto_apply:
        image_map = collect_metadata(output_root)
        write_generated_image_map(generated_path, image_map)
        write_attribution_csv(project_root / args.attribution, image_map)
        ensure_index_script(project_root / "index.html", Path(args.generated_map).name)

    successful = sum(1 for item in review if item.get("images"))
    print(f"完成：审核清单中 {successful} 个材料已有候选图。")
    print(f"审核文件：{review_path}")
    if not args.auto_apply:
        print("下一步：用本地服务器打开 review-images.html，选择图片并导出 review-selections.json。")
    return 0


def command_apply(args: argparse.Namespace) -> int:
    project_root = args.project_root.resolve()
    materials = load_materials(project_root / args.materials)
    material_lookup = {str(item["id"]): item for item in materials}
    review = load_review(project_root / args.review)
    review_lookup = {str(item.get("materialId")): item for item in review}
    selections = normalize_selection_payload(read_json(project_root / args.selections, default=[]))
    if not selections and args.auto_top:
        for item in review:
            images = item.get("images") or []
            if images:
                selections[str(item.get("materialId"))] = str(images[0].get("file", ""))
    if not selections:
        print("未找到选择结果。请先在审核页导出 review-selections.json，或使用 --auto-top。", file=sys.stderr)
        return 2

    output_root = project_root / args.output_root
    applied = 0
    for material_id, selected_file in selections.items():
        material = material_lookup.get(material_id)
        review_item = review_lookup.get(material_id)
        if not material or not review_item:
            print(f"! 跳过未知材料：{material_id}", file=sys.stderr)
            continue
        image = next((x for x in (review_item.get("images") or []) if x.get("file") == selected_file), None)
        if not image:
            print(f"! 未在审核清单中找到图片：{material_id} / {selected_file}", file=sys.stderr)
            continue
        try:
            apply_candidate(project_root, output_root, material, image)
            applied += 1
            print(f"✓ {material['name_cn']} -> assets/images/materials/{material_id}/macro_01.jpg")
        except Exception as exc:
            print(f"! 应用失败：{material_id}：{exc}", file=sys.stderr)

    image_map = collect_metadata(output_root)
    generated_path = project_root / args.generated_map
    write_generated_image_map(generated_path, image_map)
    write_attribution_csv(project_root / args.attribution, image_map)
    changed = ensure_index_script(project_root / "index.html", Path(args.generated_map).name)
    print(f"已应用 {applied} 个材料。")
    print(f"已生成：{generated_path}")
    print(f"已生成：{project_root / args.attribution}")
    if changed:
        print("已在 index.html 中自动加入 material-images.generated.js。")
    return 0 if applied else 1


def command_status(args: argparse.Namespace) -> int:
    project_root = args.project_root.resolve()
    materials = load_materials(project_root / args.materials)
    review = load_review(project_root / args.review)
    review_lookup = {str(item.get("materialId")): item for item in review}
    output_root = project_root / args.output_root

    candidate_count = 0
    applied_count = 0
    missing: list[str] = []
    for material in materials:
        material_id = str(material["id"])
        if (review_lookup.get(material_id, {}).get("images") or []):
            candidate_count += 1
        if (output_root / safe_filename(material_id) / "macro_01.jpg").exists():
            applied_count += 1
        else:
            missing.append(f"{material['name_cn']}({material_id})")

    print(f"材料总数：{len(materials)}")
    print(f"已有候选图：{candidate_count}")
    print(f"已应用宏观图：{applied_count}")
    print(f"仍缺宏观图：{len(missing)}")
    if args.show_missing and missing:
        print("、".join(missing))
    return 0


def command_plan(args: argparse.Namespace) -> int:
    project_root = args.project_root.resolve()
    materials = load_materials(project_root / args.materials)
    selected = select_materials(materials, args.material, args.category, args.max_materials)
    for material in selected:
        print(f"{material['name_cn']} ({material['id']}):")
        for query in material_queries(material, max_queries=args.max_queries):
            print(f"  - {query}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="批量检索、下载、审核并接入 MaterialBox 材料宏观图片。"
    )
    parser.add_argument(
        "--project-root", type=Path, default=Path(__file__).resolve().parents[1],
        help="项目根目录，默认是 tools 的上一级目录。",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--materials", default="materials.json", help="材料数据文件。")
    common.add_argument("--review", default="review-images.json", help="审核清单文件。")
    common.add_argument("--output-root", default="assets/images/materials", help="图片输出目录。")

    fetch = subparsers.add_parser("fetch", parents=[common], help="获取宏观图片候选。")
    fetch.add_argument("--limit", type=int, default=3, help="每种材料保存的候选图数量。")
    fetch.add_argument("--search-limit", type=int, default=16, help="每个关键词从 Commons 获取的结果数。")
    fetch.add_argument("--max-queries", type=int, default=3, help="每种材料最多使用的搜索关键词数量。")
    fetch.add_argument("--material", action="append", help="只处理指定材料 ID 或中文名，可重复使用。")
    fetch.add_argument("--category", help="只处理指定一级分类。")
    fetch.add_argument("--max-materials", type=int, help="最多处理前 N 个材料，便于测试。")
    fetch.add_argument("--overwrite", action="store_true", help="覆盖已有候选图。")
    fetch.add_argument("--auto-apply", action="store_true", help="自动采用每种材料排名第一的图片。")
    fetch.add_argument("--allow-other-licenses", action="store_true", help="允许默认白名单之外的 Commons 许可证。")
    fetch.add_argument("--thumb-width", type=int, default=DEFAULT_IMAGE_WIDTH, help="向 Commons 请求的缩略图宽度。")
    fetch.add_argument("--max-edge", type=int, default=1600, help="本地图片最大边长。")
    fetch.add_argument("--min-edge", type=int, default=DEFAULT_MIN_EDGE, help="候选图最短边最低像素。")
    fetch.add_argument("--delay", type=float, default=0.45, help="两次网络请求之间的最小间隔秒数。")
    fetch.add_argument("--timeout", type=float, default=30.0, help="单次网络请求超时秒数。")
    fetch.add_argument("--contact", help="用于 Wikimedia User-Agent 的邮箱或项目主页。")
    fetch.add_argument("--user-agent", help="完全自定义 HTTP User-Agent。")
    fetch.add_argument("--generated-map", default="material-images.generated.js", help="自动应用时生成的图片映射。")
    fetch.add_argument("--attribution", default="image-attribution.csv", help="图片署名清单。")
    fetch.set_defaults(func=command_fetch)

    apply = subparsers.add_parser("apply", parents=[common], help="应用审核通过的图片。")
    apply.add_argument("--selections", default="review-selections.json", help="审核页导出的选择文件。")
    apply.add_argument("--auto-top", action="store_true", help="无需选择文件，直接采用每种材料排名第一的候选图。")
    apply.add_argument("--generated-map", default="material-images.generated.js", help="生成的图片映射文件。")
    apply.add_argument("--attribution", default="image-attribution.csv", help="图片署名清单。")
    apply.set_defaults(func=command_apply)

    status = subparsers.add_parser("status", parents=[common], help="查看图片导入进度。")
    status.add_argument("--show-missing", action="store_true", help="列出仍缺少宏观图的材料。")
    status.set_defaults(func=command_status)

    plan = subparsers.add_parser("plan", parents=[common], help="仅预览自动生成的检索关键词。")
    plan.add_argument("--material", action="append", help="只显示指定材料 ID 或中文名。")
    plan.add_argument("--category", help="只显示指定一级分类。")
    plan.add_argument("--max-materials", type=int, help="最多显示前 N 个材料。")
    plan.add_argument("--max-queries", type=int, default=3, help="每种材料最多显示的关键词数量。")
    plan.set_defaults(func=command_plan)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return int(args.func(args))
    except KeyboardInterrupt:
        print("\n操作已取消。", file=sys.stderr)
        return 130
    except Exception as exc:
        print(f"错误：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
