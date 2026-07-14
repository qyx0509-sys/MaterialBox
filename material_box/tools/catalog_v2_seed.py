"""Structured seed definitions used by the MaterialBox V2 migration.

This module intentionally contains classification and identity data only.  It does
not manufacture engineering properties.  Numeric properties must be added to
materials.json with conditions and sources after review.
"""

from __future__ import annotations


ENTITY_TYPES = {"family", "subfamily", "material", "grade", "variant", "state", "form"}

BASE_CATEGORIES = [
    {
        "name": "金属与合金",
        "description": "覆盖黑色金属、有色金属、高温合金、难熔金属、贵金属与金属间化合物。",
        "branches": ["黑色金属", "有色金属", "高温合金", "难熔金属", "贵金属", "金属间化合物"],
    },
    {
        "name": "高分子材料",
        "description": "覆盖热塑性塑料、热固性树脂、弹性体、胶黏剂、涂层与生物可降解聚合物。",
        "branches": ["热塑性塑料", "热固性树脂", "弹性体", "胶黏剂", "涂层高分子", "生物可降解聚合物", "高性能聚合物"],
    },
    {
        "name": "无机非金属材料",
        "description": "覆盖氧化物与非氧化物陶瓷、传统陶瓷、玻璃、玻璃陶瓷和耐火材料。",
        "branches": ["氧化物陶瓷", "非氧化物陶瓷", "传统陶瓷", "玻璃", "玻璃陶瓷", "耐火材料"],
    },
    {
        "name": "复合材料",
        "description": "按基体、增强体和结构形式组织聚合物基、金属基、陶瓷基及结构复合材料。",
        "branches": ["聚合物基复合材料", "金属基复合材料", "陶瓷基复合材料", "碳基复合材料", "层合材料", "夹层结构材料", "功能梯度材料"],
    },
    {
        "name": "半导体与电子材料",
        "description": "覆盖半导体、磁性、介电、压电、透明导电、发光、超导和热电材料。",
        "branches": ["元素半导体", "化合物半导体", "宽禁带半导体", "磁性材料", "介电材料", "压电与铁电材料", "透明导电材料", "发光与光电材料", "超导材料", "热电材料"],
    },
    {
        "name": "碳材料",
        "description": "按碳的结构与形态组织石墨、金刚石、碳纤维、石墨烯和其他先进碳材料。",
        "branches": ["石墨", "金刚石", "炭黑", "活性炭", "碳纤维", "石墨烯", "碳纳米管", "富勒烯", "碳气凝胶", "玻璃碳"],
    },
    {
        "name": "天然与生物基材料",
        "description": "覆盖木材、竹藤、植物纤维、动物来源、纸基、天然矿物与生物基材料。",
        "branches": ["木材", "竹材与藤材", "植物纤维", "动物来源材料", "纸基材料", "天然矿物材料", "生物基聚合物"],
    },
    {
        "name": "建筑胶凝与土木材料",
        "description": "覆盖水泥、混凝土、砂浆、砖瓦、石膏、沥青、防水、保温和建筑板材。",
        "branches": ["水泥", "混凝土", "砂浆", "砖瓦", "石膏材料", "沥青材料", "防水材料", "保温材料", "建筑板材", "装饰材料"],
    },
    {
        "name": "纤维与纺织材料",
        "description": "覆盖天然纤维、再生纤维、合成纤维、高性能纤维、无机纤维与非织造材料。",
        "branches": ["天然植物纤维", "天然动物纤维", "再生纤维", "合成纤维", "高性能纤维", "无机纤维", "非织造材料", "纺织复合材料"],
    },
]


COLLECTION_SPECS = [
    ("aerospace_materials", "航空航天材料", "面向飞行器结构、热端、推进和航天环境的跨分类材料集合。", ["航空航天", "航空", "航天", "发动机", "飞行器"]),
    ("automotive_lightweight", "汽车轻量化材料", "用于车身、底盘、内外饰和动力系统轻量化的材料集合。", ["汽车轻量化", "汽车", "车身"]),
    ("new_energy_vehicle", "新能源汽车材料", "覆盖动力电池、电驱、热管理、轻量化和电气绝缘材料。", ["新能源汽车", "动力电池", "电驱"]),
    ("lithium_ion_battery", "锂离子电池材料", "锂离子电池正极、负极、电解质、隔膜和集流体材料。", ["锂电池", "锂离子电池", "正极", "负极", "隔膜", "电解液"]),
    ("sodium_ion_battery", "钠离子电池材料", "钠离子电池电极、电解质和辅助材料集合。", ["钠离子电池", "钠电"]),
    ("solid_state_battery", "固态电池材料", "固态电解质、电极和界面调控材料集合。", ["固态电池", "固态电解质"]),
    ("hydrogen_fuel_cell", "氢能与燃料电池材料", "制氢、储氢、输氢及燃料电池用材料集合。", ["氢能", "燃料电池", "储氢"]),
    ("photovoltaic_materials", "光伏材料", "晶硅、薄膜和新型光伏器件相关材料集合。", ["光伏", "太阳能电池"]),
    ("supercapacitor_materials", "超级电容材料", "双电层和赝电容储能材料集合。", ["超级电容", "赝电容"]),
    ("semiconductor_materials", "半导体材料", "元素、化合物和宽禁带半导体材料集合。", ["半导体", "芯片", "功率器件"]),
    ("electronic_packaging", "电子封装材料", "用于芯片互连、封装基板、散热和绝缘的材料集合。", ["电子封装", "封装", "散热"]),
    ("biomedical_materials", "生物医用材料", "用于植入、修复、诊疗和组织工程的材料集合。", ["生物医用", "医疗植入", "医用", "植入", "骨科"]),
    ("biodegradable_materials", "可降解材料", "可在生物或环境条件下降解的聚合物、金属和复合材料。", ["可降解", "生物降解", "降解"]),
    ("construction_materials", "建筑工程材料", "房屋、道路、桥梁和基础设施用材料集合。", ["建筑工程", "建筑", "土木", "道路", "桥梁"]),
    ("interior_materials", "室内装饰材料", "室内表面、板材、家具和装饰制品材料集合。", ["室内装饰", "家具", "装饰"]),
    ("marine_engineering", "海洋工程材料", "面向海水腐蚀、海洋结构和船舶装备的材料集合。", ["海洋", "船舶", "海水"]),
    ("high_temperature", "耐高温材料", "用于持续高温、热循环或热防护环境的材料集合。", ["耐高温", "高温", "热稳定"]),
    ("corrosion_resistant", "耐腐蚀材料", "面向化学介质、海洋和严苛环境耐蚀需求的材料集合。", ["耐腐蚀", "耐蚀", "耐化学"]),
    ("additive_manufacturing", "3D打印材料", "适用于粉末床、熔融挤出、光固化等增材制造工艺的材料。", ["3D打印", "增材制造", "粉末床"]),
    ("nanomaterials", "纳米材料", "至少一个维度处于纳米尺度或具有纳米结构特征的材料集合。", ["纳米", "石墨烯", "碳纳米管", "量子点"]),
    ("sustainable_materials", "可持续与可回收材料", "强调可再生来源、循环利用、低环境负荷的材料集合。", ["可持续", "可回收", "再生", "生物基"]),
    ("packaging_materials", "包装材料", "包装薄膜、容器、纸基和阻隔材料集合。", ["包装", "瓶", "薄膜"]),
    ("textile_apparel", "纺织服装材料", "服装、家纺和产业用纺织品相关材料集合。", ["纺织", "服装", "纤维", "织物"]),
]


ID_ALIASES = {
    "carbon_fiber_composite": "carbon_fiber_epoxy",
    "glass_fiber_reinforced_plastic": "glass_fiber_composite",
    "mdf_board": "mdf",
    "polyester": "pet",
    "nylon": "polyamide",
}


