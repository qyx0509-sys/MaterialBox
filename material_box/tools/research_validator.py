#!/usr/bin/env python3
"""Validate research candidates before they become reviewable or importable."""

from __future__ import annotations

import argparse
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from PIL import Image, UnidentifiedImageError

from image_research import license_allowed
from research_common import (
    ROOT,
    SCHEMA_VERSION,
    append_log,
    atomic_json,
    confidence_value,
    load_candidates,
    load_config,
    now_iso,
    research_directory,
    safe_project_path,
    sha256_file,
    source_complete,
    source_key,
)


LIFECYCLE_STATUSES = {"pending_review", "accepted", "rejected", "applied"}
ENGINEERING_TYPES = {"measured", "typical", "literature", "category_reference", "unavailable"}
NUMERIC = re.compile(r"[-+]?\d+(?:\.\d+)?")
URL_SCHEMES = {"http", "https"}
EXPERIMENTAL_WORDS = re.compile(r"\b(SEM|TEM|OM)\b|金相|断口|实验结果|真实样品|显微照片", re.I)
PLAUSIBLE_RANGES = {
    "density": (-1, 30000),
    "melting_point": (-273.15, 10000),
    "service_temperature": (-273.15, 10000),
    "tensile_strength": (0, 100000),
    "elastic_modulus": (0, 1000000),
    "thermal_conductivity": (0, 100000),
    "electrical_resistivity": (0, 1e30),
    "hardness": (0, 100000),
}


def valid_url(value: Any) -> bool:
    text = str(value or "").strip()
    if not text:
        return False
    parsed = urlparse(text)
    return parsed.scheme in URL_SCHEMES and bool(parsed.netloc)


def source_domain_allowed(value: Any, config: dict) -> tuple[bool, str]:
    text = str(value or "").strip()
    if not text:
        return True, ""
    host = (urlparse(text).hostname or "").casefold()
    blocked = [str(item).strip().casefold() for item in config.get("source_domain_blocklist", []) if str(item).strip()]
    allowed = [str(item).strip().casefold() for item in config.get("source_domain_allowlist", []) if str(item).strip()]
    matches = lambda domain: host == domain or host.endswith("." + domain)
    if any(matches(domain) for domain in blocked):
        return False, "来源域名位于黑名单"
    if allowed and not any(matches(domain) for domain in allowed):
        return False, "来源域名不在白名单"
    return True, ""


def property_result(candidate: dict, config: dict) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    field = str(candidate.get("field") or "")
    entity_type = str(candidate.get("entity_type") or "material")
    value = str(candidate.get("value") or "")
    source = candidate.get("source") or {}
    status = str(candidate.get("status") or "")
    if status not in LIFECYCLE_STATUSES:
        errors.append("候选状态非法")
    if not candidate.get("material_id") or not field:
        errors.append("缺少 material_id 或 field")
    if field != "data_source" and not value:
        errors.append("参数候选缺少 value")
    has_number = bool(NUMERIC.search(value)) or candidate.get("range_min") is not None or candidate.get("range_max") is not None
    if has_number and field != "data_source":
        if not str(candidate.get("unit") or "").strip():
            errors.append("数值参数缺少单位")
        if config.get("require_source_for_numeric_data", True) and not source_complete(source):
            errors.append("精确数值缺少标题以及 URL 或 DOI")
    if source:
        if not str(source.get("title") or "").strip():
            errors.append("来源缺少标题")
        url = str(source.get("url") or "").strip()
        doi = str(source.get("doi") or "").strip()
        if url and not valid_url(url):
            errors.append("来源 URL 格式无效")
        elif url:
            allowed_domain, reason = source_domain_allowed(url, config)
            if not allowed_domain:
                errors.append(reason)
        if not url and not doi:
            errors.append("来源缺少 URL 或 DOI")
    elif field == "data_source" or has_number:
        errors.append("候选缺少来源")
    minimum = candidate.get("range_min")
    maximum = candidate.get("range_max")
    if isinstance(minimum, (int, float)) and isinstance(maximum, (int, float)) and minimum > maximum:
        errors.append("range_min 大于 range_max")
    bounds = PLAUSIBLE_RANGES.get(field)
    if bounds:
        for label, number in (("range_min", minimum), ("range_max", maximum)):
            if isinstance(number, (int, float)) and not bounds[0] <= number <= bounds[1]:
                errors.append(f"{label} 超出宽松合理范围")
    data_type = str(candidate.get("engineering_data_type") or "")
    if data_type not in ENGINEERING_TYPES:
        errors.append("engineering_data_type 不规范")
    condition = str(candidate.get("condition") or "")
    if entity_type in {"family", "subfamily"}:
        if data_type != "category_reference":
            errors.append("family/subfamily 只能使用 category_reference")
        if "具体牌号和状态可能存在明显差异" not in condition:
            errors.append("家族候选缺少牌号与状态差异声明")
    if entity_type in {"material", "grade"} and has_number and not str(candidate.get("material_state") or "").strip():
        errors.append("具体材料或牌号数值缺少 material_state")
    if entity_type == "variant" and has_number:
        combined = " ".join([condition, str(candidate.get("agent_notes") or "")])
        if not re.search(r"含量|比例|填料|增强|改性", combined):
            errors.append("variant 数值未说明增强体含量、填料比例或改性方式")
    if entity_type == "form" and has_number:
        warnings.append("form 通常不应重复创建完整工程参数，请人工确认")
    confidence = confidence_value(candidate.get("confidence"))
    if confidence <= 0:
        errors.append("confidence 必须在 0 到 1 之间")
    if status != "pending_review":
        warnings.append(f"候选已进入工作流状态：{status}")
    return errors, warnings


