let materials = window.MATERIALS_DATA || [];
let collections = window.MATERIAL_COLLECTIONS || [];
let taxonomyModel = null;
const taxonomyApi = window.MaterialBoxTaxonomy;
const categorySystem = window.MATERIAL_CATEGORIES || [];
window.MATERIALBOX_DATA_SOURCE = "materials.js (generated from materials.json)";
const materialImageMap = window.MATERIAL_IMAGE_MAP || {};
const materialImagePolicyApi = window.MaterialBoxImagePolicy;
const materialImageTypes = ["macro", "micro", "structure"];
const quickTags = ["PEEK", "碳纤维", "钛合金", "石墨烯", "锂电池材料", "木材", "塑料", "金属", "陶瓷", "建筑", "纺织", "电子", "医用", "储能", "天然材料"];
const recommendedIds = ["wood", "bamboo", "peek", "carbon_fiber_epoxy", "aluminum_alloy", "alumina_ceramic", "graphene", "natural_stone"];
const hotSearchTerms = ["PEEK", "碳纤维", "钛合金", "石墨烯", "锂电池材料"];
const searchCollectionIntentGroups = [
  {
    label: "新能源材料",
    terms: ["新能源", "新能源材料"],
    collectionIds: [
      "new_energy_vehicle", "lithium_ion_battery", "sodium_ion_battery", "solid_state_battery",
      "hydrogen_fuel_cell", "photovoltaic_materials", "supercapacitor_materials"
    ]
  }
];
const engineeringFieldOrder = [
  ["density", "密度"], ["melting_point", "熔点"], ["service_temperature", "使用温度"], ["tensile_strength", "抗拉强度"],
  ["elastic_modulus", "弹性模量"], ["thermal_conductivity", "导热率"], ["electrical_resistivity", "电阻率"],
  ["hardness", "硬度"], ["hardness_condition", "硬度条件"], ["corrosion_resistance", "耐腐蚀性"], ["cost_level", "成本等级"]
];
const temperatureFilterOptions = ["全部", "常温与低温", "中温 150-300℃", "高温 300-800℃", "超高温 800℃以上", "暂无数据"];
const costFilterOptions = ["全部", "低", "中", "较高", "高", "很高", "暂无数据"];
const UNKNOWN_DATA = "暂无数据";

const state = {
  query: "",
  category1: "全部",
  category2: "全部",
  tag: "全部",
  application: "全部",
  processing: "全部",
  family: "全部",
  entityType: "全部",
  collectionId: "全部",
  productForm: "全部",
  materialState: "全部",
  dataQuality: "全部",
  taxonomyPath: [],
  costLevel: "全部",
  temperatureRange: "全部",
  resultsExpanded: false,
  collectionsExpanded: false,
  compareMode: "all",
  favorites: new Set(readStorageArray("materialbox:favorites")),
  compareItems: new Set(readStorageArray("materialbox:compare"))
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const hasItems = (value) => Array.isArray(value) && value.length > 0;

function prepareMaterialData() {
  if (taxonomyApi) materials = materials.map(taxonomyApi.normalizeMaterial);
  window.MATERIALS_DATA = materials;
  taxonomyModel = taxonomyApi ? taxonomyApi.createModel(materials, collections) : null;
  mergeMaterialImages();
  mergeEngineeringData();
  taxonomyModel = taxonomyApi ? taxonomyApi.createModel(materials, collections) : null;
}

async function loadMaterialsJsonPreferred() {
  // materials.json is the only editable source. tools/sync_materials.py creates
  // materials.js so file:// and http:// always render the same generated data.
  if (!Array.isArray(window.MATERIALS_DATA) || window.MATERIALS_DATA.length === 0) {
    throw new Error("未加载到 materials.js，请先运行 tools/06_同步材料数据.bat");
  }
  materials = window.MATERIALS_DATA;
  collections = Array.isArray(window.MATERIAL_COLLECTIONS) ? window.MATERIAL_COLLECTIONS : [];
  prepareMaterialData();
}

function migrateStoredSelections() {
  if (!taxonomyApi) return;
  const validIds = new Set(materials.map((item) => item.id));
  state.favorites = new Set(taxonomyApi.migrateStoredIds("materialbox:favorites", validIds));
  state.compareItems = new Set(taxonomyApi.migrateStoredIds("materialbox:compare", validIds).slice(0, 3));
}

function engineeringValue(material, key) {
  return readableValue(material.engineering_properties?.[key] ?? material[key], UNKNOWN_DATA);
}

function corrosionResistance(material) {
  return engineeringValue(material, "corrosion_resistance");
}

function hardnessValue(material) {
  const hardness = engineeringValue(material, "hardness");
  const condition = engineeringValue(material, "hardness_condition");
  if (isMissingValue(hardness) && isMissingValue(condition)) return UNKNOWN_DATA;
  if (isMissingValue(condition)) return hardness;
  return `${hardness}（${condition}）`;
}

function meltingAndServiceTemperature(material) {
  const melting = engineeringValue(material, "melting_point");
  const service = engineeringValue(material, "service_temperature");
  if (isMissingValue(melting) && isMissingValue(service)) return UNKNOWN_DATA;
  if (isMissingValue(melting)) return service;
  if (isMissingValue(service)) return melting;
  return `${melting} / ${service}`;
}



function imageTypeLabel(type) {
  return { macro: "宏观图", micro: "微观图", structure: "结构示意图" }[type] || "材料图";
}

function normalizeImageItem(item, material, type, index) {
  const raw = typeof item === "string" ? { src: item } : (item || {});
  const src = String(raw.src || "").replace(/\\/g, "/");
  // Old assets/materials paths were only placeholders and often do not exist.
  // Real local files are catalogued under assets/images/materials by the manager.
  if (!src || src.startsWith("assets/materials/")) return null;
  return {
    src,
    alt: raw.alt || `${material.name_cn}${imageTypeLabel(type)}`,
    source: raw.source || "",
    author: raw.author || "",
    license: raw.license || "",
    licenseUrl: raw.licenseUrl || "",
    sourceUrl: raw.sourceUrl || "",
    caption: raw.caption || raw.alt || `${material.name_cn}${imageTypeLabel(type)}`,
    accessed_at: raw.accessed_at || "",
    origin: raw.origin || "legacy",
    inheritedFrom: raw.inheritedFrom || ""
  };
}

function normalizeImageList(value, material, type) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.filter(Boolean).map((item, index) => normalizeImageItem(item, material, type, index)).filter(Boolean);
}