EXISTING_PATH_OVERRIDES = {
    "steel": ["金属与合金", "黑色金属", "钢"],
    "cast_iron": ["金属与合金", "黑色金属", "铸铁"],
    "stainless_steel": ["金属与合金", "黑色金属", "钢", "不锈钢"],
    "tool_steel": ["金属与合金", "黑色金属", "钢", "工具钢"],
    "high_speed_steel": ["金属与合金", "黑色金属", "钢", "工具钢", "高速工具钢"],
    "aluminum_alloy": ["金属与合金", "有色金属", "铝及铝合金"],
    "magnesium_alloy": ["金属与合金", "有色金属", "镁及镁合金"],
    "titanium_alloy": ["金属与合金", "有色金属", "钛及钛合金"],
    "copper_alloy": ["金属与合金", "有色金属", "铜及铜合金"],
    "nickel_alloy": ["金属与合金", "有色金属", "镍及镍合金"],
    "nickel_superalloy": ["金属与合金", "高温合金", "镍基高温合金"],
    "cobalt_superalloy": ["金属与合金", "高温合金", "钴基高温合金"],
    "polyethylene": ["高分子材料", "热塑性塑料", "聚烯烃", "聚乙烯"],
    "polypropylene": ["高分子材料", "热塑性塑料", "聚烯烃", "聚丙烯"],
    "polyvinyl_chloride": ["高分子材料", "热塑性塑料", "含氯聚合物", "聚氯乙烯"],
    "polystyrene": ["高分子材料", "热塑性塑料", "苯乙烯类聚合物", "聚苯乙烯"],
    "abs": ["高分子材料", "热塑性塑料", "苯乙烯类聚合物", "ABS"],
    "polyamide": ["高分子材料", "热塑性塑料", "工程热塑性塑料", "聚酰胺"],
    "polycarbonate": ["高分子材料", "热塑性塑料", "工程热塑性塑料", "聚碳酸酯"],
    "pom": ["高分子材料", "热塑性塑料", "工程热塑性塑料", "聚甲醛"],
    "pet": ["高分子材料", "热塑性塑料", "热塑性聚酯", "PET"],
    "pbt": ["高分子材料", "热塑性塑料", "热塑性聚酯", "PBT"],
    "peek": ["高分子材料", "高性能聚合物", "聚芳醚酮", "PEEK"],
    "polyimide": ["高分子材料", "高性能聚合物", "聚酰亚胺", "PI"],
    "pps": ["高分子材料", "高性能聚合物", "聚芳硫醚", "PPS"],
    "ptfe": ["高分子材料", "热塑性塑料", "含氟聚合物", "PTFE"],
    "lcp": ["高分子材料", "高性能聚合物", "液晶聚合物", "LCP"],
    "natural_rubber": ["高分子材料", "弹性体", "通用橡胶", "天然橡胶"],
    "silicone_rubber": ["高分子材料", "弹性体", "特种橡胶", "硅橡胶"],
    "fluororubber": ["高分子材料", "弹性体", "特种橡胶", "氟橡胶"],
    "epoxy_resin": ["高分子材料", "热固性树脂", "环氧树脂"],
    "polyurethane": ["高分子材料", "热固性树脂", "聚氨酯树脂"],
    "alumina_ceramic": ["无机非金属材料", "氧化物陶瓷", "氧化铝陶瓷"],
    "zirconia_ceramic": ["无机非金属材料", "氧化物陶瓷", "氧化锆陶瓷"],
    "sic_ceramic": ["无机非金属材料", "非氧化物陶瓷", "碳化物陶瓷", "碳化硅陶瓷"],
    "silicon_nitride_ceramic": ["无机非金属材料", "非氧化物陶瓷", "氮化物陶瓷", "氮化硅陶瓷"],
    "quartz_glass": ["无机非金属材料", "玻璃", "特种玻璃", "石英玻璃"],
    "borosilicate_glass": ["无机非金属材料", "玻璃", "特种玻璃", "硼硅玻璃"],
    "tempered_glass": ["无机非金属材料", "玻璃", "安全玻璃", "钢化玻璃"],
    "refractory": ["无机非金属材料", "耐火材料"],
    "carbon_fiber_epoxy": ["复合材料", "聚合物基复合材料", "连续纤维增强复合材料", "碳纤维/环氧复合材料"],
    "glass_fiber_composite": ["复合材料", "聚合物基复合材料", "玻璃纤维复合材料"],
    "aramid_fiber_composite": ["复合材料", "聚合物基复合材料", "芳纶纤维复合材料"],
    "aluminum_mmc": ["复合材料", "金属基复合材料", "铝基复合材料"],
    "sic_cmc": ["复合材料", "陶瓷基复合材料", "SiC/SiC"],
    "carbon_carbon": ["复合材料", "碳基复合材料", "碳/碳复合材料"],
    "honeycomb_sandwich": ["复合材料", "夹层结构材料", "蜂窝夹层板"],
    "silicon": ["半导体与电子材料", "元素半导体", "硅"],
    "gallium_arsenide": ["半导体与电子材料", "化合物半导体", "砷化镓"],
    "gallium_nitride": ["半导体与电子材料", "宽禁带半导体", "氮化镓"],
    "silicon_carbide_semiconductor": ["半导体与电子材料", "宽禁带半导体", "碳化硅半导体"],
    "ferrite": ["半导体与电子材料", "磁性材料", "铁氧体"],
    "ndfeb": ["半导体与电子材料", "磁性材料", "永磁材料", "钕铁硼"],
    "ito": ["半导体与电子材料", "透明导电材料", "ITO"],
    "oled_material": ["半导体与电子材料", "发光与光电材料", "OLED材料"],
    "shape_memory_alloy": ["金属与合金", "金属间化合物", "形状记忆合金"],
    "piezo_ceramic": ["半导体与电子材料", "压电与铁电材料", "压电陶瓷"],
    "graphite_anode": ["碳材料", "石墨", "电池级石墨", "石墨负极"],
    "activated_carbon": ["碳材料", "活性炭"],
    "graphene": ["碳材料", "石墨烯"],
    "carbon_nanotube": ["碳材料", "碳纳米管"],
    "nano_silver": ["金属与合金", "贵金属", "银", "纳米银"],
    "nano_titanium_dioxide": ["无机非金属材料", "氧化物陶瓷", "氧化钛", "纳米二氧化钛"],
    "polymer_nanocomposite": ["复合材料", "聚合物基复合材料", "聚合物纳米复合材料"],
    "wood": ["天然与生物基材料", "植物来源材料", "木材"],
    "bamboo": ["天然与生物基材料", "植物来源材料", "竹材与藤材", "竹材"],
    "paper": ["天然与生物基材料", "纸基材料", "纸张"],
    "leather": ["天然与生物基材料", "动物来源材料", "皮革"],
    "natural_stone": ["天然与生物基材料", "天然矿物材料", "天然石材"],
    "clay": ["无机非金属材料", "传统陶瓷", "陶土"],
    "cotton_fiber": ["纤维与纺织材料", "天然植物纤维", "棉纤维"],
    "hemp_fiber": ["纤维与纺织材料", "天然植物纤维", "麻纤维"],
    "wool": ["纤维与纺织材料", "天然动物纤维", "羊毛"],
    "polyester_fiber": ["纤维与纺织材料", "合成纤维", "聚酯纤维", "涤纶纤维"],
    "nylon_fiber": ["纤维与纺织材料", "合成纤维", "聚酰胺纤维", "尼龙纤维"],
    "portland_cement": ["建筑胶凝与土木材料", "水泥", "硅酸盐水泥"],
    "concrete": ["建筑胶凝与土木材料", "混凝土", "普通混凝土"],
    "plywood": ["建筑胶凝与土木材料", "建筑板材", "工程木制品", "胶合板"],
    "mdf": ["建筑胶凝与土木材料", "建筑板材", "工程木制品", "中密度纤维板"],
    "brick": ["建筑胶凝与土木材料", "砖瓦", "砖"],
    "gypsum_board": ["建筑胶凝与土木材料", "石膏材料", "石膏板"],
    "asphalt": ["建筑胶凝与土木材料", "沥青材料", "道路沥青"],
    "waterproof_membrane": ["建筑胶凝与土木材料", "防水材料", "防水卷材"],
    "coating_paint": ["建筑胶凝与土木材料", "装饰材料", "建筑涂料"],
    "lifepo4": ["无机非金属材料", "功能陶瓷", "电化学储能材料", "磷酸铁锂"],
    "ncm": ["无机非金属材料", "功能陶瓷", "电化学储能材料", "三元正极材料"],
    "silicon_carbon_anode": ["复合材料", "碳基复合材料", "硅碳复合负极"],
    "battery_electrolyte": ["高分子材料", "电解质与功能液体", "锂电池电解液"],
    "battery_separator": ["高分子材料", "功能膜", "锂电池隔膜"],
    "perovskite_solar": ["半导体与电子材料", "发光与光电材料", "光伏材料", "钙钛矿光伏材料"],
    "crystalline_silicon_pv": ["半导体与电子材料", "元素半导体", "硅", "晶硅光伏材料"],
    "medical_titanium_alloy": ["金属与合金", "有色金属", "钛及钛合金", "医用钛合金"],
    "cobalt_chromium_alloy": ["金属与合金", "有色金属", "钴及钴合金", "钴铬合金"],
    "medical_peek": ["高分子材料", "高性能聚合物", "聚芳醚酮", "PEEK", "医用级PEEK"],
    "pla": ["高分子材料", "生物可降解聚合物", "脂肪族聚酯", "PLA"],
    "hydroxyapatite": ["无机非金属材料", "生物陶瓷", "羟基磷灰石"],
    "bioglass": ["无机非金属材料", "玻璃", "生物活性玻璃"],
    "biodegradable_magnesium_alloy": ["金属与合金", "有色金属", "镁及镁合金", "可降解医用镁合金"],
}


