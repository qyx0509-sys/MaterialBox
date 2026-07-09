// MaterialBox material taxonomy and data.
// Main source of truth: edit this file, then regenerate materials.json from window.MATERIALS_DATA.
// The page reads materials.js directly so local file:// usage does not depend on fetch().

window.MATERIAL_CATEGORIES = [
  {
    "name": "金属材料",
    "description": "以金属键结合为主，强调强度、塑性、导电导热和工程结构应用。",
    "subcategories": [
      {
        "name": "黑色金属材料",
        "examples": [
          "钢",
          "铸铁",
          "不锈钢",
          "工具钢",
          "高速钢"
        ]
      },
      {
        "name": "有色金属材料",
        "examples": [
          "铝合金",
          "镁合金",
          "钛合金",
          "铜合金",
          "镍合金"
        ]
      },
      {
        "name": "高温合金",
        "examples": [
          "镍基高温合金",
          "钴基高温合金",
          "铁基高温合金"
        ]
      }
    ]
  },
  {
    "name": "高分子材料",
    "description": "以长链分子结构为基础，覆盖通用塑料、工程塑料、橡胶和树脂体系。",
    "subcategories": [
      {
        "name": "通用塑料",
        "examples": [
          "PE",
          "PP",
          "PVC",
          "PS",
          "ABS"
        ]
      },
      {
        "name": "工程塑料",
        "examples": [
          "PA",
          "PC",
          "POM",
          "PET",
          "PBT"
        ]
      },
      {
        "name": "特种工程塑料",
        "examples": [
          "PEEK",
          "PI",
          "PPS",
          "PTFE",
          "LCP"
        ]
      },
      {
        "name": "橡胶",
        "examples": [
          "天然橡胶",
          "丁苯橡胶",
          "硅橡胶",
          "氟橡胶"
        ]
      },
      {
        "name": "树脂",
        "examples": [
          "环氧树脂",
          "酚醛树脂",
          "不饱和聚酯树脂",
          "聚氨酯"
        ]
      }
    ]
  },
  {
    "name": "无机非金属材料",
    "description": "包括陶瓷、玻璃、水泥和耐火材料，突出高硬度、耐热、绝缘和脆性特征。",
    "subcategories": [
      {
        "name": "陶瓷材料",
        "examples": [
          "氧化铝陶瓷",
          "氧化锆陶瓷",
          "碳化硅陶瓷",
          "氮化硅陶瓷"
        ]
      },
      {
        "name": "玻璃材料",
        "examples": [
          "普通玻璃",
          "石英玻璃",
          "硼硅玻璃",
          "钢化玻璃"
        ]
      },
      {
        "name": "水泥与建筑材料",
        "examples": [
          "硅酸盐水泥",
          "混凝土",
          "石膏",
          "耐火材料"
        ]
      }
    ]
  },
  {
    "name": "复合材料",
    "description": "由增强体和基体协同构成，追求单一材料难以获得的综合性能。",
    "subcategories": [
      {
        "name": "树脂基复合材料",
        "examples": [
          "碳纤维/环氧复合材料",
          "玻璃纤维复合材料",
          "芳纶纤维复合材料"
        ]
      },
      {
        "name": "金属基复合材料",
        "examples": [
          "铝基复合材料",
          "镁基复合材料",
          "钛基复合材料"
        ]
      },
      {
        "name": "陶瓷基复合材料",
        "examples": [
          "碳化硅纤维增强陶瓷基复合材料",
          "碳/碳复合材料"
        ]
      },
      {
        "name": "层合板与夹层材料",
        "examples": [
          "蜂窝夹层板",
          "泡沫夹层板",
          "纤维层合板"
        ]
      }
    ]
  },
  {
    "name": "功能材料",
    "description": "以电、磁、光、热、形变响应等功能为核心，服务电子信息与智能器件。",
    "subcategories": [
      {
        "name": "半导体材料",
        "examples": [
          "硅",
          "锗",
          "砷化镓",
          "氮化镓",
          "碳化硅"
        ]
      },
      {
        "name": "磁性材料",
        "examples": [
          "铁氧体",
          "钕铁硼",
          "硅钢",
          "坡莫合金"
        ]
      },
      {
        "name": "光电材料",
        "examples": [
          "ITO",
          "OLED材料",
          "量子点材料",
          "液晶材料"
        ]
      },
      {
        "name": "智能材料",
        "examples": [
          "形状记忆合金",
          "压电陶瓷",
          "热致变色材料",
          "自修复材料"
        ]
      }
    ]
  },
  {
    "name": "新能源材料",
    "description": "面向电化学储能、氢能、光伏和超级电容等能源转换与存储场景。",
    "subcategories": [
      {
        "name": "锂电池材料",
        "examples": [
          "磷酸铁锂",
          "三元正极材料",
          "石墨负极",
          "硅碳负极",
          "电解液",
          "隔膜"
        ]
      },
      {
        "name": "氢能材料",
        "examples": [
          "储氢合金",
          "质子交换膜",
          "催化剂材料"
        ]
      },
      {
        "name": "光伏材料",
        "examples": [
          "晶硅",
          "钙钛矿材料",
          "CdTe",
          "CIGS"
        ]
      },
      {
        "name": "超级电容材料",
        "examples": [
          "活性炭",
          "石墨烯",
          "碳纳米管",
          "赝电容材料"
        ]
      }
    ]
  },
  {
    "name": "生物医用材料",
    "description": "服务植入、修复、组织工程和可降解医疗器械，强调生物相容性。",
    "subcategories": [
      {
        "name": "金属生物材料",
        "examples": [
          "医用钛合金",
          "不锈钢",
          "钴铬合金"
        ]
      },
      {
        "name": "高分子生物材料",
        "examples": [
          "PEEK",
          "PLA",
          "PGA",
          "PLGA",
          "医用硅橡胶"
        ]
      },
      {
        "name": "生物陶瓷",
        "examples": [
          "羟基磷灰石",
          "生物玻璃",
          "氧化锆陶瓷"
        ]
      },
      {
        "name": "可降解材料",
        "examples": [
          "PLA",
          "PCL",
          "PLGA",
          "镁合金"
        ]
      }
    ]
  },
  {
    "name": "纳米材料",
    "description": "至少一个维度处于纳米尺度，具有尺寸效应、界面效应和高比表面积。",
    "subcategories": [
      {
        "name": "碳基纳米材料",
        "examples": [
          "石墨烯",
          "碳纳米管",
          "富勒烯"
        ]
      },
      {
        "name": "纳米金属材料",
        "examples": [
          "纳米银",
          "纳米铜",
          "纳米金"
        ]
      },
      {
        "name": "纳米氧化物",
        "examples": [
          "纳米二氧化钛",
          "纳米氧化锌",
          "纳米氧化铝"
        ]
      },
      {
        "name": "纳米复合材料",
        "examples": [
          "聚合物纳米复合材料",
          "纳米陶瓷复合材料"
        ]
      }
    ]
  },
  {
    "name": "传统与天然材料",
    "description": "来自植物、动物、矿物或传统工艺的材料，连接日常生活、建筑装饰和基础制造。",
    "subcategories": [
      {
        "name": "植物基天然材料",
        "examples": [
          "木材",
          "竹材",
          "纸张",
          "棉",
          "麻"
        ]
      },
      {
        "name": "动物基天然材料",
        "examples": [
          "羊毛",
          "皮革"
        ]
      },
      {
        "name": "天然矿物与土质材料",
        "examples": [
          "天然石材",
          "陶土"
        ]
      }
    ]
  },
  {
    "name": "建筑与装饰材料",
    "description": "面向建筑围护、室内装饰、防水保温和基础施工的工程材料集合。",
    "subcategories": [
      {
        "name": "木质板材",
        "examples": [
          "木材",
          "胶合板",
          "中密度纤维板 MDF"
        ]
      },
      {
        "name": "砌筑与板材",
        "examples": [
          "石材",
          "砖",
          "石膏板"
        ]
      },
      {
        "name": "防水与路面材料",
        "examples": [
          "沥青",
          "防水卷材"
        ]
      },
      {
        "name": "表面装饰材料",
        "examples": [
          "涂料"
        ]
      }
    ]
  },
  {
    "name": "纺织与日用品材料",
    "description": "覆盖衣物、家居、包装和日用品中的纤维、皮革与纸基材料。",
    "subcategories": [
      {
        "name": "天然纤维",
        "examples": [
          "棉纤维",
          "麻纤维",
          "羊毛"
        ]
      },
      {
        "name": "合成纤维",
        "examples": [
          "涤纶",
          "尼龙纤维"
        ]
      },
      {
        "name": "日用品基材",
        "examples": [
          "皮革",
          "纸张"
        ]
      }
    ]
  }
];