function mergedImageList(type, material, ...sources) {
  const seen = new Set();
  return sources.flatMap((source) => normalizeImageList(source?.[type], material, type)).filter((image) => {
    if (seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  }).slice(0, 3);
}

function mergeMaterialImages() {
  if (!Array.isArray(window.MATERIALS_DATA)) return;
  const prepared = new Map();
  window.MATERIALS_DATA.forEach((material) => {
    const mapped = materialImageMap[material.id] || {};
    const current = material.images || {};
    prepared.set(material.id, {
      macro: mergedImageList("macro", material, mapped, current),
      micro: mergedImageList("micro", material, mapped, current),
      structure: mergedImageList("structure", material, mapped, current)
    });
  });
  window.MATERIALS_DATA.forEach((material) => {
    material.images = prepared.get(material.id) || { macro: [], micro: [], structure: [] };
    ["macro", "micro", "structure"].forEach((type) => {
      if (!Array.isArray(material.images[type]) || material.images[type].length === 0) {
        let parentId = material.parent_id;
        const visited = new Set();
        while (parentId && !visited.has(parentId)) {
          visited.add(parentId);
          const parentImages = prepared.get(parentId)?.[type] || [];
          if (parentImages.length) {
            const parent = taxonomyModel?.byId.get(parentId);
            material.images[type] = parentImages.map((image) => ({
              ...image,
              caption: `家族参考图：${image.caption || parent?.name_cn || "父级材料"}`,
              inheritedFrom: parentId
            }));
            break;
          }
          parentId = taxonomyModel?.byId.get(parentId)?.parent_id || "";
        }
      }
    });
  });
}


function readStorageArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeStorageSet(key, value) {
  localStorage.setItem(key, JSON.stringify([...value]));
}

function debounce(fn, wait = 140) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function uniqueValues(items, getter) {
  return [...new Set(items.flatMap((item) => getter(item).filter(Boolean)))].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function materialById(id) {
  return taxonomyModel?.byId.get(id) || materials.find((item) => item.id === id);
}

function parentMaterial(material) {
  return material?.parent_id ? materialById(material.parent_id) : null;
}

function materialChildren(material) {
  return taxonomyModel?.childrenOf(material?.id) || [];
}

function materialCollectionNames(material) {
  return taxonomyModel?.collectionNames(material) || [];
}

function materialEntityLabel(material) {
  return taxonomyApi?.entityLabel(material) || "具体材料";
}

function materialQualityLabel(material) {
  return taxonomyApi?.qualityLabel(material) || "待审核";
}

function materialPath(material, separator = " / ") {
  return taxonomyApi?.pathText(material, separator) || [material.category_1, material.category_2, material.category_3].filter(Boolean).join(separator);
}

function materialFamilyNames(material) {
  const ancestors = taxonomyModel?.ancestorsOf(material.id) || [];
  const canonical = materialById(material.canonical_material_id);
  return [...new Set([
    ...ancestors.filter((item) => ["family", "subfamily"].includes(item.entity_type)).map((item) => item.name_cn),
    ["family", "subfamily"].includes(material.entity_type) ? material.name_cn : "",
    canonical?.name_cn
  ].filter(Boolean))];
}

function arrayText(items) {
  if (Array.isArray(items)) return items.filter(Boolean).join("、") || "暂无数据";
  return readableValue(items);
}
function readableValue(value, fallback = "暂无数据") {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text && text !== "待补充" && text !== "待评估" ? text : fallback;
}

function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 3;
  return Math.max(1, Math.min(5, Math.round(score)));
}

function mergeEngineeringData() {
  materials.forEach((material) => {
    const properties = { ...(material.engineering_properties || {}) };
    engineeringFieldOrder.forEach(([key]) => {
      const value = readableValue(properties[key] ?? material[key], UNKNOWN_DATA);
      material[key] = value;
      properties[key] = value;
    });
    material.engineering_properties = properties;
    const recordedScores = material.performance_scores && typeof material.performance_scores === "object"
      ? material.performance_scores
      : {};
    const completeScores = radarKeys().every((key) => Number.isFinite(Number(recordedScores[key])));
    material.performance_scores = completeScores ? recordedScores : {};
    material.performance_score_source = completeScores ? "已录入评分" : "";
  });
}

function isMissingValue(value) {
  return [undefined, null, "", "暂无数据", "暂无可靠数据", "待补充", "待评估"].includes(value);
}

function numericTemperature(material) {
  const value = engineeringValue(material, "service_temperature");
  if (isMissingValue(value)) return null;
  const normalizedValue = String(value).replace(/[–—~～至到]/g, "-");
  const range = normalizedValue.match(/(-?\d+(?:\.\d+)?)\s*(?:℃|°C)?\s*-\s*(-?\d+(?:\.\d+)?)/i);
  if (range) return Math.max(Number(range[1]), Number(range[2]));
  const matches = normalizedValue.match(/-?\d+(?:\.\d+)?/g);
  if (!matches) return null;
  return Math.max(...matches.map(Number));
}

function matchesTemperatureRange(material, range) {
  if (range === "全部") return true;
  const temp = numericTemperature(material);
  if (temp === null) return range === "暂无数据" || range === "待补充";
  if (range === "常温与低温") return temp < 150;
  if (range === "中温 150-300℃") return temp >= 150 && temp <= 300;
  if (range === "高温 300-800℃") return temp > 300 && temp <= 800;
  if (range === "超高温 800℃以上") return temp > 800;
  return true;
}

function scoreStars(value) {
  const score = clampScore(value);
  return `${"★".repeat(score)}${"☆".repeat(5 - score)}`;
}

function radarKeys() {
  return ["strength", "heat", "corrosion", "processability", "cost", "lightweight"];
}

function radarGridPoints(radius) {
  const centerX = 90;
  const centerY = 84;
  return radarKeys().map((key, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / radarKeys().length;
    return `${centerX + Math.cos(angle) * radius},${centerY + Math.sin(angle) * radius}`;
  }).join(" ");
}

function engineeringParameterCards(material) {
  const parameters = [
    ["密度", engineeringValue(material, "density")],
    ["强度", engineeringValue(material, "tensile_strength")],
    ["弹性模量", engineeringValue(material, "elastic_modulus")],
    ["熔点/使用温度", meltingAndServiceTemperature(material)],
    ["导热性能", engineeringValue(material, "thermal_conductivity")],
    ["耐腐蚀性", corrosionResistance(material)],
    ["硬度", hardnessValue(material)],
    ["典型应用", arrayText(material.applications)]
  ];
  const dataTypeLabels = { measured: "实测数据", typical: "典型值", literature: "文献数据", category_reference: "类别参考", estimated: "估算值", unavailable: "暂无数据" };
  const dataType = dataTypeLabels[material.engineering_data_type] || "数据类型待核验";
  return `<section class="engineering-parameter-section"><div class="parameter-context"><strong>${dataType}</strong><span>${readableValue(material.engineering_condition_note, "具体值应结合牌号、状态、产品形态与测试条件使用。")}</span></div><div class="parameter-strip" aria-label="基础工程参数">${parameters.map(([label, value]) => `<article class="parameter-card"><span>${label}</span><strong>${readableValue(value, UNKNOWN_DATA)}</strong></article>`).join("")}</div></section>`;
}

function radarPoints(scores) {
  const centerX = 90;
  const centerY = 84;
  const radius = 50;
  return radarKeys().map((key, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / radarKeys().length;
    const distance = radius * (clampScore(scores[key]) / 5);
    return `${centerX + Math.cos(angle) * distance},${centerY + Math.sin(angle) * distance}`;
  }).join(" ");
}

function performanceRadar(material) {
  const scores = material.performance_scores || {};
  const rows = [["strength", "强度"], ["heat", "耐温"], ["corrosion", "耐腐蚀"], ["processability", "加工性"], ["cost", "成本友好度"], ["lightweight", "轻量化"]];
  if (!radarKeys().every((key) => Number.isFinite(Number(scores[key])))) {
    return `<section class="radar-card radar-empty" aria-label="材料性能评分"><div><strong>暂无性能评分数据</strong><span>录入并核验强度、耐温、耐腐蚀、加工性、成本友好度和轻量化六项评分后，此处将显示雷达图。</span></div></section>`;
  }
  const labels = [
    ["强度", 90, 14],
    ["耐温", 151, 48],
    ["耐腐蚀", 151, 123],
    ["加工性", 90, 162],
    ["成本友好度", 29, 123],
    ["轻量化", 29, 48]
  ];
  const source = material.performance_score_source || (material.performance_scores ? "已录入评分" : "系统估算");
  return `
    <section class="radar-card" aria-label="材料性能雷达图">
      <div class="radar-visual">
        <svg viewBox="0 0 180 170" role="img" aria-label="性能雷达图">
          <polygon class="radar-grid" points="${radarGridPoints(50)}"></polygon>
          <polygon class="radar-grid inner" points="${radarGridPoints(32)}"></polygon>
          <polygon class="radar-grid inner faint" points="${radarGridPoints(16)}"></polygon>
          <polygon class="radar-shape" points="${radarPoints(scores)}"></polygon>
          ${labels.map(([label, x, y]) => `<text class="radar-axis-label" x="${x}" y="${y}" text-anchor="middle">${label}</text>`).join("")}
        </svg>
      </div>
      <div class="radar-list">
        ${rows.map(([key, label]) => {
          const score = clampScore(scores[key]);
          return `<div class="radar-list-item"><span>${label}</span><strong class="radar-score"><em>${score} / 5</em><span class="radar-stars">${scoreStars(score)}</span></strong></div>`;
        }).join("")}
      </div>
      <div class="radar-scale-note">
        <strong>${source}</strong>
        <span>性能评分采用 1-5 级相对评价：1 较弱，2 一般，3 中等，4 较好，5 优秀。</span>
        <span>该评分用于材料之间的相对比较，不等同于单一标准测试值。</span>
      </div>
    </section>`;
}
function searchableText(material) {
  const parent = parentMaterial(material);
  const standards = (material.standard_designations || []).flatMap((item) => typeof item === "string" ? [item] : [item.system, item.grade]);
  const treatments = (material.heat_treatments || []).flatMap((item) => typeof item === "string" ? [item] : [item.name, item.process, item.effect]);
  const propertyRecords = (material.property_records || []).flatMap((item) => typeof item === "string" ? [item] : [item.property, item.label_cn, item.condition, item.direction, item.data_type]);
  return [
    material.name_cn,
    material.name_en,
    material.abbreviation,
    material.category_1,
    material.category_2,
    material.category_3,
    ...(material.taxonomy_path || []),
    parent?.name_cn,
    parent?.name_en,
    materialEntityLabel(material),
    material.description,
    material.composition_or_structure,
    ...(material.aliases || []),
    ...(material.key_properties || []),
    ...(material.mechanical_properties || []),
    ...(material.thermal_properties || []),
    ...(material.electrical_properties || []),
    ...(material.advantages || []),
    ...(material.limitations || []),
    ...(material.applications || []),
    ...(material.processing_methods || []),
    ...(material.typical_products || []),
    ...(material.related_materials || []),
    ...(material.tags || []),
    ...(material.material_states || []),
    ...(material.product_forms || []),
    ...materialCollectionNames(material),
    ...standards,
    ...treatments,
    ...propertyRecords
  ].join(" ");
}

function compactSearchTerm(value) {
  return normalize(value).replace(/\s+/g, "");
}

function resolveSearchIntent(query) {
  const normalizedQuery = compactSearchTerm(query);
  const collectionIds = new Set();
  const group = searchCollectionIntentGroups.find((item) => item.terms.some((term) => compactSearchTerm(term) === normalizedQuery));
  group?.collectionIds.forEach((id) => collectionIds.add(id));
  const directCollections = collections.filter((item) => [item.name_cn, ...(item.keywords || [])].some((term) => {
    const normalizedTerm = compactSearchTerm(term);
    return normalizedQuery === normalizedTerm || normalizedQuery === `${normalizedTerm}材料` || `${normalizedQuery}材料` === normalizedTerm;
  }));
  directCollections.forEach((item) => collectionIds.add(item.id));
  const isMedicalPeek = ["医用peek", "医用级peek", "medicalpeek"].includes(normalizedQuery);
  return {
    normalizedQuery,
    collectionIds,
    collectionLabel: group?.label || directCollections[0]?.name_cn || "",
    canonicalIds: new Set(isMedicalPeek ? ["peek"] : []),
    isMedicalPeek,
    isSteelFamily: normalizedQuery === "钢"
  };
}

function matchesQuery(material, query, providedIntent) {
  if (!query) return true;
  const intent = providedIntent || resolveSearchIntent(query);
  const normalizedQuery = intent.normalizedQuery;
  if (["淬火钢", "淬火 钢"].some((term) => normalizedQuery.includes(term))) {
    const treatmentText = normalize([...(material.material_states || []), ...(material.heat_treatments || []).flatMap((item) => [item.name, item.process])].join(" "));
    return material.taxonomy_path.includes("钢") && treatmentText.includes("淬火");
  }
  if (intent.isSteelFamily) return material.taxonomy_path.includes("钢") || material.canonical_material_id === "steel";
  if (intent.canonicalIds.has(material.canonical_material_id)) return true;
  if ((material.application_collections || []).some((id) => intent.collectionIds.has(id))) return true;
  return compactSearchTerm(searchableText(material)).includes(normalizedQuery);
}

function queryMatchScore(material, intent) {
  if (!intent?.normalizedQuery) return 0;
  const identities = [material.name_cn, material.name_en, material.abbreviation, ...(material.aliases || [])]
    .map(compactSearchTerm).filter(Boolean);
  if (identities.includes(intent.normalizedQuery)) return 0;
  if (intent.isSteelFamily) {
    if (material.parent_id === "steel") return 1;
    if (material.entity_type === "grade") return 2;
    if (material.entity_type === "subfamily") return 3;
    return 4;
  }
  if (intent.canonicalIds.has(material.id)) return 1;
  if (identities.some((value) => value.startsWith(intent.normalizedQuery))) return 2;
  if (intent.canonicalIds.has(material.canonical_material_id)) return 3;
  if (identities.some((value) => value.includes(intent.normalizedQuery))) return 4;
  if ((material.application_collections || []).some((id) => intent.collectionIds.has(id))) return 6;
  return 5;
}

function searchContextMessage(query) {
  const normalizedQuery = compactSearchTerm(query);
  if (normalizedQuery.includes("淬火钢")) return "“淬火”属于材料热处理状态，以下结果为通常支持淬火处理的钢种或牌号。";
  const intent = resolveSearchIntent(query);
  if (intent.isMedicalPeek) return "已关联基础 PEEK、医用级 PEEK，以及同一基础材料的增强和生物活性变体。";
  if (normalizedQuery && intent.collectionLabel) return `已检索应用专题“${intent.collectionLabel}”及其关联材料。`;
  return "";
}

function getCollapsedResultLimit() {
  if (window.innerWidth <= 720) return 3;
  if (window.innerWidth <= 1050) return 6;
  return 9;
}

function isDefaultFilterState() {
  return !state.query && state.category1 === "全部" && state.category2 === "全部" && state.tag === "全部"
    && state.application === "全部" && state.processing === "全部" && state.family === "全部"
    && state.entityType === "全部" && state.collectionId === "全部" && state.productForm === "全部"
    && state.materialState === "全部" && state.dataQuality === "全部" && state.taxonomyPath.length === 0
    && state.costLevel === "全部" && state.temperatureRange === "全部";
}

function visibleMaterials(list) {
  const limit = getCollapsedResultLimit();
  return state.resultsExpanded || list.length <= limit ? list : list.slice(0, limit);
}

function renderResultsToggle(total, visibleCount) {
  const toolbar = $("#results-display-summary");
  const row = $("#results-toggle-row");
  const summary = $("#results-toggle-summary");
  const button = $("#results-toggle");
  const limit = getCollapsedResultLimit();
  const canToggle = total > limit;
  if (toolbar) {
    toolbar.textContent = state.resultsExpanded
      ? `当前显示全部 ${total} 个材料，点击下方按钮可收起为前三行。`
      : `当前显示 ${visibleCount} / ${total} 个材料，默认仅展示前三行，点击下方按钮可展开全部材料。`;
  }
  if (!row || !button || !summary) return;
  row.classList.toggle("hidden", !canToggle);
  if (!canToggle) return;
  summary.textContent = `已显示 ${visibleCount} / ${total} 个材料`;
  button.textContent = state.resultsExpanded ? "收起材料列表 ↑" : "展开更多材料 ↓";
  button.setAttribute("aria-expanded", String(state.resultsExpanded));
}

function toggleResultsExpanded() {
  state.resultsExpanded = !state.resultsExpanded;
  renderResults();
  if (!state.resultsExpanded) scrollToExplore();
}

function filteredMaterials() {
  const searchIntent = resolveSearchIntent(state.query);
  const filtered = materials.filter((material) => {
    const categoryOk = state.category1 === "全部" || material.category_1 === state.category1;
    const subcategoryOk = state.category2 === "全部" || material.category_2 === state.category2;
    const tagOk = state.tag === "全部" || material.tags.includes(state.tag) || material.key_properties.includes(state.tag);
    const appOk = state.application === "全部" || material.applications.includes(state.application);
    const processingOk = state.processing === "全部" || material.processing_methods.includes(state.processing);
    const familyOk = state.family === "全部" || materialFamilyNames(material).includes(state.family);
    const entityOk = state.entityType === "全部" || materialEntityLabel(material) === state.entityType;
    const collectionOk = state.collectionId === "全部" || material.application_collections.includes(state.collectionId);
    const formOk = state.productForm === "全部" || material.product_forms.includes(state.productForm);
    const materialStateOk = state.materialState === "全部" || material.material_states.includes(state.materialState)
      || material.heat_treatments.some((item) => (typeof item === "string" ? item : `${item.name} ${item.process}`).includes(state.materialState));
    const qualityOk = state.dataQuality === "全部" || materialQualityLabel(material) === state.dataQuality;
    const taxonomyOk = state.taxonomyPath.length === 0 || state.taxonomyPath.every((part, index) => material.taxonomy_path[index] === part);
    const costValue = engineeringValue(material, "cost_level");
    const costOk = state.costLevel === "全部" || costValue === state.costLevel || (state.costLevel === "暂无数据" && isMissingValue(costValue));
    const tempOk = matchesTemperatureRange(material, state.temperatureRange);
    return categoryOk && subcategoryOk && tagOk && appOk && processingOk && familyOk && entityOk && collectionOk
      && formOk && materialStateOk && qualityOk && taxonomyOk && costOk && tempOk && matchesQuery(material, state.query, searchIntent);
  });
  if (!state.query && isDefaultFilterState()) return filtered;
  const rank = { grade: 0, material: 1, variant: 2, form: 3, subfamily: 4, family: 5, state: 6 };
  return filtered.sort((a, b) => queryMatchScore(a, searchIntent) - queryMatchScore(b, searchIntent)
    || (rank[a.entity_type] ?? 9) - (rank[b.entity_type] ?? 9)
    || a.name_cn.localeCompare(b.name_cn, "zh-CN"));
}

function setFilter(partial) {
  Object.assign(state, partial);
  if (partial.taxonomyPath) {
    state.category1 = partial.taxonomyPath[0] || "全部";
    state.category2 = partial.taxonomyPath[1] || "全部";
  } else if (Object.prototype.hasOwnProperty.call(partial, "category1")) {
    state.taxonomyPath = [];
  } else if (Object.prototype.hasOwnProperty.call(partial, "category2")) {
    state.taxonomyPath = [];
  }
  state.resultsExpanded = false;
  if (partial.category1 && partial.category1 !== "全部") {
    const validSubcategories = materials.filter((item) => item.category_1 === state.category1).map((item) => item.category_2);
    if (!validSubcategories.includes(state.category2)) state.category2 = "全部";
  }
  syncControls();
  renderActiveFilters();
  renderResults();
  renderSearchSuggestions();
}

function scrollToExplore() {
  $("#explore").scrollIntoView({ behavior: "smooth", block: "start" });
}

function toast(message, tone = "default") {
  const container = $("#toast-container");
  if (!container) return;
  const item = document.createElement("div");
  item.className = `toast ${tone}`;
  item.textContent = message;
  container.appendChild(item);
  window.setTimeout(() => item.classList.add("show"), 10);
  window.setTimeout(() => {
    item.classList.remove("show");
    window.setTimeout(() => item.remove(), 220);
  }, 2600);
}

function getImageSet(material, useDefault = true) {
  const images = material.images || {};
  const macro = hasItems(images.macro) ? images.macro : [];
  const micro = hasItems(images.micro) ? images.micro : [];
  const structure = hasItems(images.structure) ? images.structure : [];
  return { macro, micro, structure };
}

function resolvedMaterialImagePolicy(material) {
  if (materialImagePolicyApi?.resolve) return materialImagePolicyApi.resolve(material);
  return { required: ["macro"], recommended: [], optional: ["micro", "structure"], not_applicable: [], allow_inherited: true, reason: "" };
}

function materialImagePolicyState(material) {
  const policy = resolvedMaterialImagePolicy(material);
  const images = getImageSet(material, false);
  const ownImages = materialImageTypes.filter((type) => hasItems(images[type]) && images[type].some((image) => !image.inheritedFrom));
  const inheritedImages = materialImageTypes.filter((type) => hasItems(images[type]) && images[type].some((image) => image.inheritedFrom));
  const availableImages = materialImageTypes.filter((type) => hasItems(images[type]));
  const inheritedFrom = Object.fromEntries(inheritedImages.map((type) => [type, images[type].find((image) => image.inheritedFrom)?.inheritedFrom || ""]));
  const available = new Set(availableImages);
  return {
    ...policy,
    ownImages,
    inheritedImages,
    inheritedFrom,
    availableImages,
    missingRequired: policy.required.filter((type) => !available.has(type)),
    missingRecommended: policy.recommended.filter((type) => !available.has(type))
  };
}

function imagePolicyStatusMarkup(material, policyState = materialImagePolicyState(material)) {
  const labels = (types) => types.map(imageTypeLabel).join("、") || "无";
  const current = policyState.availableImages.map((type) => `${imageTypeLabel(type)}${policyState.inheritedImages.includes(type) ? "（继承）" : ""}`);
  const inherited = policyState.inheritedImages.map((type) => {
    const parent = materialById(policyState.inheritedFrom[type]);
    return `${imageTypeLabel(type)}：继承自“${parent?.name_cn || policyState.inheritedFrom[type]}”`;
  });
  const rows = [
    `<span><strong>当前配图</strong>${current.join("、") || "暂无图片"}</span>`,
    ...inherited.map((value) => `<span class="inherited"><strong>继承参考</strong>${value}</span>`),
    ...(policyState.missingRequired.length ? [`<span class="missing"><strong>必需待补</strong>${labels(policyState.missingRequired)}</span>`] : []),
    ...(policyState.missingRecommended.length ? [`<span class="recommended"><strong>建议补充</strong>${labels(policyState.missingRecommended)}</span>`] : []),
    ...(policyState.optional.length ? [`<span><strong>本材料不强制</strong>${labels(policyState.optional)}</span>`] : []),
    ...(policyState.not_applicable.length ? [`<span class="muted"><strong>不适用</strong>${labels(policyState.not_applicable)}</span>`] : [])
  ];
  return `<div class="image-policy-status" aria-label="材料配图状态">${rows.join("")}</div>`;
}

function primaryImage(material) {
  return getImageSet(material, false).macro[0] || null;
}

function thumbnailMarkup(material) {
  const image = primaryImage(material);
  const initials = material.abbreviation || material.name_cn.slice(0, 2);
  if (!image) return `<div class="thumb-placeholder"><span>${initials}</span></div>`;
  return `<div class="thumb-placeholder material-thumb"><img src="${image.src}" alt="${image.alt}" loading="lazy" onerror="this.parentElement.classList.add('missing')" /><span>${initials}</span></div>`;
}

function makeChip(label, onClick) {
  const button = document.createElement("button");
  button.className = "chip";
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function renderQuickTags() {
  const container = $("#quick-tags");
  container.innerHTML = "";
  quickTags.forEach((tag) => {
    container.appendChild(makeChip(tag, () => {
      const tagExists = materials.some((m) => m.tags.includes(tag) || m.key_properties.includes(tag));
      setFilter({ query: tag, tag: tagExists ? tag : "全部" });
      scrollToExplore();
    }));
  });
}

function renderStats() {
  const tags = uniqueValues(materials, (item) => item.tags || []);
  const applications = uniqueValues(materials, (item) => item.applications || []);
  const stats = [["收录材料", materials.length], ["材料大类", uniqueValues(materials, (item) => [item.category_1]).length], ["性能标签", tags.length], ["应用场景", applications.length]];
  $("#stats-grid").innerHTML = stats.map(([label, value]) => `<article class="stat-card"><strong>${value}</strong><span>${label}</span></article>`).join("");
  const heroStatus = $("#hero-status-grid");
  if (heroStatus) {
    heroStatus.innerHTML = stats.map(([label, value]) => `<div class="status-metric"><strong>${value}</strong><span>${label}</span></div>`).join("");
  }
}

function renderCategoryCards() {
  const grid = $("#category-grid");
  grid.innerHTML = "";
  categorySystem.forEach((category) => {
    const count = materials.filter((item) => item.category_1 === category.name).length;
    const card = document.createElement("article");
    card.className = "category-card taxonomy-entry-card";
    card.innerHTML = `
      <h3>${category.name}</h3>
      <p>${category.description}</p>
      <div class="category-meta">${count} 条记录 · ${category.subcategories.length} 个主要分支</div>
      <div class="subcategory-list">
        ${category.subcategories.slice(0, 4).map((sub) => `<button class="mini-chip" type="button" data-category="${category.name}" data-subcategory="${sub.name}">${sub.name}</button>`).join("")}
      </div>
    `;
    card.addEventListener("click", (event) => {
      if (event.target.matches(".mini-chip")) return;
      openTaxonomyBrowser(category.name);
    });
    card.querySelectorAll(".mini-chip").forEach((chip) => chip.addEventListener("click", () => {
      openTaxonomyBrowser(chip.dataset.category);
      setFilter({ taxonomyPath: [chip.dataset.category, chip.dataset.subcategory] });
      scrollToExplore();
    }));
    grid.appendChild(card);
  });
}

function taxonomyNodeMarkup(node, level = 1) {
  const children = [...node.children.values()];
  const pathValue = encodeURIComponent(JSON.stringify(node.path));
  return `<li class="taxonomy-node" role="treeitem" aria-level="${level}" aria-expanded="false">
    <div class="taxonomy-node-row">
      ${children.length ? `<button class="taxonomy-node-toggle" type="button" data-tree-toggle aria-label="展开${node.name}" aria-expanded="false">›</button>` : `<span class="taxonomy-node-spacer"></span>`}
      <button class="taxonomy-node-label" type="button" data-tree-path="${pathValue}">${node.name}</button>
      <span class="taxonomy-node-count">${node.materialIds.length}</span>
    </div>
    ${children.length ? `<ul class="taxonomy-children" role="group" hidden>${children.map((child) => taxonomyNodeMarkup(child, level + 1)).join("")}</ul>` : ""}
  </li>`;
}

function renderTaxonomyTree(categoryName) {
  const container = $("#taxonomy-tree");
  const categoryNode = taxonomyModel?.tree.children.get(categoryName);
  if (!container || !categoryNode) return;
  const children = [...categoryNode.children.values()];
  container.innerHTML = `<ul class="taxonomy-root" role="group">${children.map((node) => taxonomyNodeMarkup(node, 1)).join("")}</ul>`;
  container.querySelectorAll("[data-tree-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const node = button.closest(".taxonomy-node");
      const childrenList = node.querySelector(":scope > .taxonomy-children");
      const expanded = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(expanded));
      button.textContent = expanded ? "⌄" : "›";
      node.setAttribute("aria-expanded", String(expanded));
      if (childrenList) childrenList.hidden = !expanded;
    });
  });
  container.querySelectorAll("[data-tree-path]").forEach((button) => {
    button.addEventListener("click", () => {
      const path = JSON.parse(decodeURIComponent(button.dataset.treePath));
      $("#taxonomy-current-path").textContent = path.join(" / ");
      setFilter({ taxonomyPath: path });
      scrollToExplore();
    });
    button.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") button.closest(".taxonomy-node")?.querySelector(":scope > .taxonomy-node-row [data-tree-toggle]")?.click();
      if (event.key === "ArrowLeft") {
        const node = button.closest(".taxonomy-node");
        const toggle = node?.querySelector(":scope > .taxonomy-node-row [data-tree-toggle]");
        if (toggle?.getAttribute("aria-expanded") === "true") toggle.click();
      }
    });
  });
}

