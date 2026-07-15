#!/usr/bin/env python3
"""Review, apply and restore MaterialBox research candidates safely."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from collections import Counter
from datetime import date, datetime
from pathlib import Path, PurePosixPath
from typing import Any

from PIL import Image, ImageOps, UnidentifiedImageError

from image_catalog import IMAGE_TYPES, find_existing_image, generate_image_outputs, image_src, metadata_entries, read_json
from research_common import (
    ROOT,
    ResearchError,
    append_log,
    atomic_json,
    confidence_value,
    load_candidates,
    load_config,
    now_iso,
    read_json as strict_read_json,
    research_directory,
    safe_candidate_id,
    safe_material_id,
    safe_project_path,
    save_candidates,
    source_complete,
    source_key,
)
from research_validator import candidate_is_valid, validate_all
from sync_materials import MaterialSyncError, sync_materials


MISSING = {None, "", "暂无数据", "暂无可靠数据", "待补充", "待评估", "undefined", "null"}
CORE_FILES = (
    "materials.json",
    "materials.js",
    "material-images.generated.js",
    "image-attribution.json",
    "image-attribution.js",
    "image-attribution.csv",
    "data/research/property-candidates.json",
    "data/research/image-candidates.json",
    "data/research/validation-report.json",
)
EDITABLE_FIELDS = {
    "property": {
        "value", "unit", "range_min", "range_max", "condition", "temperature", "material_state",
        "test_standard", "engineering_data_type", "confidence", "agent_notes", "overwrite_formal", "source",
    },
    "image": {
        "title", "caption", "alt", "source", "author", "license", "licenseUrl", "sourceUrl", "originalUrl",
        "accessed_at", "confidence", "agent_notes", "material_grade", "material_state", "heat_treatment",
        "microscope_type", "magnification", "scale_bar", "etchant", "orientation", "figure_number",
        "paper_title", "doi",
    },
}


def materials_from(root: Path) -> list[dict]:
    materials = strict_read_json(root / "materials.json", [])
    if not isinstance(materials, list):
        raise ResearchError("materials.json 顶层必须是数组。")
    return materials


def candidate_store(root: Path) -> dict[str, list[dict]]:
    return {"property": load_candidates(root, "property"), "image": load_candidates(root, "image")}


def find_candidate(store: dict[str, list[dict]], kind: str, candidate_id: str) -> dict:
    if kind not in store:
        raise ResearchError("候选类型必须是 property 或 image。")
    candidate_id = safe_candidate_id(candidate_id)
    candidate = next((item for item in store[kind] if item.get("candidate_id") == candidate_id), None)
    if not candidate:
        raise ResearchError(f"找不到候选：{candidate_id}")
    return candidate


def merge_edits(candidate: dict, kind: str, edits: Any) -> None:
    if not isinstance(edits, dict):
        return
    for key, value in edits.items():
        if key not in EDITABLE_FIELDS[kind]:
            continue
        if key == "source" and kind == "property":
            if isinstance(value, dict):
                candidate["source"] = {**(candidate.get("source") or {}), **value}
        else:
            candidate[key] = value


def review_candidates(
    root: Path,
    *,
    kind: str,
    candidate_ids: list[str],
    action: str,
    edits: dict[str, Any] | None = None,
) -> dict:
    if action not in {"accept", "reject"}:
        raise ResearchError("审核动作必须是 accept 或 reject。")
    store = candidate_store(root)
    updated = []
    for raw_id in candidate_ids:
        candidate = find_candidate(store, kind, raw_id)
        if candidate.get("status") == "applied":
            raise ResearchError("已正式应用的候选不能直接改回审核状态，请先恢复研究备份。")
        merge_edits(candidate, kind, (edits or {}).get(raw_id, edits or {}))
        if action == "accept":
            candidate["status"] = "pending_review"
            valid, errors, _warnings = candidate_is_valid(root, kind, candidate)
            if not valid:
                raise ResearchError(f"候选 {raw_id} 未通过验证：{'；'.join(errors)}")
            candidate["status"] = "accepted"
            candidate["reviewed_at"] = now_iso()
        else:
            candidate["status"] = "rejected"
            candidate["reviewed_at"] = now_iso()
        updated.append(raw_id)
        append_log(root, "candidate_reviewed", material_id=candidate.get("material_id"), task_type=kind, candidate_id=raw_id, result=action)
    save_candidates(root, kind, store[kind])
    report = validate_all(root)
    return {"message": f"已{('接受' if action == 'accept' else '拒绝')} {len(updated)} 条候选。", "updated": updated, "validation": report["summary"]}


def bulk_review(root: Path, mode: str, confirmation: str) -> dict:
    config = load_config(root)
    store = candidate_store(root)
    report = validate_all(root)
    validation = {item["candidate_id"]: item for item in report["items"]}
    changed = 0
    if mode == "accept_high_confidence":
        if confirmation != "ACCEPT HIGH CONFIDENCE":
            raise ResearchError("批量接受需要输入二次确认短语：ACCEPT HIGH CONFIDENCE")
        threshold = float(config.get("minimum_confidence_for_bulk_accept", 0.85))
        for kind, candidates in store.items():
            for candidate in candidates:
                check = validation.get(candidate.get("candidate_id"), {})
                if candidate.get("status") == "pending_review" and check.get("valid") and confidence_value(candidate.get("confidence")) >= threshold:
                    candidate["status"] = "accepted"
                    candidate["reviewed_at"] = now_iso()
                    candidate["bulk_review_rule"] = f"confidence >= {threshold}"
                    changed += 1
    elif mode == "reject_unsourced":
        if confirmation != "REJECT UNSOURCED":
            raise ResearchError("批量拒绝需要输入二次确认短语：REJECT UNSOURCED")
        for kind, candidates in store.items():
            for candidate in candidates:
                if candidate.get("status") != "pending_review":
                    continue
                if kind == "property":
                    unsourced = not source_complete(candidate.get("source"))
                else:
                    unsourced = candidate.get("origin") == "web_source" and not (candidate.get("source") and candidate.get("sourceUrl"))
                if unsourced:
                    candidate["status"] = "rejected"
                    candidate["reviewed_at"] = now_iso()
                    candidate["bulk_review_rule"] = "missing source"
                    changed += 1
    else:
        raise ResearchError("未知批量审核模式。")
    save_candidates(root, "property", store["property"])
    save_candidates(root, "image", store["image"])
    append_log(root, "bulk_review", material_id="", task_type="all", result=mode, count=changed)
    validate_all(root)
    return {"message": f"批量审核完成，共更新 {changed} 条候选。", "updated": changed}


def timestamped_backup(root: Path, material_ids: set[str]) -> Path:
    stamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    backup = root / "backups" / f"research_apply_{stamp}"
    counter = 1
    while backup.exists():
        backup = root / "backups" / f"research_apply_{stamp}_{counter:02d}"
        counter += 1
    backup.mkdir(parents=True, exist_ok=False)
    copied: list[str] = []
    for relative in CORE_FILES:
        source = root / Path(*PurePosixPath(relative).parts)
        if source.is_file():
            target = backup / Path(*PurePosixPath(relative).parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
            copied.append(relative)
    image_states: dict[str, bool] = {}
    for material_id in sorted(material_ids):
        safe_material_id(material_id)
        source = root / "assets" / "images" / "materials" / material_id
        image_states[material_id] = source.is_dir()
        if source.is_dir():
            target = backup / "assets" / "images" / "materials" / material_id
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copytree(source, target)
    atomic_json(
        backup / "research_backup_manifest.json",
        {"created_at": now_iso(), "files": copied, "material_ids": sorted(material_ids), "image_directory_existed": image_states},
    )
    return backup


def restore_research_backup(root: Path, backup: Path) -> None:
    manifest = strict_read_json(backup / "research_backup_manifest.json", {})
    if not isinstance(manifest, dict):
        raise ResearchError("研究备份清单损坏。")
    for relative in manifest.get("files", []):
        relative_path = PurePosixPath(str(relative))
        if relative_path.is_absolute() or ".." in relative_path.parts:
            raise ResearchError("备份清单包含不安全路径。")
        source = backup / Path(*relative_path.parts)
        target = root / Path(*relative_path.parts)
        if source.is_file():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
    states = manifest.get("image_directory_existed") or {}
    for material_id in manifest.get("material_ids", []):
        material_id = safe_material_id(material_id)
        target = root / "assets" / "images" / "materials" / material_id
        source = backup / "assets" / "images" / "materials" / material_id
        if target.exists():
            shutil.rmtree(target)
        if states.get(material_id) and source.is_dir():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copytree(source, target)


def latest_research_backup(root: Path) -> Path | None:
    directory = root / "backups"
    if not directory.is_dir():
        return None
    values = [item for item in directory.glob("research_apply_*") if (item / "research_backup_manifest.json").is_file()]
    return max(values, key=lambda item: item.name) if values else None


def restore_latest_research_backup(root: Path, confirmation: str) -> dict:
    if confirmation != "RESTORE RESEARCH":
        raise ResearchError("恢复研究备份需要输入：RESTORE RESEARCH")
    backup = latest_research_backup(root)
    if not backup:
        raise ResearchError("没有找到自动研究正式应用备份。")
    restore_research_backup(root, backup)
    sync_materials(root, create_backup=False, extended_validation=True)
    generate_image_outputs(root)
    validate_all(root)
    append_log(root, "research_backup_restored", material_id="", task_type="all", result=str(backup))
    return {"message": f"已恢复研究备份：{backup.name}", "backup": str(backup)}


def formal_source(candidate: dict) -> dict:
    value = candidate.get("source") or {}
    if not isinstance(value, dict):
        return {}
    note_parts = [
        str(candidate.get("condition") or "").strip(),
        f"页码：{value.get('page')}" if value.get("page") else "",
        f"表格：{value.get('table')}" if value.get("table") else "",
        f"DOI：{value.get('doi')}" if value.get("doi") else "",
        f"研究候选：{candidate.get('candidate_id')}" if candidate.get("candidate_id") else "",
    ]
    return {
        "title": value.get("title", ""),
        "publisher": value.get("publisher", ""),
        "url": value.get("url") or (f"https://doi.org/{value.get('doi')}" if value.get("doi") else ""),
        "accessed_at": value.get("accessed_at", ""),
        "note": "；".join(part for part in note_parts if part),
    }


def add_source(material: dict, source: dict) -> None:
    if not source or not source.get("title"):
        return
    values = material.setdefault("data_sources", [])
    if not isinstance(values, list):
        values = material["data_sources"] = []
    key = source_key(source)
    if not any(source_key(item) == key for item in values):
        values.append(source)


def display_property_value(candidate: dict) -> str:
    value = str(candidate.get("value") or "").strip()
    unit = str(candidate.get("unit") or "").strip()
    return f"{value} {unit}".strip()


def apply_property(material: dict, candidate: dict) -> None:
    field = str(candidate.get("field") or "")
    if field != "data_source":
        engineering = material.setdefault("engineering_properties", {})
        current = engineering.get(field, material.get(field))
        if current not in MISSING and not candidate.get("overwrite_formal"):
            raise ResearchError(
                f"{material.get('id')}.{field} 已有正式值“{current}”；请在编辑候选时明确勾选允许替换。"
            )
        value = display_property_value(candidate)
        engineering[field] = value
        material[field] = value
    records = material.setdefault("property_records", [])
    if not isinstance(records, list):
        records = material["property_records"] = []
    candidate_id = candidate.get("candidate_id")
    if candidate_id and not any(item.get("research_candidate_id") == candidate_id for item in records if isinstance(item, dict)):
        record = {key: value for key, value in candidate.items() if key not in {"status", "reviewed_at", "applied_at"}}
        record["research_candidate_id"] = candidate_id
        record["review_status"] = "accepted_pending_verification"
        records.append(record)
    add_source(material, formal_source(candidate))


def next_image_slot(directory: Path, image_type: str) -> int:
    for slot in range(1, 4):
        if not find_existing_image(directory, image_type, slot):
            return slot
    raise ResearchError(f"{directory.name} 的 {image_type} 正式图片槽位已满，默认禁止覆盖。")


def image_metadata_entry(root: Path, target: Path, candidate: dict) -> dict:
    origin = "reviewed" if candidate.get("origin") == "web_source" else "generated"
    return {
        "src": image_src(root, target),
        "alt": candidate.get("alt", ""),
        "caption": candidate.get("caption") or candidate.get("title", ""),
        "source": candidate.get("source", ""),
        "author": candidate.get("author", ""),
        "license": candidate.get("license", ""),
        "licenseUrl": candidate.get("licenseUrl", ""),
        "sourceUrl": candidate.get("sourceUrl", ""),
        "accessed_at": candidate.get("accessed_at", ""),
        "origin": origin,
        "research_candidate_id": candidate.get("candidate_id", ""),
        "originalUrl": candidate.get("originalUrl", ""),
        "sha256": candidate.get("sha256", ""),
        "generated_origin": candidate.get("origin", ""),
        "model": candidate.get("model", ""),
        "prompt": candidate.get("prompt", ""),
        "generated_at": candidate.get("generated_at", ""),
        "generator_version": candidate.get("generator_version", ""),
        "basis_sources": candidate.get("basis_sources") or [],
        "disclaimer": candidate.get("disclaimer", ""),
    }


def apply_image(root: Path, material: dict, candidate: dict) -> str:
    if candidate.get("link_only"):
        links = material.setdefault("research_links", [])
        if not isinstance(links, list):
            links = material["research_links"] = []
        if not any(item.get("research_candidate_id") == candidate.get("candidate_id") for item in links if isinstance(item, dict)):
            links.append({
                "research_candidate_id": candidate.get("candidate_id"),
                "type": "micro_source_link",
                "title": candidate.get("paper_title") or candidate.get("source"),
                "url": candidate.get("sourceUrl"),
                "doi": candidate.get("doi", ""),
                "figure_number": candidate.get("figure_number", ""),
                "license": candidate.get("license", ""),
                "note": candidate.get("agent_notes", ""),
            })
        return "link_only"
    image_type = str(candidate.get("image_type") or "")
    if image_type not in IMAGE_TYPES:
        raise ResearchError("图片候选类型非法。")
    source = safe_project_path(root, str(candidate.get("src") or ""))
    if not source.is_file():
        raise ResearchError("候选图片文件不存在。")
    directory = root / "assets" / "images" / "materials" / safe_material_id(material.get("id"))
    directory.mkdir(parents=True, exist_ok=True)
    slot = next_image_slot(directory, image_type)
    target = directory / f"{image_type}_{slot:02d}.webp"
    try:
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened).convert("RGB")
            image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            image.save(target, "WEBP", quality=85, method=6)
    except (UnidentifiedImageError, OSError) as exc:
        raise ResearchError("候选图片无法转换为正式 WebP。") from exc
    current = read_json(directory / "metadata.json", {})
    groups = metadata_entries(current)
    groups[image_type] = [item for item in groups[image_type] if Path(str(item.get("src") or "")).name != target.name]
    groups[image_type].append(image_metadata_entry(root, target, candidate))
    atomic_json(directory / "metadata.json", {"materialId": material["id"], "images": groups})
    return image_src(root, target)


def selected_accepted(store: dict[str, list[dict]], candidate_ids: list[str] | None) -> list[tuple[str, dict]]:
    wanted = {safe_candidate_id(item) for item in candidate_ids or []}
    output: list[tuple[str, dict]] = []
    for kind, candidates in store.items():
        for candidate in candidates:
            if candidate.get("status") != "accepted":
                continue
            if wanted and candidate.get("candidate_id") not in wanted:
                continue
            output.append((kind, candidate))
    if wanted:
        found = {item.get("candidate_id") for _kind, item in output}
        missing = wanted - found
        if missing:
            raise ResearchError(f"以下候选不存在或尚未接受：{', '.join(sorted(missing))}")
    return output


def apply_accepted_candidates(
    root: Path,
    *,
    confirmation: str,
    candidate_ids: list[str] | None = None,
    dry_run: bool = False,
) -> dict:
    root = Path(root).resolve()
    if not dry_run and confirmation != "APPLY ACCEPTED":
        raise ResearchError("正式应用需要输入二次确认短语：APPLY ACCEPTED")
    store = candidate_store(root)
    selected = selected_accepted(store, candidate_ids)
    if not selected:
        raise ResearchError("没有可正式应用的 accepted 候选。")
    materials = materials_from(root)
    by_id = {item.get("id"): item for item in materials}
    pairs: Counter[tuple[str, str]] = Counter(
        (str(candidate.get("material_id")), str(candidate.get("field")))
        for kind, candidate in selected if kind == "property" and candidate.get("field") != "data_source"
    )
    conflicts = [f"{material_id}.{field}" for (material_id, field), count in pairs.items() if count > 1]
    if conflicts:
        raise ResearchError(f"同一正式字段存在多个已接受候选，请先保留一个：{', '.join(conflicts)}")
    for kind, candidate in selected:
        valid, errors, _warnings = candidate_is_valid(root, kind, candidate)
        if not valid:
            raise ResearchError(f"候选 {candidate.get('candidate_id')} 未通过导入前验证：{'；'.join(errors)}")
        if candidate.get("material_id") not in by_id:
            raise ResearchError(f"候选引用不存在材料：{candidate.get('material_id')}")
    summary = {
        "candidates": len(selected),
        "properties": sum(kind == "property" for kind, _item in selected),
        "images": sum(kind == "image" and not item.get("link_only") for kind, item in selected),
        "source_links": sum(kind == "image" and bool(item.get("link_only")) for kind, item in selected),
        "materials": sorted({str(item.get("material_id")) for _kind, item in selected}),
    }
    if dry_run:
        return {"message": "预检通过，尚未修改正式数据。", **summary}
    backup = timestamped_backup(root, set(summary["materials"]))
    applied_ids: list[str] = []
    image_outputs: list[str] = []
    try:
        for kind, candidate in selected:
            material = by_id[candidate["material_id"]]
            if kind == "property":
                apply_property(material, candidate)
            else:
                image_outputs.append(apply_image(root, material, candidate))
            material["data_status"] = "待核验"
            material["updated_at"] = date.today().isoformat()
            quality = dict(material.get("data_quality") or {})
            quality["reviewed"] = False
            quality["status"] = "pending"
            quality["source_count"] = len(material.get("data_sources") or [])
            material["data_quality"] = quality
            applied_ids.append(candidate["candidate_id"])
        atomic_json(root / "materials.json", materials)
        sync_materials(root, create_backup=False, extended_validation=True)
        image_result = generate_image_outputs(root)
        for kind, candidates in store.items():
            for candidate in candidates:
                if candidate.get("candidate_id") in applied_ids:
                    candidate["status"] = "applied"
                    candidate["applied_at"] = now_iso()
                    candidate["apply_backup"] = str(backup)
            save_candidates(root, kind, candidates)
        validation = validate_all(root)
    except Exception as exc:
        restore_research_backup(root, backup)
        try:
            sync_materials(root, create_backup=False, extended_validation=True)
            generate_image_outputs(root)
        except Exception:
            pass
        raise ResearchError(f"正式应用失败，已自动恢复到应用前备份：{exc}") from exc
    append_log(root, "candidates_applied", material_id=summary["materials"], task_type="all", result=applied_ids, backup=str(backup))
    return {
        "message": f"已正式应用 {len(applied_ids)} 条已审核候选，相关材料状态设为“待核验”。",
        **summary,
        "applied_ids": applied_ids,
        "image_outputs": image_outputs,
        "formal_image_count": image_result["images"],
        "backup": str(backup),
        "validation": validation["summary"],
    }


def candidate_source_state(kind: str, candidate: dict) -> tuple[bool, bool]:
    if kind == "property":
        complete = source_complete(candidate.get("source"))
        return complete, not complete
    if candidate.get("origin") in {"program_generated", "ai_generated"}:
        basis = candidate.get("basis_sources") or []
        complete = bool(basis) and all(source_complete(item) for item in basis)
        return complete, not complete
    complete = bool(candidate.get("source") and candidate.get("sourceUrl"))
    return complete, not complete


def research_payload(root: Path) -> dict:
    root = Path(root).resolve()
    report = validate_all(root)
    checks = {item["candidate_id"]: item for item in report["items"]}
    materials = materials_from(root)
    by_id = {item.get("id"): item for item in materials}
    config = load_config(root)
    items = []
    for kind, candidates in candidate_store(root).items():
        for candidate in candidates:
            material = by_id.get(candidate.get("material_id"), {})
            check = checks.get(candidate.get("candidate_id"), {"valid": False, "errors": ["未生成验证记录"], "warnings": []})
            has_source, source_incomplete = candidate_source_state(kind, candidate)
            current_value = ""
            if kind == "property" and candidate.get("field") != "data_source":
                current_value = (material.get("engineering_properties") or {}).get(candidate.get("field"), material.get(candidate.get("field"), ""))
            item = dict(candidate)
            item.update(
                {
                    "candidate_type": kind,
                    "validation": check,
                    "reviewable": bool(check.get("valid")) and candidate.get("status") == "pending_review",
                    "has_source": has_source,
                    "source_incomplete": source_incomplete,
                    "license_issue": any("许可证" in error for error in check.get("errors", [])),
                    "current_value": current_value or "暂无数据",
                    "preview_url": f"/project/{candidate.get('src')}" if candidate.get("src") else "",
                    "material": {
                        "name_cn": material.get("name_cn", candidate.get("material_name", "")),
                        "name_en": material.get("name_en", ""),
                        "entity_type": material.get("entity_type", candidate.get("entity_type", "material")),
                        "taxonomy_path": material.get("taxonomy_path") or [],
                    },
                }
            )
            items.append(item)
    counts = Counter(str(item.get("status") or "unknown") for item in items)
    jobs = strict_read_json(research_directory(root) / "research-jobs.json", {}) or {}
    return {
        "items": items,
        "stats": {**report["summary"], "statuses": dict(counts), "bulk_threshold": config.get("minimum_confidence_for_bulk_accept", 0.85)},
        "jobs": jobs.get("jobs", []),
        "estimate": jobs.get("estimate", {}),
        "latest_backup": str(latest_research_backup(root) or ""),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="审核后正式应用 MaterialBox 研究候选")
    parser.add_argument("--root", type=Path, default=ROOT, help=argparse.SUPPRESS)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--candidate", action="append", help="仅应用指定 accepted 候选")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--restore-latest", action="store_true")
    parser.add_argument("--yes", action="store_true", help="确认命令行正式操作")
    args = parser.parse_args()
    try:
        if args.restore_latest:
            if not args.yes:
                raise ResearchError("恢复前请添加 --yes 并确认已阅读备份说明。")
            result = restore_latest_research_backup(args.root.resolve(), "RESTORE RESEARCH")
        elif args.apply or args.dry_run:
            result = apply_accepted_candidates(
                args.root.resolve(),
                confirmation="APPLY ACCEPTED" if args.yes else "",
                candidate_ids=args.candidate,
                dry_run=args.dry_run,
            )
        else:
            parser.error("请使用 --dry-run、--apply --yes 或 --restore-latest --yes")
            return
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except (ResearchError, MaterialSyncError) as exc:
        print(f"候选导入失败：{exc}", file=sys.stderr)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
