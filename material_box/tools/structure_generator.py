#!/usr/bin/env python3
"""Generate traceable teaching-diagram candidates, never experimental images."""

from __future__ import annotations

import base64
import os
from datetime import date
from io import BytesIO
from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw, ImageFont, ImageOps

from research_common import ResearchError, make_candidate_id, now_iso, project_relative, sha256_file


GENERATOR_VERSION = "1.0"
DISCLAIMER = "AI生成教学示意图，不是实验照片"
PROGRAM_DISCLAIMER = "程序生成教学示意图，不是实验照片；概念性示意，不代表实际尺寸、比例和显微组织。"


def basis_source(title: str, publisher: str, url: str, *, doi: str = "") -> dict:
    return {
        "title": title,
        "publisher": publisher,
        "doi": doi,
        "url": url,
        "accessed_at": date.today().isoformat(),
    }


TEMPLATES: dict[str, dict] = {
    "polyethylene": {
        "caption": "聚乙烯重复单元与线性链段教学示意",
        "alt": "聚乙烯重复单元程序化结构示意图",
        "kind": "polymer_repeat_unit",
        "basis_sources": [
            basis_source(
                "Polymer Materials for Photovoltaic Systems",
                "National Bureau of Standards (NIST legacy publication)",
                "https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nbsir85-3197.pdf",
            ),
            basis_source(
                "Polyethylene (SID 134991390)",
                "PubChem, U.S. National Library of Medicine",
                "https://pubchem.ncbi.nlm.nih.gov/substance/134991390",
            ),
        ],
    },
    "carbon_fiber_epoxy": {
        "caption": "碳纤维增强环氧基体与层合结构教学示意",
        "alt": "碳纤维环氧复合材料程序化层级结构示意图",
        "kind": "fiber_composite",
        "basis_sources": [
            basis_source(
                "Composite Overwrapped Pressure Vessel Life Prediction",
                "NASA Technical Reports Server",
                "https://ntrs.nasa.gov/api/citations/20150012180/downloads/20150012180.pdf?attachment=true",
            )
        ],
    },
}


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    names = [
        Path("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for path in names:
        if path.is_file():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


def base_canvas(title: str) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGB", (1400, 900), "#f7fbfb")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((42, 42, 1358, 858), radius=28, fill="#ffffff", outline="#cfe2e0", width=3)
    draw.text((82, 76), title, fill="#173f3b", font=font(44, True))
    draw.text((82, 134), "PROGRAMMATIC TEACHING DIAGRAM", fill="#4c7f79", font=font(22, True))
    return image, draw


def draw_polyethylene() -> Image.Image:
    image, draw = base_canvas("Polyethylene repeating unit")
    y = 400
    x_values = [270, 520, 770, 1020]
    for index, x in enumerate(x_values):
        draw.ellipse((x - 50, y - 50, x + 50, y + 50), fill="#e6f3f1", outline="#168d81", width=6)
        draw.text((x - 36, y - 24), "CH2", fill="#124d47", font=font(34, True))
        if index:
            draw.line((x_values[index - 1] + 50, y, x - 50, y), fill="#3d78be", width=8)
    draw.line((205, y - 95, 205, y + 95), fill="#566b73", width=6)
    draw.line((1085, y - 95, 1085, y + 95), fill="#566b73", width=6)
    draw.text((1120, y + 42), "n", fill="#173f3b", font=font(44, True))
    draw.text((275, 575), "Repeating unit: [-CH2-CH2-]n", fill="#293f47", font=font(36, True))
    draw.text((245, 652), "Chain length, branching and crystallinity vary by polyethylene grade.", fill="#667085", font=font(24))
    draw.text((82, 802), PROGRAM_DISCLAIMER, fill="#7a4f00", font=font(20))
    return image


def draw_fiber_composite() -> Image.Image:
    image, draw = base_canvas("Carbon fiber / epoxy hierarchical structure")
    draw.rounded_rectangle((100, 235, 820, 690), radius=24, fill="#e9f5f3", outline="#168d81", width=4)
    for row in range(4):
        for column in range(7):
            x = 170 + column * 95 + (row % 2) * 22
            y = 300 + row * 95
            draw.ellipse((x - 31, y - 31, x + 31, y + 31), fill="#26333a", outline="#5d747f", width=3)
    draw.text((125, 710), "Fiber cross-sections embedded in epoxy matrix", fill="#293f47", font=font(25, True))
    colors = ["#39596b", "#7fa6b8", "#39596b", "#7fa6b8", "#39596b"]
    for index, color in enumerate(colors):
        top = 260 + index * 76
        draw.rounded_rectangle((910, top, 1280, top + 48), radius=9, fill=color)
        angle = "0 deg" if index % 2 == 0 else "90 deg"
        draw.text((1040, top + 8), angle, fill="#ffffff", font=font(22, True))
    draw.text((955, 675), "Laminate plies", fill="#293f47", font=font(28, True))
    draw.line((835, 455, 895, 455), fill="#3d78be", width=8)
    draw.polygon([(895, 455), (870, 440), (870, 470)], fill="#3d78be")
    draw.text((82, 802), PROGRAM_DISCLAIMER, fill="#7a4f00", font=font(20))
    return image


DRAWERS: dict[str, Callable[[], Image.Image]] = {
    "polymer_repeat_unit": draw_polyethylene,
    "fiber_composite": draw_fiber_composite,
}


def svg_for(kind: str, title: str) -> str:
    if kind == "polymer_repeat_unit":
        body = """
  <g fill="#e6f3f1" stroke="#168d81" stroke-width="5">
    <circle cx="290" cy="330" r="54"/><circle cx="510" cy="330" r="54"/>
    <circle cx="730" cy="330" r="54"/><circle cx="950" cy="330" r="54"/>
  </g>
  <g stroke="#3d78be" stroke-width="8"><path d="M344 330H456M564 330H676M784 330H896"/></g>
  <g font-size="31" font-weight="700" text-anchor="middle" fill="#124d47">
    <text x="290" y="341">CH2</text><text x="510" y="341">CH2</text>
    <text x="730" y="341">CH2</text><text x="950" y="341">CH2</text>
  </g>
  <text x="330" y="510" font-size="40" font-weight="700" fill="#293f47">[-CH2-CH2-]n</text>"""
    else:
        circles = "".join(
            f'<circle cx="{170 + col * 82 + (row % 2) * 18}" cy="{265 + row * 82}" r="27" fill="#26333a"/>'
            for row in range(4) for col in range(7)
        )
        layers = "".join(
            f'<rect x="840" y="{250 + index * 70}" width="300" height="44" rx="8" fill="{color}"/>'
            for index, color in enumerate(["#39596b", "#7fa6b8", "#39596b", "#7fa6b8", "#39596b"])
        )
        body = f'<rect x="90" y="210" width="640" height="430" rx="22" fill="#e9f5f3"/>{circles}{layers}'
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760">
<rect width="1200" height="760" fill="#f7fbfb"/><rect x="28" y="28" width="1144" height="704" rx="24" fill="#fff" stroke="#cfe2e0" stroke-width="3"/>
<text x="70" y="92" font-family="Arial,sans-serif" font-size="38" font-weight="700" fill="#173f3b">{title}</text>
<text x="70" y="135" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#4c7f79">PROGRAMMATIC TEACHING DIAGRAM</text>
{body}
<text x="70" y="700" font-family="Arial,sans-serif" font-size="16" fill="#7a4f00">Conceptual diagram; not an experimental image and not to scale.</text>
</svg>\n"""


def programmatic_candidate(root: Path, material: dict, config: dict) -> dict | None:
    material_id = str(material.get("id") or "")
    template = TEMPLATES.get(material_id)
    if not template or not template.get("basis_sources"):
        return None
    kind = template["kind"]
    candidate_id = make_candidate_id("structure", material_id, kind, GENERATOR_VERSION)
    directory = root / "assets" / "images" / "materials" / material_id / "candidates" / "generated" / "structure"
    directory.mkdir(parents=True, exist_ok=True)
    stem = candidate_id.split(":")[-1]
    webp = directory / f"{stem}.webp"
    svg = directory / f"{stem}.svg"
    image = DRAWERS[kind]()
    image.thumbnail((int(config.get("max_image_edge", 1600)),) * 2, Image.Resampling.LANCZOS)
    image.save(webp, "WEBP", quality=int(config.get("image_quality", 85)), method=6)
    svg.write_text(svg_for(kind, template["caption"]), encoding="utf-8")
    return {
        "candidate_id": candidate_id,
        "material_id": material_id,
        "material_name": material.get("name_cn", material_id),
        "entity_type": material.get("entity_type", "material"),
        "image_type": "structure",
        "src": project_relative(root, webp),
        "generator_artifact": project_relative(root, svg),
        "title": template["caption"],
        "caption": template["caption"],
        "alt": template["alt"],
        "source": "MaterialBox programmatic diagram",
        "author": "MaterialBox",
        "license": "Project-generated candidate",
        "licenseUrl": "",
        "sourceUrl": "",
        "accessed_at": date.today().isoformat(),
        "sha256": sha256_file(webp),
        "width": image.width,
        "height": image.height,
        "mime": "image/webp",
        "origin": "program_generated",
        "generator_version": GENERATOR_VERSION,
        "generated_at": now_iso(),
        "basis_sources": template["basis_sources"],
        "disclaimer": PROGRAM_DISCLAIMER,
        "confidence": 0.9,
        "status": "pending_review",
        "agent_notes": "依据公开资料程序化绘制；审核时仍需核对结构表达是否适合该材料层级。",
    }


def ai_structure_candidate(root: Path, material: dict, config: dict, prompt: str, basis_sources: list[dict]) -> dict:
    """Optional, explicit-only AI diagram generation. Never used for macro or micro images."""
    if not config.get("allow_ai_generated_images"):
        raise ResearchError("research_config.json 未开启 allow_ai_generated_images。")
    if not basis_sources:
        raise ResearchError("没有结构依据资料，禁止生成 AI 结构图。")
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise ResearchError("未设置环境变量 OPENAI_API_KEY。")
    try:
        from openai import OpenAI
    except ImportError as exc:
        raise ResearchError("未安装 openai；请安装 tools/requirements-research.txt。") from exc
    model = str(config.get("openai_image_model") or "gpt-image-1")
    guarded_prompt = (
        f"Create a clean educational structure diagram for {material.get('name_en') or material.get('name_cn')}. "
        "This must look like an explanatory diagram, never a photograph, SEM, TEM, metallograph, fracture image, "
        f"or experimental result. Include a visible label: Teaching schematic, not experimental data. {prompt}"
    )
    response = OpenAI(api_key=api_key).images.generate(model=model, prompt=guarded_prompt, size="1536x1024")
    encoded = getattr(response.data[0], "b64_json", None)
    if not encoded:
        raise ResearchError("OpenAI 图片响应未包含可保存的数据。")
    with Image.open(BytesIO(base64.b64decode(encoded))) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        image.thumbnail((int(config.get("max_image_edge", 1600)),) * 2, Image.Resampling.LANCZOS)
        candidate_id = make_candidate_id("ai-structure", str(material.get("id")), guarded_prompt, now_iso())
        target = root / "assets" / "images" / "materials" / str(material["id"]) / "candidates" / "generated" / "structure" / f"{candidate_id.split(':')[-1]}.webp"
        target.parent.mkdir(parents=True, exist_ok=True)
        image.save(target, "WEBP", quality=int(config.get("image_quality", 85)), method=6)
    return {
        "candidate_id": candidate_id,
        "material_id": material["id"],
        "material_name": material.get("name_cn", material["id"]),
        "entity_type": material.get("entity_type", "material"),
        "image_type": "structure",
        "src": project_relative(root, target),
        "caption": "AI 生成的材料结构教学示意候选",
        "alt": f"{material.get('name_cn', material['id'])}AI结构教学示意图",
        "origin": "ai_generated",
        "source": "OpenAI GPT Image",
        "model": model,
        "prompt": guarded_prompt,
        "generated_at": now_iso(),
        "basis_sources": basis_sources,
        "generator_version": GENERATOR_VERSION,
        "disclaimer": DISCLAIMER,
        "sha256": sha256_file(target),
        "width": image.width,
        "height": image.height,
        "mime": "image/webp",
        "confidence": 0.5,
        "status": "pending_review",
    }

