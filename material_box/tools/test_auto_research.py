#!/usr/bin/env python3
"""Offline end-to-end test for the research review and import workflow."""

from __future__ import annotations

import hashlib
import json
import shutil
import tempfile
from pathlib import Path

from research_import import apply_accepted_candidates, restore_latest_research_backup, review_candidates
from research_sources import micro_link_candidates_for, property_candidates_for
from research_common import save_candidates
from research_validator import validate_all
from structure_generator import programmatic_candidate


ROOT = Path(__file__).resolve().parents[1]


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="materialbox-research-test-") as temporary:
        project = Path(temporary) / "material_box"
        shutil.copytree(
            ROOT,
            project,
            ignore=shutil.ignore_patterns(".git", "backups", "artifacts", "__pycache__", "图片"),
        )
        materials = json.loads((project / "materials.json").read_text(encoding="utf-8"))
        by_id = {item["id"]: item for item in materials}
        config = json.loads((project / "tools" / "research_config.json").read_text(encoding="utf-8"))
        materials_before = digest(project / "materials.json")
        steel_before = digest(project / "assets" / "images" / "materials" / "steel" / "macro_01.webp")
        polyethylene_image_dir = project / "assets" / "images" / "materials" / "polyethylene"
        structures_before = {
            path.name: digest(path)
            for path in polyethylene_image_dir.glob("structure_*.webp")
        }

        properties = property_candidates_for(by_id["polyethylene"])
        ti_properties = property_candidates_for(by_id["ti_tc4"])
        structure = programmatic_candidate(project, by_id["polyethylene"], config)
        micro_links = micro_link_candidates_for(by_id["ti_tc4"])
        assert properties and structure and ti_properties and micro_links
        assert ti_properties[0]["material_state"]
        assert micro_links[0]["link_only"] is True and not micro_links[0]["src"]
        save_candidates(project, "property", properties + ti_properties)
        save_candidates(project, "image", [structure, *micro_links])

        report = validate_all(project)
        assert report["summary"]["invalid"] == 0
        property_id = properties[0]["candidate_id"]
        image_id = structure["candidate_id"]
        review_candidates(project, kind="property", candidate_ids=[property_id], action="accept")
        review_candidates(project, kind="image", candidate_ids=[image_id], action="accept")
        preview = apply_accepted_candidates(
            project,
            confirmation="",
            candidate_ids=[property_id, image_id],
            dry_run=True,
        )
        assert preview["properties"] == 1 and preview["images"] == 1
        result = apply_accepted_candidates(
            project,
            confirmation="APPLY ACCEPTED",
            candidate_ids=[property_id, image_id],
        )
        assert result["candidates"] == 2
        updated = json.loads((project / "materials.json").read_text(encoding="utf-8"))
        polyethylene = next(item for item in updated if item["id"] == "polyethylene")
        assert polyethylene["data_status"] == "待核验"
        assert polyethylene["data_sources"]
        structures_after = {
            path.name: digest(path)
            for path in polyethylene_image_dir.glob("structure_*.webp")
        }
        added_structure_names = set(structures_after) - set(structures_before)
        assert len(added_structure_names) == 1
        formal = polyethylene_image_dir / added_structure_names.pop()
        assert formal.is_file()
        assert property_id in (project / "materials.js").read_text(encoding="utf-8")
        assert any(
            item.get("materialId") == "polyethylene" and item.get("type") == "structure"
            for item in json.loads((project / "image-attribution.json").read_text(encoding="utf-8"))
        )
        assert digest(project / "assets" / "images" / "materials" / "steel" / "macro_01.webp") == steel_before

        restore_latest_research_backup(project, "RESTORE RESEARCH")
        assert digest(project / "materials.json") == materials_before
        assert digest(project / "assets" / "images" / "materials" / "steel" / "macro_01.webp") == steel_before
        structures_restored = {
            path.name: digest(path)
            for path in polyethylene_image_dir.glob("structure_*.webp")
        }
        assert structures_restored == structures_before
        print("Auto research acceptance test passed.")
        print("Verified validation, review, dry-run, formal apply, static sync, attribution and backup restore.")


if __name__ == "__main__":
    main()