function openTaxonomyBrowser(categoryName) {
  const browser = $("#taxonomy-browser");
  if (!browser) return;
  browser.classList.remove("hidden");
  $("#taxonomy-current-path").textContent = categoryName;
  renderTaxonomyTree(categoryName);
  setFilter({ taxonomyPath: [categoryName] });
  browser.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderApplications() {
  const grid = $("#application-grid");
  grid.innerHTML = "";
  const visibleCollections = state.collectionsExpanded ? collections : collections.slice(0, 12);
  visibleCollections.forEach((collection) => {
    const card = document.createElement("button");
    card.className = "application-card";
    card.type = "button";
    card.innerHTML = `<h3>${collection.name_cn}</h3><p>${collection.material_ids.length} 个关联条目</p>`;
    card.addEventListener("click", () => {
      setFilter({ collectionId: collection.id, query: "" });
      scrollToExplore();
    });
    grid.appendChild(card);
  });
  let toggle = document.querySelector("#collection-toggle");
  if (!toggle) {
    toggle = document.createElement("button");
    toggle.id = "collection-toggle";
    toggle.className = "ghost-button collection-toggle";
    toggle.type = "button";
    grid.insertAdjacentElement("afterend", toggle);
    toggle.addEventListener("click", () => {
      state.collectionsExpanded = !state.collectionsExpanded;
      renderApplications();
    });
  }
  toggle.classList.toggle("hidden", collections.length <= 12);
  toggle.textContent = state.collectionsExpanded ? "收起专题 ↑" : `查看全部 ${collections.length} 个专题 ↓`;
}

function populateSelect(select, values, currentValue) {
  select.innerHTML = ["全部", ...values].map((value) => `<option value="${value}">${value}</option>`).join("");
  select.value = values.includes(currentValue) || currentValue === "全部" ? currentValue : "全部";
}

const filterSelectIds = [
  "category-filter", "subcategory-filter", "tag-filter", "application-filter", "processing-filter",
  "family-filter", "entity-filter", "collection-filter", "form-filter", "state-filter",
  "cost-filter", "temperature-filter", "quality-filter"
];

function optionAliasText(value) {
  const aliases = {
    "高分子材料": "塑料 plastic polymer",
    "天然与生物基材料": "天然材料 木材 木头 wood timber 原木 板材 生物基",
    "建筑胶凝与土木材料": "建筑 建材 水泥 混凝土 石材 板材",
    "金属与合金": "金属 steel alloy 钢 铝 铜 钛",
    "聚酰胺": "PA 尼龙 nylon",
    "PA": "聚酰胺 尼龙 nylon",
    "PEEK": "聚醚醚酮 高性能塑料",
    "木材": "木头 wood timber 原木 板材",
    "玻璃纤维复合材料": "玻璃钢 FRP GFRP"
  };
  return aliases[value] || "";
}

function materialMatchesComboboxQuery(material, query) {
  return normalize(searchableText(material)).includes(query) || normalize(`${material.name_cn} ${material.name_en} ${material.abbreviation}`).includes(query);
}

function optionMatchesCombobox(select, value, query) {
  if (!query) return true;
  if (normalize(`${value} ${optionAliasText(value)}`).includes(query)) return true;
  return materials.some((material) => {
    if (!materialMatchesComboboxQuery(material, query)) return false;
    if (select.id === "category-filter") return material.category_1 === value;
    if (select.id === "subcategory-filter") return material.category_2 === value;
    if (select.id === "tag-filter") return [...(material.tags || []), ...(material.key_properties || [])].includes(value);
    if (select.id === "application-filter") return (material.applications || []).includes(value);
    if (select.id === "processing-filter") return (material.processing_methods || []).includes(value);
    if (select.id === "family-filter") return materialFamilyNames(material).includes(value);
    if (select.id === "entity-filter") return materialEntityLabel(material) === value;
    if (select.id === "collection-filter") return materialCollectionNames(material).includes(value);
    if (select.id === "form-filter") return (material.product_forms || []).includes(value);
    if (select.id === "state-filter") return [...(material.material_states || []), ...(material.heat_treatments || []).map((item) => item.name || item)].includes(value);
    if (select.id === "quality-filter") return materialQualityLabel(material) === value;
    return false;
  });
}

let comboboxPositionFrame = 0;

function closeFilterCombobox(select) {
  const combo = select?._filterCombobox;
  if (!combo) return;
  combo.root.classList.remove("open", "drop-up");
  combo.options.classList.remove("open");
  combo.input.setAttribute("aria-expanded", "false");
}

function closeAllFilterComboboxes(exceptSelect = null) {
  filterSelectIds.forEach((id) => {
    const select = $(`#${id}`);
    if (select && select !== exceptSelect) closeFilterCombobox(select);
  });
}

function positionFilterComboboxOptions(select) {
  const combo = select?._filterCombobox;
  if (!combo || !combo.root.classList.contains("open")) return;
  const rect = combo.input.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > window.innerHeight) {
    closeFilterCombobox(select);
    return;
  }

  const viewportPadding = 8;
  const gap = 8;
  const preferredMaxHeight = window.innerWidth <= 720 ? 240 : 260;
  const desiredHeight = Math.min(combo.options.scrollHeight || preferredMaxHeight, preferredMaxHeight);
  const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - gap - viewportPadding);
  const spaceAbove = Math.max(0, rect.top - gap - viewportPadding);
  const openUp = spaceBelow < Math.min(desiredHeight, 160) && spaceAbove > spaceBelow;
  const availableHeight = Math.max(80, Math.min(preferredMaxHeight, openUp ? spaceAbove : spaceBelow));
  const width = Math.min(rect.width, window.innerWidth - viewportPadding * 2);
  const left = Math.min(Math.max(viewportPadding, rect.left), window.innerWidth - width - viewportPadding);

  combo.options.style.left = `${Math.round(left)}px`;
  combo.options.style.width = `${Math.round(width)}px`;
  combo.options.style.maxHeight = `${Math.round(availableHeight)}px`;
  const renderedHeight = Math.min(combo.options.scrollHeight, availableHeight);
  combo.options.style.top = `${Math.round(openUp ? Math.max(viewportPadding, rect.top - gap - renderedHeight) : rect.bottom + gap)}px`;
  combo.root.classList.toggle("drop-up", openUp);
}