def image_result(candidate: dict, root: Path, config: dict) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    status = str(candidate.get("status") or "")
    image_type = str(candidate.get("image_type") or "")
    origin = str(candidate.get("origin") or "")
    if status not in LIFECYCLE_STATUSES:
        errors.append("候选状态非法")
    if image_type not in {"macro", "micro", "structure"}:
        errors.append("image_type 非法")
    if origin not in {"web_source", "program_generated", "ai_generated"}:
        errors.append("origin 非法")
    if image_type in {"macro", "micro"} and origin in {"program_generated", "ai_generated"}:
        errors.append("宏观图或微观图禁止使用生成图")
    if origin == "ai_generated":
        if image_type != "structure":
            errors.append("AI 图只能作为结构示意候选")
        for key in ("model", "prompt", "generated_at", "generator_version", "disclaimer"):
            if not str(candidate.get(key) or "").strip():
                errors.append(f"AI 生成图缺少 {key}")
        if "不是实验照片" not in str(candidate.get("disclaimer") or ""):
            errors.append("AI 生成图缺少非实验图免责声明")
        text = " ".join(str(candidate.get(key) or "") for key in ("title", "caption", "alt"))
        if EXPERIMENTAL_WORDS.search(text) and "不是" not in text:
            errors.append("AI 图被错误标记为实验图")
    if origin in {"program_generated", "ai_generated"}:
        basis = candidate.get("basis_sources") or []
        if not isinstance(basis, list) or not basis:
            errors.append("结构生成图缺少 basis_sources")
        elif any(not source_complete(item) for item in basis):
            errors.append("结构依据来源缺少标题以及 URL 或 DOI")
        else:
            for item in basis:
                allowed_domain, reason = source_domain_allowed(item.get("url"), config)
                if not allowed_domain:
                    errors.append(reason)
        if image_type != "structure":
            errors.append("生成图只能用于 structure")
    link_only = bool(candidate.get("link_only"))
    if link_only:
        if image_type != "micro":
            errors.append("只有微观候选允许仅保存文献链接")
        if candidate.get("src"):
            errors.append("link_only 候选不应包含本地图片")
        if not valid_url(candidate.get("sourceUrl")):
            errors.append("文献链接候选缺少有效 sourceUrl")
        if not str(candidate.get("figure_number") or "").strip():
            errors.append("文献链接候选缺少 figure_number")
    else:
        src = str(candidate.get("src") or "")
        if not src:
            errors.append("图片候选缺少 src")
        else:
            try:
                path = safe_project_path(root, src)
                if "candidates" not in path.parts:
                    errors.append("候选图片必须位于 candidates 目录")
                if not path.is_file():
                    errors.append("候选图片文件不存在")
                else:
                    try:
                        with Image.open(path) as image:
                            image.verify()
                        with Image.open(path) as image:
                            width, height = image.size
                            if width < 320 or height < 240:
                                errors.append("候选图片尺寸过小")
                    except (UnidentifiedImageError, OSError):
                        errors.append("候选文件不是有效图片")
                    expected = str(candidate.get("sha256") or "")
                    if not expected:
                        errors.append("候选图片缺少 SHA256")
                    elif expected != sha256_file(path):
                        errors.append("候选图片 SHA256 不匹配")
            except Exception as exc:
                errors.append(f"候选路径无效：{exc}")
    if origin == "web_source":
        allowed = [str(item) for item in config.get("allowed_licenses", [])]
        if not license_allowed(str(candidate.get("license") or ""), allowed):
            errors.append("图片许可证不在白名单")
        if not valid_url(candidate.get("sourceUrl")):
            errors.append("网页图片缺少有效来源页")
        else:
            allowed_domain, reason = source_domain_allowed(candidate.get("sourceUrl"), config)
            if not allowed_domain:
                errors.append(reason)
    if image_type == "micro":
        for key in ("material_state", "microscope_type"):
            if not str(candidate.get(key) or "").strip():
                warnings.append(f"微观候选缺少 {key}")
        if not str(candidate.get("figure_number") or "").strip() and link_only:
            errors.append("微观文献候选缺少图号")
        if warnings and confidence_value(candidate.get("confidence")) > 0.8:
            errors.append("微观元数据不完整时 confidence 不得高于 0.8")
    if confidence_value(candidate.get("confidence")) <= 0:
        errors.append("confidence 必须在 0 到 1 之间")
    if status != "pending_review":
        warnings.append(f"候选已进入工作流状态：{status}")
    return errors, warnings


