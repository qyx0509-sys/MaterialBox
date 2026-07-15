#!/usr/bin/env python3
"""Find and validate openly licensed image candidates without publishing them."""

from __future__ import annotations

import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from io import BytesIO
from pathlib import Path
from typing import Any

from PIL import Image, ImageOps, UnidentifiedImageError

from research_common import (
    append_log,
    make_candidate_id,
    project_relative,
    sha256_file,
)


COMMONS_API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "MaterialBoxResearch/1.0 (local educational material database; manual review required)"
REJECT_TITLE = re.compile(
    r"\b(logo|icon|flag|map|chart|poster|advert|screenshot|print\s*screen|software|ansys|micrograph|microstructure)\b",
    re.I,
)


def clean_html(value: Any) -> str:
    text = re.sub(r"<[^>]+>", " ", str(value or ""))
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def normalize_license(value: str) -> str:
    text = clean_html(value).replace("Creative Commons", "CC")
    text = re.sub(r"Attribution-ShareAlike", "BY-SA", text, flags=re.I)
    text = re.sub(r"Attribution", "BY", text, flags=re.I)
    text = re.sub(r"\s+", " ", text).strip()
    lowered = text.casefold()
    if "public domain" in lowered or lowered in {"pd", "pdm"}:
        return "Public Domain"
    if "cc0" in lowered:
        return "CC0"
    match = re.search(r"CC\s*BY(?:-SA)?(?:\s*\d+(?:\.\d+)?)?", text, re.I)
    return re.sub(r"\s+", " ", match.group(0).upper()).replace("CCBY", "CC BY") if match else text


def license_allowed(license_name: str, allowed: list[str]) -> bool:
    normalized = normalize_license(license_name).casefold()
    return any(normalized == item.casefold() or normalized.startswith(item.casefold() + " ") for item in allowed)


def request_json(url: str, retries: int, delay: float) -> dict:
    last_error: Exception | None = None
    for attempt in range(max(1, retries)):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
            with urllib.request.urlopen(request, timeout=30) as response:
                if "json" not in str(response.headers.get("Content-Type", "")).casefold():
                    raise RuntimeError("服务返回的不是 JSON")
                return json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, RuntimeError) as exc:
            last_error = exc
            if attempt + 1 < retries:
                time.sleep(delay * (attempt + 1))
    raise RuntimeError(f"Wikimedia 请求失败：{last_error}")


def commons_search(query: str, *, retries: int, delay: float, limit: int = 12) -> list[dict]:
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": "6",
        "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|mime|size|extmetadata|sha1",
        "iiurlwidth": "1600",
        "format": "json",
        "formatversion": "2",
        "origin": "*",
    }
    payload = request_json(f"{COMMONS_API}?{urllib.parse.urlencode(params)}", retries, delay)
    pages = payload.get("query", {}).get("pages", [])
    return pages if isinstance(pages, list) else []


def macro_queries(material: dict) -> list[str]:
    english = str(material.get("name_en") or "").strip()
    abbreviation = str(material.get("abbreviation") or "").strip()
    entity_type = str(material.get("entity_type") or "material")
    parent_context = " ".join(str(item) for item in (material.get("taxonomy_path") or [])[-2:])
    base = english or str(material.get("name_cn") or material.get("id"))
    suffixes = ["material sample", "sheet metal", "surface texture", "product", "raw material"]
    if entity_type == "form":
        suffixes = ["product form", "material sample", "product"]
    values = [f"{base} {suffix}" for suffix in suffixes]
    if abbreviation and len(abbreviation) >= 3:
        values.append(f'"{abbreviation}" {base} material')
    values.append(f"{base} {parent_context}")
    seen: set[str] = set()
    return [item for item in values if item and not (item.casefold() in seen or seen.add(item.casefold()))]