function queueOpenComboboxPosition() {
  if (comboboxPositionFrame) return;
  comboboxPositionFrame = window.requestAnimationFrame(() => {
    comboboxPositionFrame = 0;
    filterSelectIds.forEach((id) => {
      const select = $(`#${id}`);
      if (select?._filterCombobox?.root.classList.contains("open")) positionFilterComboboxOptions(select);
    });
  });
}

function openFilterCombobox(select) {
  const combo = select?._filterCombobox;
  if (!combo) return;
  closeAllFilterComboboxes(select);
  combo.root.classList.add("open");
  combo.options.classList.add("open");
  combo.input.setAttribute("aria-expanded", "true");
  renderComboboxOptions(select);
}

function applyComboboxValue(select, value) {
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  closeAllFilterComboboxes();
}

function renderComboboxOptions(select) {
  const combo = select._filterCombobox;
  if (!combo) return;
  const query = normalize(combo.input.value === "全部" ? "" : combo.input.value);
  combo.options.innerHTML = "";
  let count = 0;
  Array.from(select.options).forEach((option) => {
    if (!optionMatchesCombobox(select, option.value, query)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-option";
    button.textContent = option.textContent;
    button.addEventListener("click", () => applyComboboxValue(select, option.value));
    combo.options.appendChild(button);
    count += 1;
  });
  if (query) {
    materials.filter((material) => materialMatchesComboboxQuery(material, query)).slice(0, 5).forEach((material) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-option material-option";
      button.textContent = `材料：${material.name_cn}${material.abbreviation ? ` / ${material.abbreviation}` : ""}`;
      button.addEventListener("click", () => { setFilter({ query: material.abbreviation || material.name_cn }); closeAllFilterComboboxes(); });
      combo.options.appendChild(button);
      count += 1;
    });
  }
  if (count === 0) {
    const empty = document.createElement("div");
    empty.className = "filter-option-empty";
    empty.textContent = "没有匹配项";
    combo.options.appendChild(empty);
  }
  positionFilterComboboxOptions(select);
}

function refreshFilterCombobox(selectOrId) {
  const select = typeof selectOrId === "string" ? $(`#${selectOrId}`) : selectOrId;
  if (!select || !select._filterCombobox) return;
  const selected = select.options[select.selectedIndex];
  select._filterCombobox.input.value = selected ? selected.textContent : "全部";
  renderComboboxOptions(select);
}

function refreshAllFilterComboboxes() {
  filterSelectIds.forEach((id) => refreshFilterCombobox(id));
}

function setupFilterComboboxes() {
  filterSelectIds.forEach((id) => {
    const select = $(`#${id}`);
    if (!select || select._filterCombobox) return;
    select.classList.add("native-filter-select");
    const combo = document.createElement("div");
    combo.className = "filter-combobox";
    const input = document.createElement("input");
    input.className = "filter-input";
    input.type = "text";
    input.autocomplete = "off";
    input.setAttribute("aria-label", select.closest(".filter-block")?.querySelector("label")?.textContent || "筛选");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-haspopup", "listbox");
    const options = document.createElement("div");
    options.className = "filter-options filter-options-portal";
    options.id = `${id}-options`;
    options.setAttribute("role", "listbox");
    input.setAttribute("aria-controls", options.id);
    combo.append(input);
    select.insertAdjacentElement("afterend", combo);
    document.body.appendChild(options);
    select._filterCombobox = { root: combo, input, options };
    input.addEventListener("focus", () => openFilterCombobox(select));
    input.addEventListener("input", () => openFilterCombobox(select));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAllFilterComboboxes();
      if (event.key === "Enter") {
        const first = options.querySelector(".filter-option");
        if (first) first.click();
      }
    });
    refreshFilterCombobox(select);
  });
}

