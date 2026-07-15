#!/usr/bin/env python3
"""Create traceable MaterialBox research candidates in small, resumable batches."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any

from image_catalog import find_existing_image
from image_research import macro_queries, research_macro_images
from research_common import (
    ROOT,
    SCHEMA_VERSION,
    ResearchError,
    append_log,
    atomic_json,
    ensure_research_storage,
    load_candidates,
    load_config,
    now_iso,
    read_json,
    research_directory,
    save_candidates,
)
from research_sources import material_search_terms, micro_link_candidates_for, property_candidates_for
from research_validator import validate_all
from structure_generator import TEMPLATES, ai_structure_candidate, programmatic_candidate


ENTITY_PRIORITY = {"family": 0, "subfamily": 1, "material": 2, "grade": 3, "variant": 4, "form": 5}
MISSING = {None, "", "暂无数据", "暂无可靠数据", "待补充", "待评估", "undefined", "null"}


def materials_from(root: Path) -> list[dict]:
    materials = read_json(root / "materials.json", [])
    if not isinstance(materials, list):
        raise ResearchError("materials.json 顶层必须是数组。")
    return [item for item in materials if isinstance(item, dict) and item.get("id")]


def collections_from(root: Path) -> list[dict]:
    collections = read_json(root / "collections.json", [])
    return [item for item in collections if isinstance(item, dict)] if isinstance(collections, list) else []


def formal_image_exists(root: Path, material_id: str, image_type: str) -> bool:
    directory = root / "assets" / "images" / "materials" / material_id
    return any(find_existing_image(directory, image_type, slot) for slot in range(1, 4))


def inherited_image_parent(material: dict, by_id: dict[str, dict], root: Path, image_type: str = "macro") -> str:
    visited: set[str] = set()
    parent_id = str(material.get("parent_id") or "")
    while parent_id and parent_id in by_id and parent_id not in visited:
        visited.add(parent_id)
        if formal_image_exists(root, parent_id, image_type):
            return parent_id
        parent_id = str(by_id[parent_id].get("parent_id") or "")
    return ""


def is_missing_data(material: dict) -> bool:
    engineering = material.get("engineering_properties") or {}
    if not isinstance(engineering, dict):
        return True
    values = [engineering.get(key) for key in (
        "density", "melting_point", "service_temperature", "tensile_strength", "elastic_modulus",
        "thermal_conductivity", "electrical_resistivity", "hardness", "corrosion_resistance", "cost_level",
    )]
    return all(value in MISSING for value in values) or not (material.get("data_sources") or [])


def collection_frequencies(collections: list[dict]) -> Counter:
    frequencies: Counter = Counter()
    for collection in collections:
        for material_id in collection.get("material_ids") or []:
            frequencies[str(material_id)] += 1
    return frequencies


def selection_priority(material: dict, recommended: list[str], frequency: Counter) -> tuple:
    material_id = str(material.get("id"))
    try:
        recommended_rank = recommended.index(material_id)
        recommended_group = 0
    except ValueError:
        recommended_rank = 9999
        recommended_group = 1
    return (
        recommended_group,
        recommended_rank,
        -frequency.get(material_id, 0),
        ENTITY_PRIORITY.get(str(material.get("entity_type")), 99),
        material_id,
    )


def select_materials(root: Path, args: argparse.Namespace, config: dict) -> list[dict]:
    materials = materials_from(root)
    by_id = {item["id"]: item for item in materials}
    collections = collections_from(root)
    frequency = collection_frequencies(collections)
    validation_report = read_json(root / "validation-report.json", {}) or {}
    report_missing_images = set(validation_report.get("missing_image_ids") or []) if isinstance(validation_report, dict) else set()
    report_missing_data = set(validation_report.get("missing_data_ids") or []) if isinstance(validation_report, dict) else set()
    explicit_ids = [item for item in (args.material or []) if item]
    if explicit_ids:
        missing_ids = [item for item in explicit_ids if item not in by_id]
        if missing_ids:
            raise ResearchError(f"找不到材料：{', '.join(missing_ids)}")
        selected = [by_id[item] for item in explicit_ids]
    else:
        selected = list(materials)
        selected.sort(key=lambda item: selection_priority(item, config.get("recommended_material_ids", []), frequency))
    if args.category:
        needle = args.category.casefold()
        selected = [
            item for item in selected
            if needle in " / ".join(str(value) for value in (item.get("taxonomy_path") or [])).casefold()
        ]
    if args.entity_type:
        selected = [item for item in selected if item.get("entity_type") == args.entity_type]
    if args.collection:
        collection = next((item for item in collections if item.get("id") == args.collection), None)
        if not collection:
            raise ResearchError(f"找不到专题集合：{args.collection}")
        wanted = set(collection.get("material_ids") or [])
        selected = [item for item in selected if item.get("id") in wanted]
    if args.missing_images or args.missing_data:
        filtered: list[dict] = []
        for item in selected:
            missing_image = item["id"] in report_missing_images or not formal_image_exists(root, item["id"], "macro")
            missing_data = item["id"] in report_missing_data or is_missing_data(item)
            if (args.missing_images and missing_image) or (args.missing_data and missing_data):
                filtered.append(item)
        selected = filtered
    if args.resume:
        job_document = load_jobs(root)
        latest_jobs: dict[str, dict] = {}
        for job in job_document.get("jobs", []):
            if isinstance(job, dict) and job.get("material_id"):
                latest_jobs[str(job["material_id"])] = job
        completed_ids = {
            material_id
            for material_id, job in latest_jobs.items()
            if job.get("status") == "completed"
        }
        selected = [item for item in selected if item["id"] not in completed_ids]
    limit = int(args.limit or config.get("batch_size", 10))
    if limit < 1:
        raise ResearchError("--limit 必须大于 0；默认批次为 10。")
    return selected[:limit]


def estimate_plan(root: Path, selected: list[dict], config: dict, explicit: bool, args: argparse.Namespace) -> dict:
    by_id = {item["id"]: item for item in materials_from(root)}
    independent = 0
    inherited = 0
    deferred = 0
    search_requests = 0
    for material in selected:
        if formal_image_exists(root, material["id"], "macro"):
            continue
        parent = inherited_image_parent(material, by_id, root)
        if parent and not explicit:
            inherited += 1
        elif material.get("entity_type") in {"grade", "variant", "form"} and not explicit:
            deferred += 1
        else:
            independent += 1
            search_requests += len(macro_queries(material))
    return {
        "selected_materials": len(selected),
        "independent_core_images": independent,
        "inheritable_parent_images": inherited,
        "suggested_deferred": deferred,
        "estimated_wikimedia_search_requests": search_requests,
        "max_image_downloads": independent * int(config.get("max_image_candidates", 5)),
        "ai_images_enabled": bool(config.get("allow_ai_generated_images")),
        "ai_images_requested": bool(args.ai_structure),
        "will_generate_ai_images": bool(config.get("allow_ai_generated_images") and args.ai_structure),
        "max_generated_images_per_run": int(config.get("max_generated_images_per_run", 5)),
        "may_use_paid_api": bool(config.get("allow_ai_generated_images") and args.ai_structure),
        "output_directory": "data/research/ and assets/images/materials/{id}/candidates/",
    }


def load_jobs(root: Path) -> dict:
    ensure_research_storage(root)
    value = read_json(research_directory(root) / "research-jobs.json", {})
    return value if isinstance(value, dict) else {"schema_version": SCHEMA_VERSION, "jobs": [], "estimate": {}}


def save_jobs(root: Path, jobs: list[dict], estimate: dict) -> None:
    atomic_json(
        research_directory(root) / "research-jobs.json",
        {"schema_version": SCHEMA_VERSION, "updated_at": now_iso(), "jobs": jobs, "estimate": estimate},
    )


def merge_candidates(existing: list[dict], incoming: list[dict]) -> tuple[list[dict], int]:
    positions = {str(item.get("candidate_id")): index for index, item in enumerate(existing)}
    added = 0
    for candidate in incoming:
        candidate_id = str(candidate.get("candidate_id") or "")
        if not candidate_id:
            continue
        if candidate_id in positions:
            current = existing[positions[candidate_id]]
            if current.get("status") in {"accepted", "rejected", "applied"}:
                continue
            existing[positions[candidate_id]] = candidate
        else:
            positions[candidate_id] = len(existing)
            existing.append(candidate)
            added += 1
    return existing, added


def remove_selected_candidates(candidates: list[dict], material_ids: set[str], *, kinds: set[str] | None = None) -> list[dict]:
    protected = {"accepted", "applied"}
    if not kinds:
        return [
            item for item in candidates
            if item.get("material_id") not in material_ids or item.get("status") in protected
        ]
    return [
        item for item in candidates
        if item.get("material_id") not in material_ids
        or str(item.get("image_type") or "") not in kinds
        or item.get("status") in protected
    ]


def prune_orphan_research_images(root: Path, material_ids: set[str], referenced: list[dict]) -> int:
    keep = {
        str(item.get(key) or "")
        for item in referenced
        for key in ("src", "generator_artifact")
        if item.get(key)
    }
    removed = 0
    for material_id in material_ids:
        base = root / "assets" / "images" / "materials" / material_id / "candidates"
        for branch in (base / "auto", base / "generated"):
            if not branch.is_dir():
                continue
            for path in branch.rglob("*"):
                if not path.is_file():
                    continue
                relative = path.relative_to(root).as_posix()
                if relative not in keep:
                    path.unlink()
                    removed += 1
                    append_log(root, "orphan_candidate_removed", material_id=material_id, task_type="image", file=relative)
    return removed


def print_plan(selected: list[dict], estimate: dict, config: dict) -> None:
    print("MaterialBox 自动研究任务预估")
    print(f"将处理材料：{len(selected)} 条")
    print("材料：" + ("、".join(f"{item.get('name_cn')} ({item.get('id')})" for item in selected) or "无"))
    print(f"需要独立配图的核心材料：{estimate['independent_core_images']}")
    print(f"可继承父级图片：{estimate['inheritable_parent_images']}")
    print(f"建议暂缓处理：{estimate['suggested_deferred']}")
    print(f"预计 Wikimedia 搜索请求：最多 {estimate['estimated_wikimedia_search_requests']} 次")
    ai_state = "本次将调用" if estimate["will_generate_ai_images"] else ("配置已开启但本次未请求" if estimate["ai_images_enabled"] else "关闭（默认）")
    print(f"AI 图片生成：{ai_state}")
    print(f"是否可能产生 API 费用：{'是' if estimate['may_use_paid_api'] else '否'}")
    print(f"输出目录：{estimate['output_directory']}")
    print(f"每种材料图片候选上限：{config.get('max_image_candidates', 5)}")


def run_research(root: Path, args: argparse.Namespace) -> dict:
    root = Path(root).resolve()
    ensure_research_storage(root)
    config = load_config(root)
    selected = select_materials(root, args, config)
    explicit = bool(args.material)
    estimate = estimate_plan(root, selected, config, explicit, args)
    print_plan(selected, estimate, config)
    if args.plan:
        return {"selected": len(selected), "estimate": estimate, "planned": True}
    if config.get("require_manual_review") is not True:
        raise ResearchError("安全配置错误：require_manual_review 必须为 true。")
    if args.ai_structure and not config.get("allow_ai_generated_images"):
        raise ResearchError("本次请求了 AI 结构图，但 research_config.json 的 allow_ai_generated_images 仍为 false。")
    if args.ai_structure and not explicit:
        raise ResearchError("AI 结构图必须使用 --material 明确指定材料，禁止对默认批次自动生成。")
    if args.ai_structure and len(selected) > int(config.get("max_generated_images_per_run", 5)):
        raise ResearchError("所选材料数超过 max_generated_images_per_run 费用保护上限。")
    materials = materials_from(root)
    by_id = {item["id"]: item for item in materials}
    property_candidates = load_candidates(root, "property")
    image_candidates = load_candidates(root, "image")
    selected_ids = {item["id"] for item in selected}
    if args.overwrite_candidates:
        property_candidates = remove_selected_candidates(property_candidates, selected_ids)
        image_candidates = remove_selected_candidates(image_candidates, selected_ids)
    job_document = load_jobs(root)
    jobs = [item for item in job_document.get("jobs", []) if isinstance(item, dict)]
    completed_ids = {
        str(item.get("material_id")) for item in jobs
        if args.resume and item.get("status") == "completed"
    }
    jobs = [item for item in jobs if item.get("material_id") not in selected_ids or item.get("material_id") in completed_ids]
    total_property_added = 0
    total_image_added = 0
    for material in selected:
        material_id = material["id"]
        if material_id in completed_ids:
            append_log(root, "job_resumed_skip", material_id=material_id, task_type="all")
            continue
        job = {
            "job_id": f"research:{material_id}:{now_iso()}",
            "material_id": material_id,
            "material_name": material.get("name_cn", material_id),
            "entity_type": material.get("entity_type", "material"),
            "priority": selection_priority(material, config.get("recommended_material_ids", []), collection_frequencies(collections_from(root))),
            "queries": material_search_terms(material, by_id),
            "started_at": now_iso(),
            "status": "running",
            "tasks": [],
            "errors": [],
            "api_calls": {"wikimedia_searches": 0, "openai_images": 0},
        }
        append_log(root, "job_started", material_id=material_id, task_type="all", query=job["queries"])
        try:
            if not args.macro_only:
                incoming_properties = property_candidates_for(material)
                filtered_properties = []
                engineering = material.get("engineering_properties") or {}
                for candidate in incoming_properties:
                    field = candidate.get("field")
                    if field == "data_source" or engineering.get(field) in MISSING:
                        filtered_properties.append(candidate)
                property_candidates, added = merge_candidates(property_candidates, filtered_properties)
                total_property_added += added
                job["tasks"].append({"type": "property", "generated": len(filtered_properties), "added": added})

            if not args.data_only:
                own_macro = formal_image_exists(root, material_id, "macro")
                inherited = inherited_image_parent(material, by_id, root)
                skip_for_parent = bool(inherited and not explicit)
                skip_for_precision = material.get("entity_type") in {"grade", "variant", "form"} and not explicit
                if own_macro:
                    job["tasks"].append({"type": "macro", "skipped": "formal_image_exists"})
                elif skip_for_parent:
                    job["tasks"].append({"type": "macro", "skipped": "inherits_parent", "parent_id": inherited})
                elif skip_for_precision:
                    job["tasks"].append({"type": "macro", "skipped": "deferred_by_entity_type"})
                else:
                    maximum = args.max_images or config.get("max_image_candidates", 5)
                    incoming_images, errors = research_macro_images(
                        root, material, image_candidates, config, maximum=maximum
                    )
                    image_candidates, added = merge_candidates(image_candidates, incoming_images)
                    total_image_added += added
                    job["tasks"].append({"type": "macro", "generated": len(incoming_images), "added": added})
                    job["errors"].extend(errors)
                    job["api_calls"]["wikimedia_searches"] = len(macro_queries(material))

                structure = None
                if not args.macro_only and (args.structure or material_id in TEMPLATES) and not formal_image_exists(root, material_id, "structure"):
                    structure = programmatic_candidate(root, material, config)
                    if structure:
                        image_candidates, added = merge_candidates(image_candidates, [structure])
                        total_image_added += added
                        job["tasks"].append({"type": "structure", "generated": 1, "added": added, "origin": "program_generated"})
                if not args.macro_only and args.ai_structure and not structure and not formal_image_exists(root, material_id, "structure"):
                    basis_sources = [
                        {
                            "title": item.get("title", ""),
                            "publisher": item.get("publisher", ""),
                            "doi": item.get("doi", ""),
                            "url": item.get("url", ""),
                            "accessed_at": item.get("accessed_at", ""),
                        }
                        for item in (material.get("data_sources") or [])
                        if isinstance(item, dict) and item.get("title") and (item.get("url") or item.get("doi"))
                    ]
                    if not basis_sources:
                        raise ResearchError(f"{material_id} 没有结构依据来源，禁止调用 AI 图片生成。")
                    prompt = (
                        f"Show the documented composition or hierarchy: {material.get('composition_or_structure', '')}. "
                        f"Taxonomy: {' / '.join(material.get('taxonomy_path') or [])}. Use labels and a clean white background."
                    )
                    ai_candidate = ai_structure_candidate(root, material, config, prompt, basis_sources)
                    image_candidates, added = merge_candidates(image_candidates, [ai_candidate])
                    total_image_added += added
                    job["api_calls"]["openai_images"] += 1
                    job["tasks"].append({"type": "structure", "generated": 1, "added": added, "origin": "ai_generated"})

                if not args.macro_only and (args.micro_links or material_id in {"ti_tc4"}):
                    links = micro_link_candidates_for(material)
                    image_candidates, added = merge_candidates(image_candidates, links)
                    total_image_added += added
                    if links:
                        job["tasks"].append({"type": "micro_link", "generated": len(links), "added": added})
            job["status"] = "completed" if not job["errors"] else "partial"
        except Exception as exc:  # one material must never stop the entire batch
            job["status"] = "failed"
            job["errors"].append(str(exc))
            append_log(root, "job_failed", material_id=material_id, task_type="all", error=str(exc))
        job["finished_at"] = now_iso()
        jobs.append(job)
        append_log(
            root,
            "job_finished",
            material_id=material_id,
            task_type="all",
            result=job["status"],
            error=job["errors"],
            api_calls=job["api_calls"],
            cost="0 unless explicitly enabled AI image generation",
        )
        save_candidates(root, "property", property_candidates)
        save_candidates(root, "image", image_candidates)
        save_jobs(root, jobs, estimate)
    report = validate_all(root)
    orphan_images_removed = prune_orphan_research_images(root, selected_ids, image_candidates) if args.overwrite_candidates else 0
    result = {
        "selected": len(selected),
        "property_candidates_added": total_property_added,
        "image_candidates_added": total_image_added,
        "validation": report["summary"],
        "orphan_images_removed": orphan_images_removed,
        "estimate": estimate,
    }
    print(
        f"研究候选已生成：数据 {total_property_added} 条，图片/图源 {total_image_added} 条；"
        f"验证通过 {report['summary']['valid']} / {report['summary']['total']}。"
    )
    print("正式 materials.json 与正式图片目录中的现有文件均未被修改。")
    return result


def status(root: Path) -> None:
    jobs = load_jobs(root)
    properties = load_candidates(root, "property")
    images = load_candidates(root, "image")
    report = read_json(research_directory(root) / "validation-report.json", {})
    counts = Counter(str(item.get("status") or "unknown") for item in [*properties, *images])
    job_counts = Counter(str(item.get("status") or "unknown") for item in jobs.get("jobs", []))
    print("MaterialBox 自动研究进度")
    print(f"任务：{dict(job_counts)}")
    print(f"数据候选：{len(properties)} | 图片候选：{len(images)}")
    print(f"候选状态：{dict(counts)}")
    print(f"最近验证：{(report or {}).get('summary', {})}")
    print(f"日志：{research_directory(root) / 'research-log.jsonl'}")


def parser() -> argparse.ArgumentParser:
    value = argparse.ArgumentParser(description="MaterialBox AI 自动研究候选生成器")
    value.add_argument("--root", type=Path, default=ROOT, help=argparse.SUPPRESS)
    value.add_argument("--material", action="append", help="仅处理指定 material id，可重复")
    value.add_argument("--category", help="按 taxonomy_path 分类筛选")
    value.add_argument("--entity-type", choices=list(ENTITY_PRIORITY))
    value.add_argument("--collection", help="按 application collection id 筛选")
    value.add_argument("--missing-images", action="store_true")
    value.add_argument("--missing-data", action="store_true")
    value.add_argument("--limit", type=int, default=0)
    value.add_argument("--resume", action="store_true")
    value.add_argument("--overwrite-candidates", action="store_true")
    value.add_argument("--macro-only", action="store_true", help="只研究宏观图候选")
    value.add_argument("--data-only", action="store_true", help="只生成数据/来源候选")
    value.add_argument("--structure", action="store_true", help="为支持模板的材料生成程序化结构候选")
    value.add_argument("--ai-structure", action="store_true", help="显式请求 AI 结构图；还需配置开关、API 密钥和结构依据")
    value.add_argument("--micro-links", action="store_true", help="生成保守的微观论文链接候选")
    value.add_argument("--max-images", type=int, choices=range(1, 6), metavar="1-5")
    value.add_argument("--plan", action="store_true", help="只显示任务预估，不联网、不写候选")
    value.add_argument("--status", action="store_true", help="显示进度")
    return value


def main() -> None:
    args = parser().parse_args()
    try:
        if args.status:
            status(args.root.resolve())
        else:
            run_research(args.root.resolve(), args)
    except ResearchError as exc:
        print(f"自动研究失败：{exc}", file=sys.stderr)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