def relevance_tokens(material: dict) -> list[str]:
    stop = {"material", "materials", "alloy", "composite", "sample", "product"}
    values = [material.get("name_en"), material.get("abbreviation")]
    tokens: list[str] = []
    for value in values:
        for token in re.findall(r"[a-z0-9]+", str(value or "").casefold()):
            if len(token) >= 4 and token not in stop and token not in tokens:
                tokens.append(token)
    return tokens


def page_record(page: dict, allowed_licenses: list[str]) -> dict | None:
    title = str(page.get("title") or "")
    if not title.startswith("File:") or REJECT_TITLE.search(title):
        return None
    info = (page.get("imageinfo") or [{}])[0]
    mime = str(info.get("mime") or "").casefold()
    if mime not in {"image/jpeg", "image/png", "image/webp"}:
        return None
    metadata = info.get("extmetadata") or {}

    def meta(key: str) -> str:
        return clean_html((metadata.get(key) or {}).get("value", ""))

    license_name = normalize_license(meta("LicenseShortName") or meta("UsageTerms"))
    if not license_name or not license_allowed(license_name, allowed_licenses):
        return None
    original_url = str(info.get("url") or "")
    download_url = str(info.get("thumburl") or original_url)
    if not download_url.startswith("https://"):
        return None
    file_page = "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_"), safe=":()_-.,")
    return {
        "title": title.removeprefix("File:"),
        "caption": meta("ImageDescription") or title.removeprefix("File:"),
        "source": "Wikimedia Commons",
        "author": meta("Artist"),
        "license": license_name,
        "licenseUrl": meta("LicenseUrl"),
        "sourceUrl": file_page,
        "originalUrl": original_url,
        "downloadUrl": download_url,
        "reported_width": info.get("width"),
        "reported_height": info.get("height"),
    }


def download_image(url: str, retries: int, delay: float) -> tuple[bytes, str]:
    last_error: Exception | None = None
    for attempt in range(max(1, retries)):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "image/*"})
            with urllib.request.urlopen(request, timeout=45) as response:
                content_type = str(response.headers.get("Content-Type", "")).split(";", 1)[0].casefold()
                if content_type not in {"image/jpeg", "image/png", "image/webp"}:
                    raise RuntimeError(f"MIME 类型无效：{content_type or 'unknown'}")
                payload = response.read(20 * 1024 * 1024 + 1)
                if len(payload) > 20 * 1024 * 1024:
                    raise RuntimeError("图片超过 20 MB")
                return payload, content_type
        except (urllib.error.URLError, TimeoutError, RuntimeError) as exc:
            last_error = exc
            if attempt + 1 < retries:
                time.sleep(delay * (attempt + 1))
    raise RuntimeError(f"图片下载失败：{last_error}")


def save_candidate_webp(payload: bytes, target: Path, *, max_edge: int, quality: int) -> tuple[int, int]:
    try:
        with Image.open(BytesIO(payload)) as opened:
            image = ImageOps.exif_transpose(opened)
            image.load()
            if image.width < 320 or image.height < 240:
                raise RuntimeError(f"图片尺寸过小：{image.width}x{image.height}")
            image = image.convert("RGB")
            image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
            target.parent.mkdir(parents=True, exist_ok=True)
            image.save(target, "WEBP", quality=quality, method=6)
            return image.width, image.height
    except (UnidentifiedImageError, OSError) as exc:
        raise RuntimeError("下载内容不是可打开的图片") from exc


