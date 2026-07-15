#!/usr/bin/env python3
"""Conservative source registry and query builder for MaterialBox research.

This module never invents numeric material properties. Numeric candidates are
created only from explicitly curated primary or official sources below.
"""

from __future__ import annotations

import re
from datetime import date
from typing import Any

from research_common import make_candidate_id


def clean_terms(values: list[Any]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        text = re.sub(r"\s+", " ", str(value or "")).strip()
        key = text.casefold()
        if text and key not in seen:
            seen.add(key)
            result.append(text)
    return result


def material_search_terms(material: dict, by_id: dict[str, dict]) -> list[str]:
    """Build precise terms without collapsing a grade into its parent family."""
    parent = by_id.get(str(material.get("parent_id") or ""), {})
    path = material.get("taxonomy_path") or []
    states = material.get("material_states") or []
    forms = material.get("product_forms") or []
    standards = material.get("standard_designations") or []
    values = [
        material.get("name_cn"),
        material.get("name_en"),
        material.get("abbreviation"),
        *(material.get("aliases") or []),
        *standards,
        " ".join(str(item) for item in path),
        f"{material.get('name_en', '')} {material.get('entity_type', 'material')}",
        f"{material.get('name_en', '')} {parent.get('name_en', '')}",
        *[f"{material.get('name_en', '')} {item}" for item in states[:3]],
        *[f"{material.get('name_en', '')} {item}" for item in forms[:3]],
    ]
    return clean_terms(values)


def source(
    *,
    title: str,
    publisher: str,
    url: str,
    authors: list[str] | None = None,
    year: str = "",
    doi: str = "",
    page: str = "",
    table: str = "",
) -> dict:
    return {
        "title": title,
        "publisher": publisher,
        "authors": authors or [],
        "year": str(year or ""),
        "doi": doi,
        "url": url,
        "page": page,
        "table": table,
        "accessed_at": date.today().isoformat(),
    }


CURATED_PROPERTY_SOURCES: dict[str, list[dict]] = {
    "stainless_steel": [
        {
            "field": "data_source",
            "value": "不锈钢家族的分类、物理与力学性能参考资料",
            "condition": "家族级参考；具体数值必须按钢种、牌号和产品状态另行核对",
            "engineering_data_type": "category_reference",
            "confidence": 0.96,
            "source": source(
                title="Mechanical and physical properties of stainless steel",
                publisher="worldstainless",
                year="2019",
                url="https://worldstainless.org/about-stainless/properties/mechanical-and-physical-properties/",
            ),
            "agent_notes": "仅补充正式行业组织来源，不把家族资料转换成单一牌号精确参数。",
        }
    ],
    "polyethylene": [
        {
            "field": "data_source",
            "value": "聚乙烯重复单元与聚合物链结构依据",
            "condition": "家族级结构参考，不代表特定密度等级或分子量分布",
            "engineering_data_type": "category_reference",
            "confidence": 0.94,
            "source": source(
                title="Polymer Materials for Photovoltaic Systems",
                publisher="National Bureau of Standards (NIST legacy publication)",
                year="1985",
                url="https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nbsir85-3197.pdf",
                page="5",
            ),
            "agent_notes": "作为程序化重复单元示意图的结构依据。",
        }
    ],
    "ti_tc4": [
        {
            "field": "melting_point",
            "value": "1630-1650",
            "unit": "℃",
            "range_min": 1630,
            "range_max": 1650,
            "condition": "TIMETAL 6-4 标准牌号；熔化区间",
            "temperature": "不适用",
            "material_state": "标准 Ti-6Al-4V；产品状态未指定，仅用于熔化区间",
            "test_standard": "",
            "engineering_data_type": "literature",
            "confidence": 0.93,
            "source": source(
                title="TIMETAL 6-4 Properties",
                publisher="Titanium Metals Corporation (TIMET)",
                url="https://www.timet.com/assets/local/documents/technicalmanuals/TIMETAL_6-4_Properties.pdf",
                page="6",
            ),
            "agent_notes": "牌号级官方技术手册候选；仅写入熔点字段，不将家族范围冒充其他状态参数。",
        }
    ],
    "carbon_fiber_epoxy": [
        {
            "field": "data_source",
            "value": "碳纤维增强环氧层合结构与纤维/基体组成参考",
            "condition": "材料体系级教学参考；纤维体积分数、铺层与树脂体系需按具体产品核对",
            "engineering_data_type": "literature",
            "confidence": 0.91,
            "source": source(
                title="Composite Overwrapped Pressure Vessel Life Prediction",
                publisher="NASA Technical Reports Server",
                year="2015",
                url="https://ntrs.nasa.gov/api/citations/20150012180/downloads/20150012180.pdf?attachment=true",
                page="1",
            ),
            "agent_notes": "作为纤维嵌入环氧基体及层合结构示意图依据，不生成实验图。",
        }
    ],
}


CURATED_MICRO_LINKS: dict[str, list[dict]] = {
    "ti_tc4": [
        {
            "material_grade": "Ti-6Al-4V",
            "material_state": "自由锻造 α+β 双相 Ti-6Al-4V",
            "heat_treatment": "论文所述原始工件状态；接受前须核对全文",
            "microscope_type": "SEM / EDS",
            "magnification": "见原文 Figure 1",
            "scale_bar": "见原图",
            "etchant": "5 mL HNO3 + 3 mL HF + 100 mL H2O，室温 10 s",
            "orientation": "论文未在摘要页明确，接受前核对",
            "caption": "Ti-6Al-4V 原始显微组织及能谱信息",
            "figure_number": "Figure 1",
            "paper_title": "Quantification of Microstructural Features and Prediction of Mechanical Properties of a Dual-Phase Ti-6Al-4V Alloy",
            "authors": ["Z. Zhang et al."],
            "year": "2017",
            "doi": "10.3390/ma10070747",
            "sourceUrl": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5509046/",
            "license": "CC BY",
            "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
            "confidence": 0.78,
            "agent_notes": "保守地仅保存论文链接和图号；未下载或裁剪论文插图。",
        }
    ]
}


def property_candidates_for(material: dict) -> list[dict]:
    material_id = str(material.get("id") or "")
    entity_type = str(material.get("entity_type") or "material")
    output: list[dict] = []
    for template in CURATED_PROPERTY_SOURCES.get(material_id, []):
        item = {
            "candidate_id": make_candidate_id(
                "property",
                material_id,
                template.get("field", ""),
                (template.get("source") or {}).get("url", ""),
                template.get("condition", ""),
            ),
            "material_id": material_id,
            "material_name": material.get("name_cn", material_id),
            "entity_type": entity_type,
            "taxonomy_path": material.get("taxonomy_path") or [],
            "field": template.get("field", ""),
            "value": template.get("value", ""),
            "unit": template.get("unit", ""),
            "range_min": template.get("range_min"),
            "range_max": template.get("range_max"),
            "condition": template.get("condition", ""),
            "temperature": template.get("temperature", ""),
            "material_state": template.get("material_state", ""),
            "test_standard": template.get("test_standard", ""),
            "engineering_data_type": template.get("engineering_data_type", "literature"),
            "source": template.get("source") or {},
            "confidence": template.get("confidence", 0.0),
            "status": "pending_review",
            "agent_notes": template.get("agent_notes", ""),
        }
        if entity_type in {"family", "subfamily"}:
            item["engineering_data_type"] = "category_reference"
            caveat = "具体牌号和状态可能存在明显差异。"
            if caveat not in item["condition"]:
                item["condition"] = f"{item['condition']}；{caveat}".strip("；")
        output.append(item)
    return output


def micro_link_candidates_for(material: dict) -> list[dict]:
    material_id = str(material.get("id") or "")
    output: list[dict] = []
    for template in CURATED_MICRO_LINKS.get(material_id, []):
        candidate_id = make_candidate_id(
            "micro-link", material_id, template.get("sourceUrl", ""), template.get("figure_number", "")
        )
        output.append(
            {
                "candidate_id": candidate_id,
                "material_id": material_id,
                "material_name": material.get("name_cn", material_id),
                "entity_type": material.get("entity_type", "material"),
                "image_type": "micro",
                "src": "",
                "link_only": True,
                "origin": "web_source",
                "source": template.get("paper_title", ""),
                "author": ", ".join(template.get("authors") or []),
                "accessed_at": date.today().isoformat(),
                "status": "pending_review",
                **template,
            }
        )
    return output