function renderFilters() {
  populateSelect($("#category-filter"), uniqueValues(materials, (item) => [item.category_1]), state.category1);
  updateSubcategoryOptions();
  populateSelect($("#tag-filter"), uniqueValues(materials, (item) => [...item.tags, ...item.key_properties]), state.tag);
  populateSelect($("#application-filter"), uniqueValues(materials, (item) => item.applications), state.application);
  populateSelect($("#processing-filter"), uniqueValues(materials, (item) => item.processing_methods), state.processing);
  populateSelect($("#family-filter"), uniqueValues(materials.filter((item) => ["family", "subfamily"].includes(item.entity_type)), (item) => [item.name_cn]), state.family);
  populateSelect($("#entity-filter"), [...new Set(materials.map(materialEntityLabel))], state.entityType);
  const selectedCollectionName = taxonomyModel?.collectionById.get(state.collectionId)?.name_cn || "全部";
  populateSelect($("#collection-filter"), collections.map((item) => item.name_cn), selectedCollectionName);
  populateSelect($("#form-filter"), uniqueValues(materials, (item) => item.product_forms), state.productForm);
  populateSelect($("#state-filter"), uniqueValues(materials, (item) => [...item.material_states, ...item.heat_treatments.map((entry) => entry.name || entry)]), state.materialState);
  populateSelect($("#cost-filter"), costFilterOptions.filter((value) => value !== "全部"), state.costLevel);
  populateSelect($("#temperature-filter"), temperatureFilterOptions.filter((value) => value !== "全部"), state.temperatureRange);
  populateSelect($("#quality-filter"), [...new Set(materials.map(materialQualityLabel))], state.dataQuality);

  $("#category-filter").addEventListener("change", (event) => setFilter({ category1: event.target.value, category2: "全部" }));
  $("#subcategory-filter").addEventListener("change", (event) => setFilter({ category2: event.target.value }));
  $("#tag-filter").addEventListener("change", (event) => setFilter({ tag: event.target.value }));
  $("#application-filter").addEventListener("change", (event) => setFilter({ application: event.target.value }));
  $("#processing-filter").addEventListener("change", (event) => setFilter({ processing: event.target.value }));
  $("#family-filter").addEventListener("change", (event) => setFilter({ family: event.target.value }));
  $("#entity-filter").addEventListener("change", (event) => setFilter({ entityType: event.target.value }));
  $("#collection-filter").addEventListener("change", (event) => {
    const collection = collections.find((item) => item.name_cn === event.target.value);
    setFilter({ collectionId: collection?.id || "全部" });
  });
  $("#form-filter").addEventListener("change", (event) => setFilter({ productForm: event.target.value }));
  $("#state-filter").addEventListener("change", (event) => setFilter({ materialState: event.target.value }));
  $("#cost-filter").addEventListener("change", (event) => setFilter({ costLevel: event.target.value }));
  $("#temperature-filter").addEventListener("change", (event) => setFilter({ temperatureRange: event.target.value }));
  $("#quality-filter").addEventListener("change", (event) => setFilter({ dataQuality: event.target.value }));
  setupFilterComboboxes();
}

function updateSubcategoryOptions() {
  const scoped = state.category1 === "全部" ? materials : materials.filter((item) => item.category_1 === state.category1);
  populateSelect($("#subcategory-filter"), uniqueValues(scoped, (item) => [item.category_2]), state.category2);
  refreshFilterCombobox("subcategory-filter");
}

function syncControls() {
  $("#search-input").value = state.query;
  $("#category-filter").value = state.category1;
  updateSubcategoryOptions();
  $("#tag-filter").value = state.tag;
  $("#application-filter").value = state.application;
  $("#processing-filter").value = state.processing;
  $("#family-filter").value = state.family;
  $("#entity-filter").value = state.entityType;
  $("#collection-filter").value = taxonomyModel?.collectionById.get(state.collectionId)?.name_cn || "全部";
  $("#form-filter").value = state.productForm;
  $("#state-filter").value = state.materialState;
  $("#cost-filter").value = state.costLevel;
  $("#temperature-filter").value = state.temperatureRange;
  $("#quality-filter").value = state.dataQuality;
  refreshAllFilterComboboxes();
}

function renderActiveFilters() {
  const collectionName = taxonomyModel?.collectionById.get(state.collectionId)?.name_cn || state.collectionId;
  const filters = [["关键词", state.query], ["分类路径", state.taxonomyPath.length > 2 ? state.taxonomyPath.join(" / ") : "全部"], ["一级分类", state.category1], ["二级分类", state.category2], ["材料家族", state.family], ["实体类型", state.entityType], ["应用专题", collectionName], ["性能", state.tag], ["应用", state.application], ["加工", state.processing], ["产品形态", state.productForm], ["材料状态", state.materialState], ["成本", state.costLevel], ["温度", state.temperatureRange], ["数据完整度", state.dataQuality]].filter(([, value]) => value && value !== "全部");
  const container = $("#active-filters");
  if (filters.length === 0) {
    container.innerHTML = `<span class="active-filter-label">当前筛选：未设置</span>`;
    return;
  }
  container.innerHTML = `<span class="active-filter-label">当前筛选：</span>${filters.map(([label, value]) => `<button class="filter-chip" type="button" data-label="${label}">${value} ×</button>`).join("")}`;
  container.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const resetMap = { 关键词: { query: "" }, 分类路径: { taxonomyPath: [] }, 一级分类: { category1: "全部", category2: "全部" }, 二级分类: { category2: "全部" }, 材料家族: { family: "全部" }, 实体类型: { entityType: "全部" }, 应用专题: { collectionId: "全部" }, 性能: { tag: "全部" }, 应用: { application: "全部" }, 加工: { processing: "全部" }, 产品形态: { productForm: "全部" }, 材料状态: { materialState: "全部" }, 成本: { costLevel: "全部" }, 温度: { temperatureRange: "全部" }, 数据完整度: { dataQuality: "全部" } };
      setFilter(resetMap[chip.dataset.label]);
    });
  });
}

function materialCard(material) {
  const isFavorite = state.favorites.has(material.id);
  const isCompared = state.compareItems.has(material.id);
  const allCardTags = [...new Set([...(material.key_properties || []), ...(material.tags || [])])];
  const cardTags = allCardTags.slice(0, 3);
  const extraTagCount = Math.max(0, allCardTags.length - cardTags.length);
  const children = materialChildren(material);
  const realImages = Object.fromEntries(Object.entries(getImageSet(material, false)).map(([type, items]) => [type, items.some((image) => !image.isPlaceholder)]));
  const topicCount = material.application_collections.length;
  const shortPath = material.taxonomy_path.slice(Math.max(0, material.taxonomy_path.length - 4)).join(" / ");
  const familySummary = ["family", "subfamily"].includes(material.entity_type) && children.length
    ? `包含：${children.slice(0, 3).map((item) => item.name_cn).join("、")}${children.length > 3 ? "等" : ""}`
    : material.description;
  const card = document.createElement("article");
  card.className = `material-card entity-${material.entity_type}`;
  card.innerHTML = `
    ${thumbnailMarkup(material)}
    <div class="card-badge-row"><span class="entity-badge">${materialEntityLabel(material)}</span><span class="quality-badge">${materialQualityLabel(material)}</span></div>
    <div class="material-card-header">
      <div>
        <h3>${material.name_cn}</h3>
        <div class="path" title="${materialPath(material)}">${shortPath}</div>
      </div>
      ${material.abbreviation ? `<span class="abbrev">${material.abbreviation}</span>` : ""}
    </div>
    <p>${familySummary}</p>
    <div class="card-data-meta">
      ${children.length ? `<span>${children.length} 个直接子项</span>` : ""}
      <span>${topicCount} 个专题</span>
      <span class="image-presence ${realImages.macro ? "available" : ""}">宏</span>
      <span class="image-presence ${realImages.micro ? "available" : ""}">微</span>
      <span class="image-presence ${realImages.structure ? "available" : ""}">构</span>
    </div>
    <div class="tag-row">${cardTags.map((tag) => `<button class="mini-chip" type="button">${tag}</button>`).join("")}${extraTagCount ? `<span class="mini-chip more-chip">+${extraTagCount}</span>` : ""}</div>
    <div class="card-actions">
      <button class="text-button" type="button" data-action="detail">查看详情</button>
      <button class="text-button" type="button" data-action="compare">${isCompared ? "已对比" : "加入对比"}</button>
      <button class="icon-button" type="button" title="${isFavorite ? "取消收藏" : "收藏"}" aria-label="${isFavorite ? "取消收藏" : "收藏"}${material.name_cn}" data-action="favorite">${isFavorite ? "★" : "☆"}</button>
    </div>
  `;
  card.querySelector('[data-action="detail"]').addEventListener("click", () => showDetail(material.id));
  card.querySelector('[data-action="compare"]').addEventListener("click", () => addToCompare(material.id));
  card.querySelector('[data-action="favorite"]').addEventListener("click", () => toggleFavorite(material.id));
  card.querySelectorAll(".mini-chip:not(.more-chip)").forEach((chip) => chip.addEventListener("click", () => {
    setFilter({ tag: chip.textContent });
    scrollToExplore();
  }));
  return card;
}

function renderResults() {
  const list = filteredMaterials();
  const visible = visibleMaterials(list);
  const container = $("#material-list");
  container.classList.add("results-grid-updating");
  container.innerHTML = "";
  visible.forEach((material) => container.appendChild(materialCard(material)));
  window.requestAnimationFrame(() => container.classList.remove("results-grid-updating"));
  $("#empty-state").classList.toggle("hidden", list.length > 0);
  $("#empty-state").innerHTML = `<h3>未找到该材料，可能尚未收录</h3><p>你可以尝试：木材、杉木、45钢、PA66、SiC、建筑材料或新能源材料。</p><p>后续可在 materials.json 中补充规范记录并运行数据同步工具。</p>`;
  $("#result-summary").textContent = `当前匹配 ${list.length} / ${materials.length} 个材料`;
  const contextNote = $("#search-context-note");
  const message = searchContextMessage(state.query);
  contextNote.textContent = message;
  contextNote.classList.toggle("hidden", !message);
  renderResultsToggle(list.length, visible.length);
}

function renderRecommended() {
  const grid = $("#recommended-grid");
  grid.innerHTML = "";
  recommendedIds.map(materialById).filter(Boolean).forEach((material) => grid.appendChild(materialCard(material)));
}

function renderSearchSuggestions() {
  const container = $("#search-suggestions");
  const keyword = normalize(state.query);
  if (!keyword) {
    container.classList.add("hidden");
    container.innerHTML = "";
    return;
  }
  const searchIntent = resolveSearchIntent(keyword);
  const rank = { grade: 0, material: 1, variant: 2, form: 3, subfamily: 4, family: 5, state: 6 };
  const materialMatches = materials.filter((item) => matchesQuery(item, keyword, searchIntent))
    .sort((a, b) => queryMatchScore(a, searchIntent) - queryMatchScore(b, searchIntent)
      || (rank[a.entity_type] ?? 9) - (rank[b.entity_type] ?? 9)
      || a.name_cn.localeCompare(b.name_cn, "zh-CN"))
    .slice(0, 6);
  const categoryMatches = categorySystem.filter((cat) => normalize([cat.name, cat.description, ...cat.subcategories.flatMap((sub) => [sub.name, ...sub.examples])].join(" ")).includes(keyword)).slice(0, 3);
  const collectionMatches = collections.filter((item) => searchIntent.collectionIds.has(item.id)
    || normalize(`${item.name_cn} ${item.description} ${(item.keywords || []).join(" ")}`).includes(keyword)).slice(0, 7);
  container.classList.remove("hidden");
  if (materialMatches.length === 0 && categoryMatches.length === 0 && collectionMatches.length === 0) {
    container.innerHTML = `<div class="suggestion-empty">未找到直接建议，可尝试“45钢”“杉木”“PA66”“SiC”或“新能源材料”。</div>`;
    return;
  }
  container.innerHTML = `${materialMatches.map((item) => `<button type="button" class="suggestion-item" data-type="material" data-id="${item.id}"><strong>${item.name_cn}</strong><span>${materialEntityLabel(item)} · ${materialPath(item)}</span></button>`).join("")}${categoryMatches.map((item) => `<button type="button" class="suggestion-item" data-type="category" data-name="${item.name}"><strong>${item.name}</strong><span>基础分类</span></button>`).join("")}${collectionMatches.map((item) => `<button type="button" class="suggestion-item" data-type="collection" data-id="${item.id}"><strong>${item.name_cn}</strong><span>应用专题 · ${item.material_ids.length} 条</span></button>`).join("")}`;
  container.querySelectorAll(".suggestion-item").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.type === "material") showDetail(button.dataset.id);
      else if (button.dataset.type === "category") {
        setFilter({ category1: button.dataset.name, category2: "全部" });
        scrollToExplore();
      } else {
        setFilter({ collectionId: button.dataset.id, query: "" });
        scrollToExplore();
      }
      container.classList.add("hidden");
    });
  });
}

