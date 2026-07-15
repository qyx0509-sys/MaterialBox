#!/usr/bin/env python3
"""Shared image-policy validation, resolution and formal-image evaluation."""

from __future__ import annotations

import json
from pathlib import Path


IMAGE_TYPES = ("macro", "micro", "structure")
POLICY_LEVELS = ("required", "recommended", "optional", "not_applicable")
ENTITY_TYPES = ("family", "subfamily", "material", "grade", "variant", "form")
IMAGE_EXTENSIONS = (".webp", ".jpg", ".jpeg", ".png")


class ImagePolicyError(ValueError):
    pass


def read_json(path: Path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _rule_paths(policy: dict):
    yield "default", policy.get("default")
    for category, rule in (policy.get("category_rules") or {}).items():
        yield f"category_rules.{category}", rule
    for entity, rule in (policy.get("entity_rules") or {}).items():
        yield f"entity_rules.{entity}", rule
    for category, entity_rules in (policy.get("category_entity_rules") or {}).items():
        if not isinstance(entity_rules, dict):
            yield f"category_entity_rules.{category}", entity_rules
            continue
        for entity, rule in entity_rules.items():
            yield f"category_entity_rules.{category}.{entity}", rule
    for material_id, rule in (policy.get("material_overrides") or {}).items():
        yield f"material_overrides.{material_id}", rule


def validate_policy(policy: dict, materials: list[dict]) -> list[str]:
    errors: list[str] = []
    if not isinstance(policy, dict):
        return ["配图策略根节点必须是对象"]
    if tuple(policy.get("image_types") or []) != IMAGE_TYPES:
        errors.append("image_types 必须且只能按 macro、micro、structure 排列")
    material_ids = {str(item.get("id")) for item in materials if item.get("id")}
    categories = {str(item.get("category_1")) for item in materials if item.get("category_1")}
    default = policy.get("default")
    if not isinstance(default, dict):
        errors.append("default 规则缺失或不是对象")
    for path, rule in _rule_paths(policy):
        if not isinstance(rule, dict):
            errors.append(f"{path}: 规则必须是对象")
            continue
        supplied_levels = [level for level in POLICY_LEVELS if level in rule]
        if supplied_levels and len(supplied_levels) != len(POLICY_LEVELS):
            errors.append(f"{path}: 修改图片等级时必须同时填写 required、recommended、optional、not_applicable")
        if supplied_levels:
            assigned: list[str] = []
            for level in POLICY_LEVELS:
                values = rule.get(level)
                if not isinstance(values, list):
                    errors.append(f"{path}.{level}: 必须是数组")
                    continue
                invalid = [value for value in values if value not in IMAGE_TYPES]
                if invalid:
                    errors.append(f"{path}.{level}: 非法图片类型 {', '.join(map(str, invalid))}")
                assigned.extend(value for value in values if value in IMAGE_TYPES)
            duplicates = sorted({value for value in assigned if assigned.count(value) > 1})
            if duplicates:
                errors.append(f"{path}: 图片类型重复归类 {', '.join(duplicates)}")
            if set(assigned) != set(IMAGE_TYPES):
                errors.append(f"{path}: 三种图片必须且只能各归入一个等级")
        if "allow_inherited" in rule and not isinstance(rule.get("allow_inherited"), bool):
            errors.append(f"{path}.allow_inherited: 必须是布尔值")
        if "reason" in rule and not isinstance(rule.get("reason"), str):
            errors.append(f"{path}.reason: 必须是字符串")
    for category in (policy.get("category_rules") or {}):
        if category not in categories:
            errors.append(f"category_rules 引用了不存在的一级分类：{category}")
    for category, entity_rules in (policy.get("category_entity_rules") or {}).items():
        if category not in categories:
            errors.append(f"category_entity_rules 引用了不存在的一级分类：{category}")
        if isinstance(entity_rules, dict):
            for entity in entity_rules:
                if entity not in ENTITY_TYPES:
                    errors.append(f"category_entity_rules.{category} 引用了非法 entity_type：{entity}")
    for entity in (policy.get("entity_rules") or {}):
        if entity not in ENTITY_TYPES:
            errors.append(f"entity_rules 引用了非法 entity_type：{entity}")
    for material_id in (policy.get("material_overrides") or {}):
        if material_id not in material_ids:
            errors.append(f"material_overrides 引用了不存在的材料 ID：{material_id}")
    return errors


def resolve_image_policy(policy: dict, material: dict) -> dict:
    result = {
        "required": [],
        "recommended": [],
        "optional": [],
        "not_applicable": [],
        "allow_inherited": True,
        "reason": "",
    }
    category = str(material.get("category_1") or "")
    entity = str(material.get("entity_type") or "")
    material_id = str(material.get("id") or "")
    rules = [
        policy.get("default") or {},
        (policy.get("entity_rules") or {}).get(entity) or {},
        (policy.get("category_rules") or {}).get(category) or {},
        ((policy.get("category_entity_rules") or {}).get(category) or {}).get(entity) or {},
        (policy.get("material_overrides") or {}).get(material_id) or {},
    ]
    reasons: list[str] = []
    for rule in rules:
        for level in POLICY_LEVELS:
            if level in rule:
                result[level] = list(rule[level])
        if "allow_inherited" in rule:
            result["allow_inherited"] = bool(rule["allow_inherited"])
        reason = str(rule.get("reason") or "").strip()
        if reason and reason not in reasons:
            reasons.append(reason)
    result["reason"] = reasons[-1] if reasons else ""
    return result


def formal_image_exists(root: Path, material_id: str, image_type: str) -> bool:
    folder = Path(root) / "assets" / "images" / "materials" / material_id
    return any(
        (folder / f"{image_type}_{slot:02d}{extension}").is_file()
        for slot in range(1, 4)
        for extension in IMAGE_EXTENSIONS
    )


def build_image_inventory(root: Path, materials: list[dict]) -> dict[str, dict[str, bool]]:
    return {
        str(material["id"]): {
            image_type: formal_image_exists(root, str(material["id"]), image_type)
            for image_type in IMAGE_TYPES
        }
        for material in materials
        if material.get("id")
    }


def inherited_image_sources(material: dict, by_id: dict[str, dict], inventory: dict[str, dict[str, bool]]) -> dict[str, str]:
    inherited: dict[str, str] = {}
    for image_type in IMAGE_TYPES:
        if inventory.get(str(material.get("id")), {}).get(image_type):
            continue
        parent_id = str(material.get("parent_id") or "")
        visited: set[str] = set()
        while parent_id and parent_id not in visited:
            visited.add(parent_id)
            if inventory.get(parent_id, {}).get(image_type):
                inherited[image_type] = parent_id
                break
            parent_id = str((by_id.get(parent_id) or {}).get("parent_id") or "")
    return inherited


def evaluate_material_images(
    root: Path,
    material: dict,
    materials: list[dict],
    policy: dict,
    inventory: dict[str, dict[str, bool]] | None = None,
) -> dict:
    by_id = {str(item.get("id")): item for item in materials if item.get("id")}
    inventory = inventory or build_image_inventory(root, materials)
    resolved = resolve_image_policy(policy, material)
    material_id = str(material.get("id") or "")
    own = [image_type for image_type in IMAGE_TYPES if inventory.get(material_id, {}).get(image_type)]
    inherited_from = inherited_image_sources(material, by_id, inventory) if resolved["allow_inherited"] else {}
    inherited = [image_type for image_type in IMAGE_TYPES if image_type in inherited_from and image_type not in own]
    available = set(own) | set(inherited)
    missing_required = [image_type for image_type in resolved["required"] if image_type not in available]
    missing_recommended = [image_type for image_type in resolved["recommended"] if image_type not in available]
    required_via_inheritance = [image_type for image_type in resolved["required"] if image_type in inherited]
    family_reference_only = material.get("entity_type") == "family" and bool(required_via_inheritance)
    own_images_complete = all(image_type in own for image_type in resolved["required"])
    policy_complete = not missing_required
    if missing_required:
        status = "缺少必需图片"
    elif family_reference_only:
        status = "继承参考图，建议补专属图"
    elif missing_recommended:
        status = "必需已满足，建议补充"
    else:
        status = "已满足配图策略"
    return {
        "material_id": material_id,
        **resolved,
        "own_images": own,
        "inherited_images": inherited,
        "inherited_from": inherited_from,
        "missing_required": missing_required,
        "missing_recommended": missing_recommended,
        "policy_complete": policy_complete,
        "own_images_complete": own_images_complete,
        "family_reference_only": family_reference_only,
        "using_inherited_images": bool(inherited),
        "only_own_images": bool(own) and not inherited,
        "policy_status": status,
        "policy_reason": resolved["reason"],
    }


def javascript_source(policy: dict) -> str:
    payload = json.dumps(policy, ensure_ascii=False, indent=2)
    return f'''// AUTO-GENERATED by tools/sync_image_policy.py. Edit image-policy.json instead.
(function () {{
  const policy = {payload};
  const levels = ["required", "recommended", "optional", "not_applicable"];

  function applyRule(target, rule, reasons) {{
    if (!rule || typeof rule !== "object") return;
    levels.forEach((level) => {{ if (Array.isArray(rule[level])) target[level] = [...rule[level]]; }});
    if (typeof rule.allow_inherited === "boolean") target.allow_inherited = rule.allow_inherited;
    if (rule.reason && !reasons.includes(rule.reason)) reasons.push(rule.reason);
  }}

  function resolveImagePolicy(material) {{
    const target = {{ required: [], recommended: [], optional: [], not_applicable: [], allow_inherited: true, reason: "" }};
    const reasons = [];
    const category = String(material?.category_1 || "");
    const entity = String(material?.entity_type || "");
    const materialId = String(material?.id || "");
    applyRule(target, policy.default, reasons);
    applyRule(target, policy.entity_rules?.[entity], reasons);
    applyRule(target, policy.category_rules?.[category], reasons);
    applyRule(target, policy.category_entity_rules?.[category]?.[entity], reasons);
    applyRule(target, policy.material_overrides?.[materialId], reasons);
    target.reason = reasons.length ? reasons[reasons.length - 1] : "";
    return target;
  }}

  window.MATERIAL_IMAGE_POLICY = policy;
  window.resolveImagePolicy = resolveImagePolicy;
  window.MaterialBoxImagePolicy = {{ resolve: resolveImagePolicy, imageTypes: [...policy.image_types] }};
}})();
'''
