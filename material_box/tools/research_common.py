#!/usr/bin/env python3
"""Shared storage and safety helpers for the MaterialBox research pipeline."""

from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_VERSION = "1.0"
MATERIAL_ID = re.compile(r"^[a-z0-9][a-z0-9_-]*$")
CANDIDATE_ID = re.compile(r"^[a-z0-9][a-z0-9_.:-]*$")
CANDIDATE_FILES = {
    "property": "property-candidates.json",
    "image": "image-candidates.json",
}


class ResearchError(RuntimeError):
    """A research pipeline error safe to show in the local manager."""


def now_iso() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def read_json(path: Path, default: Any = None) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except FileNotFoundError:
        return default
    except json.JSONDecodeError as exc:
        raise ResearchError(f"JSON 格式错误：{path} 第 {exc.lineno} 行，第 {exc.colno} 列") from exc


def atomic_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def research_directory(root: Path = ROOT) -> Path:
    return Path(root).resolve() / "data" / "research"


def ensure_research_storage(root: Path = ROOT) -> None:
    directory = research_directory(root)
    directory.mkdir(parents=True, exist_ok=True)
    defaults = {
        "property-candidates.json": {"schema_version": SCHEMA_VERSION, "updated_at": "", "candidates": []},
        "image-candidates.json": {"schema_version": SCHEMA_VERSION, "updated_at": "", "candidates": []},
        "research-jobs.json": {"schema_version": SCHEMA_VERSION, "updated_at": "", "jobs": [], "estimate": {}},
        "validation-report.json": {
            "schema_version": SCHEMA_VERSION,
            "generated_at": "",
            "summary": {"total": 0, "valid": 0, "invalid": 0, "warnings": 0},
            "items": [],
        },
    }
    for name, value in defaults.items():
        path = directory / name
        if not path.exists():
            atomic_json(path, value)
    (directory / "research-log.jsonl").touch(exist_ok=True)


def load_config(root: Path = ROOT) -> dict[str, Any]:
    path = Path(root).resolve() / "tools" / "research_config.json"
    config = read_json(path, {})
    if not isinstance(config, dict):
        raise ResearchError("research_config.json 顶层必须是对象。")
    return config


def candidate_path(root: Path, kind: str) -> Path:
    if kind not in CANDIDATE_FILES:
        raise ResearchError(f"未知候选类型：{kind}")
    ensure_research_storage(root)
    return research_directory(root) / CANDIDATE_FILES[kind]


def load_candidates(root: Path, kind: str) -> list[dict[str, Any]]:
    document = read_json(candidate_path(root, kind), {})
    candidates = document.get("candidates", []) if isinstance(document, dict) else []
    if not isinstance(candidates, list):
        raise ResearchError(f"{CANDIDATE_FILES[kind]} 的 candidates 必须是数组。")
    return [item for item in candidates if isinstance(item, dict)]


def save_candidates(root: Path, kind: str, candidates: list[dict[str, Any]]) -> None:
    atomic_json(
        candidate_path(root, kind),
        {"schema_version": SCHEMA_VERSION, "updated_at": now_iso(), "candidates": candidates},
    )


def make_candidate_id(prefix: str, *parts: str) -> str:
    seed = "|".join(str(part or "") for part in parts)
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()[:14]
    clean_prefix = re.sub(r"[^a-z0-9_-]+", "-", prefix.lower()).strip("-") or "candidate"
    return f"{clean_prefix}:{digest}"


def safe_material_id(value: Any) -> str:
    material_id = str(value or "").strip()
    if not MATERIAL_ID.fullmatch(material_id):
        raise ResearchError("材料 id 不合法。")
    return material_id


def safe_candidate_id(value: Any) -> str:
    candidate_id = str(value or "").strip()
    if not CANDIDATE_ID.fullmatch(candidate_id):
        raise ResearchError("候选 id 不合法。")
    return candidate_id


def safe_project_path(root: Path, value: str) -> Path:
    relative = PurePosixPath(str(value or ""))
    if relative.is_absolute() or ".." in relative.parts:
        raise ResearchError("候选文件路径不安全。")
    target = (Path(root).resolve() / Path(*relative.parts)).resolve()
    try:
        target.relative_to(Path(root).resolve())
    except ValueError as exc:
        raise ResearchError("候选文件不在项目目录内。") from exc
    return target


def project_relative(root: Path, path: Path) -> str:
    return path.resolve().relative_to(Path(root).resolve()).as_posix()


def append_log(root: Path, event: str, **values: Any) -> None:
    ensure_research_storage(root)
    record = {"time": now_iso(), "event": event, **values}
    path = research_directory(root) / "research-log.jsonl"
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def source_complete(source: Any) -> bool:
    if not isinstance(source, dict) or not str(source.get("title", "")).strip():
        return False
    return bool(str(source.get("url", "")).strip() or str(source.get("doi", "")).strip())


def source_key(source: Any) -> tuple[str, str, str]:
    if not isinstance(source, dict):
        return ("", "", "")
    return (
        str(source.get("title", "")).strip().casefold(),
        str(source.get("doi", "")).strip().casefold(),
        str(source.get("url", "")).strip().casefold(),
    )


def confidence_value(value: Any) -> float:
    try:
        return max(0.0, min(1.0, float(value)))
    except (TypeError, ValueError):
        return 0.0