function imageMeta(image) {
  const source = image.sourceUrl ? `<a href="${image.sourceUrl}" target="_blank" rel="noopener">${image.source || "\u539f\u56fe\u94fe\u63a5"}</a>` : (image.source || "\u6765\u6e90\u5f85\u8865\u5145");
  const license = image.licenseUrl ? `<a href="${image.licenseUrl}" target="_blank" rel="noopener">${image.license || "\u8bb8\u53ef\u8bc1"}</a>` : (image.license || "\u8bb8\u53ef\u8bc1\u5f85\u8865\u5145");
  return `<div class="image-meta"><span>\u6765\u6e90\uff1a${source}</span><span>\u4f5c\u8005\uff1a${image.author || "\u5f85\u8865\u5145"}</span><span>\u8bb8\u53ef\uff1a${license}</span></div>`;
}

function imageSourceRows(image) {
  const hasSourceInfo = [image.source, image.author, image.license, image.licenseUrl, image.sourceUrl, image.accessed_at].some((value) => readableValue(value, "") !== "");
  if (!hasSourceInfo) return `<p class="image-source-empty">来源信息待补充</p>`;
  const rows = [];
  if (image.source) rows.push(["来源", image.source]);
  if (image.author) rows.push(["作者", image.author]);
  if (image.license || image.licenseUrl) rows.push(["许可证", image.licenseUrl ? `<a href="${image.licenseUrl}" target="_blank" rel="noreferrer">${readableValue(image.license, "查看许可证")}</a>` : image.license]);
  if (image.sourceUrl) rows.push(["来源页面", `<a href="${image.sourceUrl}" target="_blank" rel="noreferrer">查看原图来源</a>`]);
  if (image.accessed_at) rows.push(["访问日期", image.accessed_at]);
  return `<dl class="image-source-list">${rows.map(([label, value]) => `<div class="image-info-row"><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>`;
}

function imageTypeInfo(type) {
  const map = {
    macro: {
      label: "宏观形貌",
      empty: "暂无宏观图",
      content: "展示材料外观、纹理、产品形态或断口形貌。",
      focus: "观察重点：颜色、纹理、表面状态、形状和典型制品形态。",
      purpose: "用途：帮助建立材料的直观识别和工程使用场景印象。"
    },
    micro: {
      label: "微观结构",
      empty: "暂无微观图",
      content: "展示显微组织、晶粒、相、孔隙、纤维或界面结构。",
      focus: "观察重点：组织类型、晶粒或纤维分布、孔隙、界面和断口形貌。",
      purpose: "图像类型可包括光学显微镜、SEM 或 TEM；放大倍数和比例尺存在时应在说明中补充。"
    },
    structure: {
      label: "结构示意",
      empty: "暂无结构图",
      content: "展示分子结构、晶体结构、层状结构或复合材料结构关系。",
      focus: "观察重点：结构单元、连接方式、相互作用以及结构与性能之间的关系。",
      purpose: "该区域可放真实结构图或教学示意图，并在来源信息中注明。"
    }
  };
  return map[type] || map.macro;
}

function imagePanel(type, images, fallbackText) {
  const info = imageTypeInfo(type);
  const available = hasItems(images) ? images.slice(0, 3) : [];
  const inheritedIds = [...new Set(available.map((image) => image.inheritedFrom).filter(Boolean))];
  const gallery = available.length
    ? available.map((image, index) => `<article class="image-stage image-card"><button class="image-frame" type="button" data-preview-image="${image.src}" data-preview-alt="${image.alt}" data-preview-caption="${image.caption || image.alt}" aria-label="放大预览${image.alt}"><img src="${image.src}" alt="${image.alt}" loading="lazy" onerror="this.closest('.image-stage').classList.add('image-missing')" /><div class="image-fallback"><strong>${info.empty}</strong><span>图片文件未找到，请在本地维护器中重新导入</span></div></button>${available.length > 1 ? `<span class="image-card-caption">${index + 1}. ${image.caption || image.alt}</span>` : ""}</article>`).join("")
    : `<article class="image-stage image-card image-missing"><div class="image-frame"><div class="image-fallback"><strong>${fallbackText || info.empty}</strong><span>可通过本地材料维护器补充图片</span></div></div></article>`;
  const sourceBlocks = available.length
    ? available.map((image, index) => `<div class="image-source-entry"><strong>${available.length > 1 ? `图片 ${index + 1}` : "当前图片"}</strong>${imageSourceRows(image)}<p class="image-path">本地路径：${image.src}</p></div>`).join("")
    : `<p class="image-source-empty">该图片尚待补充，可通过本地材料维护器或现有图片审核流程添加。</p><p class="image-path">规范路径：assets/images/materials/{material_id}/${type}_01.webp</p>`;
  return `<div class="image-tab-panel" data-image-panel="${type}"><div class="image-layout"><div class="image-stage-list ${available.length > 1 ? "multiple" : ""}">${gallery}</div><aside class="image-info-panel"><span class="image-type-label">${info.label}${inheritedIds.length ? " · 家族参考图" : ""}</span><h4>${available[0]?.caption || available[0]?.alt || info.empty}</h4>${inheritedIds.map((id) => materialById(id)).filter(Boolean).map((item) => `<p class="image-reference-note">继承自父级“${item.name_cn}”，仅作家族参考。</p>`).join("")}<p>${info.content}</p><div class="image-info-list"><div class="image-info-row"><dt>观察重点</dt><dd>${info.focus}</dd></div><div class="image-info-row"><dt>图片用途</dt><dd>${info.purpose}</dd></div></div><div class="image-source-block"><strong>来源与许可</strong>${sourceBlocks}</div></aside></div></div>`;
}

function materialImages(material) {
  const images = getImageSet(material, false);
  const policyState = materialImagePolicyState(material);
  const availableTypes = policyState.availableImages;
  const tabs = availableTypes.length > 1
    ? `<div class="image-tabs" role="tablist" aria-label="材料图像类型">${availableTypes.map((type, index) => `<button class="image-tab${index === 0 ? " active" : ""}" type="button" data-image-tab="${type}">${imageTypeLabel(type)}</button>`).join("")}</div>`
    : availableTypes.length === 1 ? `<span class="image-single-type">${imageTypeLabel(availableTypes[0])}</span>` : "";
  const content = availableTypes.length
    ? `<div class="image-tab-content">${availableTypes.map((type) => imagePanel(type, images[type], imageTypeInfo(type).empty)).join("")}</div>`
    : `<div class="image-empty-unified"><strong>暂无材料图片</strong><span>${policyState.missingRequired.length ? `优先补充${policyState.missingRequired.map(imageTypeLabel).join("、")}` : "可按配图建议后续补充"}</span></div>`;
  return `<section class="material-images"><div class="material-images-head"><h3>材料图像</h3>${tabs}</div>${imagePolicyStatusMarkup(material, policyState)}${content}<p class="image-rule">${policyState.reason || `图片目录：assets/images/materials/${material.id}/`}</p></section>`;
}

function detailValueMarkup(value) {
  const values = Array.isArray(value) ? value.filter(Boolean) : [value];
  const normalized = values.map((item) => readableValue(item)).filter(Boolean);
  if (!normalized.length) return `<p>暂无数据</p>`;
  if (normalized.length === 1) return `<p>${normalized[0]}</p>`;
  return `<ul>${normalized.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function detailGroup(title, rows) {
  return `<article class="detail-card detail-card-wide"><h3>${title}</h3><div class="detail-info-list">${rows.map(([label, value]) => `<div class="detail-info-row"><div class="detail-info-label">${label}</div><div class="detail-info-content">${detailValueMarkup(value)}</div></div>`).join("")}</div></article>`;
}

function standardDesignationText(material) {
  const values = (material.standard_designations || []).map((item) => {
    if (typeof item === "string") return item;
    return [item.system, item.grade].filter(Boolean).join("：");
  });
  return values.length ? values : [UNKNOWN_DATA];
}

function heatTreatmentText(material) {
  const values = (material.heat_treatments || []).map((item) => {
    if (typeof item === "string") return item;
    return [item.name, item.process, item.effect].filter(Boolean).join("：");
  });
  return values.length ? values : [UNKNOWN_DATA];
}

function propertyRecordsMarkup(material) {
  const records = material.property_records || [];
  if (!records.length) return `<article class="detail-card detail-card-wide"><h3>条件化性能数据</h3><div class="data-empty-note"><strong>${UNKNOWN_DATA}</strong><span>后续记录需包含材料状态、温度、方向、测试标准、数据类型与来源。</span></div></article>`;
  const rows = records.map((record) => {
    const range = record.min !== undefined || record.max !== undefined
      ? `${record.min ?? ""}${record.min !== undefined && record.max !== undefined ? "–" : ""}${record.max ?? ""} ${record.unit || ""}`.trim()
      : readableValue(record.value, UNKNOWN_DATA);
    return `<tr><th>${readableValue(record.label_cn || record.property)}</th><td>${range}</td><td>${readableValue(record.condition, "未注明")}</td><td>${readableValue(record.temperature, "未注明")}</td><td>${readableValue(record.direction, "未注明")}</td><td>${readableValue(record.data_type, "待核验")}</td><td>${readableValue(record.source, "来源待补充")}</td></tr>`;
  }).join("");
  return `<article class="detail-card detail-card-wide"><h3>条件化性能数据</h3><div class="property-records-wrap"><table class="property-records"><thead><tr><th>性能</th><th>数值/范围</th><th>状态条件</th><th>温度</th><th>方向</th><th>数据类型</th><th>来源</th></tr></thead><tbody>${rows}</tbody></table></div></article>`;
}

function relationButtons(items, emptyText = "暂无关联条目") {
  if (!items.length) return `<span class="detail-muted">${emptyText}</span>`;
  return items.map((item) => `<button class="relation-link" type="button" data-related-id="${item.id}">${item.name_cn}<small>${materialEntityLabel(item)}</small></button>`).join("");
}

function materialRelationsMarkup(material) {
  const parent = parentMaterial(material);
  const children = materialChildren(material);
  const canonical = materialById(material.canonical_material_id);
  const sameCanonical = materials.filter((item) => item.id !== material.id && item.canonical_material_id === material.canonical_material_id).slice(0, 12);
  const relatedById = (material.related_material_ids || []).map(materialById).filter(Boolean);
  const collectionsForMaterial = (material.application_collections || []).map((id) => taxonomyModel?.collectionById.get(id)).filter(Boolean);
  return `<article class="detail-card detail-card-wide relation-card"><h3>材料关系</h3><div class="relation-grid">
    <div><span>父级材料</span><div class="relation-links">${parent ? relationButtons([parent]) : '<span class="detail-muted">基础分类根节点</span>'}</div></div>
    <div><span>基础主记录</span><div class="relation-links">${canonical && canonical.id !== material.id ? relationButtons([canonical]) : '<span class="detail-muted">当前条目即主记录</span>'}</div></div>
    <div><span>直接子材料/牌号</span><div class="relation-links">${relationButtons(children.slice(0, 16))}</div></div>
    <div><span>同一基础材料的形态与变体</span><div class="relation-links">${relationButtons(sameCanonical)}</div></div>
    <div><span>ID关联材料</span><div class="relation-links">${relationButtons(relatedById)}</div></div>
    <div><span>所属专题</span><div class="relation-links">${collectionsForMaterial.length ? collectionsForMaterial.map((item) => `<button class="relation-link collection" type="button" data-related-collection="${item.id}">${item.name_cn}<small>${item.material_ids.length} 条</small></button>`).join("") : '<span class="detail-muted">暂无专题关联</span>'}</div></div>
  </div></article>`;
}

function woodPropertiesMarkup(material) {
  const wood = material.wood_properties;
  if (!wood) return "";
  return detailGroup("木材专属信息", [
    ["学名", wood.scientific_name], ["科 / 属", [wood.family, wood.genus].filter(Boolean)], ["木材类型", wood.wood_type],
    ["产地", wood.origin], ["心材颜色", wood.heartwood_color], ["纹理", wood.grain], ["气干密度", wood.air_dry_density],
    ["含水率条件", wood.moisture_condition], ["纵向拉伸强度", wood.longitudinal_tensile_strength],
    ["纵向抗压强度", wood.longitudinal_compressive_strength], ["抗弯强度", wood.bending_strength],
    ["弹性模量", wood.elastic_modulus], ["径向 / 弦向收缩", [wood.radial_shrinkage, wood.tangential_shrinkage]],
    ["耐久与户外适用性", [wood.durability_class, wood.outdoor_suitability]]
  ]);
}

function dataSourceLabel(source) {
  if (typeof source === "string") return readableValue(source, "参考来源待补充");
  if (!source || typeof source !== "object") return "参考来源待补充";
  return [source.title, source.publisher].filter(Boolean).join(" · ") || "参考来源待补充";
}

function dataSourcesMarkup(sources) {
  if (!hasItems(sources)) return `<p class="data-source-empty">参考来源待补充</p>`;
  return `<div class="data-source-list">${sources.map((source) => {
    if (typeof source === "string") return `<div class="data-source-item"><strong>${readableValue(source, "参考来源待补充")}</strong></div>`;
    const title = readableValue(source?.title, "未命名来源");
    const heading = source?.url ? `<a href="${source.url}" target="_blank" rel="noreferrer">${title}</a>` : `<strong>${title}</strong>`;
    const meta = [source?.publisher, source?.accessed_at ? `访问日期 ${source.accessed_at}` : ""].filter(Boolean).join(" · ");
    return `<div class="data-source-item">${heading}${meta ? `<span>${meta}</span>` : ""}${source?.note ? `<p>${source.note}</p>` : ""}</div>`;
  }).join("")}</div>`;
}

function dataQualityMarkup(material) {
  const quality = material.data_quality || {};
  const status = readableValue(material.data_status, quality.reviewed ? "已核验" : "待补充");
  return `<article class="detail-card detail-card-wide data-quality-card"><h3>数据状态与参考来源</h3><div class="detail-info-list">
    <div class="detail-info-row"><div class="detail-info-label">数据状态</div><div class="detail-info-content"><p>${status}</p></div></div>
    <div class="detail-info-row"><div class="detail-info-label">最近更新</div><div class="detail-info-content"><p>${readableValue(material.updated_at, "暂无数据")}</p></div></div>
    <div class="detail-info-row"><div class="detail-info-label">数据完整度</div><div class="detail-info-content"><p>${materialQualityLabel(material)}</p></div></div>
    <div class="detail-info-row"><div class="detail-info-label">工程数据</div><div class="detail-info-content"><p>${readableValue(material.engineering_data_type, "unavailable")}</p></div></div>
    <div class="detail-info-row"><div class="detail-info-label">参数说明</div><div class="detail-info-content">${detailValueMarkup(material.engineering_condition_note)}</div></div>
    <div class="detail-info-row"><div class="detail-info-label">参考来源</div><div class="detail-info-content">${dataSourcesMarkup(material.data_sources)}</div></div>
  </div></article>`;
}

function recommendationCard(material, reason) {
  return `<button class="recommend-card" type="button" data-material-id="${material.id}">${thumbnailMarkup(material)}<strong>${material.name_cn}${material.abbreviation ? ` · ${material.abbreviation}` : ""}</strong><span class="detail-muted">${reason}</span></button>`;
}


function bindImageTabs(scope) {
  scope.querySelectorAll(".image-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const type = tab.dataset.imageTab;
      scope.querySelectorAll(".image-tab").forEach((item) => item.classList.toggle("active", item === tab));
      scope.querySelectorAll(".image-tab-panel").forEach((panel) => panel.classList.toggle("active", panel.dataset.imagePanel === type));
    });
  });
  const firstPanel = scope.querySelector(".image-tab-panel");
  if (firstPanel) firstPanel.classList.add("active");
}