def validate_all(root: Path = ROOT, *, write_report: bool = True) -> dict:
    root = Path(root).resolve()
    config = load_config(root)
    candidates = [("property", item) for item in load_candidates(root, "property")]
    candidates += [("image", item) for item in load_candidates(root, "image")]
    items: list[dict] = []
    hashes: dict[str, list[str]] = defaultdict(list)
    sources: Counter[tuple[str, str, str]] = Counter()
    for kind, candidate in candidates:
        errors, warnings = (
            property_result(candidate, config)
            if kind == "property"
            else image_result(candidate, root, config)
        )
        digest = str(candidate.get("sha256") or "")
        if digest:
            hashes[digest].append(str(candidate.get("candidate_id") or ""))
        source = candidate.get("source") if kind == "property" else {
            "title": candidate.get("source"), "url": candidate.get("sourceUrl"), "doi": candidate.get("doi")
        }
        key = source_key(source)
        if any(key):
            sources[key] += 1
        items.append(
            {
                "candidate_id": candidate.get("candidate_id", ""),
                "candidate_type": kind,
                "material_id": candidate.get("material_id", ""),
                "field": candidate.get("field", ""),
                "image_type": candidate.get("image_type", ""),
                "status": candidate.get("status", ""),
                "valid": not errors,
                "errors": errors,
                "warnings": warnings,
            }
        )
    by_id = {item["candidate_id"]: item for item in items}
    for digest, ids in hashes.items():
        if len(ids) > 1:
            for candidate_id in ids:
                item = by_id.get(candidate_id)
                if item:
                    item["errors"].append(f"图片 SHA256 与其他候选重复：{digest[:12]}")
                    item["valid"] = False
    summary = {
        "total": len(items),
        "valid": sum(bool(item["valid"]) for item in items),
        "invalid": sum(not item["valid"] for item in items),
        "warnings": sum(len(item["warnings"]) for item in items),
        "pending_review": sum(item["status"] == "pending_review" for item in items),
        "accepted": sum(item["status"] == "accepted" for item in items),
        "rejected": sum(item["status"] == "rejected" for item in items),
        "applied": sum(item["status"] == "applied" for item in items),
        "duplicate_sources": sum(count > 1 for count in sources.values()),
    }
    report = {"schema_version": SCHEMA_VERSION, "generated_at": now_iso(), "summary": summary, "items": items}
    if write_report:
        atomic_json(research_directory(root) / "validation-report.json", report)
        append_log(root, "validation_completed", validation=summary)
    return report


def candidate_is_valid(root: Path, kind: str, candidate: dict) -> tuple[bool, list[str], list[str]]:
    config = load_config(root)
    errors, warnings = property_result(candidate, config) if kind == "property" else image_result(candidate, root, config)
    return not errors, errors, warnings


def main() -> None:
    parser = argparse.ArgumentParser(description="验证 MaterialBox 自动研究候选")
    parser.add_argument("--root", type=Path, default=ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args()
    report = validate_all(args.root)
    summary = report["summary"]
    print(f"候选验证完成：共 {summary['total']} 条，通过 {summary['valid']} 条，未通过 {summary['invalid']} 条。")
    for item in report["items"]:
        if not item["valid"]:
            print(f"[未通过] {item['candidate_id']}: {'；'.join(item['errors'])}")
    raise SystemExit(1 if summary["invalid"] else 0)


if __name__ == "__main__":
    main()