def research_macro_images(
    root: Path,
    material: dict,
    existing_candidates: list[dict],
    config: dict,
    *,
    maximum: int | None = None,
) -> tuple[list[dict], list[str]]:
    """Return new candidates and non-fatal errors for one material."""
    allowed = [str(item) for item in config.get("allowed_licenses", [])]
    retries = int(config.get("request_retries", 3))
    delay = float(config.get("request_delay_seconds", 1.0))
    maximum = max(1, min(5, int(maximum or config.get("max_image_candidates", 5))))
    quality = int(config.get("image_quality", 85))
    max_edge = int(config.get("max_image_edge", 1600))
    material_id = str(material.get("id"))
    existing_urls = {
        str(item.get("originalUrl") or item.get("sourceUrl") or "")
        for item in existing_candidates
        if item.get("material_id") == material_id and item.get("image_type") == "macro"
    }
    existing_hashes = {str(item.get("sha256") or "") for item in existing_candidates if item.get("sha256")}
    existing_captions = {
        re.sub(r"\s+", " ", str(item.get("caption") or "")).strip().casefold()
        for item in existing_candidates
        if item.get("material_id") == material_id and item.get("image_type") == "macro" and item.get("caption")
    }
    output: list[dict] = []
    errors: list[str] = []
    material_tokens = relevance_tokens(material)
    for query in macro_queries(material):
        if len(output) >= maximum:
            break
        try:
            pages = commons_search(query, retries=retries, delay=delay)
        except RuntimeError as exc:
            errors.append(f"{query}: {exc}")
            append_log(root, "image_search_failed", material_id=material_id, task_type="macro", query=query, error=str(exc))
            continue
        append_log(root, "image_search", material_id=material_id, task_type="macro", query=query, results=len(pages))
        time.sleep(delay)
        for page in pages:
            if len(output) >= maximum:
                break
            record = page_record(page, allowed)
            if not record or record["originalUrl"] in existing_urls:
                continue
            # Require the distinctive material term in the file title. Long
            # descriptions often mention a material only incidentally.
            searchable = record["title"].casefold()
            if material_tokens and not any(token in searchable for token in material_tokens):
                continue
            caption_key = re.sub(r"\s+", " ", record["caption"]).strip().casefold()
            if caption_key and caption_key in existing_captions:
                continue
            try:
                payload, mime = download_image(record["downloadUrl"], retries, delay)
                seed = make_candidate_id("image", material_id, record["originalUrl"])
                filename = f"{seed.split(':')[-1]}.webp"
                target = root / "assets" / "images" / "materials" / material_id / "candidates" / "auto" / "macro" / filename
                width, height = save_candidate_webp(payload, target, max_edge=max_edge, quality=quality)
                digest = sha256_file(target)
                if digest in existing_hashes:
                    target.unlink(missing_ok=True)
                    continue
                candidate = {
                    "candidate_id": seed,
                    "material_id": material_id,
                    "material_name": material.get("name_cn", material_id),
                    "entity_type": material.get("entity_type", "material"),
                    "image_type": "macro",
                    "src": project_relative(root, target),
                    "title": record["title"],
                    "caption": record["caption"],
                    "alt": f"{material.get('name_cn', material_id)}宏观图片候选：{record['title']}",
                    "source": record["source"],
                    "author": record["author"],
                    "license": record["license"],
                    "licenseUrl": record["licenseUrl"],
                    "sourceUrl": record["sourceUrl"],
                    "originalUrl": record["originalUrl"],
                    "accessed_at": date.today().isoformat(),
                    "sha256": digest,
                    "width": width,
                    "height": height,
                    "mime": "image/webp",
                    "query": query,
                    "confidence": 0.72,
                    "origin": "web_source",
                    "status": "pending_review",
                    "agent_notes": "Wikimedia 自动检索结果；图像内容与材料身份必须由用户人工核对。",
                }
                output.append(candidate)
                existing_urls.add(record["originalUrl"])
                existing_hashes.add(digest)
                if caption_key:
                    existing_captions.add(caption_key)
                append_log(
                    root,
                    "image_downloaded",
                    material_id=material_id,
                    task_type="macro",
                    query=query,
                    source=record["sourceUrl"],
                    file=candidate["src"],
                    sha256=digest,
                    validation="pending",
                )
                time.sleep(delay)
            except RuntimeError as exc:
                errors.append(f"{record['title']}: {exc}")
                append_log(
                    root,
                    "image_download_failed",
                    material_id=material_id,
                    task_type="macro",
                    query=query,
                    source=record.get("sourceUrl", ""),
                    error=str(exc),
                )
    return output, errors