function bindImagePreview(scope) {
  scope.querySelectorAll("[data-preview-image]").forEach((button) => {
    button.addEventListener("click", () => openImagePreview(button.dataset.previewImage, button.dataset.previewAlt, button.dataset.previewCaption));
  });
}

function syncOverlayLock() {
  const compareOpen = !document.querySelector("#compare-panel")?.classList.contains("hidden");
  const previewOpen = !document.querySelector("#image-preview")?.classList.contains("hidden");
  document.body.classList.toggle("overlay-open", compareOpen || previewOpen);
}

function closeImagePreview() {
  document.querySelector("#image-preview")?.classList.add("hidden");
  syncOverlayLock();
}

function openImagePreview(src, alt, caption) {
  let preview = document.querySelector("#image-preview");
  if (!preview) {
    preview = document.createElement("div");
    preview.id = "image-preview";
    preview.className = "image-preview hidden";
    preview.innerHTML = `<div class="image-preview-backdrop" data-close-preview></div><figure class="image-preview-dialog"><button type="button" class="image-preview-close" data-close-preview aria-label="\u5173\u95ed\u56fe\u7247\u9884\u89c8">\u5173\u95ed</button><img alt="" /><figcaption></figcaption></figure>`;
    document.body.appendChild(preview);
    preview.querySelectorAll("[data-close-preview]").forEach((item) => item.addEventListener("click", closeImagePreview));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeImagePreview(); });
  }
  preview.querySelector("img").src = src;
  preview.querySelector("img").alt = alt || "\u6750\u6599\u56fe\u7247\u9884\u89c8";
  preview.querySelector("figcaption").textContent = caption || alt || "\u6750\u6599\u56fe\u7247\u9884\u89c8";
  preview.classList.remove("hidden");
  syncOverlayLock();
}

function showDetail(id) {
  const material = materialById(id);
  if (!material) return;
  const directRelations = materialChildren(material).slice(0, 4);
  const sameFamily = materials.filter((item) => item.id !== material.id && (item.parent_id === material.parent_id || item.canonical_material_id === material.canonical_material_id)).slice(0, 4);
  const sameApplication = materials.filter((item) => item.id !== material.id && item.application_collections.some((collectionId) => material.application_collections.includes(collectionId))).slice(0, 4);
  const samePerformance = materials.filter((item) => item.id !== material.id && item.key_properties.some((tag) => material.key_properties.includes(tag))).slice(0, 4);
  const recommendations = [];
  [...directRelations.map((item) => [item, "直接子项"]), ...sameFamily.map((item) => [item, "同一材料家族"]), ...sameApplication.map((item) => [item, "同应用专题"]), ...samePerformance.map((item) => [item, "相似性能"])].forEach(([item, reason]) => {
    if (!recommendations.some(([current]) => current.id === item.id)) recommendations.push([item, reason]);
  });
  const parent = parentMaterial(material);
  const canonical = materialById(material.canonical_material_id);
  const detail = $("#material-detail");
  detail.classList.remove("hidden");
  detail.innerHTML = `
    <div class="breadcrumb breadcrumb-scroll">首页 / 材料详情 / ${material.taxonomy_path.join(" / ")}</div>
    <div class="detail-hero">
      <div>
        <div class="detail-identity-badges"><span class="entity-badge">${materialEntityLabel(material)}</span><span class="quality-badge">${materialQualityLabel(material)}</span></div>
        <h2>${material.name_cn}</h2>
        <p class="detail-muted">${material.name_en}${material.abbreviation ? ` · ${material.abbreviation}` : ""}</p>
        <p class="detail-muted detail-taxonomy-path">${materialPath(material, " › ")}</p>
      </div>
      <div class="detail-actions">
        <button class="ghost-button" type="button" id="detail-favorite">${state.favorites.has(material.id) ? "已收藏" : "收藏"}</button>
        <button class="ghost-button" type="button" id="detail-compare">${state.compareItems.has(material.id) ? "已在对比" : "加入对比"}</button>
        <button class="ghost-button" type="button" id="detail-close">返回列表</button>
      </div>
    </div>
    <p class="detail-intro">${material.description}</p>
    ${engineeringParameterCards(material)}
    ${performanceRadar(material)}
    ${materialImages(material)}
    <div class="property-strip">${material.key_properties.map((property) => `<button class="property-pill" type="button">${property}</button>`).join("")}</div>
    <div class="detail-grid grouped-detail-grid">
      ${detailGroup("材料身份", [["实体类型", materialEntityLabel(material)], ["所属父级", parent?.name_cn || "基础分类根节点"], ["基础主记录", canonical?.name_cn || material.name_cn], ["完整分类路径", materialPath(material, " › ")], ["分类依据", material.classification_basis], ["牌号与标准对照", standardDesignationText(material)], ["学习层级", material.difficulty_level]])}
      ${detailGroup("结构与组成", [["化学成分", material.chemical_composition || UNKNOWN_DATA], ["组成/组织结构", material.composition_or_structure], ["补充说明", material.notes]])}
      ${detailGroup("状态与形态", [["材料状态", material.material_states], ["热处理", heatTreatmentText(material)], ["产品形态", material.product_forms]])}
      ${detailGroup("性能表现", [["力学性能", material.mechanical_properties], ["热性能", material.thermal_properties], ["电性能", material.electrical_properties], ["光学性能", material.optical_properties], ["磁学性能", material.magnetic_properties], ["耐腐蚀/耐候", corrosionResistance(material)]])}
      ${detailGroup("加工与应用", [["加工方法", material.processing_methods], ["典型用途", material.applications], ["典型产品", material.typical_products], ["应用专题", materialCollectionNames(material)]])}
      ${detailGroup("优缺点", [["优点", material.advantages], ["局限性", material.limitations]])}
      ${detailGroup("检索与关联信息", [["相关材料名称", material.related_materials], ["同义词/别名", material.aliases], ["标签", material.tags]])}
      ${woodPropertiesMarkup(material)}
      ${propertyRecordsMarkup(material)}
      ${materialRelationsMarkup(material)}
      ${dataQualityMarkup(material)}
    </div>
    <h3>关联推荐</h3>
    <div class="recommendation-grid">${recommendations.slice(0, 9).map(([item, reason]) => recommendationCard(item, reason)).join("")}</div>
  `;
  detail.querySelectorAll(".property-pill").forEach((pill) => pill.addEventListener("click", () => {
    setFilter({ tag: pill.textContent });
    scrollToExplore();
  }));
  detail.querySelectorAll(".recommend-card").forEach((button) => button.addEventListener("click", () => showDetail(button.dataset.materialId)));
  detail.querySelectorAll("[data-related-id]").forEach((button) => button.addEventListener("click", () => showDetail(button.dataset.relatedId)));
  detail.querySelectorAll("[data-related-collection]").forEach((button) => button.addEventListener("click", () => {
    setFilter({ collectionId: button.dataset.relatedCollection, query: "" });
    detail.classList.add("hidden");
    scrollToExplore();
  }));
  bindImageTabs(detail);
  bindImagePreview(detail);
  $("#detail-close").addEventListener("click", () => { detail.classList.add("hidden"); scrollToExplore(); });
  $("#detail-favorite").addEventListener("click", () => toggleFavorite(material.id, true));
  $("#detail-compare").addEventListener("click", () => addToCompare(material.id, true));
  detail.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleFavorite(id, fromDetail = false) {
  const material = materialById(id);
  if (!material) return;
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    toast(`已取消收藏：${material.name_cn}`);
  } else {
    state.favorites.add(id);
    toast(`已收藏：${material.name_cn}`, "success");
  }
  writeStorageSet("materialbox:favorites", state.favorites);
  renderAllMaterialAreas();
  if (fromDetail) {
    const btn = $("#detail-favorite");
    if (btn) btn.textContent = state.favorites.has(id) ? "已收藏" : "收藏";
  }
}

