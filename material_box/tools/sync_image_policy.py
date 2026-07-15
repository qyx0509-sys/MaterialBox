#!/usr/bin/env python3
"""Validate image-policy.json and generate its static browser copy."""

from __future__ import annotations

import argparse
from pathlib import Path

from image_policy import javascript_source, read_json, validate_policy


ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    parser = argparse.ArgumentParser(description="同步 MaterialBox 配图策略")
    parser.add_argument("--check", action="store_true", help="只检查，不生成 image-policy.js")
    args = parser.parse_args()
    policy_path = ROOT / "image-policy.json"
    materials_path = ROOT / "materials.json"
    try:
        policy = read_json(policy_path)
        materials = read_json(materials_path)
    except (OSError, ValueError) as exc:
        raise SystemExit(f"配图策略读取失败：{exc}") from exc
    errors = validate_policy(policy, materials)
    if errors:
        print("配图策略检查失败：")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)
    print(f"配图策略检查通过：{len(materials)} 条材料，{len(policy.get('material_overrides') or {})} 条材料覆盖规则。")
    if args.check:
        print("检查模式未写入任何文件。")
        return
    target = ROOT / "image-policy.js"
    target.write_text(javascript_source(policy), encoding="utf-8")
    print(f"已生成静态策略：{target}")
    print("未修改任何图片、候选图、图片元数据或许可证记录。")


if __name__ == "__main__":
    main()