window.MATERIALS_DATA = [
  {
    "id": "steel",
    "name_cn": "钢",
    "name_en": "Steel",
    "abbreviation": "",
    "category_1": "金属材料",
    "category_2": "黑色金属材料",
    "category_3": "铁碳合金",
    "description": "钢是以铁和碳为主的工程合金，强度、塑性和加工性平衡，是最常用的结构材料之一。",
    "composition_or_structure": "铁基体中含少量碳及锰、硅等元素，可通过热处理调控组织。",
    "key_properties": [
      "高强度",
      "可焊接",
      "可热处理"
    ],
    "mechanical_properties": [
      "强韧性可调",
      "承载能力好"
    ],
    "thermal_properties": [
      "耐热性中等",
      "热处理响应明显"
    ],
    "electrical_properties": [
      "导电性一般"
    ],
    "advantages": [
      "成本低",
      "规格体系成熟"
    ],
    "limitations": [
      "易腐蚀",
      "密度较高"
    ],
    "applications": [
      "建筑工程",
      "机械制造",
      "汽车轻量化"
    ],
    "processing_methods": [
      "轧制",
      "锻造",
      "焊接",
      "热处理"
    ],
    "typical_products": [
      "钢梁",
      "轴类零件",
      "车身结构件"
    ],
    "related_materials": [
      "铸铁",
      "不锈钢",
      "工具钢"
    ],
    "tags": [
      "结构材料",
      "高强度",
      "低成本"
    ],
    "difficulty_level": "基础",
    "notes": "钢的性能跨度很大，学习时应区分碳钢、合金钢和热处理状态。",
    "aliases": [
      "steel",
      "钢材",
      "碳钢",
      "钢铁",
      "金属",
      "metal"
    ],
    "images": {
      "macro": [
        {
          "src": "assets/materials/steel/macro.jpg",
          "alt": "钢材板材、型材或断口的宏观形态宏观照片",
          "caption": "钢材板材、型材或断口的宏观形态"
        }
      ],
      "micro": [
        {
          "src": "assets/materials/steel/micro.jpg",
          "alt": "钢的铁素体、珠光体或马氏体显微组织微观结构照片",
          "caption": "钢的铁素体、珠光体或马氏体显微组织"
        }
      ]
    }
  },
  {
    "id": "cast_iron",
    "name_cn": "铸铁",
    "name_en": "Cast Iron",
    "abbreviation": "",
    "category_1": "金属材料",
    "category_2": "黑色金属材料",
    "category_3": "高碳铁碳合金",
    "description": "铸铁含碳量高、流动性好，适合制造复杂形状的承压和耐磨部件。",
    "composition_or_structure": "铁碳硅体系中碳多以石墨或渗碳体形式存在。",
    "key_properties": [
      "铸造性好",
      "减振",
      "耐磨"
    ],
    "mechanical_properties": [
      "抗压强度高",
      "塑性较低"
    ],
    "thermal_properties": [
      "导热性较好",
      "热稳定性中等"
    ],
    "electrical_properties": [
      "导电性一般"
    ],
    "advantages": [
      "成本低",
      "减振性能好"
    ],
    "limitations": [
      "韧性不足",
      "焊接较困难"
    ],
    "applications": [
      "机械制造",
      "建筑工程"
    ],
    "processing_methods": [
      "砂型铸造",
      "机加工",
      "热处理"
    ],
    "typical_products": [
      "机床床身",
      "发动机缸体",
      "管件"
    ],
    "related_materials": [
      "钢",
      "球墨铸铁",
      "灰铸铁"
    ],
    "tags": [
      "铸造",
      "耐磨",
      "减振"
    ],
    "difficulty_level": "基础",
    "notes": "球墨铸铁通过球化石墨显著改善韧性。",
    "aliases": [
      "金属",
      "metal"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "stainless_steel",
    "name_cn": "不锈钢",
    "name_en": "Stainless Steel",
    "abbreviation": "",
    "category_1": "金属材料",
    "category_2": "黑色金属材料",
    "category_3": "耐蚀铁基合金",
    "description": "不锈钢依靠铬形成钝化膜获得耐腐蚀能力，兼具结构和装饰用途。",
    "composition_or_structure": "铁基合金中通常含铬大于约10.5%，可加入镍、钼等元素。",
    "key_properties": [
      "耐腐蚀",
      "易清洁",
      "强度高"
    ],
    "mechanical_properties": [
      "韧性好",
      "加工硬化明显"
    ],
    "thermal_properties": [
      "耐热性较好",
      "热膨胀需关注"
    ],
    "electrical_properties": [
      "导电性一般"
    ],
    "advantages": [
      "耐蚀性好",
      "外观稳定"
    ],
    "limitations": [
      "成本高于碳钢",
      "导热性较低"
    ],
    "applications": [
      "医疗器械",
      "化工设备",
      "建筑工程"
    ],
    "processing_methods": [
      "轧制",
      "焊接",
      "抛光",
      "钝化"
    ],
    "typical_products": [
      "管道",
      "厨具",
      "外科器械"
    ],
    "related_materials": [
      "钢",
      "钴铬合金",
      "镍合金"
    ],
    "tags": [
      "耐腐蚀",
      "医用",
      "结构材料"
    ],
    "difficulty_level": "基础",
    "notes": "奥氏体、铁素体和马氏体不锈钢的组织与应用差异明显。",
    "aliases": [
      "金属",
      "metal"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "tool_steel",
    "name_cn": "工具钢",
    "name_en": "Tool Steel",
    "abbreviation": "",
    "category_1": "金属材料",
    "category_2": "黑色金属材料",
    "category_3": "高硬度合金钢",
    "description": "工具钢用于模具、量具和切削工具，重点关注硬度、耐磨性和热处理稳定性。",
    "composition_or_structure": "铁碳合金中加入铬、钼、钨、钒等碳化物形成元素。",
    "key_properties": [
      "高硬度",
      "耐磨",
      "可淬火"
    ],
    "mechanical_properties": [
      "耐磨损",
      "抗压强度高"
    ],
    "thermal_properties": [
      "热处理稳定",
      "部分牌号耐热疲劳"
    ],
    "electrical_properties": [
      "导电性一般"
    ],
    "advantages": [
      "寿命长",
      "尺寸稳定性好"
    ],
    "limitations": [
      "韧性需权衡",
      "热处理工艺敏感"
    ],
    "applications": [
      "模具",
      "机械制造"
    ],
    "processing_methods": [
      "锻造",
      "退火",
      "淬火",
      "回火"
    ],
    "typical_products": [
      "冲模",
      "量具",
      "冷作模具"
    ],
    "related_materials": [
      "高速钢",
      "钢",
      "硬质合金"
    ],
    "tags": [
      "耐磨",
      "高硬度",
      "模具"
    ],
    "difficulty_level": "进阶",
    "notes": "冷作、热作和塑料模具钢的合金设计不同。",
    "aliases": [
      "金属",
      "metal"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "high_speed_steel",
    "name_cn": "高速钢",
    "name_en": "High Speed Steel",
    "abbreviation": "HSS",
    "category_1": "金属材料",
    "category_2": "黑色金属材料",
    "category_3": "高合金工具钢",
    "description": "高速钢在高温下仍能保持硬度，适合切削刀具和耐磨工具。",
    "composition_or_structure": "含钨、钼、铬、钒等元素，形成稳定碳化物。",
    "key_properties": [
      "红硬性",
      "耐磨",
      "高硬度"
    ],
    "mechanical_properties": [
      "刃口保持性好",
      "抗压强度高"
    ],
    "thermal_properties": [
      "高温硬度保持好",
      "回火稳定性好"
    ],
    "electrical_properties": [
      "导电性一般"
    ],
    "advantages": [
      "切削性能稳定",
      "可重磨"
    ],
    "limitations": [
      "密度较高",
      "成本高于普通工具钢"
    ],
    "applications": [
      "切削加工",
      "机械制造"
    ],
    "processing_methods": [
      "粉末冶金",
      "锻造",
      "热处理",
      "磨削"
    ],
    "typical_products": [
      "钻头",
      "铣刀",
      "拉刀"
    ],
    "related_materials": [
      "工具钢",
      "硬质合金",
      "陶瓷刀具"
    ],
    "tags": [
      "耐磨",
      "耐高温",
      "刀具"
    ],
    "difficulty_level": "进阶",
    "notes": "粉末高速钢可改善碳化物偏析和韧性。",
    "aliases": [
      "金属",
      "metal"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "aluminum_alloy",
    "name_cn": "铝合金",
    "name_en": "Aluminum Alloy",
    "abbreviation": "",
    "category_1": "金属材料",
    "category_2": "有色金属材料",
    "category_3": "轻质铝基合金",
    "description": "铝合金密度低、易成形、耐腐蚀，是轻量化结构中的核心金属材料。",
    "composition_or_structure": "以铝为基体，加入镁、硅、铜、锌等元素形成可强化合金。",
    "key_properties": [
      "轻量化",
      "耐腐蚀",
      "导热"
    ],
    "mechanical_properties": [
      "比强度较高",
      "塑性好"
    ],
    "thermal_properties": [
      "导热性好",
      "高温强度有限"
    ],
    "electrical_properties": [
      "导电性较好"
    ],
    "advantages": [
      "密度低",
      "可回收",
      "加工性好"
    ],
    "limitations": [
      "弹性模量低",
      "耐磨性一般"
    ],
    "applications": [
      "航空航天",
      "汽车轻量化",
      "电子封装"
    ],
    "processing_methods": [
      "挤压",
      "轧制",
      "压铸",
      "焊接"
    ],
    "typical_products": [
      "车身板",
      "散热器",
      "飞机蒙皮"
    ],
    "related_materials": [
      "镁合金",
      "钛合金",
      "铝基复合材料"
    ],
    "tags": [
      "轻量化",
      "导热",
      "可回收"
    ],
    "difficulty_level": "基础",
    "notes": "2xxx、6xxx、7xxx系列铝合金在强度、焊接和耐蚀性上差异明显。",
    "aliases": [
      "aluminium alloy",
      "aluminum",
      "铝",
      "铝材",
      "铝型材",
      "金属",
      "metal"
    ],
    "images": {
      "macro": [
        {
          "src": "assets/materials/aluminum_alloy/macro.jpg",
          "alt": "铝合金型材、板材和加工表面宏观照片",
          "caption": "铝合金型材、板材和加工表面"
        }
      ],
      "micro": [
        {
          "src": "assets/materials/aluminum_alloy/micro.jpg",
          "alt": "铝合金晶粒和第二相颗粒显微组织微观结构照片",
          "caption": "铝合金晶粒和第二相颗粒显微组织"
        }
      ]
    }
  },
  {
    "id": "magnesium_alloy",
    "name_cn": "镁合金",
    "name_en": "Magnesium Alloy",
    "abbreviation": "",
    "category_1": "金属材料",
    "category_2": "有色金属材料",
    "category_3": "超轻镁基合金",
    "description": "镁合金是最轻的工程金属之一，适合减重、减振和便携电子结构件。",
    "composition_or_structure": "以镁为基体，常加入铝、锌、锰和稀土元素。",
    "key_properties": [
      "轻量化",
      "减振",
      "易切削"
    ],
    "mechanical_properties": [
      "比强度好",
      "阻尼性能好"
    ],
    "thermal_properties": [
      "耐热性依牌号变化",
      "导热性较好"
    ],
    "electrical_properties": [
      "电磁屏蔽较好"
    ],
    "advantages": [
      "密度很低",
      "加工效率高"
    ],
    "limitations": [
      "耐腐蚀性较弱",
      "熔炼需防燃"
    ],
    "applications": [
      "汽车轻量化",
      "电子外壳",
      "航空航天"
    ],
    "processing_methods": [
      "压铸",
      "挤压",
      "机加工",
      "表面处理"
    ],
    "typical_products": [
      "方向盘骨架",
      "笔记本外壳",
      "支架"
    ],
    "related_materials": [
      "铝合金",
      "钛合金",
      "镁基复合材料"
    ],
    "tags": [
      "轻量化",
      "减振",
      "结构材料"
    ],
    "difficulty_level": "基础",
    "notes": "表面防护和合金化是提升镁合金耐蚀性的关键。",
    "aliases": [
      "金属",
      "metal"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "titanium_alloy",
    "name_cn": "钛合金",
    "name_en": "Titanium Alloy",
    "abbreviation": "",
    "category_1": "金属材料",
    "category_2": "有色金属材料",
    "category_3": "高比强耐蚀合金",
    "description": "钛合金比强度高、耐腐蚀且生物相容性好，常用于航空航天和医疗植入。",
    "composition_or_structure": "钛基体中加入铝、钒、钼等元素，可形成α、β或α+β组织。",
    "key_properties": [
      "高比强度",
      "耐腐蚀",
      "医用"
    ],
    "mechanical_properties": [
      "疲劳性能好",
      "强度密度比高"
    ],
    "thermal_properties": [
      "耐热性好",
      "导热性较低"
    ],
    "electrical_properties": [
      "导电性一般"
    ],
    "advantages": [
      "轻质高强",
      "生物相容性好"
    ],
    "limitations": [
      "成本高",
      "切削加工困难"
    ],
    "applications": [
      "航空航天",
      "医疗植入",
      "海洋工程"
    ],
    "processing_methods": [
      "锻造",
      "轧制",
      "焊接",
      "3D打印"
    ],
    "typical_products": [
      "发动机叶片",
      "骨科植入物",
      "紧固件"
    ],
    "related_materials": [
      "铝合金",
      "镍基高温合金",
      "医用钛合金"
    ],
    "tags": [
      "轻量化",
      "耐腐蚀",
      "航空航天",
      "医用"
    ],
    "difficulty_level": "进阶",
    "notes": "Ti-6Al-4V 是最典型的α+β钛合金。",
    "aliases": [
      "金属",
      "metal"
    ],
    "images": {
      "macro": [
        {
          "src": "assets/materials/titanium_alloy/macro.jpg",
          "alt": "钛合金宏观照片",
          "caption": "钛合金锻件、打印件或植入件外观"
        }
      ],
      "micro": [
        {
          "src": "assets/materials/titanium_alloy/micro.jpg",
          "alt": "钛合金显微组织照片",
          "caption": "钛合金 α/β 相组织与晶粒结构"
        }
      ]
    }
  },
  {
    "id": "copper_alloy",
    "name_cn": "铜合金",
    "name_en": "Copper Alloy",
    "abbreviation": "",
    "category_1": "金属材料",
    "category_2": "有色金属材料",
    "category_3": "导电导热铜基合金",
    "description": "铜合金兼具导电、导热、耐蚀和良好加工性，广泛用于电气和换热部件。",
    "composition_or_structure": "以铜为基体，加入锌、锡、镍、铍等元素调节性能。",
    "key_properties": [
      "导电",
      "导热",
      "耐腐蚀"
    ],
    "mechanical_properties": [
      "延展性好",
      "耐磨性可提升"
    ],
    "thermal_properties": [
      "导热性优异",
      "高温强度有限"
    ],
    "electrical_properties": [
      "导电性优异"
    ],
    "advantages": [
      "加工性好",
      "连接可靠"
    ],
    "limitations": [
      "密度较高",
      "资源成本较高"
    ],
    "applications": [
      "电子封装",
      "电气连接",
      "热管理"
    ],
    "processing_methods": [
      "轧制",
      "拉拔",
      "钎焊",
      "机加工"
    ],
    "typical_products": [
      "端子",
      "换热管",
      "连接器"
    ],
    "related_materials": [
      "铝合金",
      "镍合金",
      "ITO"
    ],
    "tags": [
      "导电",
      "导热",
      "电子"
    ],
    "difficulty_level": "基础",
    "notes": "黄铜、青铜和白铜的合金元素与应用重点不同。",
    "aliases": [
      "金属",
      "metal"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "nickel_alloy",
    "name_cn": "镍合金",
    "name_en": "Nickel Alloy",
    "abbreviation": "",
    "category_1": "金属材料",
    "category_2": "有色金属材料",
    "category_3": "耐蚀镍基合金",
    "description": "镍合金在腐蚀环境和中高温环境中稳定，常用于化工、能源和海洋设备。",
    "composition_or_structure": "以镍为基体，可加入铬、钼、铁、铜等元素。",
    "key_properties": [
      "耐腐蚀",
      "耐高温",
      "稳定性好"
    ],
    "mechanical_properties": [
      "强度保持好",
      "韧性较好"
    ],
    "thermal_properties": [
      "热稳定性好",
      "抗氧化性好"
    ],
    "electrical_properties": [
      "导电性一般"
    ],
    "advantages": [
      "耐蚀范围广",
      "可靠性高"
    ],
    "limitations": [
      "价格高",
      "加工硬化明显"
    ],
    "applications": [
      "化工设备",
      "能源装备",
      "航空航天"
    ],
    "processing_methods": [
      "锻造",
      "轧制",
      "焊接",
      "热处理"
    ],
    "typical_products": [
      "换热器",
      "阀门",
      "耐蚀管道"
    ],
    "related_materials": [
      "不锈钢",
      "镍基高温合金",
      "钴基高温合金"
    ],
    "tags": [
      "耐腐蚀",
      "耐高温",
      "能源"
    ],
    "difficulty_level": "进阶",
    "notes": "镍铬钼体系常用于强腐蚀介质。",
    "aliases": [
      "金属",
      "metal"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "nickel_superalloy",
    "name_cn": "镍基高温合金",
    "name_en": "Nickel-based Superalloy",
    "abbreviation": "",
    "category_1": "金属材料",
    "category_2": "高温合金",
    "category_3": "沉淀强化高温合金",
    "description": "镍基高温合金在高温下保持强度和抗氧化能力，是航空发动机热端关键材料。",
    "composition_or_structure": "以γ镍固溶体和γ'沉淀相为主要强化基础。",
    "key_properties": [
      "耐高温",
      "抗蠕变",
      "抗氧化"
    ],
    "mechanical_properties": [
      "高温强度高",
      "蠕变抗力好"
    ],
    "thermal_properties": [
      "长期热稳定",
      "抗热腐蚀"
    ],
    "electrical_properties": [
      "导电性一般"
    ],
    "advantages": [
      "高温可靠",
      "服役经验丰富"
    ],
    "limitations": [
      "密度高",
      "成本高",
      "加工复杂"
    ],
    "applications": [
      "航空航天",
      "燃气轮机",
      "能源装备"
    ],
    "processing_methods": [
      "精密铸造",
      "定向凝固",
      "粉末冶金",
      "热处理"
    ],
    "typical_products": [
      "涡轮叶片",
      "燃烧室",
      "涡轮盘"
    ],
    "related_materials": [
      "钴基高温合金",
      "钛合金",
      "陶瓷基复合材料"
    ],
    "tags": [
      "耐高温",
      "航空航天",
      "高性能"
    ],
    "difficulty_level": "进阶",
    "notes": "单晶高温合金通过控制晶界提升蠕变性能。",
    "aliases": [
      "金属",
      "metal"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "cobalt_superalloy",
    "name_cn": "钴基高温合金",
    "name_en": "Cobalt-based Superalloy",
    "abbreviation": "",
    "category_1": "金属材料",
    "category_2": "高温合金",
    "category_3": "耐热耐蚀钴基合金",
    "description": "钴基高温合金抗热腐蚀和耐磨性好，常用于高温磨损和腐蚀耦合环境。",
    "composition_or_structure": "以钴为基体，常含铬、钨、镍和碳化物强化相。",
    "key_properties": [
      "耐高温",
      "耐磨",
      "抗热腐蚀"
    ],
    "mechanical_properties": [
      "热强性好",
      "耐磨粒磨损"
    ],
    "thermal_properties": [
      "抗氧化较好",
      "高温稳定"
    ],
    "electrical_properties": [
      "导电性一般"
    ],
    "advantages": [
      "热腐蚀抗力好",
      "耐磨性好"
    ],
    "limitations": [
      "成本高",
      "密度高"
    ],
    "applications": [
      "航空航天",
      "能源装备",
      "医疗植入"
    ],
    "processing_methods": [
      "铸造",
      "堆焊",
      "热处理",
      "机加工"
    ],
    "typical_products": [
      "导向叶片",
      "阀座",
      "人工关节部件"
    ],
    "related_materials": [
      "镍基高温合金",
      "钴铬合金",
      "工具钢"
    ],
    "tags": [
      "耐高温",
      "耐磨",
      "高性能"
    ],
    "difficulty_level": "进阶",
    "notes": "Stellite 类合金是典型的耐磨钴基合金。",
    "aliases": [
      "金属",
      "metal"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "polyethylene",
    "name_cn": "聚乙烯",
    "name_en": "Polyethylene",
    "abbreviation": "PE",
    "category_1": "高分子材料",
    "category_2": "通用塑料",
    "category_3": "聚烯烃",
    "description": "聚乙烯柔韧、耐化学腐蚀、绝缘性好，是包装、管材和薄膜中最常见的塑料之一。",
    "composition_or_structure": "由乙烯单体聚合形成，分为LDPE、HDPE等不同结晶度体系。",
    "key_properties": [
      "耐化学腐蚀",
      "绝缘",
      "柔韧"
    ],
    "mechanical_properties": [
      "韧性好",
      "刚度随密度变化"
    ],
    "thermal_properties": [
      "耐热性有限",
      "低温韧性好"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "成本低",
      "易加工"
    ],
    "limitations": [
      "耐候性需改性",
      "表面能低不易粘接"
    ],
    "applications": [
      "包装",
      "建筑工程",
      "电线电缆"
    ],
    "processing_methods": [
      "挤出",
      "注塑",
      "吹塑",
      "热封"
    ],
    "typical_products": [
      "薄膜",
      "管材",
      "容器"
    ],
    "related_materials": [
      "PP",
      "PVC",
      "PTFE"
    ],
    "tags": [
      "塑料",
      "绝缘",
      "低成本"
    ],
    "difficulty_level": "基础",
    "notes": "HDPE更硬，LDPE更柔软。",
    "aliases": [
      "塑料",
      "PE塑料",
      "聚乙烯塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "polypropylene",
    "name_cn": "聚丙烯",
    "name_en": "Polypropylene",
    "abbreviation": "PP",
    "category_1": "高分子材料",
    "category_2": "通用塑料",
    "category_3": "聚烯烃",
    "description": "聚丙烯密度低、耐疲劳、耐化学性好，常用于汽车、家电和包装制品。",
    "composition_or_structure": "由丙烯单体聚合形成，等规结构有较高结晶度。",
    "key_properties": [
      "轻量化",
      "耐疲劳",
      "耐化学腐蚀"
    ],
    "mechanical_properties": [
      "刚度较好",
      "铰链疲劳性好"
    ],
    "thermal_properties": [
      "耐热性优于PE",
      "低温韧性一般"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "密度低",
      "性价比高"
    ],
    "limitations": [
      "易老化",
      "耐寒性不足"
    ],
    "applications": [
      "汽车轻量化",
      "包装",
      "家电"
    ],
    "processing_methods": [
      "注塑",
      "挤出",
      "纺丝",
      "吹塑"
    ],
    "typical_products": [
      "保险杠",
      "食品盒",
      "纤维"
    ],
    "related_materials": [
      "PE",
      "ABS",
      "PBT"
    ],
    "tags": [
      "塑料",
      "轻量化",
      "低成本"
    ],
    "difficulty_level": "基础",
    "notes": "玻纤增强PP常用于汽车结构件。",
    "aliases": [
      "塑料",
      "PP塑料",
      "聚丙烯塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "polyvinyl_chloride",
    "name_cn": "聚氯乙烯",
    "name_en": "Polyvinyl Chloride",
    "abbreviation": "PVC",
    "category_1": "高分子材料",
    "category_2": "通用塑料",
    "category_3": "含氯热塑性塑料",
    "description": "聚氯乙烯阻燃、耐化学腐蚀且价格低，广泛用于管材、型材和电缆护套。",
    "composition_or_structure": "由氯乙烯聚合形成，可通过增塑剂制成软质或硬质材料。",
    "key_properties": [
      "阻燃",
      "耐腐蚀",
      "绝缘"
    ],
    "mechanical_properties": [
      "硬质PVC刚性好",
      "软质PVC柔韧"
    ],
    "thermal_properties": [
      "热稳定性需助剂",
      "长期耐热一般"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "成本低",
      "阻燃性好"
    ],
    "limitations": [
      "热加工窗口窄",
      "环保争议较多"
    ],
    "applications": [
      "建筑工程",
      "电线电缆",
      "包装"
    ],
    "processing_methods": [
      "挤出",
      "注塑",
      "压延",
      "涂覆"
    ],
    "typical_products": [
      "管材",
      "门窗型材",
      "电缆护套"
    ],
    "related_materials": [
      "PE",
      "PP",
      "ABS"
    ],
    "tags": [
      "阻燃",
      "绝缘",
      "建筑"
    ],
    "difficulty_level": "基础",
    "notes": "PVC配方体系对加工和使用性能影响很大。",
    "aliases": [
      "塑料",
      "PVC塑料",
      "PVC管",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "polystyrene",
    "name_cn": "聚苯乙烯",
    "name_en": "Polystyrene",
    "abbreviation": "PS",
    "category_1": "高分子材料",
    "category_2": "通用塑料",
    "category_3": "苯乙烯类塑料",
    "description": "聚苯乙烯透明、易成型、刚性好，常用于包装、日用品和泡沫保温材料。",
    "composition_or_structure": "由苯乙烯单体聚合形成，可发泡形成EPS。",
    "key_properties": [
      "透明",
      "刚性好",
      "易成型"
    ],
    "mechanical_properties": [
      "硬而脆",
      "抗冲击一般"
    ],
    "thermal_properties": [
      "耐热性一般",
      "尺寸稳定性较好"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "成型容易",
      "价格低"
    ],
    "limitations": [
      "韧性差",
      "耐溶剂性差"
    ],
    "applications": [
      "包装",
      "建筑工程",
      "家电"
    ],
    "processing_methods": [
      "注塑",
      "挤出",
      "发泡"
    ],
    "typical_products": [
      "透明盒",
      "泡沫板",
      "仪表外壳"
    ],
    "related_materials": [
      "ABS",
      "PC",
      "PVC"
    ],
    "tags": [
      "透明",
      "绝缘",
      "低成本"
    ],
    "difficulty_level": "基础",
    "notes": "HIPS通过橡胶增韧提升抗冲击能力。",
    "aliases": [
      "塑料",
      "PS塑料",
      "泡沫塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "abs",
    "name_cn": "丙烯腈-丁二烯-苯乙烯",
    "name_en": "Acrylonitrile Butadiene Styrene",
    "abbreviation": "ABS",
    "category_1": "高分子材料",
    "category_2": "通用塑料",
    "category_3": "苯乙烯类共聚物",
    "description": "ABS兼具韧性、刚性和表面质量，是消费电子和汽车内饰常用材料。",
    "composition_or_structure": "由丙烯腈、丁二烯和苯乙烯三元共聚或共混形成。",
    "key_properties": [
      "抗冲击",
      "易加工",
      "表面质量好"
    ],
    "mechanical_properties": [
      "韧性好",
      "刚韧平衡"
    ],
    "thermal_properties": [
      "耐热性中等",
      "热变形温度可改性提升"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "综合性能好",
      "易电镀喷涂"
    ],
    "limitations": [
      "耐候性一般",
      "耐溶剂性有限"
    ],
    "applications": [
      "电子外壳",
      "汽车轻量化",
      "3D打印"
    ],
    "processing_methods": [
      "注塑",
      "挤出",
      "电镀",
      "FDM打印"
    ],
    "typical_products": [
      "键盘外壳",
      "仪表板",
      "玩具"
    ],
    "related_materials": [
      "PC",
      "PS",
      "PP"
    ],
    "tags": [
      "抗冲击",
      "工程塑料",
      "3D打印"
    ],
    "difficulty_level": "基础",
    "notes": "PC/ABS合金常用于更高耐热和抗冲击外壳。",
    "aliases": [
      "塑料",
      "ABS塑料",
      "外壳塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "polyamide",
    "name_cn": "聚酰胺",
    "name_en": "Polyamide",
    "abbreviation": "PA",
    "category_1": "高分子材料",
    "category_2": "工程塑料",
    "category_3": "尼龙",
    "description": "聚酰胺耐磨、自润滑、强度高，常用于齿轮、轴承和纤维制品。",
    "composition_or_structure": "分子链含酰胺键，常见PA6、PA66等品种。",
    "key_properties": [
      "耐磨",
      "高强度",
      "自润滑"
    ],
    "mechanical_properties": [
      "韧性好",
      "疲劳性能好"
    ],
    "thermal_properties": [
      "耐热性较好",
      "吸湿后尺寸变化"
    ],
    "electrical_properties": [
      "绝缘性较好但受吸湿影响"
    ],
    "advantages": [
      "机械性能好",
      "摩擦系数低"
    ],
    "limitations": [
      "吸水率高",
      "尺寸稳定性需控制"
    ],
    "applications": [
      "汽车轻量化",
      "机械零件",
      "纤维"
    ],
    "processing_methods": [
      "注塑",
      "挤出",
      "纺丝",
      "机加工"
    ],
    "typical_products": [
      "齿轮",
      "轴承保持架",
      "扎带"
    ],
    "related_materials": [
      "POM",
      "PBT",
      "PEEK"
    ],
    "tags": [
      "工程塑料",
      "耐磨",
      "高强度"
    ],
    "difficulty_level": "基础",
    "notes": "玻纤增强尼龙在汽车零件中应用广泛。",
    "aliases": [
      "PA",
      "nylon",
      "尼龙",
      "尼龙材料",
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "polycarbonate",
    "name_cn": "聚碳酸酯",
    "name_en": "Polycarbonate",
    "abbreviation": "PC",
    "category_1": "高分子材料",
    "category_2": "工程塑料",
    "category_3": "透明工程塑料",
    "description": "聚碳酸酯透明、抗冲击、耐热，是防护、光学和电子外壳常用工程塑料。",
    "composition_or_structure": "含碳酸酯基团的非晶热塑性聚合物。",
    "key_properties": [
      "高透明",
      "抗冲击",
      "耐热"
    ],
    "mechanical_properties": [
      "冲击韧性优异",
      "刚性较好"
    ],
    "thermal_properties": [
      "热变形温度较高",
      "耐热老化需稳定剂"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "透明强韧",
      "尺寸稳定"
    ],
    "limitations": [
      "耐刮擦性差",
      "易应力开裂"
    ],
    "applications": [
      "电子外壳",
      "光学器件",
      "医疗器械"
    ],
    "processing_methods": [
      "注塑",
      "挤出",
      "吹塑",
      "涂层硬化"
    ],
    "typical_products": [
      "防护面罩",
      "透镜",
      "外壳"
    ],
    "related_materials": [
      "ABS",
      "PMMA",
      "PET"
    ],
    "tags": [
      "透明",
      "抗冲击",
      "工程塑料"
    ],
    "difficulty_level": "基础",
    "notes": "PC常通过硬涂层改善表面耐刮擦性。",
    "aliases": [
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "pom",
    "name_cn": "聚甲醛",
    "name_en": "Polyoxymethylene",
    "abbreviation": "POM",
    "category_1": "高分子材料",
    "category_2": "工程塑料",
    "category_3": "高结晶工程塑料",
    "description": "聚甲醛刚性高、耐磨、自润滑，适合精密传动和滑动零件。",
    "composition_or_structure": "主链含重复氧亚甲基结构，结晶度高。",
    "key_properties": [
      "耐磨",
      "低摩擦",
      "尺寸稳定"
    ],
    "mechanical_properties": [
      "刚性高",
      "疲劳强度好"
    ],
    "thermal_properties": [
      "耐热性中等",
      "热稳定需控制"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "摩擦性能好",
      "成型精度高"
    ],
    "limitations": [
      "耐强酸差",
      "阻燃较困难"
    ],
    "applications": [
      "机械零件",
      "汽车轻量化",
      "家电"
    ],
    "processing_methods": [
      "注塑",
      "挤出",
      "机加工"
    ],
    "typical_products": [
      "齿轮",
      "滑块",
      "扣件"
    ],
    "related_materials": [
      "PA",
      "PBT",
      "PEEK"
    ],
    "tags": [
      "耐磨",
      "工程塑料",
      "低摩擦"
    ],
    "difficulty_level": "基础",
    "notes": "POM适合替代部分小型金属传动件。",
    "aliases": [
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "pet",
    "name_cn": "聚对苯二甲酸乙二醇酯",
    "name_en": "Polyethylene Terephthalate",
    "abbreviation": "PET",
    "category_1": "高分子材料",
    "category_2": "工程塑料",
    "category_3": "热塑性聚酯",
    "description": "PET强度好、透明性好、阻隔性较好，是瓶片、薄膜和纤维的重要材料。",
    "composition_or_structure": "由对苯二甲酸和乙二醇缩聚形成的半结晶聚酯。",
    "key_properties": [
      "透明",
      "阻隔",
      "耐疲劳"
    ],
    "mechanical_properties": [
      "拉伸强度好",
      "耐蠕变较好"
    ],
    "thermal_properties": [
      "耐热性中等",
      "结晶后耐热提升"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "可回收",
      "成膜性好"
    ],
    "limitations": [
      "干燥要求高",
      "冲击韧性一般"
    ],
    "applications": [
      "包装",
      "电子绝缘",
      "纤维"
    ],
    "processing_methods": [
      "注塑",
      "吹瓶",
      "双向拉伸",
      "纺丝"
    ],
    "typical_products": [
      "饮料瓶",
      "薄膜",
      "涤纶纤维"
    ],
    "related_materials": [
      "PBT",
      "PC",
      "PLA"
    ],
    "tags": [
      "透明",
      "可回收",
      "绝缘"
    ],
    "difficulty_level": "基础",
    "notes": "工程级PET常需玻纤增强和充分干燥。",
    "aliases": [
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "pbt",
    "name_cn": "聚对苯二甲酸丁二醇酯",
    "name_en": "Polybutylene Terephthalate",
    "abbreviation": "PBT",
    "category_1": "高分子材料",
    "category_2": "工程塑料",
    "category_3": "热塑性聚酯",
    "description": "PBT结晶快、尺寸稳定、耐化学性好，是电子电气连接件常用工程塑料。",
    "composition_or_structure": "由对苯二甲酸和丁二醇缩聚形成的半结晶聚酯。",
    "key_properties": [
      "尺寸稳定",
      "耐化学腐蚀",
      "绝缘"
    ],
    "mechanical_properties": [
      "刚性好",
      "玻纤增强后强度高"
    ],
    "thermal_properties": [
      "耐热性较好",
      "结晶速度快"
    ],
    "electrical_properties": [
      "电绝缘性好"
    ],
    "advantages": [
      "成型周期短",
      "电性能稳定"
    ],
    "limitations": [
      "缺口冲击一般",
      "水解需关注"
    ],
    "applications": [
      "电子封装",
      "汽车轻量化",
      "电气连接"
    ],
    "processing_methods": [
      "注塑",
      "挤出",
      "玻纤增强"
    ],
    "typical_products": [
      "连接器",
      "继电器壳体",
      "传感器外壳"
    ],
    "related_materials": [
      "PET",
      "PA",
      "PPS"
    ],
    "tags": [
      "工程塑料",
      "绝缘",
      "电子"
    ],
    "difficulty_level": "基础",
    "notes": "阻燃增强PBT是电子电气领域常见配方。",
    "aliases": [
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "peek",
    "name_cn": "聚醚醚酮",
    "name_en": "Polyether ether ketone",
    "abbreviation": "PEEK",
    "category_1": "高分子材料",
    "category_2": "特种工程塑料",
    "category_3": "芳香族高性能聚合物",
    "description": "PEEK是高性能热塑性工程塑料，耐高温、耐化学腐蚀且机械性能优异，可用于严苛环境。",
    "composition_or_structure": "芳香环、醚键和酮键构成的半结晶高分子结构。",
    "key_properties": [
      "耐高温",
      "高强度",
      "耐化学腐蚀"
    ],
    "mechanical_properties": [
      "拉伸强度高",
      "耐磨损",
      "抗疲劳"
    ],
    "thermal_properties": [
      "长期使用温度高",
      "热稳定性好"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "综合性能优异",
      "可替代部分金属"
    ],
    "limitations": [
      "价格高",
      "加工温度高"
    ],
    "applications": [
      "航空航天",
      "医疗植入",
      "汽车零件",
      "电子绝缘",
      "3D打印"
    ],
    "processing_methods": [
      "注塑",
      "挤出",
      "机加工",
      "3D打印"
    ],
    "typical_products": [
      "轴承",
      "齿轮",
      "骨科植入物",
      "绝缘件"
    ],
    "related_materials": [
      "PI",
      "PPS",
      "PTFE"
    ],
    "tags": [
      "耐高温",
      "工程塑料",
      "高性能",
      "医用"
    ],
    "difficulty_level": "进阶",
    "notes": "医用级PEEK因弹性模量接近骨组织而受到关注。",
    "aliases": [
      "聚醚醚酮",
      "peek材料",
      "高性能塑料",
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [
        {
          "src": "assets/materials/peek/macro.jpg",
          "alt": "PEEK棒材、板材或注塑件外观宏观照片",
          "caption": "PEEK棒材、板材或注塑件外观"
        }
      ],
      "micro": [
        {
          "src": "assets/materials/peek/micro.jpg",
          "alt": "PEEK半结晶结构和断口形貌微观结构照片",
          "caption": "PEEK半结晶结构和断口形貌"
        }
      ]
    }
  },
  {
    "id": "polyimide",
    "name_cn": "聚酰亚胺",
    "name_en": "Polyimide",
    "abbreviation": "PI",
    "category_1": "高分子材料",
    "category_2": "特种工程塑料",
    "category_3": "耐高温芳杂环聚合物",
    "description": "聚酰亚胺耐热、耐辐照、电绝缘性能优异，是航空航天和电子薄膜的代表材料。",
    "composition_or_structure": "分子链含酰亚胺环，刚性芳香结构带来高热稳定性。",
    "key_properties": [
      "耐高温",
      "绝缘",
      "耐辐照"
    ],
    "mechanical_properties": [
      "尺寸稳定",
      "耐蠕变"
    ],
    "thermal_properties": [
      "热稳定性优异",
      "低温到高温范围宽"
    ],
    "electrical_properties": [
      "介电性能好"
    ],
    "advantages": [
      "耐热等级高",
      "薄膜性能突出"
    ],
    "limitations": [
      "加工难度高",
      "成本高"
    ],
    "applications": [
      "航空航天",
      "电子封装",
      "柔性电路"
    ],
    "processing_methods": [
      "流延成膜",
      "热压",
      "涂覆",
      "3D打印"
    ],
    "typical_products": [
      "柔性电路基膜",
      "绝缘垫片",
      "耐热胶带"
    ],
    "related_materials": [
      "PEEK",
      "PPS",
      "LCP"
    ],
    "tags": [
      "耐高温",
      "绝缘",
      "电子"
    ],
    "difficulty_level": "进阶",
    "notes": "Kapton是聚酰亚胺薄膜的典型商品名。",
    "aliases": [
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "pps",
    "name_cn": "聚苯硫醚",
    "name_en": "Polyphenylene Sulfide",
    "abbreviation": "PPS",
    "category_1": "高分子材料",
    "category_2": "特种工程塑料",
    "category_3": "芳香族硫醚聚合物",
    "description": "PPS耐热、阻燃、耐化学腐蚀，适合汽车热管理和电子电气部件。",
    "composition_or_structure": "芳香环与硫醚键交替构成的半结晶聚合物。",
    "key_properties": [
      "耐高温",
      "阻燃",
      "耐化学腐蚀"
    ],
    "mechanical_properties": [
      "玻纤增强后刚性高",
      "尺寸稳定"
    ],
    "thermal_properties": [
      "长期耐热好",
      "热变形温度高"
    ],
    "electrical_properties": [
      "电绝缘稳定"
    ],
    "advantages": [
      "本征阻燃",
      "耐化学性强"
    ],
    "limitations": [
      "韧性一般",
      "成型需高温"
    ],
    "applications": [
      "汽车轻量化",
      "电子封装",
      "化工设备"
    ],
    "processing_methods": [
      "注塑",
      "挤出",
      "玻纤增强"
    ],
    "typical_products": [
      "连接器",
      "泵壳",
      "水阀部件"
    ],
    "related_materials": [
      "PEEK",
      "PI",
      "PBT"
    ],
    "tags": [
      "耐高温",
      "阻燃",
      "工程塑料"
    ],
    "difficulty_level": "进阶",
    "notes": "PPS常以玻纤或矿物填充增强形态使用。",
    "aliases": [
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "ptfe",
    "name_cn": "聚四氟乙烯",
    "name_en": "Polytetrafluoroethylene",
    "abbreviation": "PTFE",
    "category_1": "高分子材料",
    "category_2": "特种工程塑料",
    "category_3": "含氟聚合物",
    "description": "PTFE摩擦系数极低、耐化学腐蚀、电绝缘性好，是密封和防粘领域代表材料。",
    "composition_or_structure": "完全氟化的碳链结构，C-F键稳定。",
    "key_properties": [
      "低摩擦",
      "耐化学腐蚀",
      "绝缘"
    ],
    "mechanical_properties": [
      "强度较低",
      "耐磨需填充改性"
    ],
    "thermal_properties": [
      "耐热性好",
      "冷流需关注"
    ],
    "electrical_properties": [
      "介电性能优异"
    ],
    "advantages": [
      "化学惰性强",
      "表面不粘"
    ],
    "limitations": [
      "加工方式特殊",
      "蠕变较大"
    ],
    "applications": [
      "化工密封",
      "电子绝缘",
      "医疗器械"
    ],
    "processing_methods": [
      "模压烧结",
      "挤出",
      "机加工",
      "涂覆"
    ],
    "typical_products": [
      "密封圈",
      "防粘涂层",
      "绝缘套管"
    ],
    "related_materials": [
      "PEEK",
      "PPS",
      "氟橡胶"
    ],
    "tags": [
      "低摩擦",
      "耐腐蚀",
      "绝缘"
    ],
    "difficulty_level": "进阶",
    "notes": "PTFE不能像普通热塑性塑料那样直接熔融注塑。",
    "aliases": [
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "lcp",
    "name_cn": "液晶聚合物",
    "name_en": "Liquid Crystal Polymer",
    "abbreviation": "LCP",
    "category_1": "高分子材料",
    "category_2": "特种工程塑料",
    "category_3": "各向异性高性能聚合物",
    "description": "LCP流动性好、尺寸稳定、介电损耗低，适合精密电子连接器和高频器件。",
    "composition_or_structure": "刚性棒状分子在熔体中可形成液晶有序结构。",
    "key_properties": [
      "尺寸稳定",
      "低介电损耗",
      "耐高温"
    ],
    "mechanical_properties": [
      "薄壁强度好",
      "各向异性明显"
    ],
    "thermal_properties": [
      "耐热性高",
      "热膨胀低"
    ],
    "electrical_properties": [
      "高频介电性能好"
    ],
    "advantages": [
      "精密成型好",
      "适合薄壁件"
    ],
    "limitations": [
      "熔接线强度需关注",
      "材料成本高"
    ],
    "applications": [
      "电子封装",
      "高频通信",
      "汽车电子"
    ],
    "processing_methods": [
      "注塑",
      "薄壁成型",
      "挤出成膜"
    ],
    "typical_products": [
      "连接器",
      "天线支架",
      "柔性基材"
    ],
    "related_materials": [
      "PI",
      "PPS",
      "PBT"
    ],
    "tags": [
      "高频",
      "耐高温",
      "电子"
    ],
    "difficulty_level": "进阶",
    "notes": "LCP在5G高频连接器中具有重要应用。",
    "aliases": [
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "natural_rubber",
    "name_cn": "天然橡胶",
    "name_en": "Natural Rubber",
    "abbreviation": "NR",
    "category_1": "高分子材料",
    "category_2": "橡胶",
    "category_3": "天然聚异戊二烯",
    "description": "天然橡胶弹性好、强度高，是轮胎、减振和密封制品的重要弹性体。",
    "composition_or_structure": "主要成分为顺式-1,4-聚异戊二烯。",
    "key_properties": [
      "高弹性",
      "耐疲劳",
      "减振"
    ],
    "mechanical_properties": [
      "拉伸强度高",
      "撕裂强度好"
    ],
    "thermal_properties": [
      "耐热老化一般",
      "低温弹性好"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "弹性优异",
      "动态性能好"
    ],
    "limitations": [
      "耐油性差",
      "耐臭氧老化需防护"
    ],
    "applications": [
      "轮胎",
      "减振",
      "密封"
    ],
    "processing_methods": [
      "混炼",
      "压延",
      "硫化",
      "模压"
    ],
    "typical_products": [
      "轮胎",
      "减振垫",
      "胶管"
    ],
    "related_materials": [
      "丁苯橡胶",
      "硅橡胶",
      "氟橡胶"
    ],
    "tags": [
      "橡胶",
      "减振",
      "弹性"
    ],
    "difficulty_level": "基础",
    "notes": "硫化交联是橡胶获得实用弹性的关键。",
    "aliases": [
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "silicone_rubber",
    "name_cn": "硅橡胶",
    "name_en": "Silicone Rubber",
    "abbreviation": "VMQ",
    "category_1": "高分子材料",
    "category_2": "橡胶",
    "category_3": "有机硅弹性体",
    "description": "硅橡胶耐高低温、生物相容性好，常用于密封、医疗和电子灌封。",
    "composition_or_structure": "主链为Si-O键，侧基多为甲基或乙烯基。",
    "key_properties": [
      "耐高温",
      "耐低温",
      "医用"
    ],
    "mechanical_properties": [
      "弹性稳定",
      "撕裂强度可改性"
    ],
    "thermal_properties": [
      "高低温范围宽",
      "热老化好"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "生物相容性好",
      "柔软稳定"
    ],
    "limitations": [
      "机械强度低于通用橡胶",
      "耐油性一般"
    ],
    "applications": [
      "医疗器械",
      "电子封装",
      "密封"
    ],
    "processing_methods": [
      "混炼",
      "液态注射",
      "硫化",
      "挤出"
    ],
    "typical_products": [
      "医用管",
      "密封圈",
      "键盘垫"
    ],
    "related_materials": [
      "天然橡胶",
      "氟橡胶",
      "医用硅橡胶"
    ],
    "tags": [
      "医用",
      "绝缘",
      "耐高温"
    ],
    "difficulty_level": "基础",
    "notes": "液态硅橡胶适合精密复杂制品。",
    "aliases": [
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "fluororubber",
    "name_cn": "氟橡胶",
    "name_en": "Fluoroelastomer",
    "abbreviation": "FKM",
    "category_1": "高分子材料",
    "category_2": "橡胶",
    "category_3": "含氟弹性体",
    "description": "氟橡胶耐油、耐热、耐化学介质，常用于汽车、航空和化工密封。",
    "composition_or_structure": "分子结构中含氟单体，化学稳定性较高。",
    "key_properties": [
      "耐油",
      "耐高温",
      "耐化学腐蚀"
    ],
    "mechanical_properties": [
      "压缩永久变形小",
      "强度中等"
    ],
    "thermal_properties": [
      "耐热老化好",
      "低温弹性一般"
    ],
    "electrical_properties": [
      "绝缘性较好"
    ],
    "advantages": [
      "密封可靠",
      "介质适应性强"
    ],
    "limitations": [
      "成本高",
      "低温性能受限"
    ],
    "applications": [
      "航空航天",
      "汽车零件",
      "化工密封"
    ],
    "processing_methods": [
      "混炼",
      "模压",
      "硫化",
      "注射成型"
    ],
    "typical_products": [
      "O形圈",
      "油封",
      "燃油管"
    ],
    "related_materials": [
      "硅橡胶",
      "PTFE",
      "天然橡胶"
    ],
    "tags": [
      "耐高温",
      "耐油",
      "密封"
    ],
    "difficulty_level": "进阶",
    "notes": "FKM常用于高温油介质环境。",
    "aliases": [
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "epoxy_resin",
    "name_cn": "环氧树脂",
    "name_en": "Epoxy Resin",
    "abbreviation": "EP",
    "category_1": "高分子材料",
    "category_2": "树脂",
    "category_3": "热固性树脂",
    "description": "环氧树脂粘接强度高、固化收缩小，是复合材料基体、胶黏剂和电子封装树脂。",
    "composition_or_structure": "分子中含环氧基团，与胺类、酸酐等固化剂交联成网状结构。",
    "key_properties": [
      "高粘接",
      "绝缘",
      "耐化学腐蚀"
    ],
    "mechanical_properties": [
      "强度高",
      "脆性需增韧"
    ],
    "thermal_properties": [
      "耐热性由固化体系决定",
      "固化放热需控制"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "粘接力强",
      "尺寸稳定"
    ],
    "limitations": [
      "韧性不足",
      "不可熔融再加工"
    ],
    "applications": [
      "电子封装",
      "航空航天",
      "复合材料"
    ],
    "processing_methods": [
      "浇注",
      "灌封",
      "预浸料",
      "RTM"
    ],
    "typical_products": [
      "胶黏剂",
      "电路板",
      "碳纤维复合材料基体"
    ],
    "related_materials": [
      "聚氨酯",
      "不饱和聚酯树脂",
      "碳纤维/环氧复合材料"
    ],
    "tags": [
      "热固性",
      "绝缘",
      "复合材料"
    ],
    "difficulty_level": "基础",
    "notes": "固化剂和配方决定环氧树脂最终性能。",
    "aliases": [
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "polyurethane",
    "name_cn": "聚氨酯",
    "name_en": "Polyurethane",
    "abbreviation": "PU",
    "category_1": "高分子材料",
    "category_2": "树脂",
    "category_3": "氨酯键聚合物",
    "description": "聚氨酯可制成泡沫、弹性体、涂层和胶黏剂，性能覆盖范围很宽。",
    "composition_or_structure": "由异氰酸酯与多元醇反应形成含氨酯键结构。",
    "key_properties": [
      "弹性可调",
      "耐磨",
      "隔热"
    ],
    "mechanical_properties": [
      "弹性好",
      "耐磨损"
    ],
    "thermal_properties": [
      "泡沫隔热好",
      "耐热性中等"
    ],
    "electrical_properties": [
      "绝缘性较好"
    ],
    "advantages": [
      "配方灵活",
      "粘接和缓冲性能好"
    ],
    "limitations": [
      "耐水解需改性",
      "原料安全需管理"
    ],
    "applications": [
      "建筑工程",
      "汽车内饰",
      "医疗器械"
    ],
    "processing_methods": [
      "发泡",
      "浇注",
      "喷涂",
      "反应注射成型"
    ],
    "typical_products": [
      "保温泡沫",
      "滚轮",
      "涂层"
    ],
    "related_materials": [
      "环氧树脂",
      "硅橡胶",
      "聚酯树脂"
    ],
    "tags": [
      "弹性",
      "隔热",
      "耐磨"
    ],
    "difficulty_level": "基础",
    "notes": "软泡和硬泡聚氨酯的应用差异很大。",
    "aliases": [
      "塑料",
      "高分子材料",
      "polymer"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "alumina_ceramic",
    "name_cn": "氧化铝陶瓷",
    "name_en": "Alumina Ceramic",
    "abbreviation": "Al2O3",
    "category_1": "无机非金属材料",
    "category_2": "陶瓷材料",
    "category_3": "氧化物结构陶瓷",
    "description": "氧化铝陶瓷硬度高、耐磨、绝缘且耐高温，是结构陶瓷和电子陶瓷的基础材料。",
    "composition_or_structure": "以Al2O3晶相为主，常通过烧结致密化。",
    "key_properties": [
      "高硬度",
      "耐磨",
      "绝缘"
    ],
    "mechanical_properties": [
      "抗压强度高",
      "脆性较大"
    ],
    "thermal_properties": [
      "耐高温",
      "热震性中等"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "成本相对低",
      "耐腐蚀"
    ],
    "limitations": [
      "韧性低",
      "后加工困难"
    ],
    "applications": [
      "电子封装",
      "机械密封",
      "医疗器械"
    ],
    "processing_methods": [
      "粉体成型",
      "烧结",
      "热压",
      "研磨"
    ],
    "typical_products": [
      "陶瓷基板",
      "密封环",
      "耐磨衬片"
    ],
    "related_materials": [
      "氧化锆陶瓷",
      "碳化硅陶瓷",
      "氮化硅陶瓷"
    ],
    "tags": [
      "陶瓷",
      "耐磨",
      "绝缘",
      "耐高温"
    ],
    "difficulty_level": "基础",
    "notes": "高纯氧化铝可用于电子和生物陶瓷。",
    "aliases": [
      "Al2O3",
      "陶瓷",
      "氧化铝"
    ],
    "images": {
      "macro": [
        {
          "src": "assets/materials/alumina_ceramic/macro.jpg",
          "alt": "氧化铝陶瓷基板、结构件或抛光表面宏观照片",
          "caption": "氧化铝陶瓷基板、结构件或抛光表面"
        }
      ],
      "micro": [
        {
          "src": "assets/materials/alumina_ceramic/micro.jpg",
          "alt": "氧化铝陶瓷晶粒、晶界和孔隙结构微观结构照片",
          "caption": "氧化铝陶瓷晶粒、晶界和孔隙结构"
        }
      ]
    }
  },
  {
    "id": "zirconia_ceramic",
    "name_cn": "氧化锆陶瓷",
    "name_en": "Zirconia Ceramic",
    "abbreviation": "ZrO2",
    "category_1": "无机非金属材料",
    "category_2": "陶瓷材料",
    "category_3": "相变增韧陶瓷",
    "description": "氧化锆陶瓷韧性高于多数陶瓷，耐磨且生物相容性好，用于齿科和精密结构件。",
    "composition_or_structure": "以ZrO2为主，常用氧化钇稳定四方相。",
    "key_properties": [
      "高韧性",
      "耐磨",
      "生物相容"
    ],
    "mechanical_properties": [
      "断裂韧性较高",
      "抗弯强度高"
    ],
    "thermal_properties": [
      "耐高温",
      "低导热"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "陶瓷中韧性突出",
      "表面美观"
    ],
    "limitations": [
      "老化敏感性需关注",
      "成本较高"
    ],
    "applications": [
      "医疗植入",
      "机械零件",
      "电子封装"
    ],
    "processing_methods": [
      "注浆成型",
      "干压",
      "烧结",
      "精密磨削"
    ],
    "typical_products": [
      "牙冠",
      "轴承球",
      "刀具"
    ],
    "related_materials": [
      "氧化铝陶瓷",
      "生物玻璃",
      "羟基磷灰石"
    ],
    "tags": [
      "陶瓷",
      "耐磨",
      "医用"
    ],
    "difficulty_level": "进阶",
    "notes": "相变增韧是氧化锆区别于普通陶瓷的重要机制。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "sic_ceramic",
    "name_cn": "碳化硅陶瓷",
    "name_en": "Silicon Carbide Ceramic",
    "abbreviation": "SiC",
    "category_1": "无机非金属材料",
    "category_2": "陶瓷材料",
    "category_3": "非氧化物结构陶瓷",
    "description": "碳化硅陶瓷硬度高、导热好、耐磨耐高温，适合密封、热管理和严苛磨损场景。",
    "composition_or_structure": "由SiC强共价键晶体构成，可反应烧结或无压烧结。",
    "key_properties": [
      "高硬度",
      "导热",
      "耐高温"
    ],
    "mechanical_properties": [
      "耐磨损",
      "脆性较大"
    ],
    "thermal_properties": [
      "导热性高",
      "热膨胀低"
    ],
    "electrical_properties": [
      "半导体或绝缘取决于纯度"
    ],
    "advantages": [
      "耐磨耐蚀",
      "热稳定好"
    ],
    "limitations": [
      "烧结困难",
      "加工成本高"
    ],
    "applications": [
      "机械密封",
      "电子封装",
      "航空航天"
    ],
    "processing_methods": [
      "反应烧结",
      "无压烧结",
      "热压",
      "CVD"
    ],
    "typical_products": [
      "密封环",
      "散热基板",
      "喷嘴"
    ],
    "related_materials": [
      "氮化硅陶瓷",
      "氧化铝陶瓷",
      "碳化硅半导体"
    ],
    "tags": [
      "耐高温",
      "导热",
      "陶瓷"
    ],
    "difficulty_level": "进阶",
    "notes": "SiC同时也是重要的宽禁带半导体材料。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "silicon_nitride_ceramic",
    "name_cn": "氮化硅陶瓷",
    "name_en": "Silicon Nitride Ceramic",
    "abbreviation": "Si3N4",
    "category_1": "无机非金属材料",
    "category_2": "陶瓷材料",
    "category_3": "非氧化物结构陶瓷",
    "description": "氮化硅陶瓷强度高、热震性好、耐磨，适合轴承、发动机和高可靠机械部件。",
    "composition_or_structure": "以Si3N4晶粒互锁结构为主，常含烧结助剂形成晶界相。",
    "key_properties": [
      "高强度",
      "热震性好",
      "耐磨"
    ],
    "mechanical_properties": [
      "断裂韧性较好",
      "疲劳性能好"
    ],
    "thermal_properties": [
      "耐热冲击",
      "耐高温"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "可靠性高",
      "密度低于氧化物陶瓷"
    ],
    "limitations": [
      "烧结工艺复杂",
      "成本高"
    ],
    "applications": [
      "航空航天",
      "机械零件",
      "汽车零件"
    ],
    "processing_methods": [
      "气压烧结",
      "热等静压",
      "精密磨削"
    ],
    "typical_products": [
      "陶瓷轴承",
      "涡轮转子",
      "切削刀具"
    ],
    "related_materials": [
      "碳化硅陶瓷",
      "氧化锆陶瓷",
      "陶瓷基复合材料"
    ],
    "tags": [
      "陶瓷",
      "耐磨",
      "耐高温"
    ],
    "difficulty_level": "进阶",
    "notes": "氮化硅轴承适合高速、绝缘和低密度场景。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "quartz_glass",
    "name_cn": "石英玻璃",
    "name_en": "Quartz Glass",
    "abbreviation": "SiO2",
    "category_1": "无机非金属材料",
    "category_2": "玻璃材料",
    "category_3": "高纯二氧化硅玻璃",
    "description": "石英玻璃耐高温、透紫外、热膨胀低，是光学、半导体和实验器皿常用材料。",
    "composition_or_structure": "主要成分为高纯无定形SiO2网络结构。",
    "key_properties": [
      "耐高温",
      "透光",
      "低热膨胀"
    ],
    "mechanical_properties": [
      "硬而脆",
      "抗拉弱"
    ],
    "thermal_properties": [
      "热稳定性好",
      "抗热震好"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "光学性能好",
      "纯度高"
    ],
    "limitations": [
      "价格高",
      "成形难度较高"
    ],
    "applications": [
      "半导体",
      "光学器件",
      "实验室"
    ],
    "processing_methods": [
      "熔融成形",
      "火焰加工",
      "研磨抛光"
    ],
    "typical_products": [
      "石英管",
      "窗口片",
      "坩埚"
    ],
    "related_materials": [
      "硼硅玻璃",
      "普通玻璃",
      "单晶硅"
    ],
    "tags": [
      "玻璃",
      "耐高温",
      "绝缘"
    ],
    "difficulty_level": "基础",
    "notes": "石英玻璃与普通钠钙玻璃在热膨胀和纯度上差异很大。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "borosilicate_glass",
    "name_cn": "硼硅玻璃",
    "name_en": "Borosilicate Glass",
    "abbreviation": "",
    "category_1": "无机非金属材料",
    "category_2": "玻璃材料",
    "category_3": "低膨胀玻璃",
    "description": "硼硅玻璃耐热冲击、化学稳定性好，常用于实验器皿、炊具和照明玻璃。",
    "composition_or_structure": "硅氧网络中引入B2O3降低热膨胀并提升化学稳定性。",
    "key_properties": [
      "耐热冲击",
      "透明",
      "耐化学腐蚀"
    ],
    "mechanical_properties": [
      "硬脆",
      "强度依表面缺陷变化"
    ],
    "thermal_properties": [
      "低热膨胀",
      "耐温差"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "稳定可靠",
      "成本低于石英玻璃"
    ],
    "limitations": [
      "抗冲击有限",
      "不能承受极端热负荷"
    ],
    "applications": [
      "实验室",
      "建筑工程",
      "照明"
    ],
    "processing_methods": [
      "熔融成形",
      "吹制",
      "退火"
    ],
    "typical_products": [
      "烧杯",
      "玻璃管",
      "耐热锅盖"
    ],
    "related_materials": [
      "石英玻璃",
      "钢化玻璃",
      "普通玻璃"
    ],
    "tags": [
      "玻璃",
      "耐热",
      "透明"
    ],
    "difficulty_level": "基础",
    "notes": "硼硅玻璃常见于实验室耐热器皿。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "tempered_glass",
    "name_cn": "钢化玻璃",
    "name_en": "Tempered Glass",
    "abbreviation": "",
    "category_1": "无机非金属材料",
    "category_2": "玻璃材料",
    "category_3": "表面压应力强化玻璃",
    "description": "钢化玻璃通过热处理引入表面压应力，抗冲击和安全性优于普通玻璃。",
    "composition_or_structure": "钠钙硅玻璃经加热和快速冷却形成表面压应力层。",
    "key_properties": [
      "高强度",
      "安全",
      "透明"
    ],
    "mechanical_properties": [
      "抗弯强度提高",
      "破碎成钝小颗粒"
    ],
    "thermal_properties": [
      "耐热冲击优于普通玻璃",
      "不可二次切割"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "安全性好",
      "成本适中"
    ],
    "limitations": [
      "边缘易受损",
      "自爆风险需控制"
    ],
    "applications": [
      "建筑工程",
      "汽车玻璃",
      "电子屏幕"
    ],
    "processing_methods": [
      "切割磨边",
      "热钢化",
      "化学钢化"
    ],
    "typical_products": [
      "幕墙玻璃",
      "车窗",
      "手机盖板"
    ],
    "related_materials": [
      "硼硅玻璃",
      "普通玻璃",
      "石英玻璃"
    ],
    "tags": [
      "透明",
      "建筑",
      "高强度"
    ],
    "difficulty_level": "基础",
    "notes": "钢化前必须完成切割、开孔和磨边。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "portland_cement",
    "name_cn": "硅酸盐水泥",
    "name_en": "Portland Cement",
    "abbreviation": "",
    "category_1": "无机非金属材料",
    "category_2": "水泥与建筑材料",
    "category_3": "水硬性胶凝材料",
    "description": "硅酸盐水泥遇水水化硬化，是混凝土和砂浆最重要的胶凝材料。",
    "composition_or_structure": "主要由硅酸三钙、硅酸二钙、铝酸三钙等熟料矿物和石膏组成。",
    "key_properties": [
      "水硬性",
      "可浇筑",
      "建筑"
    ],
    "mechanical_properties": [
      "早期与后期强度可调",
      "抗拉较弱"
    ],
    "thermal_properties": [
      "水化放热",
      "耐火性有限"
    ],
    "electrical_properties": [
      "绝缘性较好"
    ],
    "advantages": [
      "原料丰富",
      "工程体系成熟"
    ],
    "limitations": [
      "碳排放高",
      "脆性和收缩需控制"
    ],
    "applications": [
      "建筑工程",
      "基础设施"
    ],
    "processing_methods": [
      "粉磨",
      "拌合",
      "浇筑",
      "养护"
    ],
    "typical_products": [
      "砂浆",
      "混凝土",
      "预制件"
    ],
    "related_materials": [
      "混凝土",
      "石膏",
      "耐火材料"
    ],
    "tags": [
      "建筑",
      "胶凝材料",
      "低成本"
    ],
    "difficulty_level": "基础",
    "notes": "水灰比和养护条件显著影响强度发展。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "concrete",
    "name_cn": "混凝土",
    "name_en": "Concrete",
    "abbreviation": "",
    "category_1": "无机非金属材料",
    "category_2": "水泥与建筑材料",
    "category_3": "颗粒增强胶凝复合材料",
    "description": "混凝土由水泥、骨料、水和外加剂组成，抗压强度高，是现代土木工程基础材料。",
    "composition_or_structure": "水泥水化产物将砂石骨料胶结成整体。",
    "key_properties": [
      "抗压强度高",
      "可浇筑",
      "耐久"
    ],
    "mechanical_properties": [
      "抗压好",
      "抗拉弱需钢筋增强"
    ],
    "thermal_properties": [
      "耐火性较好",
      "温度裂缝需控制"
    ],
    "electrical_properties": [
      "绝缘性较好"
    ],
    "advantages": [
      "成本低",
      "适合大体积构件"
    ],
    "limitations": [
      "自重大",
      "开裂和耐久性需设计"
    ],
    "applications": [
      "建筑工程",
      "基础设施",
      "桥梁"
    ],
    "processing_methods": [
      "搅拌",
      "浇筑",
      "振捣",
      "养护"
    ],
    "typical_products": [
      "梁柱",
      "路面",
      "预制构件"
    ],
    "related_materials": [
      "硅酸盐水泥",
      "钢",
      "纤维增强混凝土"
    ],
    "tags": [
      "建筑",
      "结构材料",
      "低成本"
    ],
    "difficulty_level": "基础",
    "notes": "钢筋混凝土利用钢材抗拉和混凝土抗压的互补性。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "refractory",
    "name_cn": "耐火材料",
    "name_en": "Refractory",
    "abbreviation": "",
    "category_1": "无机非金属材料",
    "category_2": "水泥与建筑材料",
    "category_3": "高温炉衬材料",
    "description": "耐火材料在高温、熔渣和热震环境下保持结构稳定，用于冶金、玻璃和水泥窑炉。",
    "composition_or_structure": "可由氧化铝、氧化镁、二氧化硅、碳化硅等耐火相构成。",
    "key_properties": [
      "耐高温",
      "抗侵蚀",
      "热稳定"
    ],
    "mechanical_properties": [
      "高温强度好",
      "耐磨性视体系而定"
    ],
    "thermal_properties": [
      "耐火度高",
      "抗热震需配方设计"
    ],
    "electrical_properties": [
      "多数为绝缘或低导电"
    ],
    "advantages": [
      "高温服役可靠",
      "种类丰富"
    ],
    "limitations": [
      "脆性大",
      "施工和烘炉要求高"
    ],
    "applications": [
      "冶金",
      "玻璃窑炉",
      "建筑工程"
    ],
    "processing_methods": [
      "成型",
      "烧成",
      "浇注",
      "喷补"
    ],
    "typical_products": [
      "炉砖",
      "浇注料",
      "坩埚"
    ],
    "related_materials": [
      "氧化铝陶瓷",
      "碳化硅陶瓷",
      "硅酸盐水泥"
    ],
    "tags": [
      "耐高温",
      "陶瓷",
      "窑炉"
    ],
    "difficulty_level": "进阶",
    "notes": "酸性、碱性和中性耐火材料适用炉渣环境不同。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "carbon_fiber_epoxy",
    "name_cn": "碳纤维/环氧复合材料",
    "name_en": "Carbon Fiber/Epoxy Composite",
    "abbreviation": "CFRP",
    "category_1": "复合材料",
    "category_2": "树脂基复合材料",
    "category_3": "连续纤维增强热固性复合材料",
    "description": "碳纤维/环氧复合材料比强度和比模量高，是航空航天和高端轻量化结构的代表材料。",
    "composition_or_structure": "碳纤维作为增强体，环氧树脂作为基体并经固化形成层合结构。",
    "key_properties": [
      "轻量化",
      "高比强度",
      "耐疲劳"
    ],
    "mechanical_properties": [
      "比模量高",
      "疲劳性能好"
    ],
    "thermal_properties": [
      "热膨胀低",
      "耐热性受树脂限制"
    ],
    "electrical_properties": [
      "碳纤维方向导电"
    ],
    "advantages": [
      "减重效果显著",
      "可设计性强"
    ],
    "limitations": [
      "成本高",
      "冲击损伤不易发现"
    ],
    "applications": [
      "航空航天",
      "汽车轻量化",
      "体育器材"
    ],
    "processing_methods": [
      "预浸料铺层",
      "热压罐",
      "RTM",
      "自动铺丝"
    ],
    "typical_products": [
      "机翼蒙皮",
      "车身构件",
      "自行车架"
    ],
    "related_materials": [
      "玻璃纤维复合材料",
      "芳纶纤维复合材料",
      "PEEK"
    ],
    "tags": [
      "复合材料",
      "轻量化",
      "航空航天"
    ],
    "difficulty_level": "进阶",
    "notes": "铺层角度决定各方向刚度和强度。",
    "aliases": [
      "CFRP",
      "carbon fiber",
      "碳纤维",
      "碳纤维复合材料",
      "碳纤维板"
    ],
    "images": {
      "macro": [
        {
          "src": "assets/materials/carbon_fiber_epoxy/macro.jpg",
          "alt": "碳纤维/环氧复合材料编织纹理和层合板外观宏观照片",
          "caption": "碳纤维/环氧复合材料编织纹理和层合板外观"
        }
      ],
      "micro": [
        {
          "src": "assets/materials/carbon_fiber_epoxy/micro.jpg",
          "alt": "碳纤维束、树脂基体和界面结构微观结构照片",
          "caption": "碳纤维束、树脂基体和界面结构"
        }
      ]
    }
  },
  {
    "id": "glass_fiber_composite",
    "name_cn": "玻璃纤维复合材料",
    "name_en": "Glass Fiber Composite",
    "abbreviation": "GFRP",
    "category_1": "复合材料",
    "category_2": "树脂基复合材料",
    "category_3": "玻璃纤维增强树脂",
    "description": "玻璃纤维复合材料成本适中、绝缘性好、耐腐蚀，广泛用于风电、船舶和电气领域。",
    "composition_or_structure": "玻璃纤维增强不饱和聚酯、环氧或乙烯基树脂基体。",
    "key_properties": [
      "绝缘",
      "耐腐蚀",
      "性价比高"
    ],
    "mechanical_properties": [
      "强度高于普通塑料",
      "疲劳性能中等"
    ],
    "thermal_properties": [
      "耐热性受树脂限制",
      "热膨胀较低"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "成本低于碳纤维",
      "成型方法多"
    ],
    "limitations": [
      "密度高于碳纤维",
      "刚度较低"
    ],
    "applications": [
      "风电",
      "建筑工程",
      "电子封装"
    ],
    "processing_methods": [
      "手糊",
      "拉挤",
      "缠绕",
      "RTM"
    ],
    "typical_products": [
      "风电叶片",
      "电路板",
      "管道"
    ],
    "related_materials": [
      "碳纤维/环氧复合材料",
      "芳纶纤维复合材料",
      "环氧树脂"
    ],
    "tags": [
      "复合材料",
      "绝缘",
      "耐腐蚀"
    ],
    "difficulty_level": "基础",
    "notes": "GFRP是学习复合材料工艺的入门体系。",
    "aliases": [
      "GFRP",
      "FRP",
      "玻璃钢",
      "玻纤复合材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "aramid_fiber_composite",
    "name_cn": "芳纶纤维复合材料",
    "name_en": "Aramid Fiber Composite",
    "abbreviation": "AFRP",
    "category_1": "复合材料",
    "category_2": "树脂基复合材料",
    "category_3": "高韧纤维增强复合材料",
    "description": "芳纶纤维复合材料抗冲击、耐疲劳、密度低，常用于防护和高韧轻量化结构。",
    "composition_or_structure": "芳香族聚酰胺纤维与树脂基体复合形成。",
    "key_properties": [
      "抗冲击",
      "轻量化",
      "耐疲劳"
    ],
    "mechanical_properties": [
      "韧性好",
      "抗拉强度高"
    ],
    "thermal_properties": [
      "耐热性较好",
      "热膨胀低"
    ],
    "electrical_properties": [
      "绝缘性较好"
    ],
    "advantages": [
      "吸能能力强",
      "密度低"
    ],
    "limitations": [
      "压缩性能一般",
      "吸湿需控制"
    ],
    "applications": [
      "防护装备",
      "航空航天",
      "体育器材"
    ],
    "processing_methods": [
      "预浸料",
      "层压",
      "缠绕",
      "热压"
    ],
    "typical_products": [
      "防弹板",
      "头盔",
      "蜂窝芯材"
    ],
    "related_materials": [
      "碳纤维复合材料",
      "玻璃纤维复合材料",
      "蜂窝夹层板"
    ],
    "tags": [
      "复合材料",
      "抗冲击",
      "轻量化"
    ],
    "difficulty_level": "进阶",
    "notes": "Kevlar是芳纶纤维的典型代表。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "aluminum_mmc",
    "name_cn": "铝基复合材料",
    "name_en": "Aluminum Matrix Composite",
    "abbreviation": "Al-MMC",
    "category_1": "复合材料",
    "category_2": "金属基复合材料",
    "category_3": "颗粒或纤维增强铝基复合材料",
    "description": "铝基复合材料在保持轻质的同时提升刚度、耐磨和热稳定性，适合热管理和结构件。",
    "composition_or_structure": "铝合金基体中加入SiC、Al2O3颗粒或纤维增强体。",
    "key_properties": [
      "轻量化",
      "高刚度",
      "耐磨"
    ],
    "mechanical_properties": [
      "弹性模量提高",
      "耐磨性增强"
    ],
    "thermal_properties": [
      "热膨胀可控",
      "导热性较好"
    ],
    "electrical_properties": [
      "导电性取决于增强体"
    ],
    "advantages": [
      "性能可设计",
      "比刚度高"
    ],
    "limitations": [
      "成形和连接困难",
      "成本较高"
    ],
    "applications": [
      "汽车轻量化",
      "电子封装",
      "航空航天"
    ],
    "processing_methods": [
      "粉末冶金",
      "搅拌铸造",
      "挤压",
      "机加工"
    ],
    "typical_products": [
      "制动盘",
      "散热基板",
      "支架"
    ],
    "related_materials": [
      "铝合金",
      "碳化硅陶瓷",
      "钛基复合材料"
    ],
    "tags": [
      "复合材料",
      "轻量化",
      "导热"
    ],
    "difficulty_level": "进阶",
    "notes": "颗粒体积分数会显著影响加工性和韧性。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "sic_cmc",
    "name_cn": "碳化硅纤维增强陶瓷基复合材料",
    "name_en": "SiC Fiber Reinforced Ceramic Matrix Composite",
    "abbreviation": "SiC/SiC CMC",
    "category_1": "复合材料",
    "category_2": "陶瓷基复合材料",
    "category_3": "连续纤维增强陶瓷基复合材料",
    "description": "SiC/SiC陶瓷基复合材料耐高温、低密度并具备损伤容限，是先进航空发动机热端材料。",
    "composition_or_structure": "碳化硅纤维增强碳化硅陶瓷基体，界面层调控裂纹扩展。",
    "key_properties": [
      "耐高温",
      "轻量化",
      "抗氧化"
    ],
    "mechanical_properties": [
      "损伤容限优于单体陶瓷",
      "高温强度好"
    ],
    "thermal_properties": [
      "高温稳定",
      "热膨胀低"
    ],
    "electrical_properties": [
      "半导体特征或绝缘改性"
    ],
    "advantages": [
      "可替代部分高温合金",
      "减重显著"
    ],
    "limitations": [
      "制备周期长",
      "成本高"
    ],
    "applications": [
      "航空航天",
      "燃气轮机",
      "能源装备"
    ],
    "processing_methods": [
      "CVI",
      "PIP",
      "熔渗",
      "热处理"
    ],
    "typical_products": [
      "燃烧室衬套",
      "涡轮外环",
      "喷管"
    ],
    "related_materials": [
      "镍基高温合金",
      "碳/碳复合材料",
      "碳化硅陶瓷"
    ],
    "tags": [
      "复合材料",
      "耐高温",
      "航空航天"
    ],
    "difficulty_level": "高级",
    "notes": "界面设计是陶瓷基复合材料获得韧性的关键。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "carbon_carbon",
    "name_cn": "碳/碳复合材料",
    "name_en": "Carbon/Carbon Composite",
    "abbreviation": "C/C",
    "category_1": "复合材料",
    "category_2": "陶瓷基复合材料",
    "category_3": "碳纤维增强碳基复合材料",
    "description": "碳/碳复合材料在惰性或防氧化保护环境下耐极高温，常用于刹车盘和航天热防护。",
    "composition_or_structure": "碳纤维增强热解碳或树脂炭基体。",
    "key_properties": [
      "耐极高温",
      "轻量化",
      "耐热冲击"
    ],
    "mechanical_properties": [
      "高温强度保持好",
      "摩擦性能稳定"
    ],
    "thermal_properties": [
      "惰性环境耐超高温",
      "抗氧化需涂层"
    ],
    "electrical_properties": [
      "导电"
    ],
    "advantages": [
      "热冲击性能好",
      "密度低"
    ],
    "limitations": [
      "空气中易氧化",
      "制备成本高"
    ],
    "applications": [
      "航空航天",
      "高温制动",
      "热防护"
    ],
    "processing_methods": [
      "预制体成型",
      "CVI",
      "树脂浸渍炭化",
      "涂层"
    ],
    "typical_products": [
      "飞机刹车盘",
      "鼻锥",
      "坩埚"
    ],
    "related_materials": [
      "碳纤维复合材料",
      "SiC/SiC CMC",
      "石墨"
    ],
    "tags": [
      "复合材料",
      "耐高温",
      "导电"
    ],
    "difficulty_level": "高级",
    "notes": "抗氧化涂层决定其在空气高温中的服役能力。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "honeycomb_sandwich",
    "name_cn": "蜂窝夹层板",
    "name_en": "Honeycomb Sandwich Panel",
    "abbreviation": "",
    "category_1": "复合材料",
    "category_2": "层合板与夹层材料",
    "category_3": "轻质夹层结构",
    "description": "蜂窝夹层板以薄面板和蜂窝芯组合获得高比刚度，是航空、轨道交通和建筑轻量化常用结构。",
    "composition_or_structure": "上下蒙皮承受拉压，蜂窝芯承受剪切并稳定面板。",
    "key_properties": [
      "轻量化",
      "高比刚度",
      "隔热"
    ],
    "mechanical_properties": [
      "弯曲刚度高",
      "抗局部压陷需设计"
    ],
    "thermal_properties": [
      "隔热性好",
      "耐热性取决于芯材和胶黏剂"
    ],
    "electrical_properties": [
      "绝缘或导电取决于面板"
    ],
    "advantages": [
      "减重显著",
      "结构效率高"
    ],
    "limitations": [
      "边缘密封和冲击损伤需关注",
      "维修复杂"
    ],
    "applications": [
      "航空航天",
      "建筑工程",
      "轨道交通"
    ],
    "processing_methods": [
      "胶接",
      "热压",
      "真空袋",
      "二次加工"
    ],
    "typical_products": [
      "舱门",
      "地板",
      "幕墙板"
    ],
    "related_materials": [
      "碳纤维复合材料",
      "芳纶纤维复合材料",
      "泡沫夹层板"
    ],
    "tags": [
      "复合材料",
      "轻量化",
      "结构材料"
    ],
    "difficulty_level": "进阶",
    "notes": "蜂窝芯可使用铝、芳纶纸或热塑性材料。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "silicon",
    "name_cn": "硅",
    "name_en": "Silicon",
    "abbreviation": "Si",
    "category_1": "功能材料",
    "category_2": "半导体材料",
    "category_3": "元素半导体",
    "description": "硅是集成电路和晶硅光伏的基础半导体材料，工艺成熟且资源丰富。",
    "composition_or_structure": "金刚石立方晶体结构的四价元素半导体。",
    "key_properties": [
      "半导体",
      "光伏",
      "工艺成熟"
    ],
    "mechanical_properties": [
      "脆性晶体",
      "可精密加工"
    ],
    "thermal_properties": [
      "热稳定性较好",
      "导热性较好"
    ],
    "electrical_properties": [
      "可通过掺杂调控导电性"
    ],
    "advantages": [
      "产业链成熟",
      "成本低于多数化合物半导体"
    ],
    "limitations": [
      "间接带隙",
      "高频高功率性能有限"
    ],
    "applications": [
      "电子封装",
      "集成电路",
      "光伏能源"
    ],
    "processing_methods": [
      "单晶生长",
      "切片",
      "光刻",
      "掺杂"
    ],
    "typical_products": [
      "晶圆",
      "太阳能电池片",
      "芯片"
    ],
    "related_materials": [
      "锗",
      "砷化镓",
      "晶硅"
    ],
    "tags": [
      "半导体",
      "光伏",
      "电子"
    ],
    "difficulty_level": "基础",
    "notes": "硅工艺平台是理解现代电子工业的核心。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "gallium_arsenide",
    "name_cn": "砷化镓",
    "name_en": "Gallium Arsenide",
    "abbreviation": "GaAs",
    "category_1": "功能材料",
    "category_2": "半导体材料",
    "category_3": "III-V族化合物半导体",
    "description": "砷化镓电子迁移率高且为直接带隙，适合射频、光电和高速器件。",
    "composition_or_structure": "由镓和砷组成的闪锌矿结构化合物半导体。",
    "key_properties": [
      "高迁移率",
      "直接带隙",
      "光电"
    ],
    "mechanical_properties": [
      "晶体脆",
      "可外延生长"
    ],
    "thermal_properties": [
      "耐热性一般",
      "热导率低于硅"
    ],
    "electrical_properties": [
      "掺杂可控",
      "高频性能好"
    ],
    "advantages": [
      "高速和光电性能好",
      "效率高"
    ],
    "limitations": [
      "成本高",
      "砷元素有毒需管理"
    ],
    "applications": [
      "射频器件",
      "光电探测",
      "光伏能源"
    ],
    "processing_methods": [
      "外延生长",
      "光刻",
      "离子注入"
    ],
    "typical_products": [
      "射频芯片",
      "LED",
      "多结太阳电池"
    ],
    "related_materials": [
      "硅",
      "氮化镓",
      "锗"
    ],
    "tags": [
      "半导体",
      "光电",
      "高频"
    ],
    "difficulty_level": "进阶",
    "notes": "GaAs常用于高频通信和空间太阳能电池。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "gallium_nitride",
    "name_cn": "氮化镓",
    "name_en": "Gallium Nitride",
    "abbreviation": "GaN",
    "category_1": "功能材料",
    "category_2": "半导体材料",
    "category_3": "宽禁带半导体",
    "description": "氮化镓宽禁带、高击穿场强，适合功率电子、射频和蓝光LED。",
    "composition_or_structure": "III-V族氮化物半导体，常为纤锌矿结构。",
    "key_properties": [
      "宽禁带",
      "高功率",
      "光电"
    ],
    "mechanical_properties": [
      "晶体脆",
      "外延缺陷需控制"
    ],
    "thermal_properties": [
      "耐高温较好",
      "热管理重要"
    ],
    "electrical_properties": [
      "高击穿场强",
      "高电子迁移率"
    ],
    "advantages": [
      "功率密度高",
      "开关速度快"
    ],
    "limitations": [
      "衬底和外延成本高",
      "可靠性设计复杂"
    ],
    "applications": [
      "电力电子",
      "射频通信",
      "光电器件"
    ],
    "processing_methods": [
      "MOCVD外延",
      "光刻",
      "刻蚀",
      "封装"
    ],
    "typical_products": [
      "快充芯片",
      "射频功放",
      "LED"
    ],
    "related_materials": [
      "硅",
      "碳化硅",
      "砷化镓"
    ],
    "tags": [
      "半导体",
      "导电",
      "高性能"
    ],
    "difficulty_level": "进阶",
    "notes": "GaN器件在高频高效率电源中增长很快。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "silicon_carbide_semiconductor",
    "name_cn": "碳化硅",
    "name_en": "Silicon Carbide",
    "abbreviation": "SiC",
    "category_1": "功能材料",
    "category_2": "半导体材料",
    "category_3": "宽禁带半导体",
    "description": "半导体级碳化硅耐高压、耐高温、低损耗，是新能源汽车和电力电子关键材料。",
    "composition_or_structure": "Si-C强共价键晶体，常用4H-SiC晶型制备功率器件。",
    "key_properties": [
      "宽禁带",
      "耐高温",
      "高击穿"
    ],
    "mechanical_properties": [
      "硬而脆",
      "晶圆加工难"
    ],
    "thermal_properties": [
      "导热性高",
      "高温稳定"
    ],
    "electrical_properties": [
      "可制备高压低损耗器件"
    ],
    "advantages": [
      "效率高",
      "适合高压快充"
    ],
    "limitations": [
      "晶圆成本高",
      "缺陷控制难"
    ],
    "applications": [
      "新能源汽车",
      "电力电子",
      "光伏能源"
    ],
    "processing_methods": [
      "晶体生长",
      "外延",
      "离子注入",
      "封装"
    ],
    "typical_products": [
      "MOSFET",
      "肖特基二极管",
      "功率模块"
    ],
    "related_materials": [
      "氮化镓",
      "硅",
      "碳化硅陶瓷"
    ],
    "tags": [
      "半导体",
      "耐高温",
      "导热"
    ],
    "difficulty_level": "高级",
    "notes": "SiC功率器件能提升逆变器和充电系统效率。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "ferrite",
    "name_cn": "铁氧体",
    "name_en": "Ferrite",
    "abbreviation": "",
    "category_1": "功能材料",
    "category_2": "磁性材料",
    "category_3": "陶瓷磁性材料",
    "description": "铁氧体电阻率高、磁性能稳定，常用于磁芯、天线和电磁干扰抑制。",
    "composition_or_structure": "以铁氧化物为主的尖晶石或六角晶系磁性陶瓷。",
    "key_properties": [
      "磁性",
      "高电阻",
      "低损耗"
    ],
    "mechanical_properties": [
      "陶瓷脆性",
      "可烧结成型"
    ],
    "thermal_properties": [
      "热稳定性中等",
      "居里温度决定上限"
    ],
    "electrical_properties": [
      "电阻率高"
    ],
    "advantages": [
      "高频损耗低",
      "成本低"
    ],
    "limitations": [
      "饱和磁感应较低",
      "脆性大"
    ],
    "applications": [
      "电子封装",
      "电源磁芯",
      "通信"
    ],
    "processing_methods": [
      "粉末制备",
      "压制",
      "烧结",
      "磨削"
    ],
    "typical_products": [
      "磁环",
      "变压器磁芯",
      "滤波器"
    ],
    "related_materials": [
      "钕铁硼",
      "硅钢",
      "坡莫合金"
    ],
    "tags": [
      "磁性",
      "电子",
      "绝缘"
    ],
    "difficulty_level": "基础",
    "notes": "软磁铁氧体和永磁铁氧体用途不同。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "ndfeb",
    "name_cn": "钕铁硼",
    "name_en": "Neodymium Iron Boron Magnet",
    "abbreviation": "NdFeB",
    "category_1": "功能材料",
    "category_2": "磁性材料",
    "category_3": "稀土永磁材料",
    "description": "钕铁硼磁能积高，是电机、硬盘和高性能永磁器件的核心材料。",
    "composition_or_structure": "以Nd2Fe14B主相为基础，并通过晶界相调控矫顽力。",
    "key_properties": [
      "强磁性",
      "高磁能积",
      "高性能"
    ],
    "mechanical_properties": [
      "硬脆",
      "需防腐涂层"
    ],
    "thermal_properties": [
      "耐热等级可设计",
      "高温退磁需控制"
    ],
    "electrical_properties": [
      "导电性一般"
    ],
    "advantages": [
      "磁性能极强",
      "体积小"
    ],
    "limitations": [
      "耐蚀性差",
      "稀土成本波动"
    ],
    "applications": [
      "新能源汽车",
      "风电",
      "电子器件"
    ],
    "processing_methods": [
      "粉末冶金",
      "烧结",
      "取向成型",
      "电镀"
    ],
    "typical_products": [
      "永磁电机",
      "扬声器",
      "传感器"
    ],
    "related_materials": [
      "铁氧体",
      "钐钴磁体",
      "硅钢"
    ],
    "tags": [
      "磁性",
      "高性能",
      "能源"
    ],
    "difficulty_level": "进阶",
    "notes": "重稀土扩散可提高高温矫顽力。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "ito",
    "name_cn": "氧化铟锡",
    "name_en": "Indium Tin Oxide",
    "abbreviation": "ITO",
    "category_1": "功能材料",
    "category_2": "光电材料",
    "category_3": "透明导电氧化物",
    "description": "ITO兼具透明和导电，是触控屏、显示器和光电器件中的典型透明电极材料。",
    "composition_or_structure": "In2O3中掺入Sn形成高载流子浓度透明导电薄膜。",
    "key_properties": [
      "透明导电",
      "光电",
      "薄膜"
    ],
    "mechanical_properties": [
      "薄膜脆性",
      "附着力依工艺控制"
    ],
    "thermal_properties": [
      "热稳定性较好",
      "柔性弯折性有限"
    ],
    "electrical_properties": [
      "导电性好"
    ],
    "advantages": [
      "透明度高",
      "工艺成熟"
    ],
    "limitations": [
      "铟资源稀缺",
      "脆性不适合大弯折"
    ],
    "applications": [
      "显示器",
      "光伏能源",
      "触控屏"
    ],
    "processing_methods": [
      "磁控溅射",
      "蒸镀",
      "退火",
      "图形化"
    ],
    "typical_products": [
      "透明电极",
      "触控膜",
      "OLED阳极"
    ],
    "related_materials": [
      "OLED材料",
      "石墨烯",
      "银纳米线"
    ],
    "tags": [
      "导电",
      "透明",
      "光电"
    ],
    "difficulty_level": "进阶",
    "notes": "柔性电子推动ITO替代材料研究。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "oled_material",
    "name_cn": "OLED材料",
    "name_en": "OLED Materials",
    "abbreviation": "OLED",
    "category_1": "功能材料",
    "category_2": "光电材料",
    "category_3": "有机发光材料",
    "description": "OLED材料可在电场驱动下发光，用于自发光显示和柔性显示器件。",
    "composition_or_structure": "包括空穴传输、发光、电子传输等有机功能层材料。",
    "key_properties": [
      "发光",
      "柔性",
      "光电"
    ],
    "mechanical_properties": [
      "有机薄膜机械柔性好",
      "封装敏感"
    ],
    "thermal_properties": [
      "热稳定性需设计",
      "寿命受环境影响"
    ],
    "electrical_properties": [
      "载流子传输可调"
    ],
    "advantages": [
      "自发光",
      "对比度高",
      "可柔性化"
    ],
    "limitations": [
      "水氧敏感",
      "蓝光寿命挑战"
    ],
    "applications": [
      "显示器",
      "照明",
      "电子封装"
    ],
    "processing_methods": [
      "真空蒸镀",
      "喷墨打印",
      "封装"
    ],
    "typical_products": [
      "手机屏幕",
      "电视面板",
      "柔性显示"
    ],
    "related_materials": [
      "ITO",
      "量子点材料",
      "液晶材料"
    ],
    "tags": [
      "光电",
      "柔性",
      "电子"
    ],
    "difficulty_level": "进阶",
    "notes": "OLED器件性能来自多层材料协同。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "shape_memory_alloy",
    "name_cn": "形状记忆合金",
    "name_en": "Shape Memory Alloy",
    "abbreviation": "SMA",
    "category_1": "功能材料",
    "category_2": "智能材料",
    "category_3": "热弹性马氏体相变材料",
    "description": "形状记忆合金能在温度或应力作用下恢复预设形状，是典型智能材料。",
    "composition_or_structure": "常见NiTi合金通过马氏体和奥氏体可逆相变产生记忆效应。",
    "key_properties": [
      "形状记忆",
      "超弹性",
      "智能响应"
    ],
    "mechanical_properties": [
      "可恢复应变大",
      "疲劳寿命需设计"
    ],
    "thermal_properties": [
      "相变温度可调",
      "热响应速度受尺寸影响"
    ],
    "electrical_properties": [
      "导电性一般"
    ],
    "advantages": [
      "驱动结构简单",
      "生物相容性较好"
    ],
    "limitations": [
      "成本高",
      "控制精度需优化"
    ],
    "applications": [
      "医疗植入",
      "航空航天",
      "微驱动"
    ],
    "processing_methods": [
      "熔炼",
      "热加工",
      "热处理",
      "训练处理"
    ],
    "typical_products": [
      "血管支架",
      "执行器",
      "连接件"
    ],
    "related_materials": [
      "钛合金",
      "压电陶瓷",
      "自修复材料"
    ],
    "tags": [
      "智能材料",
      "医用",
      "航空航天"
    ],
    "difficulty_level": "进阶",
    "notes": "NiTi形状记忆合金在支架和正畸丝中应用成熟。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "piezo_ceramic",
    "name_cn": "压电陶瓷",
    "name_en": "Piezoelectric Ceramic",
    "abbreviation": "PZT",
    "category_1": "功能材料",
    "category_2": "智能材料",
    "category_3": "电-机械耦合陶瓷",
    "description": "压电陶瓷能在机械应力和电场之间转换能量，用于传感、驱动和超声器件。",
    "composition_or_structure": "常见PZT为钙钛矿结构铁电陶瓷，经极化后具备压电效应。",
    "key_properties": [
      "压电",
      "传感",
      "驱动"
    ],
    "mechanical_properties": [
      "陶瓷脆性",
      "位移精度高"
    ],
    "thermal_properties": [
      "居里温度限制使用上限",
      "热稳定需设计"
    ],
    "electrical_properties": [
      "机电耦合强"
    ],
    "advantages": [
      "响应快",
      "精度高"
    ],
    "limitations": [
      "脆性大",
      "含铅体系环保压力"
    ],
    "applications": [
      "传感器",
      "医疗超声",
      "精密驱动"
    ],
    "processing_methods": [
      "粉体合成",
      "烧结",
      "极化",
      "电极制备"
    ],
    "typical_products": [
      "超声换能器",
      "蜂鸣片",
      "压电执行器"
    ],
    "related_materials": [
      "形状记忆合金",
      "铁电材料",
      "氧化锆陶瓷"
    ],
    "tags": [
      "智能材料",
      "传感",
      "电子"
    ],
    "difficulty_level": "进阶",
    "notes": "无铅压电陶瓷是重要研究方向。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "lifepo4",
    "name_cn": "磷酸铁锂",
    "name_en": "Lithium Iron Phosphate",
    "abbreviation": "LFP",
    "category_1": "新能源材料",
    "category_2": "锂电池材料",
    "category_3": "橄榄石型正极材料",
    "description": "磷酸铁锂安全性高、循环寿命长，是动力电池和储能系统的重要正极材料。",
    "composition_or_structure": "橄榄石结构LiFePO4，通过碳包覆和纳米化改善导电性。",
    "key_properties": [
      "储能",
      "安全",
      "长寿命"
    ],
    "mechanical_properties": [
      "粉体材料需电极粘结成型",
      "结构稳定"
    ],
    "thermal_properties": [
      "热稳定性好",
      "热失控风险较低"
    ],
    "electrical_properties": [
      "本征导电性较低需改性"
    ],
    "advantages": [
      "安全性高",
      "成本较低",
      "寿命长"
    ],
    "limitations": [
      "能量密度低于高镍三元",
      "低温性能需优化"
    ],
    "applications": [
      "锂电池",
      "储能电站",
      "电动汽车"
    ],
    "processing_methods": [
      "固相合成",
      "碳包覆",
      "电极涂布",
      "辊压"
    ],
    "typical_products": [
      "动力电池正极",
      "储能电芯",
      "电池包"
    ],
    "related_materials": [
      "三元正极材料",
      "石墨负极",
      "电解液"
    ],
    "tags": [
      "储能",
      "锂电池",
      "安全"
    ],
    "difficulty_level": "基础",
    "notes": "LFP凭借安全和成本优势在储能场景占比高。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "ncm",
    "name_cn": "三元正极材料",
    "name_en": "Nickel Cobalt Manganese Cathode",
    "abbreviation": "NCM",
    "category_1": "新能源材料",
    "category_2": "锂电池材料",
    "category_3": "层状氧化物正极材料",
    "description": "三元正极材料能量密度高，是高续航动力电池的重要正极体系。",
    "composition_or_structure": "镍、钴、锰层状过渡金属氧化物，锂离子在层间嵌脱。",
    "key_properties": [
      "高能量密度",
      "储能",
      "锂电池"
    ],
    "mechanical_properties": [
      "粉体需制成复合电极",
      "颗粒强度影响加工"
    ],
    "thermal_properties": [
      "热稳定性随镍含量降低",
      "高温存储需控制"
    ],
    "electrical_properties": [
      "电子和离子传输需导电剂与电解液配合"
    ],
    "advantages": [
      "能量密度高",
      "倍率性能可设计"
    ],
    "limitations": [
      "成本和安全性压力",
      "钴资源问题"
    ],
    "applications": [
      "锂电池",
      "电动汽车",
      "消费电子"
    ],
    "processing_methods": [
      "共沉淀",
      "高温烧结",
      "包覆改性",
      "电极涂布"
    ],
    "typical_products": [
      "动力电池正极",
      "圆柱电芯",
      "软包电芯"
    ],
    "related_materials": [
      "磷酸铁锂",
      "石墨负极",
      "电解液"
    ],
    "tags": [
      "储能",
      "高性能",
      "锂电池"
    ],
    "difficulty_level": "进阶",
    "notes": "高镍三元提高容量但对热稳定和界面控制要求更高。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "graphite_anode",
    "name_cn": "石墨负极",
    "name_en": "Graphite Anode",
    "abbreviation": "",
    "category_1": "新能源材料",
    "category_2": "锂电池材料",
    "category_3": "层状碳负极材料",
    "description": "石墨负极是当前锂离子电池最成熟的负极材料，循环稳定且成本较低。",
    "composition_or_structure": "锂离子可在石墨层间嵌入形成LiC6结构。",
    "key_properties": [
      "储能",
      "导电",
      "成熟"
    ],
    "mechanical_properties": [
      "颗粒电极需粘结",
      "压实密度高"
    ],
    "thermal_properties": [
      "热稳定需与电解液界面配合",
      "低温充电需控制析锂"
    ],
    "electrical_properties": [
      "导电性好"
    ],
    "advantages": [
      "技术成熟",
      "成本低",
      "循环稳定"
    ],
    "limitations": [
      "理论容量有限",
      "快充受限"
    ],
    "applications": [
      "锂电池",
      "消费电子",
      "电动汽车"
    ],
    "processing_methods": [
      "球形化",
      "包覆",
      "电极涂布",
      "辊压"
    ],
    "typical_products": [
      "负极片",
      "电芯",
      "储能电池"
    ],
    "related_materials": [
      "硅碳负极",
      "电解液",
      "隔膜"
    ],
    "tags": [
      "储能",
      "导电",
      "锂电池"
    ],
    "difficulty_level": "基础",
    "notes": "SEI膜稳定性对石墨负极寿命很关键。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "silicon_carbon_anode",
    "name_cn": "硅碳负极",
    "name_en": "Silicon-Carbon Anode",
    "abbreviation": "Si/C",
    "category_1": "新能源材料",
    "category_2": "锂电池材料",
    "category_3": "高容量复合负极材料",
    "description": "硅碳负极利用硅的高容量提升电池能量密度，是下一代负极的重要方向。",
    "composition_or_structure": "纳米硅、氧化亚硅或硅颗粒与碳材料复合缓冲体积膨胀。",
    "key_properties": [
      "高容量",
      "储能",
      "锂电池"
    ],
    "mechanical_properties": [
      "体积膨胀大",
      "颗粒结构需稳定"
    ],
    "thermal_properties": [
      "界面热稳定需优化",
      "循环中膨胀收缩明显"
    ],
    "electrical_properties": [
      "碳相提升导电性"
    ],
    "advantages": [
      "容量高",
      "可与石墨混用"
    ],
    "limitations": [
      "循环膨胀",
      "首效和工艺挑战"
    ],
    "applications": [
      "锂电池",
      "电动汽车",
      "快充电池"
    ],
    "processing_methods": [
      "纳米化",
      "碳包覆",
      "复合造粒",
      "电极涂布"
    ],
    "typical_products": [
      "高能量密度负极",
      "圆柱电芯",
      "软包电芯"
    ],
    "related_materials": [
      "石墨负极",
      "碳纳米管",
      "电解液"
    ],
    "tags": [
      "储能",
      "高容量",
      "纳米"
    ],
    "difficulty_level": "进阶",
    "notes": "粘结剂和电解液添加剂对硅碳负极循环很重要。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "battery_electrolyte",
    "name_cn": "锂电池电解液",
    "name_en": "Lithium Battery Electrolyte",
    "abbreviation": "",
    "category_1": "新能源材料",
    "category_2": "锂电池材料",
    "category_3": "离子传导液态材料",
    "description": "锂电池电解液负责锂离子传输并参与界面膜形成，决定安全、倍率和寿命表现。",
    "composition_or_structure": "通常由锂盐、有机碳酸酯溶剂和功能添加剂组成。",
    "key_properties": [
      "离子传导",
      "储能",
      "界面调控"
    ],
    "mechanical_properties": [
      "液体材料无承载功能",
      "润湿性影响电极"
    ],
    "thermal_properties": [
      "热稳定性和阻燃性需设计",
      "低温黏度影响倍率"
    ],
    "electrical_properties": [
      "离子导电，电子绝缘"
    ],
    "advantages": [
      "传导效率高",
      "配方可调"
    ],
    "limitations": [
      "可燃性",
      "水敏感"
    ],
    "applications": [
      "锂电池",
      "储能电站",
      "消费电子"
    ],
    "processing_methods": [
      "配液",
      "纯化",
      "注液",
      "化成"
    ],
    "typical_products": [
      "电芯电解液",
      "添加剂体系",
      "凝胶电解质"
    ],
    "related_materials": [
      "磷酸铁锂",
      "三元正极材料",
      "隔膜"
    ],
    "tags": [
      "储能",
      "锂电池",
      "绝缘"
    ],
    "difficulty_level": "进阶",
    "notes": "添加剂通过形成稳定SEI/CEI提升循环寿命。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "battery_separator",
    "name_cn": "锂电池隔膜",
    "name_en": "Battery Separator",
    "abbreviation": "",
    "category_1": "新能源材料",
    "category_2": "锂电池材料",
    "category_3": "多孔聚烯烃膜",
    "description": "锂电池隔膜隔离正负极并允许锂离子通过，是电池安全的关键材料。",
    "composition_or_structure": "多为PE、PP或复合多孔膜，可进行陶瓷涂覆。",
    "key_properties": [
      "绝缘",
      "多孔",
      "安全"
    ],
    "mechanical_properties": [
      "抗穿刺需满足装配",
      "拉伸强度影响卷绕"
    ],
    "thermal_properties": [
      "热收缩需控制",
      "闭孔温度影响安全"
    ],
    "electrical_properties": [
      "电子绝缘，离子可通过电解液迁移"
    ],
    "advantages": [
      "厚度薄",
      "安全功能明确"
    ],
    "limitations": [
      "热稳定和润湿性需改性",
      "孔结构控制要求高"
    ],
    "applications": [
      "锂电池",
      "储能电站",
      "电动汽车"
    ],
    "processing_methods": [
      "干法拉伸",
      "湿法萃取",
      "陶瓷涂覆",
      "分切"
    ],
    "typical_products": [
      "电池隔膜",
      "陶瓷涂覆膜",
      "复合隔膜"
    ],
    "related_materials": [
      "电解液",
      "PP",
      "PE"
    ],
    "tags": [
      "储能",
      "绝缘",
      "锂电池"
    ],
    "difficulty_level": "基础",
    "notes": "陶瓷涂覆可提升隔膜热稳定性和润湿性。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "perovskite_solar",
    "name_cn": "钙钛矿光伏材料",
    "name_en": "Perovskite Solar Material",
    "abbreviation": "",
    "category_1": "新能源材料",
    "category_2": "光伏材料",
    "category_3": "钙钛矿结构吸光材料",
    "description": "钙钛矿光伏材料吸光强、可低温制备，是新一代高效率太阳能电池研究热点。",
    "composition_or_structure": "常见为ABX3结构有机-无机卤化物钙钛矿。",
    "key_properties": [
      "光伏",
      "高吸光",
      "低温制备"
    ],
    "mechanical_properties": [
      "薄膜脆弱需封装",
      "柔性基底可用"
    ],
    "thermal_properties": [
      "热湿稳定性挑战",
      "离子迁移需控制"
    ],
    "electrical_properties": [
      "光生载流子输运好"
    ],
    "advantages": [
      "效率提升快",
      "制备能耗低"
    ],
    "limitations": [
      "长期稳定性不足",
      "铅环境问题"
    ],
    "applications": [
      "光伏能源",
      "建筑光伏",
      "光电探测"
    ],
    "processing_methods": [
      "旋涂",
      "刮涂",
      "蒸镀",
      "封装"
    ],
    "typical_products": [
      "太阳能电池",
      "叠层电池",
      "光探测器"
    ],
    "related_materials": [
      "晶硅",
      "ITO",
      "量子点材料"
    ],
    "tags": [
      "光伏",
      "新能源",
      "光电"
    ],
    "difficulty_level": "进阶",
    "notes": "钙钛矿/晶硅叠层电池是重要产业化方向。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "crystalline_silicon_pv",
    "name_cn": "晶硅",
    "name_en": "Crystalline Silicon",
    "abbreviation": "c-Si",
    "category_1": "新能源材料",
    "category_2": "光伏材料",
    "category_3": "晶体硅光伏材料",
    "description": "晶硅是当前光伏产业主流材料，可靠性高、工艺成熟、规模化能力强。",
    "composition_or_structure": "单晶或多晶硅片经掺杂、制绒和钝化形成光伏电池结构。",
    "key_properties": [
      "光伏",
      "成熟",
      "稳定"
    ],
    "mechanical_properties": [
      "晶片脆性",
      "可切片加工"
    ],
    "thermal_properties": [
      "热稳定性好",
      "温度升高效率下降"
    ],
    "electrical_properties": [
      "半导体导电性可调"
    ],
    "advantages": [
      "产业成熟",
      "寿命长"
    ],
    "limitations": [
      "理论效率受限",
      "制片能耗较高"
    ],
    "applications": [
      "光伏能源",
      "建筑光伏",
      "电站"
    ],
    "processing_methods": [
      "拉晶",
      "切片",
      "制绒",
      "扩散",
      "丝网印刷"
    ],
    "typical_products": [
      "太阳能电池片",
      "光伏组件",
      "硅片"
    ],
    "related_materials": [
      "硅",
      "钙钛矿材料",
      "ITO"
    ],
    "tags": [
      "光伏",
      "半导体",
      "新能源"
    ],
    "difficulty_level": "基础",
    "notes": "PERC、TOPCon和HJT是常见晶硅电池技术路线。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "activated_carbon",
    "name_cn": "活性炭",
    "name_en": "Activated Carbon",
    "abbreviation": "",
    "category_1": "新能源材料",
    "category_2": "超级电容材料",
    "category_3": "高比表面积碳材料",
    "description": "活性炭孔隙发达、比表面积高，是双电层超级电容器最常用电极材料。",
    "composition_or_structure": "无定形碳中含丰富微孔和介孔结构。",
    "key_properties": [
      "高比表面积",
      "储能",
      "导电"
    ],
    "mechanical_properties": [
      "粉体需电极成型",
      "压实密度需平衡孔隙"
    ],
    "thermal_properties": [
      "热稳定性较好",
      "表面官能团影响稳定"
    ],
    "electrical_properties": [
      "导电性需导电剂配合"
    ],
    "advantages": [
      "成本低",
      "孔结构可调"
    ],
    "limitations": [
      "能量密度有限",
      "孔径匹配需优化"
    ],
    "applications": [
      "超级电容",
      "吸附",
      "储能"
    ],
    "processing_methods": [
      "炭化",
      "活化",
      "造粒",
      "电极涂布"
    ],
    "typical_products": [
      "超级电容电极",
      "吸附剂",
      "滤芯"
    ],
    "related_materials": [
      "石墨烯",
      "碳纳米管",
      "赝电容材料"
    ],
    "tags": [
      "储能",
      "碳材料",
      "多孔"
    ],
    "difficulty_level": "基础",
    "notes": "电解液离子尺寸与孔径匹配影响电容性能。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "medical_titanium_alloy",
    "name_cn": "医用钛合金",
    "name_en": "Medical Titanium Alloy",
    "abbreviation": "Ti-6Al-4V ELI",
    "category_1": "生物医用材料",
    "category_2": "金属生物材料",
    "category_3": "植入级钛合金",
    "description": "医用钛合金强度高、耐腐蚀、生物相容性好，是骨科和牙科植入物常用金属材料。",
    "composition_or_structure": "以钛为基体，植入级牌号控制杂质并优化α+β组织。",
    "key_properties": [
      "医用",
      "耐腐蚀",
      "高比强度"
    ],
    "mechanical_properties": [
      "疲劳强度好",
      "弹性模量低于不锈钢"
    ],
    "thermal_properties": [
      "体内环境稳定",
      "导热性较低"
    ],
    "electrical_properties": [
      "导电性一般"
    ],
    "advantages": [
      "生物相容性好",
      "轻质高强"
    ],
    "limitations": [
      "弹性模量仍高于骨",
      "成本较高"
    ],
    "applications": [
      "医疗植入",
      "骨科",
      "牙科"
    ],
    "processing_methods": [
      "锻造",
      "机加工",
      "表面处理",
      "3D打印"
    ],
    "typical_products": [
      "人工关节柄",
      "接骨板",
      "牙种植体"
    ],
    "related_materials": [
      "钛合金",
      "PEEK",
      "羟基磷灰石"
    ],
    "tags": [
      "医用",
      "耐腐蚀",
      "3D打印"
    ],
    "difficulty_level": "进阶",
    "notes": "多孔钛结构有利于骨长入和弹性模量匹配。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "cobalt_chromium_alloy",
    "name_cn": "钴铬合金",
    "name_en": "Cobalt Chromium Alloy",
    "abbreviation": "CoCr",
    "category_1": "生物医用材料",
    "category_2": "金属生物材料",
    "category_3": "耐磨植入金属",
    "description": "钴铬合金耐磨、耐腐蚀、强度高，常用于人工关节和牙科修复。",
    "composition_or_structure": "钴基合金中加入铬、钼等元素形成钝化膜并提升强度。",
    "key_properties": [
      "医用",
      "耐磨",
      "耐腐蚀"
    ],
    "mechanical_properties": [
      "强度高",
      "耐磨性好"
    ],
    "thermal_properties": [
      "热稳定性好",
      "导热性一般"
    ],
    "electrical_properties": [
      "导电性一般"
    ],
    "advantages": [
      "磨损寿命长",
      "耐蚀性好"
    ],
    "limitations": [
      "密度高",
      "加工难度较高"
    ],
    "applications": [
      "医疗植入",
      "牙科",
      "关节置换"
    ],
    "processing_methods": [
      "铸造",
      "锻造",
      "机加工",
      "3D打印"
    ],
    "typical_products": [
      "股骨头",
      "牙冠支架",
      "支架"
    ],
    "related_materials": [
      "医用钛合金",
      "不锈钢",
      "氧化锆陶瓷"
    ],
    "tags": [
      "医用",
      "耐磨",
      "高强度"
    ],
    "difficulty_level": "进阶",
    "notes": "钴铬钼合金在金属关节摩擦副中较常见。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "medical_peek",
    "name_cn": "医用PEEK",
    "name_en": "Medical PEEK",
    "abbreviation": "PEEK",
    "category_1": "生物医用材料",
    "category_2": "高分子生物材料",
    "category_3": "植入级高性能聚合物",
    "description": "医用PEEK生物相容性好、耐辐照、弹性模量接近骨，是脊柱和骨科植入物材料。",
    "composition_or_structure": "聚醚醚酮经医用级纯化和质量控制，可进行碳纤维或羟基磷灰石改性。",
    "key_properties": [
      "医用",
      "耐高温",
      "可灭菌"
    ],
    "mechanical_properties": [
      "强度较高",
      "弹性模量接近骨"
    ],
    "thermal_properties": [
      "耐高温灭菌",
      "热稳定性好"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "影像伪影少",
      "质量轻"
    ],
    "limitations": [
      "骨整合性需表面改性",
      "价格高"
    ],
    "applications": [
      "医疗植入",
      "脊柱修复",
      "骨科"
    ],
    "processing_methods": [
      "注塑",
      "机加工",
      "3D打印",
      "表面改性"
    ],
    "typical_products": [
      "椎间融合器",
      "颅骨修补板",
      "骨钉"
    ],
    "related_materials": [
      "PEEK",
      "医用钛合金",
      "羟基磷灰石"
    ],
    "tags": [
      "医用",
      "高性能",
      "3D打印"
    ],
    "difficulty_level": "进阶",
    "notes": "PEEK表面惰性较强，常需涂层或多孔化改善骨结合。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "pla",
    "name_cn": "聚乳酸",
    "name_en": "Polylactic Acid",
    "abbreviation": "PLA",
    "category_1": "生物医用材料",
    "category_2": "可降解材料",
    "category_3": "脂肪族聚酯",
    "description": "聚乳酸来源可再生、可降解，常用于可吸收医疗器械、包装和3D打印。",
    "composition_or_structure": "由乳酸或丙交酯聚合形成，水解后逐步降解。",
    "key_properties": [
      "可降解",
      "生物基",
      "3D打印"
    ],
    "mechanical_properties": [
      "刚性较好",
      "韧性偏低"
    ],
    "thermal_properties": [
      "耐热性较低",
      "玻璃化温度附近易变形"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "来源可再生",
      "打印友好"
    ],
    "limitations": [
      "耐热和韧性不足",
      "降解速率需设计"
    ],
    "applications": [
      "医疗器械",
      "3D打印",
      "包装"
    ],
    "processing_methods": [
      "挤出",
      "注塑",
      "纺丝",
      "FDM打印"
    ],
    "typical_products": [
      "可吸收螺钉",
      "打印丝材",
      "包装杯"
    ],
    "related_materials": [
      "PCL",
      "PLGA",
      "PET"
    ],
    "tags": [
      "可降解",
      "医用",
      "3D打印"
    ],
    "difficulty_level": "基础",
    "notes": "PLA在体内降解产物为乳酸，但力学保持时间有限。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "hydroxyapatite",
    "name_cn": "羟基磷灰石",
    "name_en": "Hydroxyapatite",
    "abbreviation": "HA",
    "category_1": "生物医用材料",
    "category_2": "生物陶瓷",
    "category_3": "钙磷生物活性陶瓷",
    "description": "羟基磷灰石成分接近骨矿物，具有良好骨传导性，常用于骨修复和植入物涂层。",
    "composition_or_structure": "化学式Ca10(PO4)6(OH)2，是骨和牙齿无机相的主要类似物。",
    "key_properties": [
      "生物活性",
      "骨传导",
      "医用"
    ],
    "mechanical_properties": [
      "脆性大",
      "承载能力有限"
    ],
    "thermal_properties": [
      "耐高温烧结",
      "体内稳定性较好"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "骨相容性好",
      "可促进骨结合"
    ],
    "limitations": [
      "韧性低",
      "单独承载受限"
    ],
    "applications": [
      "医疗植入",
      "骨修复",
      "涂层"
    ],
    "processing_methods": [
      "沉淀合成",
      "烧结",
      "等离子喷涂",
      "3D打印"
    ],
    "typical_products": [
      "骨填充颗粒",
      "钛合金涂层",
      "支架"
    ],
    "related_materials": [
      "生物玻璃",
      "医用钛合金",
      "氧化锆陶瓷"
    ],
    "tags": [
      "医用",
      "陶瓷",
      "生物活性"
    ],
    "difficulty_level": "进阶",
    "notes": "HA常作为金属植入物表面涂层改善骨结合。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "bioglass",
    "name_cn": "生物玻璃",
    "name_en": "Bioglass",
    "abbreviation": "",
    "category_1": "生物医用材料",
    "category_2": "生物陶瓷",
    "category_3": "硅酸盐生物活性玻璃",
    "description": "生物玻璃可与骨组织形成化学结合，适用于骨修复、牙科和组织工程。",
    "composition_or_structure": "典型体系含SiO2、CaO、Na2O、P2O5等组分。",
    "key_properties": [
      "生物活性",
      "骨结合",
      "医用"
    ],
    "mechanical_properties": [
      "脆性大",
      "可制成颗粒或支架"
    ],
    "thermal_properties": [
      "热处理可结晶化",
      "降解速率可调"
    ],
    "electrical_properties": [
      "绝缘性好"
    ],
    "advantages": [
      "可诱导类骨磷灰石层",
      "组成可调"
    ],
    "limitations": [
      "承载能力有限",
      "加工窗口需控制"
    ],
    "applications": [
      "骨修复",
      "牙科",
      "组织工程"
    ],
    "processing_methods": [
      "熔融淬冷",
      "溶胶凝胶",
      "烧结",
      "3D打印"
    ],
    "typical_products": [
      "骨修复颗粒",
      "支架",
      "牙科材料"
    ],
    "related_materials": [
      "羟基磷灰石",
      "氧化锆陶瓷",
      "PLA"
    ],
    "tags": [
      "医用",
      "生物活性",
      "陶瓷"
    ],
    "difficulty_level": "进阶",
    "notes": "45S5生物玻璃是经典组成。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "biodegradable_magnesium_alloy",
    "name_cn": "可降解镁合金",
    "name_en": "Biodegradable Magnesium Alloy",
    "abbreviation": "Mg",
    "category_1": "生物医用材料",
    "category_2": "可降解材料",
    "category_3": "可吸收金属材料",
    "description": "可降解镁合金在体内逐步腐蚀吸收，适用于临时支撑和骨固定器械。",
    "composition_or_structure": "镁基合金通过锌、钙、稀土等元素调控力学和降解行为。",
    "key_properties": [
      "可降解",
      "医用",
      "轻量化"
    ],
    "mechanical_properties": [
      "初始强度较高",
      "弹性模量接近骨"
    ],
    "thermal_properties": [
      "体内腐蚀放热小",
      "降解速率需控制"
    ],
    "electrical_properties": [
      "导电性较好"
    ],
    "advantages": [
      "避免二次取出",
      "力学匹配较好"
    ],
    "limitations": [
      "腐蚀过快风险",
      "氢气析出需控制"
    ],
    "applications": [
      "骨科",
      "血管支架",
      "医疗植入"
    ],
    "processing_methods": [
      "铸造",
      "挤压",
      "表面涂层",
      "机加工"
    ],
    "typical_products": [
      "骨钉",
      "骨板",
      "可降解支架"
    ],
    "related_materials": [
      "镁合金",
      "PLA",
      "PLGA"
    ],
    "tags": [
      "可降解",
      "医用",
      "金属"
    ],
    "difficulty_level": "高级",
    "notes": "表面涂层和合金设计是控制降解速率的核心。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "graphene",
    "name_cn": "石墨烯",
    "name_en": "Graphene",
    "abbreviation": "",
    "category_1": "纳米材料",
    "category_2": "碳基纳米材料",
    "category_3": "二维碳纳米材料",
    "description": "石墨烯由单层碳原子构成，导电、导热和力学性能突出，是纳米材料代表。",
    "composition_or_structure": "碳原子以sp2杂化形成二维蜂窝晶格。",
    "key_properties": [
      "导电",
      "导热",
      "高比表面积"
    ],
    "mechanical_properties": [
      "理论强度高",
      "片层易团聚"
    ],
    "thermal_properties": [
      "导热性优异",
      "热稳定性好"
    ],
    "electrical_properties": [
      "导电性优异"
    ],
    "advantages": [
      "性能潜力高",
      "可用于多种复合材料"
    ],
    "limitations": [
      "规模化一致性难",
      "分散和界面控制难"
    ],
    "applications": [
      "超级电容",
      "复合材料",
      "传感器"
    ],
    "processing_methods": [
      "机械剥离",
      "氧化还原",
      "CVD",
      "分散复合"
    ],
    "typical_products": [
      "导电膜",
      "复合填料",
      "电极材料"
    ],
    "related_materials": [
      "碳纳米管",
      "活性炭",
      "ITO"
    ],
    "tags": [
      "纳米",
      "导电",
      "储能"
    ],
    "difficulty_level": "进阶",
    "notes": "石墨烯应用常受制于规模化制备和分散稳定性。",
    "aliases": [
      "graphene",
      "石墨烯材料",
      "二维碳材料"
    ],
    "images": {
      "macro": [
        {
          "src": "assets/materials/graphene/macro.jpg",
          "alt": "石墨烯粉体、薄膜或分散液外观宏观照片",
          "caption": "石墨烯粉体、薄膜或分散液外观"
        }
      ],
      "micro": [
        {
          "src": "assets/materials/graphene/micro.jpg",
          "alt": "石墨烯片层、褶皱和堆叠结构微观结构照片",
          "caption": "石墨烯片层、褶皱和堆叠结构"
        }
      ]
    }
  },
  {
    "id": "carbon_nanotube",
    "name_cn": "碳纳米管",
    "name_en": "Carbon Nanotube",
    "abbreviation": "CNT",
    "category_1": "纳米材料",
    "category_2": "碳基纳米材料",
    "category_3": "一维碳纳米材料",
    "description": "碳纳米管具有高长径比、良好导电和增强效果，常用于导电网络和复合增强。",
    "composition_or_structure": "石墨烯片卷曲形成单壁或多壁管状结构。",
    "key_properties": [
      "导电",
      "高强度",
      "纳米增强"
    ],
    "mechanical_properties": [
      "拉伸强度潜力高",
      "分散影响增强效果"
    ],
    "thermal_properties": [
      "导热性好",
      "耐热性较好"
    ],
    "electrical_properties": [
      "导电性可为金属性或半导体性"
    ],
    "advantages": [
      "低添加量形成导电网络",
      "增强效率高"
    ],
    "limitations": [
      "团聚难分散",
      "纯度和成本问题"
    ],
    "applications": [
      "储能",
      "导电复合材料",
      "传感器"
    ],
    "processing_methods": [
      "CVD",
      "纯化",
      "表面改性",
      "复合分散"
    ],
    "typical_products": [
      "导电浆料",
      "增强塑料",
      "电极添加剂"
    ],
    "related_materials": [
      "石墨烯",
      "纳米复合材料",
      "硅碳负极"
    ],
    "tags": [
      "纳米",
      "导电",
      "复合材料"
    ],
    "difficulty_level": "进阶",
    "notes": "表面功能化可改善CNT与聚合物基体界面结合。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "nano_silver",
    "name_cn": "纳米银",
    "name_en": "Nano Silver",
    "abbreviation": "AgNP",
    "category_1": "纳米材料",
    "category_2": "纳米金属材料",
    "category_3": "贵金属纳米颗粒",
    "description": "纳米银具有抗菌、导电和表面等离子体特性，常用于抗菌材料和导电油墨。",
    "composition_or_structure": "银颗粒尺寸处于纳米尺度，比表面积高且表面活性强。",
    "key_properties": [
      "抗菌",
      "导电",
      "纳米"
    ],
    "mechanical_properties": [
      "颗粒无承载功能",
      "需载体固定"
    ],
    "thermal_properties": [
      "烧结温度可降低",
      "热稳定取决于包覆"
    ],
    "electrical_properties": [
      "导电性好"
    ],
    "advantages": [
      "抗菌效率高",
      "低温导电连接潜力"
    ],
    "limitations": [
      "成本较高",
      "环境和生物安全需评估"
    ],
    "applications": [
      "医疗器械",
      "电子封装",
      "抗菌涂层"
    ],
    "processing_methods": [
      "化学还原",
      "分散",
      "喷墨打印",
      "低温烧结"
    ],
    "typical_products": [
      "抗菌敷料",
      "导电墨水",
      "涂层"
    ],
    "related_materials": [
      "纳米铜",
      "ITO",
      "石墨烯"
    ],
    "tags": [
      "纳米",
      "导电",
      "医用"
    ],
    "difficulty_level": "进阶",
    "notes": "粒径、形貌和表面配体决定纳米银性能。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "nano_titanium_dioxide",
    "name_cn": "纳米二氧化钛",
    "name_en": "Nano Titanium Dioxide",
    "abbreviation": "TiO2",
    "category_1": "纳米材料",
    "category_2": "纳米氧化物",
    "category_3": "光催化纳米氧化物",
    "description": "纳米二氧化钛具有光催化、紫外屏蔽和高折射率特性，常用于涂层、环保和防晒材料。",
    "composition_or_structure": "TiO2纳米颗粒常见锐钛矿和金红石晶型。",
    "key_properties": [
      "光催化",
      "紫外屏蔽",
      "纳米"
    ],
    "mechanical_properties": [
      "颗粒填料需分散",
      "可提升涂层硬度"
    ],
    "thermal_properties": [
      "热稳定性好",
      "晶型转变影响性能"
    ],
    "electrical_properties": [
      "绝缘或半导体特征"
    ],
    "advantages": [
      "化学稳定",
      "成本适中"
    ],
    "limitations": [
      "可见光响应弱",
      "团聚影响透明性"
    ],
    "applications": [
      "涂层",
      "环保净化",
      "防晒"
    ],
    "processing_methods": [
      "溶胶凝胶",
      "水热合成",
      "表面改性",
      "涂覆"
    ],
    "typical_products": [
      "自清洁涂层",
      "防晒剂",
      "光催化膜"
    ],
    "related_materials": [
      "纳米氧化锌",
      "纳米氧化铝",
      "钙钛矿材料"
    ],
    "tags": [
      "纳米",
      "光电",
      "涂层"
    ],
    "difficulty_level": "基础",
    "notes": "晶型和粒径决定其光催化与屏蔽能力。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "id": "polymer_nanocomposite",
    "name_cn": "聚合物纳米复合材料",
    "name_en": "Polymer Nanocomposite",
    "abbreviation": "",
    "category_1": "纳米材料",
    "category_2": "纳米复合材料",
    "category_3": "纳米填料增强聚合物",
    "description": "聚合物纳米复合材料通过少量纳米填料提升力学、阻隔、导电或阻燃性能。",
    "composition_or_structure": "聚合物基体中分散纳米黏土、石墨烯、CNT或纳米氧化物等填料。",
    "key_properties": [
      "纳米增强",
      "性能可设计",
      "轻量化"
    ],
    "mechanical_properties": [
      "强度和模量可提升",
      "韧性取决于界面"
    ],
    "thermal_properties": [
      "热稳定和阻燃可改善",
      "热膨胀可降低"
    ],
    "electrical_properties": [
      "可设计为绝缘或导电"
    ],
    "advantages": [
      "低添加量改善性能",
      "适合多种基体"
    ],
    "limitations": [
      "分散难",
      "界面相容性要求高"
    ],
    "applications": [
      "汽车轻量化",
      "包装",
      "电子封装"
    ],
    "processing_methods": [
      "熔融共混",
      "溶液共混",
      "原位聚合",
      "挤出"
    ],
    "typical_products": [
      "阻隔薄膜",
      "导电塑料",
      "增强外壳"
    ],
    "related_materials": [
      "石墨烯",
      "碳纳米管",
      "PP"
    ],
    "tags": [
      "纳米",
      "复合材料",
      "轻量化"
    ],
    "difficulty_level": "进阶",
    "notes": "纳米填料分散状态往往比添加量更关键。",
    "aliases": [],
    "images": {
      "macro": [],
      "micro": []
    }
  },
  {
    "abbreviation": "",
    "aliases": [
      "木头",
      "木料",
      "原木",
      "板材",
      "木板",
      "木质材料",
      "timber",
      "wood",
      "lumber",
      "天然材料"
    ],
    "images": {
      "macro": [
        {
          "src": "assets/materials/wood/macro.jpg",
          "alt": "木材的宏观纹理与年轮结构宏观照片",
          "caption": "木材的宏观纹理与年轮结构"
        }
      ],
      "micro": [
        {
          "src": "assets/materials/wood/micro.jpg",
          "alt": "木材细胞壁、导管和纤维组织的显微结构微观结构照片",
          "caption": "木材细胞壁、导管和纤维组织的显微结构"
        }
      ]
    },
    "id": "wood",
    "name_cn": "木材",
    "name_en": "Wood / Timber",
    "category_1": "传统与天然材料",
    "category_2": "植物基天然材料",
    "category_3": "木质纤维素天然复合材料",
    "description": "木材是由树木形成的天然多孔材料，具有纹理美观、可加工、可再生和良好比强度，是建筑、家具和日用品中最常见的材料之一。",
    "composition_or_structure": "由纤维素、半纤维素和木质素构成，宏观上有年轮、心材和边材，微观上包含导管、管胞、木纤维和射线组织。",
    "key_properties": [
      "天然材料",
      "可再生",
      "易加工"
    ],
    "mechanical_properties": [
      "顺纹强度较高",
      "横纹强度较低",
      "各向异性明显"
    ],
    "thermal_properties": [
      "导热系数低",
      "可燃",
      "吸湿会影响尺寸稳定"
    ],
    "electrical_properties": [
      "干燥状态绝缘性较好",
      "含水率升高后电阻下降"
    ],
    "advantages": [
      "纹理自然",
      "质量轻",
      "加工方便",
      "碳储存能力好"
    ],
    "limitations": [
      "易燃",
      "易吸湿变形",
      "易受虫蛀和腐朽影响"
    ],
    "applications": [
      "建筑工程",
      "家具",
      "室内装饰",
      "包装",
      "乐器"
    ],
    "processing_methods": [
      "锯切",
      "干燥",
      "刨削",
      "胶合",
      "表面涂装"
    ],
    "typical_products": [
      "原木",
      "板材",
      "地板",
      "家具",
      "木梁"
    ],
    "related_materials": [
      "竹材",
      "胶合板",
      "中密度纤维板 MDF",
      "纸张"
    ],
    "tags": [
      "木材",
      "木头",
      "天然材料",
      "建筑",
      "装饰",
      "可再生"
    ],
    "difficulty_level": "基础",
    "notes": "搜索“木头”“wood”“timber”“原木”“板材”都会匹配到木材。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "竹子",
      "竹板",
      "bamboo",
      "竹木",
      "天然材料"
    ],
    "images": {
      "macro": [
        {
          "src": "assets/materials/bamboo/macro.jpg",
          "alt": "竹材的表面纹理和竹节形态宏观照片",
          "caption": "竹材的表面纹理和竹节形态"
        }
      ],
      "micro": [
        {
          "src": "assets/materials/bamboo/micro.jpg",
          "alt": "竹材维管束和薄壁组织的显微结构微观结构照片",
          "caption": "竹材维管束和薄壁组织的显微结构"
        }
      ]
    },
    "id": "bamboo",
    "name_cn": "竹材",
    "name_en": "Bamboo",
    "category_1": "传统与天然材料",
    "category_2": "植物基天然材料",
    "category_3": "草本木质化天然材料",
    "description": "竹材生长快、强度密度比高、纹理清晰，是家具、建筑装饰和复合板材的重要可再生材料。",
    "composition_or_structure": "竹材由纤维束、维管束和薄壁组织组成，沿轴向具有明显增强结构。",
    "key_properties": [
      "可再生",
      "轻量化",
      "高比强度"
    ],
    "mechanical_properties": [
      "顺纹抗拉强度高",
      "抗弯性能好",
      "节点影响均匀性"
    ],
    "thermal_properties": [
      "导热较低",
      "可燃",
      "热压碳化可改善稳定性"
    ],
    "electrical_properties": [
      "干燥状态绝缘性好"
    ],
    "advantages": [
      "生长周期短",
      "纹理美观",
      "强度较高"
    ],
    "limitations": [
      "易吸湿",
      "防霉防虫需处理",
      "尺寸稳定性需控制"
    ],
    "applications": [
      "建筑工程",
      "家具",
      "室内装饰",
      "日用品"
    ],
    "processing_methods": [
      "剖分",
      "干燥",
      "碳化",
      "胶合",
      "热压"
    ],
    "typical_products": [
      "竹地板",
      "竹家具",
      "竹胶板",
      "竹编制品"
    ],
    "related_materials": [
      "木材",
      "胶合板",
      "纸张"
    ],
    "tags": [
      "竹材",
      "天然材料",
      "建筑",
      "装饰",
      "可再生"
    ],
    "difficulty_level": "基础",
    "notes": "工程竹材常通过胶合和热压形成稳定板材。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "纸",
      "纸板",
      "paper",
      "纸制品",
      "天然材料"
    ],
    "images": {
      "macro": [
        {
          "src": "assets/materials/paper/macro.jpg",
          "alt": "纸张表面纤维交织形态宏观照片",
          "caption": "纸张表面纤维交织形态"
        }
      ],
      "micro": [
        {
          "src": "assets/materials/paper/micro.jpg",
          "alt": "纸纤维网络和孔隙结构的显微图微观结构照片",
          "caption": "纸纤维网络和孔隙结构的显微图"
        }
      ]
    },
    "id": "paper",
    "name_cn": "纸张",
    "name_en": "Paper",
    "category_1": "传统与天然材料",
    "category_2": "植物基天然材料",
    "category_3": "纤维网络薄片材料",
    "description": "纸张由植物纤维交织成形，轻薄、可印刷、可折叠，是包装、书写、过滤和日用品中的基础材料。",
    "composition_or_structure": "主要由纤维素纤维、填料、施胶剂和助剂构成，微观上为多孔纤维网络。",
    "key_properties": [
      "轻薄",
      "可印刷",
      "多孔"
    ],
    "mechanical_properties": [
      "抗张强度取决于纤维结合",
      "耐折性可调"
    ],
    "thermal_properties": [
      "易燃",
      "耐热性有限",
      "隔热性较好"
    ],
    "electrical_properties": [
      "干燥状态绝缘性较好",
      "湿态绝缘下降"
    ],
    "advantages": [
      "成本低",
      "易加工",
      "可回收"
    ],
    "limitations": [
      "怕水",
      "耐久性有限",
      "湿强低"
    ],
    "applications": [
      "包装",
      "印刷",
      "过滤",
      "日用品"
    ],
    "processing_methods": [
      "制浆",
      "抄纸",
      "压光",
      "涂布",
      "模切"
    ],
    "typical_products": [
      "书写纸",
      "瓦楞纸",
      "纸袋",
      "滤纸"
    ],
    "related_materials": [
      "木材",
      "棉纤维",
      "涂料"
    ],
    "tags": [
      "纸张",
      "天然材料",
      "包装",
      "日用品"
    ],
    "difficulty_level": "基础",
    "notes": "纸张性能可通过纤维种类、施胶和涂布明显改变。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "棉",
      "棉花",
      "棉布",
      "cotton",
      "纺织材料",
      "天然材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "cotton_fiber",
    "name_cn": "棉纤维",
    "name_en": "Cotton Fiber",
    "category_1": "纺织与日用品材料",
    "category_2": "天然纤维",
    "category_3": "植物纤维素纤维",
    "description": "棉纤维柔软、吸湿、亲肤，是服装、家纺和卫生用品中最常见的天然纺织纤维。",
    "composition_or_structure": "主要成分为纤维素，纤维呈扁平带状并具有天然转曲。",
    "key_properties": [
      "吸湿",
      "亲肤",
      "天然纤维"
    ],
    "mechanical_properties": [
      "湿态强度较好",
      "弹性回复一般"
    ],
    "thermal_properties": [
      "耐热性中等",
      "可燃"
    ],
    "electrical_properties": [
      "干燥时易积累静电",
      "吸湿后导电性提高"
    ],
    "advantages": [
      "舒适透气",
      "染色性好",
      "来源广"
    ],
    "limitations": [
      "易皱",
      "干燥慢",
      "易霉变"
    ],
    "applications": [
      "纺织",
      "服装",
      "家居",
      "医疗敷料"
    ],
    "processing_methods": [
      "纺纱",
      "织造",
      "针织",
      "染整"
    ],
    "typical_products": [
      "T恤",
      "床品",
      "纱布",
      "毛巾"
    ],
    "related_materials": [
      "麻纤维",
      "羊毛",
      "涤纶"
    ],
    "tags": [
      "纺织",
      "天然材料",
      "日用品",
      "吸湿"
    ],
    "difficulty_level": "基础",
    "notes": "棉纤维常与涤纶混纺以改善抗皱和耐磨。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "麻",
      "亚麻",
      "苎麻",
      "hemp",
      "linen",
      "纺织材料",
      "天然材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "hemp_fiber",
    "name_cn": "麻纤维",
    "name_en": "Hemp / Linen Fiber",
    "category_1": "纺织与日用品材料",
    "category_2": "天然纤维",
    "category_3": "植物韧皮纤维",
    "description": "麻纤维强度高、吸湿透气、风格挺括，常用于夏季服装、家纺和绳索。",
    "composition_or_structure": "主要由纤维素组成，纤维束来自植物韧皮部。",
    "key_properties": [
      "透气",
      "高强度",
      "天然纤维"
    ],
    "mechanical_properties": [
      "拉伸强度高",
      "伸长率较低",
      "手感偏硬"
    ],
    "thermal_properties": [
      "导热散热较快",
      "可燃"
    ],
    "electrical_properties": [
      "吸湿后抗静电性较好"
    ],
    "advantages": [
      "凉爽透气",
      "耐磨",
      "天然质感强"
    ],
    "limitations": [
      "易皱",
      "柔软性不足",
      "加工需脱胶"
    ],
    "applications": [
      "纺织",
      "服装",
      "家居",
      "包装"
    ],
    "processing_methods": [
      "脱胶",
      "纺纱",
      "织造",
      "染整"
    ],
    "typical_products": [
      "亚麻衬衫",
      "麻布",
      "绳索",
      "窗帘"
    ],
    "related_materials": [
      "棉纤维",
      "羊毛",
      "竹材"
    ],
    "tags": [
      "纺织",
      "天然材料",
      "透气",
      "日用品"
    ],
    "difficulty_level": "基础",
    "notes": "麻纤维需要脱胶和柔软整理来改善手感。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "毛料",
      "羊毛纤维",
      "wool",
      "纺织材料",
      "天然材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "wool",
    "name_cn": "羊毛",
    "name_en": "Wool",
    "category_1": "纺织与日用品材料",
    "category_2": "天然纤维",
    "category_3": "动物蛋白纤维",
    "description": "羊毛保暖、弹性好、吸湿调温，是服装、毯类和高端纺织品的重要天然纤维。",
    "composition_or_structure": "主要成分为角蛋白，纤维表面具有鳞片结构，内部有皮质层。",
    "key_properties": [
      "保暖",
      "弹性",
      "天然纤维"
    ],
    "mechanical_properties": [
      "弹性回复好",
      "湿态强度下降"
    ],
    "thermal_properties": [
      "保温性好",
      "阻燃性优于多数植物纤维"
    ],
    "electrical_properties": [
      "吸湿后抗静电性较好"
    ],
    "advantages": [
      "穿着舒适",
      "保暖调湿",
      "不易沾污"
    ],
    "limitations": [
      "易毡缩",
      "可能虫蛀",
      "护理要求高"
    ],
    "applications": [
      "服装",
      "家居",
      "地毯",
      "隔音"
    ],
    "processing_methods": [
      "洗毛",
      "梳理",
      "纺纱",
      "织造",
      "缩绒整理"
    ],
    "typical_products": [
      "毛衣",
      "西装面料",
      "毛毯",
      "地毯"
    ],
    "related_materials": [
      "棉纤维",
      "麻纤维",
      "涤纶"
    ],
    "tags": [
      "纺织",
      "天然材料",
      "保暖",
      "日用品"
    ],
    "difficulty_level": "基础",
    "notes": "防缩整理可减少羊毛毡缩。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "真皮",
      "皮料",
      "leather",
      "天然材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "leather",
    "name_cn": "皮革",
    "name_en": "Leather",
    "category_1": "传统与天然材料",
    "category_2": "动物基天然材料",
    "category_3": "胶原纤维网络材料",
    "description": "皮革由动物皮经鞣制加工而成，柔韧、耐磨、质感强，常用于鞋包、服装和家具。",
    "composition_or_structure": "以胶原纤维三维网络为主体，经铬鞣、植鞣或合成鞣剂稳定化。",
    "key_properties": [
      "柔韧",
      "耐磨",
      "天然质感"
    ],
    "mechanical_properties": [
      "抗撕裂较好",
      "弯折耐久性好"
    ],
    "thermal_properties": [
      "保温性较好",
      "耐高温有限"
    ],
    "electrical_properties": [
      "干燥时绝缘性较好"
    ],
    "advantages": [
      "触感好",
      "耐用",
      "可塑性强"
    ],
    "limitations": [
      "怕水和霉变",
      "维护要求高",
      "品质差异大"
    ],
    "applications": [
      "鞋材",
      "箱包",
      "家具",
      "服装"
    ],
    "processing_methods": [
      "鞣制",
      "染色",
      "涂饰",
      "压花",
      "裁切缝制"
    ],
    "typical_products": [
      "皮鞋",
      "皮包",
      "沙发面料",
      "皮带"
    ],
    "related_materials": [
      "羊毛",
      "涂料",
      "聚氨酯"
    ],
    "tags": [
      "皮革",
      "天然材料",
      "日用品",
      "装饰"
    ],
    "difficulty_level": "基础",
    "notes": "合成革属于高分子涂层或复合材料体系，不等同于天然皮革。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "石头",
      "石料",
      "stone",
      "岩石",
      "大理石",
      "花岗岩",
      "天然材料"
    ],
    "images": {
      "macro": [
        {
          "src": "assets/materials/natural_stone/macro.jpg",
          "alt": "天然石材的纹理、色带和抛光表面宏观照片",
          "caption": "天然石材的纹理、色带和抛光表面"
        }
      ],
      "micro": [
        {
          "src": "assets/materials/natural_stone/micro.jpg",
          "alt": "石材矿物颗粒、晶界和孔隙结构微观结构照片",
          "caption": "石材矿物颗粒、晶界和孔隙结构"
        }
      ]
    },
    "id": "natural_stone",
    "name_cn": "天然石材",
    "name_en": "Natural Stone",
    "category_1": "传统与天然材料",
    "category_2": "天然矿物与土质材料",
    "category_3": "矿物颗粒集合体",
    "description": "天然石材具有天然纹理、高硬度和良好耐久性，是建筑幕墙、地面、台面和雕刻常用材料。",
    "composition_or_structure": "由方解石、石英、长石、云母等矿物颗粒组成，结构随花岗岩、大理石、砂岩等岩种变化。",
    "key_properties": [
      "耐磨",
      "装饰",
      "耐久"
    ],
    "mechanical_properties": [
      "抗压强度高",
      "抗拉和抗冲击较弱"
    ],
    "thermal_properties": [
      "耐热性较好",
      "热膨胀需考虑"
    ],
    "electrical_properties": [
      "一般为绝缘或弱导电"
    ],
    "advantages": [
      "纹理独特",
      "耐久性好",
      "质感高级"
    ],
    "limitations": [
      "自重大",
      "脆性较大",
      "部分石材易污染或风化"
    ],
    "applications": [
      "建筑工程",
      "室内装饰",
      "景观",
      "台面"
    ],
    "processing_methods": [
      "开采",
      "切割",
      "研磨",
      "抛光",
      "防护处理"
    ],
    "typical_products": [
      "石材板",
      "台面",
      "地砖",
      "雕塑"
    ],
    "related_materials": [
      "砖",
      "混凝土",
      "陶土"
    ],
    "tags": [
      "石材",
      "天然材料",
      "建筑",
      "装饰"
    ],
    "difficulty_level": "基础",
    "notes": "石材选用需区分花岗岩、大理石、砂岩等岩性。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "泥土",
      "黏土",
      "粘土",
      "clay",
      "天然材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "clay",
    "name_cn": "陶土",
    "name_en": "Clay",
    "category_1": "传统与天然材料",
    "category_2": "天然矿物与土质材料",
    "category_3": "含水铝硅酸盐矿物材料",
    "description": "陶土可塑性好，烧成后形成陶瓷或砖瓦，是传统陶艺、建材和耐火材料的重要原料。",
    "composition_or_structure": "由高岭石、伊利石、蒙脱石等细粒黏土矿物及杂质组成。",
    "key_properties": [
      "可塑",
      "烧结",
      "传统材料"
    ],
    "mechanical_properties": [
      "湿态可塑",
      "烧后硬脆"
    ],
    "thermal_properties": [
      "烧成后耐热性提高",
      "干燥和烧成会收缩"
    ],
    "electrical_properties": [
      "干燥烧结后绝缘性较好"
    ],
    "advantages": [
      "来源广",
      "成形性好",
      "成本低"
    ],
    "limitations": [
      "干燥开裂风险",
      "烧成能耗高",
      "成品脆性大"
    ],
    "applications": [
      "陶艺",
      "砖瓦",
      "建筑工程",
      "耐火材料"
    ],
    "processing_methods": [
      "练泥",
      "成形",
      "干燥",
      "烧成",
      "施釉"
    ],
    "typical_products": [
      "陶器",
      "砖瓦",
      "陶板",
      "耐火坯体"
    ],
    "related_materials": [
      "砖",
      "氧化铝陶瓷",
      "耐火材料"
    ],
    "tags": [
      "陶土",
      "陶瓷",
      "天然材料",
      "建筑"
    ],
    "difficulty_level": "基础",
    "notes": "陶土是理解传统陶瓷和砖瓦材料的入口。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "夹板",
      "多层板",
      "plywood",
      "建筑材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "plywood",
    "name_cn": "胶合板",
    "name_en": "Plywood",
    "category_1": "建筑与装饰材料",
    "category_2": "木质板材",
    "category_3": "单板层合木质复合板",
    "description": "胶合板由多层木单板交错胶合而成，尺寸稳定性和面内强度优于普通实木板。",
    "composition_or_structure": "奇数层木单板按相邻层纹理方向交错铺装，并用胶黏剂热压成板。",
    "key_properties": [
      "板材",
      "尺寸稳定",
      "易加工"
    ],
    "mechanical_properties": [
      "面内强度较好",
      "抗翘曲优于实木"
    ],
    "thermal_properties": [
      "导热低",
      "可燃",
      "耐热取决于胶黏剂"
    ],
    "electrical_properties": [
      "干燥状态绝缘性较好"
    ],
    "advantages": [
      "幅面大",
      "变形小",
      "加工方便"
    ],
    "limitations": [
      "边缘防潮需处理",
      "胶黏剂环保等级需关注"
    ],
    "applications": [
      "建筑工程",
      "家具",
      "室内装饰",
      "包装"
    ],
    "processing_methods": [
      "旋切",
      "涂胶",
      "组坯",
      "热压",
      "裁边"
    ],
    "typical_products": [
      "模板板",
      "家具板",
      "包装箱板",
      "装饰面板"
    ],
    "related_materials": [
      "木材",
      "中密度纤维板 MDF",
      "竹材"
    ],
    "tags": [
      "建筑",
      "装饰",
      "木质板材",
      "板材"
    ],
    "difficulty_level": "基础",
    "notes": "胶合板常按用途分为结构板、家具板和装饰板。"
  },
  {
    "abbreviation": "MDF",
    "aliases": [
      "密度板",
      "纤维板",
      "MDF板",
      "medium density fiberboard",
      "建筑材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "mdf",
    "name_cn": "中密度纤维板",
    "name_en": "Medium Density Fiberboard",
    "category_1": "建筑与装饰材料",
    "category_2": "木质板材",
    "category_3": "木纤维重组板材",
    "description": "MDF由木纤维和胶黏剂热压成型，表面平整、易雕刻和贴面，是家具和室内装饰常用板材。",
    "composition_or_structure": "木材被纤维化后与树脂胶混合，通过热压形成均质纤维板。",
    "key_properties": [
      "表面平整",
      "易加工",
      "板材"
    ],
    "mechanical_properties": [
      "均质性好",
      "握钉力低于实木和胶合板"
    ],
    "thermal_properties": [
      "导热低",
      "可燃",
      "耐热受胶黏剂影响"
    ],
    "electrical_properties": [
      "干燥状态绝缘性较好"
    ],
    "advantages": [
      "表面细腻",
      "加工造型方便",
      "成本适中"
    ],
    "limitations": [
      "怕潮",
      "边部易吸水膨胀",
      "环保等级需关注"
    ],
    "applications": [
      "家具",
      "室内装饰",
      "门板",
      "展示道具"
    ],
    "processing_methods": [
      "纤维制备",
      "施胶",
      "铺装",
      "热压",
      "贴面"
    ],
    "typical_products": [
      "柜门",
      "雕花板",
      "踢脚线",
      "展示板"
    ],
    "related_materials": [
      "木材",
      "胶合板",
      "涂料"
    ],
    "tags": [
      "建筑",
      "装饰",
      "木质板材",
      "MDF"
    ],
    "difficulty_level": "基础",
    "notes": "MDF适合表面造型和贴面，不适合长期潮湿环境。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "砖块",
      "红砖",
      "brick",
      "建筑材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "brick",
    "name_cn": "砖",
    "name_en": "Brick",
    "category_1": "建筑与装饰材料",
    "category_2": "砌筑与板材",
    "category_3": "烧结或非烧结砌筑材料",
    "description": "砖是建筑砌筑和铺装中的基础材料，具有尺寸模块化、抗压和耐久等特点。",
    "composition_or_structure": "可由黏土烧结形成，也可由粉煤灰、混凝土等非烧结体系压制养护形成。",
    "key_properties": [
      "建筑",
      "抗压",
      "耐久"
    ],
    "mechanical_properties": [
      "抗压强度较高",
      "抗拉抗弯较弱"
    ],
    "thermal_properties": [
      "耐火性较好",
      "保温性依孔隙率变化"
    ],
    "electrical_properties": [
      "干燥状态绝缘性较好"
    ],
    "advantages": [
      "成本低",
      "施工体系成熟",
      "耐久"
    ],
    "limitations": [
      "自重大",
      "施工效率受砌筑影响",
      "脆性大"
    ],
    "applications": [
      "建筑工程",
      "墙体",
      "铺装",
      "景观"
    ],
    "processing_methods": [
      "制坯",
      "干燥",
      "烧结",
      "蒸压养护"
    ],
    "typical_products": [
      "红砖",
      "空心砖",
      "透水砖",
      "装饰砖"
    ],
    "related_materials": [
      "陶土",
      "混凝土",
      "石膏板"
    ],
    "tags": [
      "建筑",
      "砌筑",
      "传统材料"
    ],
    "difficulty_level": "基础",
    "notes": "现代建筑中砖常与保温、结构和装饰体系配合使用。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "纸面石膏板",
      "gypsum board",
      "干墙板",
      "建筑材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "gypsum_board",
    "name_cn": "石膏板",
    "name_en": "Gypsum Board",
    "category_1": "建筑与装饰材料",
    "category_2": "砌筑与板材",
    "category_3": "纸面石膏复合板",
    "description": "石膏板轻质、平整、施工快，是室内隔墙和吊顶系统的常用板材。",
    "composition_or_structure": "以建筑石膏芯材为主体，两面覆纸或纤维增强面层。",
    "key_properties": [
      "轻质",
      "防火",
      "装饰基层"
    ],
    "mechanical_properties": [
      "抗弯适中",
      "抗冲击需龙骨支撑"
    ],
    "thermal_properties": [
      "遇火释放结晶水有助于防火",
      "耐水性需改性"
    ],
    "electrical_properties": [
      "绝缘性较好"
    ],
    "advantages": [
      "施工快",
      "表面平整",
      "防火性好"
    ],
    "limitations": [
      "普通板怕潮",
      "承重能力有限"
    ],
    "applications": [
      "室内装饰",
      "吊顶",
      "隔墙",
      "建筑工程"
    ],
    "processing_methods": [
      "浆料制备",
      "连续成型",
      "干燥",
      "切割",
      "安装"
    ],
    "typical_products": [
      "隔墙板",
      "吊顶板",
      "防火板",
      "耐水板"
    ],
    "related_materials": [
      "石膏",
      "砖",
      "涂料"
    ],
    "tags": [
      "建筑",
      "装饰",
      "防火",
      "板材"
    ],
    "difficulty_level": "基础",
    "notes": "厨卫等潮湿区域应选择耐水石膏板或其他防潮板材。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "柏油",
      "bitumen",
      "asphalt",
      "建筑材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "asphalt",
    "name_cn": "沥青",
    "name_en": "Asphalt / Bitumen",
    "category_1": "建筑与装饰材料",
    "category_2": "防水与路面材料",
    "category_3": "石油基有机胶结材料",
    "description": "沥青具有黏结、防水和粘弹性，是道路铺装和建筑防水的重要材料。",
    "composition_or_structure": "由复杂高分子烃类及少量杂原子化合物组成，含沥青质、胶质、芳香分和饱和分。",
    "key_properties": [
      "防水",
      "粘结",
      "路面材料"
    ],
    "mechanical_properties": [
      "粘弹性明显",
      "低温易脆高温易流动"
    ],
    "thermal_properties": [
      "温度敏感",
      "加热可软化"
    ],
    "electrical_properties": [
      "绝缘性较好"
    ],
    "advantages": [
      "防水性好",
      "施工成熟",
      "可回收利用"
    ],
    "limitations": [
      "高低温性能需改性",
      "老化会变硬开裂"
    ],
    "applications": [
      "道路工程",
      "建筑防水",
      "屋面"
    ],
    "processing_methods": [
      "加热混合",
      "摊铺",
      "压实",
      "改性",
      "卷材浸涂"
    ],
    "typical_products": [
      "沥青混合料",
      "防水沥青",
      "道路面层"
    ],
    "related_materials": [
      "防水卷材",
      "混凝土",
      "涂料"
    ],
    "tags": [
      "建筑",
      "防水",
      "道路",
      "有机材料"
    ],
    "difficulty_level": "基础",
    "notes": "SBS改性沥青可改善弹性和低温性能。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "防水材料",
      "防水膜",
      "waterproof membrane",
      "建筑材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "waterproof_membrane",
    "name_cn": "防水卷材",
    "name_en": "Waterproof Membrane",
    "category_1": "建筑与装饰材料",
    "category_2": "防水与路面材料",
    "category_3": "柔性防水片材",
    "description": "防水卷材用于屋面、地下室和隧道等部位，通过连续铺贴形成防水层。",
    "composition_or_structure": "可由改性沥青、高分子片材或复合胎基层、涂覆层和隔离层组成。",
    "key_properties": [
      "防水",
      "柔性",
      "建筑"
    ],
    "mechanical_properties": [
      "抗拉和延伸率依体系变化",
      "抗穿刺需保护层"
    ],
    "thermal_properties": [
      "耐热和低温柔性需配方设计"
    ],
    "electrical_properties": [
      "多数体系绝缘性较好"
    ],
    "advantages": [
      "施工效率高",
      "连续防水效果好",
      "体系选择多"
    ],
    "limitations": [
      "搭接质量影响防水",
      "老化和基层变形需考虑"
    ],
    "applications": [
      "建筑工程",
      "屋面",
      "地下室",
      "隧道"
    ],
    "processing_methods": [
      "热熔铺贴",
      "自粘铺贴",
      "焊接",
      "冷粘"
    ],
    "typical_products": [
      "SBS卷材",
      "TPO卷材",
      "PVC防水卷材"
    ],
    "related_materials": [
      "沥青",
      "涂料",
      "PVC"
    ],
    "tags": [
      "建筑",
      "防水",
      "装饰辅材"
    ],
    "difficulty_level": "基础",
    "notes": "防水卷材性能不仅取决于材料，也取决于节点和搭接施工质量。"
  },
  {
    "abbreviation": "",
    "aliases": [
      "油漆",
      "漆",
      "paint",
      "coating",
      "建筑材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "coating_paint",
    "name_cn": "涂料",
    "name_en": "Coating / Paint",
    "category_1": "建筑与装饰材料",
    "category_2": "表面装饰材料",
    "category_3": "成膜型表面保护材料",
    "description": "涂料涂覆后形成连续涂膜，可提供装饰、防护、防腐、防水或功能化表面。",
    "composition_or_structure": "由成膜树脂、颜填料、溶剂或水、助剂等组成，固化后形成涂膜。",
    "key_properties": [
      "装饰",
      "防护",
      "成膜"
    ],
    "mechanical_properties": [
      "附着力和耐磨性依配方变化",
      "柔韧性可调"
    ],
    "thermal_properties": [
      "耐热性依树脂体系变化",
      "部分涂料具阻燃隔热功能"
    ],
    "electrical_properties": [
      "可设计为绝缘、导电或防静电"
    ],
    "advantages": [
      "施工方便",
      "颜色和功能丰富",
      "可保护基材"
    ],
    "limitations": [
      "耐久性受环境影响",
      "VOC和环保要求需关注"
    ],
    "applications": [
      "建筑工程",
      "室内装饰",
      "金属防腐",
      "家具"
    ],
    "processing_methods": [
      "刷涂",
      "辊涂",
      "喷涂",
      "固化",
      "打磨"
    ],
    "typical_products": [
      "乳胶漆",
      "木器漆",
      "防腐涂料",
      "防水涂料"
    ],
    "related_materials": [
      "环氧树脂",
      "聚氨酯",
      "木材"
    ],
    "tags": [
      "建筑",
      "装饰",
      "防护",
      "涂层"
    ],
    "difficulty_level": "基础",
    "notes": "水性涂料正在逐步替代高VOC溶剂型体系。"
  },
  {
    "abbreviation": "PET Fiber",
    "aliases": [
      "聚酯纤维",
      "的确良",
      "polyester",
      "涤纶布",
      "纺织材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "polyester_fiber",
    "name_cn": "涤纶",
    "name_en": "Polyester Fiber",
    "category_1": "纺织与日用品材料",
    "category_2": "合成纤维",
    "category_3": "聚酯纤维",
    "description": "涤纶强度高、耐磨、抗皱，是服装、家纺和产业用纺织品中用量最大的合成纤维之一。",
    "composition_or_structure": "通常由PET熔融纺丝形成，分子链含芳香族聚酯结构。",
    "key_properties": [
      "耐磨",
      "抗皱",
      "合成纤维"
    ],
    "mechanical_properties": [
      "强度高",
      "弹性回复好",
      "耐疲劳"
    ],
    "thermal_properties": [
      "热塑性",
      "耐热性优于多数天然纤维"
    ],
    "electrical_properties": [
      "易产生静电",
      "可通过整理抗静电"
    ],
    "advantages": [
      "耐用",
      "快干",
      "价格低"
    ],
    "limitations": [
      "吸湿性低",
      "舒适性需混纺改善",
      "微塑料问题需关注"
    ],
    "applications": [
      "纺织",
      "服装",
      "家居",
      "包装"
    ],
    "processing_methods": [
      "熔融纺丝",
      "牵伸",
      "变形加工",
      "织造",
      "染整"
    ],
    "typical_products": [
      "运动服",
      "窗帘",
      "无纺布",
      "背包面料"
    ],
    "related_materials": [
      "PET",
      "棉纤维",
      "尼龙纤维"
    ],
    "tags": [
      "纺织",
      "塑料",
      "日用品",
      "合成纤维"
    ],
    "difficulty_level": "基础",
    "notes": "涤棉混纺兼顾棉的舒适和涤纶的抗皱耐磨。"
  },
  {
    "abbreviation": "PA Fiber",
    "aliases": [
      "锦纶",
      "尼龙",
      "nylon",
      "PA纤维",
      "纺织材料"
    ],
    "images": {
      "macro": [],
      "micro": []
    },
    "id": "nylon_fiber",
    "name_cn": "尼龙纤维",
    "name_en": "Nylon Fiber",
    "category_1": "纺织与日用品材料",
    "category_2": "合成纤维",
    "category_3": "聚酰胺纤维",
    "description": "尼龙纤维强度高、耐磨、弹性好，常用于袜类、运动用品、绳索和工程织物。",
    "composition_or_structure": "由聚酰胺熔融纺丝形成，分子链含酰胺键并可形成氢键。",
    "key_properties": [
      "耐磨",
      "高强度",
      "弹性"
    ],
    "mechanical_properties": [
      "拉伸强度高",
      "耐疲劳和耐磨好"
    ],
    "thermal_properties": [
      "热塑性",
      "吸湿影响尺寸和手感"
    ],
    "electrical_properties": [
      "干燥环境易静电"
    ],
    "advantages": [
      "韧性好",
      "耐磨性突出",
      "轻便"
    ],
    "limitations": [
      "吸湿后尺寸变化",
      "耐光老化需改善"
    ],
    "applications": [
      "纺织",
      "户外用品",
      "工业织物",
      "绳索"
    ],
    "processing_methods": [
      "熔融纺丝",
      "牵伸",
      "织造",
      "染整"
    ],
    "typical_products": [
      "丝袜",
      "绳索",
      "背包面料",
      "刷丝"
    ],
    "related_materials": [
      "聚酰胺",
      "涤纶",
      "棉纤维"
    ],
    "tags": [
      "纺织",
      "尼龙",
      "合成纤维",
      "耐磨"
    ],
    "difficulty_level": "基础",
    "notes": "尼龙纤维和工程塑料PA同属聚酰胺体系，但形态和应用不同。"
  }
];