function renderFavorites() {
  const list = [...state.favorites].map(materialById).filter(Boolean);
  const container = $("#favorites-list");
  if (!container) return;
  container.innerHTML = "";
  list.forEach((material) => container.appendChild(materialCard(material)));
  $("#favorites-empty").classList.toggle("hidden", list.length > 0);
  $("#favorites-summary").textContent = list.length ? `已收藏 ${list.length} 个材料，保存在本机浏览器中。` : "还没有收藏材料。";
}

function clearFavorites() {
  if (state.favorites.size === 0) {
    toast("当前没有收藏材料");
    return;
  }
  state.favorites.clear();
  writeStorageSet("materialbox:favorites", state.favorites);
  renderAllMaterialAreas();
  toast("已清空收藏");
}

function addToCompare(id, fromDetail = false) {
  const material = materialById(id);
  if (!material) return;
  if (state.compareItems.has(id)) {
    toast(`已在对比中：${material.name_cn}`);
    openComparePanel();
    return;
  }
  if (state.compareItems.size >= 3) {
    toast("最多同时对比 3 个材料，请先移除一个。", "warning");
    openComparePanel();
    return;
  }
  state.compareItems.add(id);
  writeStorageSet("materialbox:compare", state.compareItems);
  renderAllMaterialAreas();
  if (fromDetail) {
    const btn = $("#detail-compare");
    if (btn) btn.textContent = "已在对比";
  }
  toast(`已加入对比：${material.name_cn}`, "success");
}

function removeFromCompare(id) {
  const material = materialById(id);
  state.compareItems.delete(id);
  writeStorageSet("materialbox:compare", state.compareItems);
  renderAllMaterialAreas();
  renderCompareContent();
  toast(`已移除对比：${material?.name_cn || id}`);
}

function clearCompare() {
  if (state.compareItems.size === 0) {
    toast("当前没有对比材料");
    return;
  }
  state.compareItems.clear();
  writeStorageSet("materialbox:compare", state.compareItems);
  renderAllMaterialAreas();
  renderCompareContent();
  toast("已清空对比");
}

function propertyRecordFor(material, key) {
  return (material.property_records || []).find((record) => record.property === key) || null;
}

function engineeringCompareValue(material, key) {
  const value = engineeringValue(material, key);
  const record = propertyRecordFor(material, key);
  const condition = record?.condition || (material.material_states || []).slice(0, 2).join("、");
  const source = dataSourceLabel(record?.source || (material.data_sources || [])[0]);
  return `<span>${value}</span><small>${condition ? `条件：${condition} · ` : ""}${source}</small>`;
}

function compareRows() {
  const field = (label, getter, available = () => true) => ({ label, getter, available });
  const engineeringField = (label, key) => field(label, (m) => engineeringCompareValue(m, key), (m) => !isMissingValue(engineeringValue(m, key)));
  const arrayField = (label, key) => field(label, (m) => arrayText(m[key]), (m) => hasItems(m[key]));
  return [
    field("查看详情", (m) => `<button class="compare-detail-button" type="button" data-compare-detail="${m.id}">查看详情</button>`),
    field("中文名", (m) => readableValue(m.name_cn)),
    field("英文名", (m) => readableValue(m.name_en), (m) => Boolean(m.name_en)),
    field("简称/缩写", (m) => readableValue(m.abbreviation), (m) => Boolean(m.abbreviation)),
    field("实体类型", (m) => materialEntityLabel(m)),
    field("完整分类路径", (m) => materialPath(m, " › ")),
    field("父级材料", (m) => parentMaterial(m)?.name_cn || "基础分类根节点"),
    field("材料状态", (m) => arrayText(m.material_states), (m) => hasItems(m.material_states)),
    field("产品形态", (m) => arrayText(m.product_forms), (m) => hasItems(m.product_forms)),
    field("工程数据类型", (m) => readableValue(m.engineering_data_type)),
    engineeringField("密度", "density"),
    engineeringField("熔点", "melting_point"),
    engineeringField("使用温度", "service_temperature"),
    engineeringField("抗拉强度", "tensile_strength"),
    engineeringField("弹性模量", "elastic_modulus"),
    engineeringField("导热率", "thermal_conductivity"),
    engineeringField("电阻率", "electrical_resistivity"),
    engineeringField("硬度", "hardness"),
    engineeringField("硬度条件", "hardness_condition"),
    engineeringField("耐腐蚀性", "corrosion_resistance"),
    engineeringField("成本等级", "cost_level"),
    arrayField("关键性能", "key_properties"),
    arrayField("应用场景", "applications"),
    field("应用专题", (m) => arrayText(materialCollectionNames(m)), (m) => materialCollectionNames(m).length > 0),
    arrayField("加工方法", "processing_methods"),
    arrayField("优点", "advantages"),
    arrayField("局限性", "limitations"),
    field("数据来源", (m) => hasItems(m.data_sources) ? m.data_sources.map(dataSourceLabel).join("；") : "参考来源待补充", (m) => hasItems(m.data_sources))
  ];
}

function renderCompareContent() {
  const content = $("#compare-content");
  if (!content) return;
  const items = [...state.compareItems].map(materialById).filter(Boolean);
  if (items.length === 0) {
    content.innerHTML = `<div class="empty-state"><h3>还没有加入对比的材料</h3><p>可以从材料卡片或详情页添加。</p></div>`;
    return;
  }
  const hasFamily = items.some((item) => ["family", "subfamily"].includes(item.entity_type));
  const hasSpecific = items.some((item) => ["grade", "material", "variant", "form"].includes(item.entity_type));
  const conditionSensitive = items.some((item) => ["复合材料", "高分子材料", "天然与生物基材料", "纤维与纺织材料"].includes(item.category_1));
  const rows = compareRows().filter((row) => state.compareMode === "all" || items.every(row.available));
  content.innerHTML = `
    <div class="compare-toolbar">
      <div class="compare-mode" role="group" aria-label="对比字段模式">
        <button type="button" data-compare-mode="common" class="${state.compareMode === "common" ? "active" : ""}">只看共同字段</button>
        <button type="button" data-compare-mode="all" class="${state.compareMode === "all" ? "active" : ""}">显示全部字段</button>
      </div>
      <span>性能值同时展示可用的状态条件与来源。</span>
    </div>
    ${hasFamily && hasSpecific ? '<div class="compare-warning">当前同时对比材料家族与具体材料/牌号，数据粒度不同，不应直接据此作最终选材结论。</div>' : ""}
    ${conditionSensitive ? '<div class="compare-warning subtle">所选材料含各向异性或条件敏感体系，请重点核对方向、含水率、增强比例、状态和测试温度。</div>' : ""}
    <div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>字段</th>${items.map((m) => `<th><div class="compare-material-head"><span>${m.name_cn}<small>${materialEntityLabel(m)}</small></span><button type="button" data-remove-compare="${m.id}" aria-label="从对比中移除${m.name_cn}">移除</button></div></th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr><th>${row.label}</th>${items.map((m) => `<td>${row.getter(m)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  content.querySelectorAll("[data-remove-compare]").forEach((button) => button.addEventListener("click", () => removeFromCompare(button.dataset.removeCompare)));
  content.querySelectorAll("[data-compare-detail]").forEach((button) => button.addEventListener("click", () => { closeComparePanel(); showDetail(button.dataset.compareDetail); }));
  content.querySelectorAll("[data-compare-mode]").forEach((button) => button.addEventListener("click", () => {
    state.compareMode = button.dataset.compareMode;
    renderCompareContent();
  }));
}

function openComparePanel() {
  $("#compare-panel").classList.remove("hidden");
  syncOverlayLock();
  renderCompareContent();
}

function closeComparePanel() {
  $("#compare-panel").classList.add("hidden");
  syncOverlayLock();
}

function updateCounts() {
  const favoriteCount = state.favorites.size;
  const compareCount = state.compareItems.size;
  ["#favorite-count", "#hero-favorite-count"].forEach((selector) => { const el = $(selector); if (el) el.textContent = favoriteCount; });
  ["#compare-count", "#hero-compare-count"].forEach((selector) => { const el = $(selector); if (el) el.textContent = compareCount; });
}

function renderAllMaterialAreas() {
  renderResults();
  renderRecommended();
  renderFavorites();
  updateCounts();
}

function bindFilterToggle() {
  const panel = $("#filters-panel");
  const button = $("#filter-toggle");
  if (!panel || !button) return;
  button.addEventListener("click", () => {
    const expanded = panel.classList.toggle("expanded");
    panel.classList.toggle("collapsed", !expanded);
    button.setAttribute("aria-expanded", String(expanded));
    button.textContent = expanded ? "收起筛选条件 ↑" : "展开更多筛选条件 ↓";
    if (!expanded) closeAllFilterComboboxes();
  });
}

function bindGlobalEvents() {
  const debouncedSearch = debounce((value) => setFilter({ query: value }), 130);
  $("#search-input").addEventListener("input", (event) => debouncedSearch(event.target.value));
  $("#search-input").addEventListener("focus", renderSearchSuggestions);
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-shell") && !event.target.closest("#search-suggestions")) $("#search-suggestions").classList.add("hidden");
    if (!event.target.closest(".filter-combobox")) closeAllFilterComboboxes();
  });
  $("#search-button").addEventListener("click", () => { setFilter({ query: $("#search-input").value }); scrollToExplore(); });
  $("#clear-filters").addEventListener("click", () => setFilter({ query: "", taxonomyPath: [], category1: "全部", category2: "全部", tag: "全部", application: "全部", processing: "全部", family: "全部", entityType: "全部", collectionId: "全部", productForm: "全部", materialState: "全部", dataQuality: "全部", costLevel: "全部", temperatureRange: "全部" }));
  $("#compare-entry").addEventListener("click", openComparePanel);
  $("#nav-compare")?.addEventListener("click", openComparePanel);
  $("#hero-compare")?.addEventListener("click", openComparePanel);
  $("#nav-favorites")?.addEventListener("click", () => $("#favorites-section").scrollIntoView({ behavior: "smooth", block: "start" }));
  $("#hero-favorites")?.addEventListener("click", () => $("#favorites-section").scrollIntoView({ behavior: "smooth", block: "start" }));
  $("#clear-favorites")?.addEventListener("click", clearFavorites);
  $("#clear-compare")?.addEventListener("click", clearCompare);
  $$('[data-close-compare]').forEach((item) => item.addEventListener("click", closeComparePanel));
  $("#results-toggle")?.addEventListener("click", toggleResultsExpanded);
  $("#taxonomy-close")?.addEventListener("click", () => $("#taxonomy-browser")?.classList.add("hidden"));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeComparePanel(); });
  $("#back-to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => $("#back-to-top").classList.toggle("visible", window.scrollY > 520));
  document.addEventListener("scroll", queueOpenComboboxPosition, true);
  window.addEventListener("resize", debounce(() => { renderResults(); queueOpenComboboxPosition(); }, 160));
}

async function init() {
  await loadMaterialsJsonPreferred();
  migrateStoredSelections();
  renderQuickTags();
  renderStats();
  renderCategoryCards();
  renderApplications();
  renderFilters();
  renderActiveFilters();
  renderAllMaterialAreas();
  renderCompareContent();
  bindFilterToggle();
  bindGlobalEvents();
}

window.addEventListener("DOMContentLoaded", init);