EXISTING_RELATIONS = {
    "steel": ("", "steel", "family"),
    "cast_iron": ("", "cast_iron", "family"),
    "stainless_steel": ("steel", "steel", "subfamily"),
    "tool_steel": ("steel", "steel", "subfamily"),
    "high_speed_steel": ("tool_steel", "steel", "subfamily"),
    "medical_peek": ("peek", "peek", "variant"),
    "polyester_fiber": ("pet", "pet", "form"),
    "nylon_fiber": ("polyamide", "polyamide", "form"),
    "silicon_carbide_semiconductor": ("", "sic_ceramic", "material"),
    "medical_titanium_alloy": ("titanium_alloy", "titanium_alloy", "variant"),
    "biodegradable_magnesium_alloy": ("magnesium_alloy", "magnesium_alloy", "variant"),
    "plywood": ("wood", "wood", "form"),
    "mdf": ("wood", "wood", "form"),
    "concrete": ("portland_cement", "portland_cement", "material"),
}


def build_seed_records():
    records = []

    def add(
        item_id,
        name_cn,
        name_en,
        path,
        parent_id="",
        canonical_id="",
        entity_type="material",
        abbreviation="",
        aliases=None,
        states=None,
        forms=None,
        treatments=None,
        standards=None,
        tags=None,
        applications=None,
    ):
        records.append(
            {
                "id": item_id,
                "name_cn": name_cn,
                "name_en": name_en,
                "abbreviation": abbreviation,
                "entity_type": entity_type,
                "parent_id": parent_id,
                "canonical_material_id": canonical_id or item_id,
                "taxonomy_path": [*path, name_cn] if not path or path[-1] != name_cn else list(path),
                "aliases": list(aliases or []),
                "material_states": list(states or []),
                "product_forms": list(forms or []),
                "heat_treatments": list(treatments or []),
                "standard_designations": list(standards or []),
                "tags": list(tags or []),
                "applications": list(applications or []),
            }
        )

    metal = ["金属与合金"]
    add("ferrous_metals", "黑色金属", "Ferrous metals", metal, entity_type="family")
    add("nonferrous_metals", "有色金属", "Non-ferrous metals", metal, entity_type="family")
    add("superalloys", "高温合金", "Superalloys", metal, entity_type="family")
    add("refractory_metals", "难熔金属", "Refractory metals", metal, entity_type="family")
    add("precious_metals", "贵金属", "Precious metals", metal, entity_type="family")
    add("intermetallics", "金属间化合物", "Intermetallic compounds", metal, entity_type="family")

    steel_path = metal + ["黑色金属", "钢"]
    annealed_states = ["退火态", "正火态"]
    quench_states = ["退火态", "正火态", "淬火态", "回火态"]
    hot_rolled_states = ["热轧态", "正火态", "退火态"]
    solution_states = ["固溶态", "冷加工态"]
    quench = [{"name": "淬火处理", "process": "奥氏体化后快速冷却", "effect": "提高硬度和强度，通常需配合回火"}]
    temper = [{"name": "调质处理", "process": "淬火+高温回火", "effect": "改善强韧性综合性能"}]
    steel_nodes = [
        ("unalloyed_steel", "非合金钢", "Non-alloy steel", steel_path, "steel"),
        ("low_carbon_steel", "低碳钢", "Low-carbon steel", steel_path + ["非合金钢"], "unalloyed_steel"),
        ("medium_carbon_steel", "中碳钢", "Medium-carbon steel", steel_path + ["非合金钢"], "unalloyed_steel"),
        ("high_carbon_steel", "高碳钢", "High-carbon steel", steel_path + ["非合金钢"], "unalloyed_steel"),
        ("low_alloy_steel", "低合金钢", "Low-alloy steel", steel_path, "steel"),
        ("structural_steel", "结构钢", "Structural steel", steel_path, "steel"),
        ("carbon_structural_steel", "普通碳素结构钢", "Carbon structural steel", steel_path + ["结构钢"], "structural_steel"),
        ("hsla_steel", "低合金高强度结构钢", "High-strength low-alloy steel", steel_path + ["结构钢"], "structural_steel"),
        ("machine_steel", "机械制造用钢", "Machine-building steel", steel_path, "steel"),
        ("carburizing_steel", "渗碳钢", "Carburizing steel", steel_path + ["机械制造用钢"], "machine_steel"),
        ("quenched_tempered_steel", "调质钢", "Quenched and tempered steel", steel_path + ["机械制造用钢"], "machine_steel"),
        ("spring_steel", "弹簧钢", "Spring steel", steel_path + ["机械制造用钢"], "machine_steel"),
        ("bearing_steel", "轴承钢", "Bearing steel", steel_path + ["机械制造用钢"], "machine_steel"),
        ("carbon_tool_steel", "碳素工具钢", "Carbon tool steel", steel_path + ["工具钢"], "tool_steel"),
        ("cold_work_tool_steel", "冷作模具钢", "Cold-work tool steel", steel_path + ["工具钢"], "tool_steel"),
        ("hot_work_tool_steel", "热作模具钢", "Hot-work tool steel", steel_path + ["工具钢"], "tool_steel"),
        ("plastic_mold_steel", "塑料模具钢", "Plastic mould steel", steel_path + ["工具钢"], "tool_steel"),
        ("austenitic_stainless_steel", "奥氏体不锈钢", "Austenitic stainless steel", steel_path + ["不锈钢"], "stainless_steel"),
        ("ferritic_stainless_steel", "铁素体不锈钢", "Ferritic stainless steel", steel_path + ["不锈钢"], "stainless_steel"),
        ("martensitic_stainless_steel", "马氏体不锈钢", "Martensitic stainless steel", steel_path + ["不锈钢"], "stainless_steel"),
        ("duplex_stainless_steel", "双相不锈钢", "Duplex stainless steel", steel_path + ["不锈钢"], "stainless_steel"),
        ("ph_stainless_steel", "沉淀硬化不锈钢", "Precipitation-hardening stainless steel", steel_path + ["不锈钢"], "stainless_steel"),
        ("electrical_steel", "电工钢", "Electrical steel", steel_path, "steel"),
    ]
    quenchable_nodes = {
        "medium_carbon_steel", "high_carbon_steel", "low_alloy_steel", "machine_steel", "carburizing_steel",
        "quenched_tempered_steel", "spring_steel", "bearing_steel", "carbon_tool_steel", "cold_work_tool_steel",
        "hot_work_tool_steel", "plastic_mold_steel", "martensitic_stainless_steel"
    }
    solution_nodes = {"austenitic_stainless_steel", "duplex_stainless_steel"}
    for item_id, cn, en, path, parent in steel_nodes:
        states = quench_states if item_id in quenchable_nodes else (solution_states if item_id in solution_nodes else annealed_states)
        if item_id == "ph_stainless_steel":
            states = ["固溶态", "时效态"]
        elif item_id in {"structural_steel", "carbon_structural_steel", "hsla_steel", "electrical_steel"}:
            states = hot_rolled_states
        treatments = quench if item_id in quenchable_nodes else []
        add(item_id, cn, en, path, parent, "steel", "subfamily", states=states, treatments=treatments, tags=["钢铁材料"])

    grade_groups = [
        ("carbon_structural_steel", steel_path + ["结构钢", "普通碳素结构钢"], [("q235", "Q235", "Q235 structural steel"), ("q275", "Q275", "Q275 structural steel")]),
        ("low_carbon_steel", steel_path + ["非合金钢", "低碳钢"], [("steel_20", "20钢", "Grade 20 carbon steel")]),
        ("medium_carbon_steel", steel_path + ["非合金钢", "中碳钢"], [("steel_35", "35钢", "Grade 35 carbon steel"), ("steel_45", "45钢", "Grade 45 carbon steel"), ("steel_50", "50钢", "Grade 50 carbon steel")]),
        ("high_carbon_steel", steel_path + ["非合金钢", "高碳钢"], [("steel_65", "65钢", "Grade 65 carbon steel"), ("steel_70", "70钢", "Grade 70 carbon steel")]),
        ("carburizing_steel", steel_path + ["机械制造用钢", "渗碳钢"], [("steel_20cr", "20Cr", "20Cr alloy steel"), ("steel_20crmnti", "20CrMnTi", "20CrMnTi gear steel")]),
        ("quenched_tempered_steel", steel_path + ["机械制造用钢", "调质钢"], [("steel_40cr", "40Cr", "40Cr alloy steel"), ("steel_42crmo", "42CrMo", "42CrMo alloy steel"), ("steel_35crmo", "35CrMo", "35CrMo alloy steel")]),
        ("spring_steel", steel_path + ["机械制造用钢", "弹簧钢"], [("steel_65mn", "65Mn", "65Mn spring steel"), ("steel_60si2mn", "60Si2Mn", "60Si2Mn spring steel")]),
        ("bearing_steel", steel_path + ["机械制造用钢", "轴承钢"], [("steel_gcr15", "GCr15", "GCr15 bearing steel")]),
        ("carbon_tool_steel", steel_path + ["工具钢", "碳素工具钢"], [("steel_t8", "T8", "T8 carbon tool steel"), ("steel_t10", "T10", "T10 carbon tool steel"), ("steel_t12", "T12", "T12 carbon tool steel")]),
        ("cold_work_tool_steel", steel_path + ["工具钢", "冷作模具钢"], [("steel_cr12", "Cr12", "Cr12 tool steel"), ("steel_cr12mov", "Cr12MoV", "Cr12MoV tool steel"), ("steel_d2", "D2", "AISI D2 tool steel")]),
        ("hot_work_tool_steel", steel_path + ["工具钢", "热作模具钢"], [("steel_h13", "H13", "AISI H13 tool steel")]),
        ("plastic_mold_steel", steel_path + ["工具钢", "塑料模具钢"], [("steel_p20", "P20", "AISI P20 mould steel")]),
        ("high_speed_steel", steel_path + ["工具钢", "高速工具钢"], [("steel_w18cr4v", "W18Cr4V", "W18Cr4V high-speed steel"), ("steel_w6mo5cr4v2", "W6Mo5Cr4V2", "W6Mo5Cr4V2 high-speed steel"), ("steel_m2", "M2", "AISI M2 high-speed steel")]),
        ("austenitic_stainless_steel", steel_path + ["不锈钢", "奥氏体不锈钢"], [("ss_304", "304", "AISI 304 stainless steel"), ("ss_304l", "304L", "AISI 304L stainless steel"), ("ss_316", "316", "AISI 316 stainless steel"), ("ss_316l", "316L", "AISI 316L stainless steel"), ("ss_310s", "310S", "AISI 310S stainless steel")]),
        ("ferritic_stainless_steel", steel_path + ["不锈钢", "铁素体不锈钢"], [("ss_430", "430", "AISI 430 stainless steel")]),
        ("martensitic_stainless_steel", steel_path + ["不锈钢", "马氏体不锈钢"], [("ss_410", "410", "AISI 410 stainless steel"), ("ss_420", "420", "AISI 420 stainless steel"), ("ss_440c", "440C", "AISI 440C stainless steel")]),
        ("duplex_stainless_steel", steel_path + ["不锈钢", "双相不锈钢"], [("ss_2205", "2205", "2205 duplex stainless steel")]),
        ("ph_stainless_steel", steel_path + ["不锈钢", "沉淀硬化不锈钢"], [("ss_17_4ph", "17-4PH", "17-4 PH stainless steel")]),
    ]
    quenchable_grade_parents = {
        "medium_carbon_steel", "high_carbon_steel", "carburizing_steel", "quenched_tempered_steel", "spring_steel",
        "bearing_steel", "carbon_tool_steel", "cold_work_tool_steel", "hot_work_tool_steel", "plastic_mold_steel",
        "high_speed_steel", "martensitic_stainless_steel"
    }
    for parent, path, grades in grade_groups:
        for item_id, cn, en in grades:
            treatments = temper if parent == "quenched_tempered_steel" else (quench if parent in quenchable_grade_parents else [])
            states = quench_states if parent in quenchable_grade_parents else hot_rolled_states
            if parent in {"austenitic_stainless_steel", "duplex_stainless_steel"}:
                states = solution_states
            elif parent == "ferritic_stainless_steel":
                states = ["退火态"]
            elif parent == "ph_stainless_steel":
                states = ["固溶态", "时效态"]
            tags = ["钢铁材料", "可热处理"] if treatments else ["钢铁材料"]
            add(item_id, cn, en, path, parent, "steel", "grade", abbreviation=cn, aliases=[f"{cn}钢"], states=states, forms=["板材", "棒材", "锻件"], treatments=treatments, standards=[{"system": "常用牌号", "grade": cn}], tags=tags)

    cast_path = metal + ["黑色金属", "铸铁"]
    cast_types = [
        ("gray_cast_iron", "灰铸铁", "Grey cast iron"), ("ductile_cast_iron", "球墨铸铁", "Ductile iron"),
        ("compacted_graphite_iron", "蠕墨铸铁", "Compacted graphite iron"), ("malleable_cast_iron", "可锻铸铁", "Malleable cast iron"),
        ("white_cast_iron", "白口铸铁", "White cast iron"), ("chilled_cast_iron", "冷硬铸铁", "Chilled cast iron"),
        ("high_chromium_cast_iron", "高铬耐磨铸铁", "High-chromium wear-resistant cast iron"),
        ("heat_resistant_cast_iron", "耐热铸铁", "Heat-resistant cast iron"), ("austenitic_cast_iron", "奥氏体铸铁", "Austenitic cast iron"),
    ]
    for item_id, cn, en in cast_types:
        add(item_id, cn, en, cast_path, "cast_iron", "cast_iron", "subfamily", forms=["铸件"], tags=["铸造", "铸铁"])
    cast_grades = [
        ("cast_ht200", "HT200", "HT200 grey cast iron", "gray_cast_iron"), ("cast_ht250", "HT250", "HT250 grey cast iron", "gray_cast_iron"),
        ("cast_qt400_18", "QT400-18", "QT400-18 ductile iron", "ductile_cast_iron"), ("cast_qt500_7", "QT500-7", "QT500-7 ductile iron", "ductile_cast_iron"),
        ("cast_qt600_3", "QT600-3", "QT600-3 ductile iron", "ductile_cast_iron"), ("cast_rut420", "RuT420", "RuT420 compacted graphite iron", "compacted_graphite_iron"),
        ("cast_kth350_10", "KTH350-10", "KTH350-10 malleable cast iron", "malleable_cast_iron"),
    ]
    for item_id, cn, en, parent in cast_grades:
        parent_name = next(item[1] for item in cast_types if item[0] == parent)
        add(item_id, cn, en, cast_path + [parent_name], parent, "cast_iron", "grade", abbreviation=cn, forms=["铸件"], standards=[{"system": "GB", "grade": cn}], tags=["铸铁", "工程牌号"])

    nonferrous = metal + ["有色金属"]
    alloy_groups = [
        ("pure_aluminum", "纯铝", "Pure aluminium", "aluminum_alloy", "aluminum_alloy", nonferrous + ["铝及铝合金"]),
        ("al_1xxx", "1xxx系纯铝", "1xxx series aluminium", "aluminum_alloy", "aluminum_alloy", nonferrous + ["铝及铝合金"]),
        ("al_2xxx", "2xxx系铝铜合金", "2xxx Al-Cu alloys", "aluminum_alloy", "aluminum_alloy", nonferrous + ["铝及铝合金"]),
        ("al_3xxx", "3xxx系铝锰合金", "3xxx Al-Mn alloys", "aluminum_alloy", "aluminum_alloy", nonferrous + ["铝及铝合金"]),
        ("al_4xxx", "4xxx系铝硅合金", "4xxx Al-Si alloys", "aluminum_alloy", "aluminum_alloy", nonferrous + ["铝及铝合金"]),
        ("al_5xxx", "5xxx系铝镁合金", "5xxx Al-Mg alloys", "aluminum_alloy", "aluminum_alloy", nonferrous + ["铝及铝合金"]),
        ("al_6xxx", "6xxx系铝镁硅合金", "6xxx Al-Mg-Si alloys", "aluminum_alloy", "aluminum_alloy", nonferrous + ["铝及铝合金"]),
        ("al_7xxx", "7xxx系铝锌镁合金", "7xxx Al-Zn-Mg alloys", "aluminum_alloy", "aluminum_alloy", nonferrous + ["铝及铝合金"]),
        ("cast_aluminum_alloy", "铸造铝合金", "Cast aluminium alloys", "aluminum_alloy", "aluminum_alloy", nonferrous + ["铝及铝合金"]),
    ]
    for item_id, cn, en, parent, canonical, path in alloy_groups:
        add(item_id, cn, en, path, parent, canonical, "subfamily", states=["O", "H14", "T4", "T5", "T6", "T651"], tags=["铝合金", "轻量化"])
    al_grades = [
        ("al_1050", "1050", "AA 1050 aluminium", "al_1xxx"), ("al_1060", "1060", "AA 1060 aluminium", "al_1xxx"),
        ("al_2024", "2024", "AA 2024 aluminium alloy", "al_2xxx"), ("al_3003", "3003", "AA 3003 aluminium alloy", "al_3xxx"),
        ("al_5052", "5052", "AA 5052 aluminium alloy", "al_5xxx"), ("al_5083", "5083", "AA 5083 aluminium alloy", "al_5xxx"),
        ("al_6061", "6061", "AA 6061 aluminium alloy", "al_6xxx"), ("al_6063", "6063", "AA 6063 aluminium alloy", "al_6xxx"),
        ("al_7075", "7075", "AA 7075 aluminium alloy", "al_7xxx"), ("al_adc12", "ADC12", "ADC12 die-casting aluminium alloy", "cast_aluminum_alloy"),
        ("al_zl101", "ZL101", "ZL101 cast aluminium alloy", "cast_aluminum_alloy"),
    ]
    al_names = {item[0]: item[1] for item in alloy_groups}
    for item_id, cn, en, parent in al_grades:
        add(item_id, cn, en, nonferrous + ["铝及铝合金", al_names[parent]], parent, "aluminum_alloy", "grade", abbreviation=cn, states=["O", "H14", "T4", "T5", "T6", "T651"], forms=["板材", "型材", "棒材", "铸件"], standards=[{"system": "常用牌号", "grade": cn}], tags=["铝合金", "轻量化"])

    copper_groups = [
        ("pure_copper", "纯铜", "Pure copper"), ("oxygen_free_copper", "无氧铜", "Oxygen-free copper"), ("brass", "黄铜", "Brass"),
        ("tin_bronze", "锡青铜", "Tin bronze"), ("aluminum_bronze", "铝青铜", "Aluminium bronze"), ("phosphor_bronze", "磷青铜", "Phosphor bronze"),
        ("beryllium_copper", "铍铜", "Beryllium copper"), ("cupronickel", "白铜", "Cupronickel"), ("chromium_zirconium_copper", "铬锆铜", "Chromium zirconium copper"),
    ]
    for item_id, cn, en in copper_groups:
        add(item_id, cn, en, nonferrous + ["铜及铜合金"], "copper_alloy", "copper_alloy", "subfamily", forms=["板带", "棒材", "管材", "线材"], tags=["铜合金", "导电"])
    copper_grades = [
        ("cu_t2", "T2", "T2 copper", "pure_copper"), ("cu_tu1", "TU1", "TU1 oxygen-free copper", "oxygen_free_copper"),
        ("cu_h62", "H62", "H62 brass", "brass"), ("cu_h68", "H68", "H68 brass", "brass"),
        ("cu_qsn6_5_0_1", "QSn6.5-0.1", "QSn6.5-0.1 phosphor bronze", "phosphor_bronze"), ("cu_qal9_4", "QAl9-4", "QAl9-4 aluminium bronze", "aluminum_bronze"),
        ("cu_qbe2", "QBe2", "QBe2 beryllium copper", "beryllium_copper"), ("cu_b30", "B30", "B30 cupronickel", "cupronickel"),
        ("cu_cucrzr", "CuCrZr", "CuCrZr alloy", "chromium_zirconium_copper"),
    ]
    copper_names = {item[0]: item[1] for item in copper_groups}
    for item_id, cn, en, parent in copper_grades:
        add(item_id, cn, en, nonferrous + ["铜及铜合金", copper_names[parent]], parent, "copper_alloy", "grade", abbreviation=cn, forms=["板带", "棒材", "管材", "线材"], standards=[{"system": "常用牌号", "grade": cn}], tags=["铜合金"])

    ti_groups = [("commercially_pure_titanium", "工业纯钛", "Commercially pure titanium"), ("alpha_titanium_alloy", "α型钛合金", "Alpha titanium alloy"), ("near_alpha_titanium_alloy", "近α型钛合金", "Near-alpha titanium alloy"), ("alpha_beta_titanium_alloy", "α+β型钛合金", "Alpha-beta titanium alloy"), ("beta_titanium_alloy", "β型钛合金", "Beta titanium alloy")]
    for item_id, cn, en in ti_groups:
        add(item_id, cn, en, nonferrous + ["钛及钛合金"], "titanium_alloy", "titanium_alloy", "subfamily", tags=["钛合金", "耐腐蚀"])
    ti_grades = [("ti_ta1", "TA1", "TA1 commercially pure titanium", "commercially_pure_titanium"), ("ti_ta2", "TA2", "TA2 commercially pure titanium", "commercially_pure_titanium"), ("ti_ta15", "TA15", "TA15 titanium alloy", "near_alpha_titanium_alloy"), ("ti_tc4", "TC4 / Ti-6Al-4V", "Ti-6Al-4V titanium alloy", "alpha_beta_titanium_alloy"), ("ti_tc11", "TC11", "TC11 titanium alloy", "alpha_beta_titanium_alloy"), ("ti_tb6", "TB6", "TB6 beta titanium alloy", "beta_titanium_alloy"), ("ti_6al_4v_eli", "Ti-6Al-4V ELI", "Extra-low-interstitial Ti-6Al-4V", "alpha_beta_titanium_alloy")]
    ti_names = {item[0]: item[1] for item in ti_groups}
    for item_id, cn, en, parent in ti_grades:
        aliases = ["Ti-6Al-4V", "TC4"] if item_id == "ti_tc4" else []
        add(item_id, cn, en, nonferrous + ["钛及钛合金", ti_names[parent]], parent, "titanium_alloy", "grade", abbreviation=cn, aliases=aliases, states=["退火态", "固溶时效态"], forms=["板材", "棒材", "锻件", "粉末"], standards=[{"system": "常用牌号", "grade": cn}], tags=["钛合金", "轻量化"])

    mg_groups = [("mg_al_zn", "Mg-Al-Zn系", "Mg-Al-Zn magnesium alloys"), ("mg_zn_zr", "Mg-Zn-Zr系", "Mg-Zn-Zr magnesium alloys"), ("mg_al_mn", "Mg-Al-Mn系", "Mg-Al-Mn magnesium alloys"), ("rare_earth_magnesium", "稀土镁合金", "Rare-earth magnesium alloys")]
    for item_id, cn, en in mg_groups:
        add(item_id, cn, en, nonferrous + ["镁及镁合金"], "magnesium_alloy", "magnesium_alloy", "subfamily", tags=["镁合金", "轻量化"])
    mg_grades = [("mg_az31", "AZ31", "AZ31 magnesium alloy", "mg_al_zn"), ("mg_az91", "AZ91", "AZ91 magnesium alloy", "mg_al_zn"), ("mg_am60", "AM60", "AM60 magnesium alloy", "mg_al_mn"), ("mg_zk60", "ZK60", "ZK60 magnesium alloy", "mg_zn_zr"), ("mg_we43", "WE43", "WE43 magnesium alloy", "rare_earth_magnesium")]
    mg_names = {item[0]: item[1] for item in mg_groups}
    for item_id, cn, en, parent in mg_grades:
        add(item_id, cn, en, nonferrous + ["镁及镁合金", mg_names[parent]], parent, "magnesium_alloy", "grade", abbreviation=cn, forms=["板材", "挤压材", "铸件"], standards=[{"system": "常用牌号", "grade": cn}], tags=["镁合金", "轻量化"])

    nickel_groups = [("commercial_nickel", "工业纯镍", "Commercially pure nickel", "nickel_alloy", nonferrous + ["镍及镍合金"]), ("nickel_copper_alloy", "镍铜合金", "Nickel-copper alloy", "nickel_alloy", nonferrous + ["镍及镍合金"]), ("nickel_chromium_alloy", "镍铬合金", "Nickel-chromium alloy", "nickel_alloy", nonferrous + ["镍及镍合金"]), ("nickel_chromium_molybdenum", "镍铬钼耐蚀合金", "Ni-Cr-Mo corrosion-resistant alloy", "nickel_alloy", nonferrous + ["镍及镍合金"]), ("wrought_superalloy", "变形高温合金", "Wrought superalloy", "nickel_superalloy", metal + ["高温合金", "镍基高温合金"]), ("cast_superalloy", "铸造高温合金", "Cast superalloy", "nickel_superalloy", metal + ["高温合金", "镍基高温合金"]), ("single_crystal_superalloy", "单晶高温合金", "Single-crystal superalloy", "nickel_superalloy", metal + ["高温合金", "镍基高温合金"]), ("powder_superalloy", "粉末高温合金", "Powder metallurgy superalloy", "nickel_superalloy", metal + ["高温合金", "镍基高温合金"])]
    for item_id, cn, en, parent, path in nickel_groups:
        add(item_id, cn, en, path, parent, "nickel_alloy" if parent == "nickel_alloy" else "nickel_superalloy", "subfamily", tags=["镍合金", "耐腐蚀"])
    nickel_grades = [("ni_200", "Ni 200", "Nickel 200", "commercial_nickel"), ("monel_400", "Monel 400", "Monel 400 nickel-copper alloy", "nickel_copper_alloy"), ("inconel_600", "Inconel 600", "Inconel 600", "nickel_chromium_alloy"), ("inconel_625", "Inconel 625", "Inconel 625", "nickel_chromium_molybdenum"), ("inconel_718", "Inconel 718", "Inconel 718", "wrought_superalloy"), ("hastelloy_c276", "Hastelloy C-276", "Hastelloy C-276", "nickel_chromium_molybdenum"), ("gh4169", "GH4169", "GH4169 superalloy", "wrought_superalloy"), ("k418", "K418", "K418 cast superalloy", "cast_superalloy")]
    nickel_lookup = {item[0]: (item[1], item[4]) for item in nickel_groups}
    for item_id, cn, en, parent in nickel_grades:
        parent_name, parent_path = nickel_lookup[parent]
        add(item_id, cn, en, parent_path + [parent_name], parent, "nickel_superalloy" if "superalloy" in parent else "nickel_alloy", "grade", abbreviation=cn, states=["固溶态", "时效态"], forms=["板材", "棒材", "锻件", "铸件"], standards=[{"system": "常用牌号", "grade": cn}], tags=["镍合金", "耐腐蚀", "耐高温"])

    wood_path = ["天然与生物基材料", "植物来源材料", "木材"]
    wood_groups = [("softwood", "针叶材", "Softwood"), ("hardwood", "阔叶材", "Hardwood"), ("modified_wood", "改性木材", "Modified wood"), ("engineered_wood", "工程木制品", "Engineered wood products")]
    for item_id, cn, en in wood_groups:
        add(item_id, cn, en, wood_path, "wood", "wood", "subfamily", forms=["原木", "锯材", "板材"], tags=["木材", "天然材料"])
    softwoods = [("chinese_fir", "杉木", "Chinese fir"), ("masson_pine", "马尾松", "Masson pine"), ("mongolian_pine", "樟子松", "Mongolian pine"), ("korean_pine", "红松", "Korean pine"), ("spruce_wood", "云杉", "Spruce wood"), ("fir_wood", "冷杉", "Fir wood"), ("larch_wood", "落叶松", "Larch wood"), ("cypress_wood", "柏木", "Cypress wood"), ("radiata_pine", "辐射松", "Radiata pine"), ("douglas_fir", "花旗松", "Douglas fir"), ("cedar_wood", "雪松", "Cedar wood")]
    hardwoods = [("poplar_wood", "杨木", "Poplar wood"), ("birch_wood", "桦木", "Birch wood"), ("beech_wood", "榉木", "Beech wood"), ("ash_wood", "水曲柳", "Manchurian ash wood"), ("oak_wood", "橡木", "Oak wood"), ("maple_wood", "枫木", "Maple wood"), ("basswood", "椴木", "Basswood"), ("paulownia_wood", "泡桐", "Paulownia wood"), ("elm_wood", "榆木", "Elm wood"), ("camphor_wood", "樟木", "Camphor wood"), ("walnut_wood", "核桃木", "Walnut wood"), ("teak_wood", "柚木", "Teak wood"), ("mahogany_wood", "桃花心木", "Mahogany"), ("eucalyptus_wood", "桉木", "Eucalyptus wood"), ("rubberwood", "橡胶木", "Rubberwood"), ("ebony_wood", "黑檀", "Ebony"), ("rosewood", "紫檀", "Rosewood")]
    for parent, parent_cn, items in [("softwood", "针叶材", softwoods), ("hardwood", "阔叶材", hardwoods)]:
        for item_id, cn, en in items:
            add(item_id, cn, en, wood_path + [parent_cn], parent, "wood", "material", aliases=[f"{cn}木材"], forms=["原木", "锯材", "单板"], tags=[parent_cn, "木材", "天然材料"])
    modified = [("thermally_modified_wood", "热处理木", "Thermally modified wood"), ("preservative_treated_wood", "防腐木", "Preservative-treated wood"), ("fire_retardant_wood", "阻燃木", "Fire-retardant wood"), ("acetylated_wood", "乙酰化木材", "Acetylated wood"), ("resin_impregnated_wood", "树脂浸渍木材", "Resin-impregnated wood"), ("densified_wood", "压缩木", "Densified wood"), ("wood_plastic_composite", "木塑复合材料", "Wood-plastic composite")]
    for item_id, cn, en in modified:
        add(item_id, cn, en, wood_path + ["改性木材"], "modified_wood", "wood", "variant", forms=["板材", "型材"], tags=["改性木材"])
    engineered = [("particleboard", "刨花板", "Particleboard"), ("hdf", "高密度纤维板", "High-density fibreboard"), ("osb", "定向刨花板", "Oriented strand board"), ("lvl", "单板层积材", "Laminated veneer lumber"), ("glulam", "胶合木", "Glue-laminated timber"), ("clt", "正交胶合木", "Cross-laminated timber"), ("blockboard", "木工板", "Blockboard"), ("reconstituted_bamboo", "重组竹", "Reconstituted bamboo"), ("laminated_bamboo", "竹集成材", "Laminated bamboo lumber")]
    for item_id, cn, en in engineered:
        add(item_id, cn, en, wood_path + ["工程木制品"], "engineered_wood", "wood", "form", forms=["板材", "结构构件"], tags=["工程木", "建筑板材"])

    polymer_families = [
        ("polyolefins", "聚烯烃", "Polyolefins", ["高分子材料", "热塑性塑料"]),
        ("styrenic_polymers", "苯乙烯类聚合物", "Styrenic polymers", ["高分子材料", "热塑性塑料"]),
        ("engineering_thermoplastics", "工程热塑性塑料", "Engineering thermoplastics", ["高分子材料", "热塑性塑料"]),
        ("thermoplastic_polyesters", "热塑性聚酯", "Thermoplastic polyesters", ["高分子材料", "热塑性塑料"]),
        ("high_performance_polymers", "高性能聚合物", "High-performance polymers", ["高分子材料"]),
        ("fluoropolymers", "含氟聚合物", "Fluoropolymers", ["高分子材料", "热塑性塑料"]),
        ("thermosetting_resins", "热固性树脂", "Thermosetting resins", ["高分子材料"]),
        ("elastomers", "弹性体", "Elastomers", ["高分子材料"]),
        ("biodegradable_polymers", "生物可降解聚合物", "Biodegradable polymers", ["高分子材料"]),
    ]
    for item_id, cn, en, path in polymer_families:
        add(item_id, cn, en, path, "", item_id, "family", tags=["高分子材料"])

    polymer_variants = [
        ("polyethylene", ["高分子材料", "热塑性塑料", "聚烯烃", "聚乙烯"], [("ldpe", "LDPE", "Low-density polyethylene", "variant"), ("lldpe", "LLDPE", "Linear low-density polyethylene", "variant"), ("mdpe", "MDPE", "Medium-density polyethylene", "variant"), ("hdpe", "HDPE", "High-density polyethylene", "variant"), ("uhmwpe", "UHMWPE", "Ultra-high-molecular-weight polyethylene", "variant"), ("xlpe", "XLPE", "Cross-linked polyethylene", "variant")]),
        ("polypropylene", ["高分子材料", "热塑性塑料", "聚烯烃", "聚丙烯"], [("pp_homopolymer", "均聚PP", "Polypropylene homopolymer", "variant"), ("pp_random_copolymer", "无规共聚PP", "Random copolymer polypropylene", "variant"), ("pp_block_copolymer", "嵌段共聚PP", "Impact copolymer polypropylene", "variant"), ("gf_pp", "玻纤增强PP", "Glass-fibre-reinforced polypropylene", "variant"), ("lgf_pp", "长玻纤增强PP", "Long-glass-fibre-reinforced polypropylene", "variant")]),
        ("polystyrene", ["高分子材料", "热塑性塑料", "苯乙烯类聚合物", "聚苯乙烯"], [("gpps", "GPPS", "General-purpose polystyrene", "variant"), ("hips", "HIPS", "High-impact polystyrene", "variant"), ("eps", "EPS", "Expanded polystyrene", "form"), ("xps", "XPS", "Extruded polystyrene foam", "form")]),
        ("polyamide", ["高分子材料", "热塑性塑料", "工程热塑性塑料", "聚酰胺"], [("pa6", "PA6", "Polyamide 6", "material"), ("pa66", "PA66", "Polyamide 66", "material"), ("pa610", "PA610", "Polyamide 610", "material"), ("pa612", "PA612", "Polyamide 612", "material"), ("pa11", "PA11", "Polyamide 11", "material"), ("pa12", "PA12", "Polyamide 12", "material"), ("pa46", "PA46", "Polyamide 46", "material"), ("pa6t", "PA6T", "Polyamide 6T", "material"), ("pa9t", "PA9T", "Polyamide 9T", "material"), ("mxd6", "MXD6", "Polyamide MXD6", "material"), ("gf_pa6", "玻纤增强PA6", "Glass-fibre-reinforced PA6", "variant"), ("gf_pa66", "玻纤增强PA66", "Glass-fibre-reinforced PA66", "variant")]),
        ("pet", ["高分子材料", "热塑性塑料", "热塑性聚酯"], [("pen", "PEN", "Polyethylene naphthalate", "material"), ("pct", "PCT", "Polycyclohexylenedimethylene terephthalate", "material"), ("petg", "PETG", "Glycol-modified PET", "variant")]),
        ("peek", ["高分子材料", "高性能聚合物"], [("pekk", "PEKK", "Polyetherketoneketone", "material"), ("pei", "PEI", "Polyetherimide", "material"), ("psu", "PSU", "Polysulfone", "material"), ("pes", "PES", "Polyethersulfone", "material"), ("ppsu", "PPSU", "Polyphenylsulfone", "material"), ("cf_peek", "碳纤增强PEEK", "Carbon-fibre-reinforced PEEK", "variant"), ("hydroxyapatite_peek", "羟基磷灰石/PEEK复合材料", "Hydroxyapatite/PEEK composite", "variant")]),
    ]
    for parent, path, variants in polymer_variants:
        for item_id, cn, en, entity in variants:
            record_parent = parent
            canonical = parent
            if parent == "pet" and item_id in {"pen", "pct"}:
                record_parent, canonical = "thermoplastic_polyesters", item_id
            elif parent == "peek" and item_id not in {"cf_peek", "hydroxyapatite_peek"}:
                record_parent, canonical = "high_performance_polymers", item_id
            record_path = EXISTING_PATH_OVERRIDES["peek"] if parent == "peek" and canonical == "peek" else path
            applications = ["骨修复", "医疗植入"] if item_id == "hydroxyapatite_peek" else []
            tags = ["高分子材料", "生物活性", "医用"] if item_id == "hydroxyapatite_peek" else ["高分子材料"]
            aliases = ["HA/PEEK"] if item_id == "hydroxyapatite_peek" else ([en.split(" ")[0]] if cn.isascii() else [])
            forms = ["颗粒", "板材", "植入物"] if item_id == "hydroxyapatite_peek" else ["颗粒", "板材", "薄膜"]
            add(item_id, cn, en, record_path, record_parent, canonical, entity, abbreviation=cn if cn.isascii() else "", aliases=aliases, forms=forms, tags=tags, applications=applications)
    styrenics = [("san", "SAN", "Styrene-acrylonitrile copolymer"), ("asa", "ASA", "Acrylonitrile styrene acrylate")]
    for item_id, cn, en in styrenics:
        add(item_id, cn, en, ["高分子材料", "热塑性塑料", "苯乙烯类聚合物"], "styrenic_polymers", item_id, "material", abbreviation=cn, tags=["高分子材料"])
    fluoropolymers = [("fep", "FEP", "Fluorinated ethylene propylene"), ("pfa", "PFA", "Perfluoroalkoxy alkane"), ("etfe", "ETFE", "Ethylene tetrafluoroethylene"), ("pvdf", "PVDF", "Polyvinylidene fluoride"), ("ectfe", "ECTFE", "Ethylene chlorotrifluoroethylene")]
    for item_id, cn, en in fluoropolymers:
        add(item_id, cn, en, ["高分子材料", "热塑性塑料", "含氟聚合物"], "fluoropolymers", item_id, "material", abbreviation=cn, tags=["含氟聚合物", "耐腐蚀"])
    thermosets = [("bisphenol_a_epoxy", "双酚A型环氧树脂", "Bisphenol-A epoxy resin", "epoxy_resin"), ("novolac_epoxy", "酚醛环氧树脂", "Novolac epoxy resin", "epoxy_resin"), ("phenolic_resin", "酚醛树脂", "Phenolic resin", ""), ("unsaturated_polyester_resin", "不饱和聚酯树脂", "Unsaturated polyester resin", ""), ("vinyl_ester_resin", "乙烯基酯树脂", "Vinyl ester resin", ""), ("silicone_resin", "有机硅树脂", "Silicone resin", ""), ("bismaleimide_resin", "双马来酰亚胺树脂", "Bismaleimide resin", ""), ("cyanate_ester_resin", "氰酸酯树脂", "Cyanate ester resin", "")]
    for item_id, cn, en, parent in thermosets:
        add(item_id, cn, en, ["高分子材料", "热固性树脂"], parent or "thermosetting_resins", parent or item_id, "variant" if parent else "material", tags=["热固性树脂"])
    elastomers = [("sbr", "丁苯橡胶", "Styrene-butadiene rubber"), ("br", "顺丁橡胶", "Polybutadiene rubber"), ("nbr", "丁腈橡胶", "Nitrile rubber"), ("hnbr", "氢化丁腈橡胶", "Hydrogenated nitrile rubber"), ("cr_rubber", "氯丁橡胶", "Chloroprene rubber"), ("epdm", "三元乙丙橡胶", "EPDM rubber"), ("iir", "丁基橡胶", "Butyl rubber"), ("tpu", "TPU", "Thermoplastic polyurethane elastomer"), ("tpe_s", "TPE-S", "Styrenic thermoplastic elastomer"), ("tpo", "TPO", "Thermoplastic polyolefin"), ("tpv", "TPV", "Thermoplastic vulcanizate")]
    for item_id, cn, en in elastomers:
        add(item_id, cn, en, ["高分子材料", "弹性体"], "elastomers", item_id, "material", abbreviation=cn if cn.isascii() else "", tags=["弹性体"])
    degradables = [("pga", "PGA", "Polyglycolic acid"), ("plga", "PLGA", "Poly(lactic-co-glycolic acid)"), ("pcl", "PCL", "Polycaprolactone"), ("pbs", "PBS", "Polybutylene succinate"), ("pbat", "PBAT", "Polybutylene adipate terephthalate"), ("pha", "PHA", "Polyhydroxyalkanoate"), ("phb", "PHB", "Polyhydroxybutyrate"), ("starch_plastic", "淀粉基塑料", "Starch-based plastic"), ("cellulose_material", "纤维素材料", "Cellulose material")]
    for item_id, cn, en in degradables:
        add(item_id, cn, en, ["高分子材料", "生物可降解聚合物"], "biodegradable_polymers", item_id, "material", abbreviation=cn if cn.isascii() else "", tags=["可降解", "生物基"])

    ceramic_specs = [
        ("oxide_ceramics", "氧化物陶瓷", "Oxide ceramics", ["无机非金属材料"], "family"),
        ("nonoxide_ceramics", "非氧化物陶瓷", "Non-oxide ceramics", ["无机非金属材料"], "family"),
        ("glass_materials", "玻璃", "Glass materials", ["无机非金属材料"], "family"),
        ("refractory_materials", "耐火材料体系", "Refractory materials", ["无机非金属材料"], "family"),
    ]
    for item_id, cn, en, path, entity in ceramic_specs:
        add(item_id, cn, en, path, "", item_id, entity)
    oxide_items = [("magnesia_ceramic", "氧化镁陶瓷", "Magnesia ceramic"), ("beryllia_ceramic", "氧化铍陶瓷", "Beryllia ceramic"), ("titania_ceramic", "氧化钛陶瓷", "Titania ceramic"), ("mullite_ceramic", "莫来石陶瓷", "Mullite ceramic"), ("cordierite_ceramic", "堇青石陶瓷", "Cordierite ceramic"), ("zinc_oxide_ceramic", "氧化锌陶瓷", "Zinc oxide ceramic"), ("ceria_ceramic", "氧化铈陶瓷", "Ceria ceramic")]
    for item_id, cn, en in oxide_items:
        add(item_id, cn, en, ["无机非金属材料", "氧化物陶瓷"], "oxide_ceramics", item_id, "material", tags=["陶瓷", "无机非金属"])
    nonoxide_items = [("aluminum_nitride_ceramic", "氮化铝陶瓷", "Aluminium nitride ceramic"), ("boron_nitride_ceramic", "氮化硼陶瓷", "Boron nitride ceramic"), ("boron_carbide_ceramic", "碳化硼陶瓷", "Boron carbide ceramic"), ("titanium_carbide_ceramic", "碳化钛陶瓷", "Titanium carbide ceramic"), ("titanium_nitride_ceramic", "氮化钛陶瓷", "Titanium nitride ceramic"), ("tungsten_carbide", "碳化钨", "Tungsten carbide"), ("titanium_diboride", "二硼化钛", "Titanium diboride"), ("zirconium_diboride", "二硼化锆", "Zirconium diboride")]
    for item_id, cn, en in nonoxide_items:
        add(item_id, cn, en, ["无机非金属材料", "非氧化物陶瓷"], "nonoxide_ceramics", item_id, "material", tags=["陶瓷", "耐高温"])
    glass_items = [("soda_lime_glass", "钠钙玻璃", "Soda-lime glass"), ("aluminosilicate_glass", "铝硅酸盐玻璃", "Aluminosilicate glass"), ("lead_glass", "铅玻璃", "Lead glass"), ("optical_glass", "光学玻璃", "Optical glass"), ("glass_ceramic", "微晶玻璃", "Glass-ceramic"), ("laminated_glass", "夹层玻璃", "Laminated glass"), ("insulating_glass", "中空玻璃", "Insulating glass"), ("low_e_glass", "低辐射玻璃", "Low-emissivity glass")]
    for item_id, cn, en in glass_items:
        add(item_id, cn, en, ["无机非金属材料", "玻璃"], "glass_materials", item_id, "material", forms=["板材", "管材", "制品"], tags=["玻璃"])
    refractory_items = [("silica_brick", "硅砖", "Silica refractory brick"), ("high_alumina_brick", "高铝砖", "High-alumina brick"), ("fireclay_brick", "黏土砖", "Fireclay brick"), ("magnesia_brick", "镁砖", "Magnesia brick"), ("magnesia_carbon_brick", "镁碳砖", "Magnesia-carbon brick"), ("carbon_brick", "碳砖", "Carbon brick"), ("refractory_castable", "耐火浇注料", "Refractory castable"), ("gunning_refractory", "喷补料", "Gunning refractory"), ("refractory_fiber", "耐火纤维", "Refractory fibre")]
    for item_id, cn, en in refractory_items:
        add(item_id, cn, en, ["无机非金属材料", "耐火材料"], "refractory_materials", item_id, "material", tags=["耐火材料", "耐高温"])

    composite_groups = [("polymer_matrix_composites", "聚合物基复合材料", "Polymer matrix composites"), ("metal_matrix_composites", "金属基复合材料", "Metal matrix composites"), ("ceramic_matrix_composites", "陶瓷基复合材料", "Ceramic matrix composites"), ("structural_composites", "结构复合材料", "Structural composites")]
    for item_id, cn, en in composite_groups:
        add(item_id, cn, en, ["复合材料"], "", item_id, "family")
    composite_items = [
        ("cf_peek_composite", "碳纤维/PEEK复合材料", "Carbon-fibre/PEEK composite", "polymer_matrix_composites", "variant"),
        ("glass_epoxy_composite", "玻璃纤维/环氧复合材料", "Glass-fibre/epoxy composite", "polymer_matrix_composites", "material"),
        ("glass_polyester_composite", "玻璃纤维/聚酯复合材料", "Glass-fibre/polyester composite", "polymer_matrix_composites", "material"),
        ("basalt_fiber_composite", "玄武岩纤维复合材料", "Basalt-fibre composite", "polymer_matrix_composites", "material"),
        ("natural_fiber_composite", "天然纤维复合材料", "Natural-fibre composite", "polymer_matrix_composites", "material"),
        ("short_glass_fiber_plastic", "短玻纤增强塑料", "Short-glass-fibre-reinforced plastic", "polymer_matrix_composites", "variant"),
        ("long_glass_fiber_plastic", "长玻纤增强塑料", "Long-glass-fibre-reinforced plastic", "polymer_matrix_composites", "variant"),
        ("continuous_fiber_thermoplastic", "连续纤维增强热塑性复合材料", "Continuous-fibre thermoplastic composite", "polymer_matrix_composites", "material"),
        ("smc", "SMC", "Sheet moulding compound", "polymer_matrix_composites", "form"), ("bmc", "BMC", "Bulk moulding compound", "polymer_matrix_composites", "form"),
        ("al_sic_mmc", "Al/SiC", "Aluminium/silicon-carbide composite", "metal_matrix_composites", "material"),
        ("al_alumina_mmc", "Al/Al₂O₃", "Aluminium/alumina composite", "metal_matrix_composites", "material"),
        ("magnesium_mmc", "镁基复合材料", "Magnesium matrix composite", "metal_matrix_composites", "material"),
        ("titanium_mmc", "钛基复合材料", "Titanium matrix composite", "metal_matrix_composites", "material"),
        ("copper_mmc", "铜基复合材料", "Copper matrix composite", "metal_matrix_composites", "material"),
        ("cnt_aluminum_composite", "碳纳米管增强铝基复合材料", "CNT-reinforced aluminium composite", "metal_matrix_composites", "material"),
        ("c_sic", "C/SiC", "Carbon-fibre/silicon-carbide composite", "ceramic_matrix_composites", "material"),
        ("oxide_oxide_cmc", "Oxide/Oxide", "Oxide-fibre/oxide-matrix composite", "ceramic_matrix_composites", "material"),
        ("zta", "氧化锆增韧氧化铝", "Zirconia-toughened alumina", "ceramic_matrix_composites", "material"),
        ("sic_alumina_composite", "SiC颗粒增强氧化铝", "SiC-particle-reinforced alumina", "ceramic_matrix_composites", "material"),
        ("carbon_fiber_cmc", "碳纤维增强陶瓷基复合材料", "Carbon-fibre-reinforced ceramic matrix composite", "ceramic_matrix_composites", "material"),
        ("aluminum_honeycomb_panel", "铝蜂窝夹层板", "Aluminium honeycomb sandwich panel", "structural_composites", "form"),
        ("aramid_honeycomb_panel", "芳纶蜂窝夹层板", "Aramid honeycomb sandwich panel", "structural_composites", "form"),
        ("foam_sandwich_panel", "泡沫夹层板", "Foam-core sandwich panel", "structural_composites", "form"),
        ("fiber_metal_laminate", "纤维金属层板", "Fibre metal laminate", "structural_composites", "material"),
        ("hybrid_fiber_laminate", "混杂纤维层合板", "Hybrid-fibre laminate", "structural_composites", "material"),
        ("functionally_graded_material", "功能梯度材料", "Functionally graded material", "structural_composites", "material"),
    ]
    composite_names = {item[0]: item[1] for item in composite_groups}
    for item_id, cn, en, parent, entity in composite_items:
        add(item_id, cn, en, ["复合材料", composite_names[parent]], parent, item_id, entity, abbreviation=cn if cn.isascii() else "", tags=["复合材料", "各向异性"])

    carbon_items = [("graphite", "石墨", "Graphite"), ("diamond", "金刚石", "Diamond"), ("carbon_black", "炭黑", "Carbon black"), ("carbon_fiber", "碳纤维", "Carbon fibre"), ("fullerene", "富勒烯", "Fullerene"), ("carbon_aerogel", "碳气凝胶", "Carbon aerogel"), ("glassy_carbon", "玻璃碳", "Glassy carbon")]
    for item_id, cn, en in carbon_items:
        add(item_id, cn, en, ["碳材料"], "", item_id, "material", tags=["碳材料"])

    return records
