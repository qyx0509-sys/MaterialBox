let materials = window.MATERIALS_DATA || [];
const categorySystem = window.MATERIAL_CATEGORIES || [];
const materialImageMap = window.MATERIAL_IMAGE_MAP || {};
const legacyImageManifest = window.MATERIAL_IMAGE_MANIFEST || {};
const quickTags = ["PEEK", "碳纤维", "钛合金", "石墨烯", "锂电池材料", "木材", "塑料", "金属", "陶瓷", "建筑", "纺织", "电子", "医用", "储能", "天然材料"];
const hotApplications = ["航空航天", "汽车轻量化", "电子封装", "医疗植入", "锂电池", "光伏能源", "建筑工程", "室内装饰", "纺织", "3D打印"];
const recommendedIds = ["wood", "bamboo", "peek", "carbon_fiber_epoxy", "aluminum_alloy", "alumina_ceramic", "graphene", "natural_stone"];
const hotSearchTerms = ["PEEK", "碳纤维", "钛合金", "石墨烯", "锂电池材料"];
const engineeringFieldOrder = [
  ["density", "密度"], ["melting_point", "熔点"], ["service_temperature", "使用温度"], ["tensile_strength", "抗拉强度"],
  ["elastic_modulus", "弹性模量"], ["thermal_conductivity", "导热率"], ["electrical_resistivity", "电阻率"], ["cost_level", "成本等级"]
];
const temperatureFilterOptions = ["全部", "常温与低温", "中温 150-300℃", "高温 300-800℃", "超高温 800℃以上", "暂无数据"];
const costFilterOptions = ["全部", "低", "中", "较高", "高", "很高", "暂无数据"];
const engineeringProfiles = {
  peek: { density: "1.30 g/cm³", melting_point: "343℃", service_temperature: "250℃", tensile_strength: "90-100 MPa", elastic_modulus: "3.6-4.0 GPa", thermal_conductivity: "0.25 W/(m·K)", electrical_resistivity: "约10^16 Ω·cm", cost_level: "高", performance_scores: { strength: 4, heat: 5, corrosion: 5, processability: 3, cost: 1, lightweight: 4 } },
  steel: { density: "7.85 g/cm³", melting_point: "约1450-1520℃", service_temperature: "约400-600℃", tensile_strength: "400-1000 MPa", elastic_modulus: "约200 GPa", thermal_conductivity: "约45-60 W/(m·K)", electrical_resistivity: "约1.0×10^-7 Ω·m", cost_level: "低", performance_scores: { strength: 4, heat: 3, corrosion: 2, processability: 4, cost: 5, lightweight: 1 } },
  aluminum_alloy: { density: "约2.70 g/cm³", melting_point: "约580-660℃", service_temperature: "约120-200℃", tensile_strength: "150-500 MPa", elastic_modulus: "约70 GPa", thermal_conductivity: "约120-180 W/(m·K)", electrical_resistivity: "约2.8×10^-8 Ω·m", cost_level: "中", performance_scores: { strength: 3, heat: 2, corrosion: 3, processability: 5, cost: 4, lightweight: 5 } },
  titanium_alloy: { density: "约4.43-4.50 g/cm³", melting_point: "约1600-1660℃", service_temperature: "约350-600℃", tensile_strength: "900-1200 MPa", elastic_modulus: "约110 GPa", thermal_conductivity: "约6-8 W/(m·K)", electrical_resistivity: "约1.7×10^-6 Ω·m", cost_level: "高", performance_scores: { strength: 5, heat: 4, corrosion: 5, processability: 2, cost: 1, lightweight: 4 } },
  carbon_fiber_epoxy: { density: "约1.5-1.7 g/cm³", service_temperature: "约120-180℃", tensile_strength: "600-1500 MPa", elastic_modulus: "70-150 GPa", cost_level: "高", performance_scores: { strength: 5, heat: 3, corrosion: 4, processability: 2, cost: 1, lightweight: 5 } },
  alumina_ceramic: { density: "约3.7-3.9 g/cm³", melting_point: "约2050℃", service_temperature: "约1000-1600℃", tensile_strength: "抗弯约300-400 MPa", elastic_modulus: "约300-380 GPa", cost_level: "中", performance_scores: { strength: 3, heat: 5, corrosion: 5, processability: 1, cost: 3, lightweight: 2 } },
  wood: { density: "约0.35-0.85 g/cm³", melting_point: "无明确熔点，受热分解", service_temperature: "长期约-20-80℃", tensile_strength: "顺纹约40-150 MPa", elastic_modulus: "约8-16 GPa", cost_level: "低", performance_scores: { strength: 3, heat: 1, corrosion: 2, processability: 5, cost: 5, lightweight: 5 } }
};
prepareMaterialData();

const state = {
  query: "",
  category1: "全部",
  category2: "全部",
  tag: "全部",
  application: "全部",
  processing: "全部",
  costLevel: "全部",
  temperatureRange: "全部",
  resultsExpanded: false,
  favorites: new Set(readStorageArray("materialbox:favorites")),
  compareItems: new Set(readStorageArray("materialbox:compare"))
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const hasItems = (value) => Array.isArray(value) && value.length > 0;

function prepareMaterialData() {
  window.MATERIALS_DATA = materials;
  mergeMaterialImages();
  mergeEngineeringData();
}

async function loadMaterialsJsonPreferred() {
  try {
    const response = await fetch("materials.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`materials.json ${response.status}`);
    const jsonData = await response.json();
    if (!Array.isArray(jsonData) || jsonData.length === 0) throw new Error("materials.json 数据为空");
    materials = jsonData;
    prepareMaterialData();
  } catch (error) {
    console.info("materials.json 不可用，已回退到 materials.js 数据源。", error);
    prepareMaterialData();
  }
}

function engineeringValue(material, key) {
  return readableValue(material.engineering_properties?.[key] || material[key]);
}

function corrosionResistance(material) {
  const explicit = material.engineering_properties?.corrosion_resistance || material.corrosion_resistance;
  if (explicit) return readableValue(explicit);
  const text = searchableText(material);
  if (["耐腐蚀", "耐化学", "不锈", "惰性"].some((word) => text.includes(word))) return "较好";
  return "暂无数据";
}

function hardnessValue(material) {
  return readableValue(material.engineering_properties?.hardness || material.hardness);
}

function meltingAndServiceTemperature(material) {
  const melting = engineeringValue(material, "melting_point");
  const service = engineeringValue(material, "service_temperature");
  if (melting === "暂无数据" && service === "暂无数据") return "暂无数据";
  if (melting === "暂无数据") return service;
  if (service === "暂无数据") return melting;
  return `${melting} / ${service}`;
}



function imageTypeLabel(type) {
  return { macro: "宏观图", micro: "微观图", structure: "结构示意图" }[type] || "材料图";
}

function normalizeImageItem(item, material, type, index) {
  const raw = typeof item === "string" ? { src: item } : (item || {});
  return {
    src: raw.src || `assets/images/materials/${material.id}/${type}_${String(index + 1).padStart(2, "0")}.jpg`,
    alt: raw.alt || `${material.name_cn}${imageTypeLabel(type)}`,
    source: raw.source || "",
    author: raw.author || "",
    license: raw.license || "",
    licenseUrl: raw.licenseUrl || "",
    sourceUrl: raw.sourceUrl || "",
    caption: raw.caption || raw.alt || `${material.name_cn}${imageTypeLabel(type)}`
  };
}

function normalizeImageList(value, material, type) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.filter(Boolean).map((item, index) => normalizeImageItem(item, material, type, index));
}

function mergeMaterialImages() {
  if (!Array.isArray(window.MATERIALS_DATA)) return;
  window.MATERIALS_DATA.forEach((material) => {
    const mapped = materialImageMap[material.id];
    const legacy = legacyImageManifest[material.id];
    const current = material.images || {};
    const source = mapped || current || legacy || {};
    material.images = {
      macro: normalizeImageList(source.macro, material, "macro"),
      micro: normalizeImageList(source.micro, material, "micro"),
      structure: normalizeImageList(source.structure, material, "structure")
    };
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
  return materials.find((item) => item.id === id);
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

function engineeringDefaultsFor(material) {
  const base = { density: "暂无数据", melting_point: "暂无数据", service_temperature: "暂无数据", tensile_strength: "暂无数据", elastic_modulus: "暂无数据", thermal_conductivity: "暂无数据", electrical_resistivity: "暂无数据", cost_level: "暂无数据" };
  const c1 = material.category_1 || "";
  const c2 = material.category_2 || "";
  if (c1.includes("金属")) return { ...base, density: "通常较高", melting_point: "通常较高", service_temperature: "中高温", thermal_conductivity: "中等至较高", electrical_resistivity: "较低", cost_level: "中" };
  if (c1.includes("高分子")) return { ...base, density: "通常0.9-1.5 g/cm³", melting_point: "依聚合物而定", service_temperature: "常温至中温", thermal_conductivity: "较低", electrical_resistivity: "通常较高", cost_level: c2.includes("特种") ? "高" : "中" };
  if (c1.includes("无机") || c1.includes("陶瓷")) return { ...base, density: "中等至较高", melting_point: "通常较高", service_temperature: "高温", electrical_resistivity: "通常较高", cost_level: "中" };
  if (c1.includes("复合")) return { ...base, density: "依增强体和基体而定", service_temperature: "依基体而定", tensile_strength: "各向异性", elastic_modulus: "各向异性", cost_level: "较高" };
  if (c1.includes("天然") || c1.includes("建筑") || c1.includes("纺织")) return { ...base, density: "依天然来源和孔隙率而定", service_temperature: "常温使用", thermal_conductivity: "通常较低", cost_level: "低" };
  return base;
}

function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 3;
  return Math.max(1, Math.min(5, Math.round(score)));
}

function estimatePerformanceScores(material) {
  const text = searchableText(material);
  const has = (...words) => words.some((word) => text.includes(word));
  return {
    strength: has("高强度", "承载", "增强", "强度") ? 4 : 3,
    heat: has("耐高温", "高温", "热稳定", "耐热") ? 5 : has("常温") ? 2 : 3,
    corrosion: has("耐腐蚀", "耐化学", "惰性", "不锈") ? 5 : 3,
    processability: has("难加工", "脆性", "烧结") ? 2 : has("可加工", "注塑", "挤出", "焊接", "机加工", "成型") ? 4 : 3,
    cost: material.cost_level === "低" ? 5 : material.cost_level === "中" ? 3 : material.cost_level === "较高" ? 2 : material.cost_level === "高" ? 1 : 3,
    lightweight: has("轻量化", "低密度", "轻质") ? 5 : has("密度较高", "高密度") ? 1 : 3
  };
}

function mergeEngineeringData() {
  materials.forEach((material) => {
    const defaults = engineeringDefaultsFor(material);
    const profile = engineeringProfiles[material.id] || {};
    engineeringFieldOrder.forEach(([key]) => {
      const value = readableValue(material.engineering_properties?.[key] || material[key] || profile[key] || defaults[key]);
      material[key] = value;
      material.engineering_properties = { ...(material.engineering_properties || {}), [key]: value };
    });
    material.performance_scores = { ...estimatePerformanceScores(material), ...(material.performance_scores || {}), ...(profile.performance_scores || {}) };
  });
}

function numericTemperature(material) {
  const value = `${material.service_temperature || ""} ${material.melting_point || ""}`;
  const matches = value.match(/-?\d+(?:\.\d+)?/g);
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

function radarPoints(scores) {
  const keys = ["strength", "heat", "corrosion", "processability", "cost", "lightweight"];
  const center = 70;
  const radius = 54;
  return keys.map((key, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / keys.length;
    const distance = radius * (clampScore(scores[key]) / 5);
    return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
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
  return `<section class="parameter-strip" aria-label="基础工程参数">${parameters.map(([label, value]) => `<article class="parameter-card"><span>${label}</span><strong>${readableValue(value)}</strong></article>`).join("")}</section>`;
}

function performanceRadar(material) {
  const scores = material.performance_scores || estimatePerformanceScores(material);
  const rows = [["strength", "强度"], ["heat", "耐温"], ["corrosion", "耐腐蚀"], ["processability", "加工性"], ["cost", "成本"], ["lightweight", "轻量化"]];
  return `<section class="radar-card" aria-label="材料性能雷达图"><div class="radar-visual"><svg viewBox="0 0 140 140" role="img" aria-label="性能雷达图"><polygon class="radar-grid" points="70,16 116,43 116,97 70,124 24,97 24,43"></polygon><polygon class="radar-grid inner" points="70,34 100,52 100,88 70,106 40,88 40,52"></polygon><polygon class="radar-shape" points="${radarPoints(scores)}"></polygon></svg></div><div class="radar-list">${rows.map(([key, label]) => `<div><span>${label}</span><strong>${scoreStars(scores[key])}</strong></div>`).join("")}</div></section>`;
}

function searchableText(material) {
  return [
    material.name_cn,
    material.name_en,
    material.abbreviation,
    material.category_1,
    material.category_2,
    material.category_3,
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
    ...(material.tags || [])
  ].join(" ");
}

function matchesQuery(material, query) {
  return !query || normalize(searchableText(material)).includes(normalize(query));
}

function getCollapsedResultLimit() {
  if (window.innerWidth <= 720) return 3;
  if (window.innerWidth <= 1050) return 6;
  return 9;
}

function isDefaultFilterState() {
  return !state.query && state.category1 === "全部" && state.category2 === "全部" && state.tag === "全部" && state.application === "全部" && state.processing === "全部" && state.costLevel === "全部" && state.temperatureRange === "全部";
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
  return materials.filter((material) => {
    const categoryOk = state.category1 === "全部" || material.category_1 === state.category1;
    const subcategoryOk = state.category2 === "全部" || material.category_2 === state.category2;
    const tagOk = state.tag === "全部" || material.tags.includes(state.tag) || material.key_properties.includes(state.tag);
    const appOk = state.application === "全部" || material.applications.includes(state.application);
    const processingOk = state.processing === "全部" || material.processing_methods.includes(state.processing);
    const costOk = state.costLevel === "全部" || material.cost_level === state.costLevel;
    const tempOk = matchesTemperatureRange(material, state.temperatureRange);
    return categoryOk && subcategoryOk && tagOk && appOk && processingOk && costOk && tempOk && matchesQuery(material, state.query);
  });
}

function setFilter(partial) {
  Object.assign(state, partial);
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
  if (!useDefault) return { macro, micro, structure };
  return {
    macro: hasItems(macro) ? macro : [{
      src: `assets/images/materials/${material.id}/macro_01.jpg`,
      alt: `${material.name_cn}\u5b8f\u89c2\u56fe`,
      caption: `${material.name_cn}\u7684\u5916\u89c2\u3001\u7eb9\u7406\u3001\u4ea7\u54c1\u5f62\u6001\u6216\u65ad\u9762\u5f62\u8c8c`,
      source: "",
      author: "",
      license: "",
      licenseUrl: "",
      sourceUrl: ""
    }],
    micro: hasItems(micro) ? micro : [{
      src: `assets/images/materials/${material.id}/micro_01.jpg`,
      alt: `${material.name_cn}\u5fae\u89c2\u56fe`,
      caption: `${material.name_cn}\u7684\u663e\u5fae\u7ec4\u7ec7\u3001\u6676\u7c92\u3001\u7ea4\u7ef4\u3001\u5b54\u9699\u3001\u7ec6\u80de\u7ed3\u6784\u6216\u65ad\u53e3\u5f62\u8c8c`,
      source: "",
      author: "",
      license: "",
      licenseUrl: "",
      sourceUrl: ""
    }]
  };
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
    card.className = "category-card";
    card.innerHTML = `
      <h3>${category.name}</h3>
      <p>${category.description}</p>
      <div class="category-meta">${count} 个代表材料 · ${category.subcategories.length} 个二级分类</div>
      <div class="subcategory-list">
        ${category.subcategories.slice(0, 4).map((sub) => `<button class="mini-chip" type="button" data-category="${category.name}" data-subcategory="${sub.name}">${sub.name}</button>`).join("")}
      </div>
    `;
    card.addEventListener("click", (event) => {
      if (event.target.matches(".mini-chip")) return;
      setFilter({ category1: category.name, category2: "全部" });
      scrollToExplore();
    });
    card.querySelectorAll(".mini-chip").forEach((chip) => chip.addEventListener("click", () => {
      setFilter({ category1: chip.dataset.category, category2: chip.dataset.subcategory });
      scrollToExplore();
    }));
    grid.appendChild(card);
  });
}

function renderApplications() {
  const grid = $("#application-grid");
  grid.innerHTML = "";
  hotApplications.forEach((app) => {
    const count = materials.filter((item) => item.applications.includes(app) || item.tags.includes(app)).length;
    const card = document.createElement("button");
    card.className = "application-card";
    card.type = "button";
    card.innerHTML = `<h3>${app}</h3><p>${count} 个相关材料</p>`;
    card.addEventListener("click", () => {
      setFilter({ query: app, application: materials.some((item) => item.applications.includes(app)) ? app : "全部" });
      scrollToExplore();
    });
    grid.appendChild(card);
  });
}

function populateSelect(select, values, currentValue) {
  select.innerHTML = ["全部", ...values].map((value) => `<option value="${value}">${value}</option>`).join("");
  select.value = values.includes(currentValue) || currentValue === "全部" ? currentValue : "全部";
}

const filterSelectIds = ["category-filter", "subcategory-filter", "tag-filter", "application-filter", "processing-filter", "cost-filter", "temperature-filter"];

function optionAliasText(value) {
  const aliases = {
    "高分子材料": "塑料 plastic polymer",
    "传统与天然材料": "天然材料 木材 木头 wood timber 原木 板材",
    "建筑与装饰材料": "建筑 建材 木材 石材 板材",
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
    return false;
  });
}

function closeAllFilterComboboxes() {
  $$(".filter-combobox.open").forEach((box) => box.classList.remove("open"));
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
    const options = document.createElement("div");
    options.className = "filter-options";
    combo.append(input, options);
    select.insertAdjacentElement("afterend", combo);
    select._filterCombobox = { root: combo, input, options };
    input.addEventListener("focus", () => { combo.classList.add("open"); renderComboboxOptions(select); });
    input.addEventListener("input", () => { combo.classList.add("open"); renderComboboxOptions(select); });
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
  populateSelect($("#cost-filter"), costFilterOptions.filter((value) => value !== "全部"), state.costLevel);
  populateSelect($("#temperature-filter"), temperatureFilterOptions.filter((value) => value !== "全部"), state.temperatureRange);

  $("#category-filter").addEventListener("change", (event) => setFilter({ category1: event.target.value, category2: "全部" }));
  $("#subcategory-filter").addEventListener("change", (event) => setFilter({ category2: event.target.value }));
  $("#tag-filter").addEventListener("change", (event) => setFilter({ tag: event.target.value }));
  $("#application-filter").addEventListener("change", (event) => setFilter({ application: event.target.value }));
  $("#processing-filter").addEventListener("change", (event) => setFilter({ processing: event.target.value }));
  $("#cost-filter").addEventListener("change", (event) => setFilter({ costLevel: event.target.value }));
  $("#temperature-filter").addEventListener("change", (event) => setFilter({ temperatureRange: event.target.value }));
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
  $("#cost-filter").value = state.costLevel;
  $("#temperature-filter").value = state.temperatureRange;
  refreshAllFilterComboboxes();
}

function renderActiveFilters() {
  const filters = [["关键词", state.query], ["一级分类", state.category1], ["二级分类", state.category2], ["性能", state.tag], ["应用", state.application], ["加工", state.processing], ["成本", state.costLevel], ["温度", state.temperatureRange]].filter(([, value]) => value && value !== "全部");
  const container = $("#active-filters");
  if (filters.length === 0) {
    container.innerHTML = `<span class="active-filter-label">当前筛选：未设置</span>`;
    return;
  }
  container.innerHTML = `<span class="active-filter-label">当前筛选：</span>${filters.map(([label, value]) => `<button class="filter-chip" type="button" data-label="${label}">${value} ×</button>`).join("")}`;
  container.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const resetMap = { 关键词: { query: "" }, 一级分类: { category1: "全部", category2: "全部" }, 二级分类: { category2: "全部" }, 性能: { tag: "全部" }, 应用: { application: "全部" }, 加工: { processing: "全部" }, 成本: { costLevel: "全部" }, 温度: { temperatureRange: "全部" } };
      setFilter(resetMap[chip.dataset.label]);
    });
  });
}

function materialCard(material) {
  const isFavorite = state.favorites.has(material.id);
  const isCompared = state.compareItems.has(material.id);
  const cardTags = material.key_properties.slice(0, 3);
  const extraTagCount = Math.max(0, material.key_properties.length - cardTags.length);
  const card = document.createElement("article");
  card.className = "material-card";
  card.innerHTML = `
    ${thumbnailMarkup(material)}
    <div class="material-card-header">
      <div>
        <h3>${material.name_cn}</h3>
        <div class="path">${material.category_1} / ${material.category_2}</div>
      </div>
      ${material.abbreviation ? `<span class="abbrev">${material.abbreviation}</span>` : ""}
    </div>
    <p>${material.description}</p>
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
  card.querySelectorAll(".mini-chip").forEach((chip) => chip.addEventListener("click", () => {
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
  $("#empty-state").innerHTML = `<h3>未找到该材料，可能尚未收录</h3><p>你可以尝试：木材、竹材、天然材料、建筑材料、塑料、玻璃钢、航空材料。</p><p>后续可按 materials.js 的字段结构添加到材料库。</p>`;
  $("#result-summary").textContent = `当前匹配 ${list.length} / ${materials.length} 个材料`;
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
  const materialMatches = materials.filter((item) => matchesQuery(item, keyword)).slice(0, 6);
  const categoryMatches = categorySystem.filter((cat) => normalize([cat.name, cat.description, ...cat.subcategories.flatMap((sub) => [sub.name, ...sub.examples])].join(" ")).includes(keyword)).slice(0, 3);
  container.classList.remove("hidden");
  if (materialMatches.length === 0 && categoryMatches.length === 0) {
    container.innerHTML = `<div class="suggestion-empty">未找到直接建议，可尝试“木材”“天然材料”“建筑材料”“航空材料”。</div>`;
    return;
  }
  container.innerHTML = `${materialMatches.map((item) => `<button type="button" class="suggestion-item" data-type="material" data-id="${item.id}"><strong>${item.name_cn}</strong><span>${item.category_1} / ${item.category_2}</span></button>`).join("")}${categoryMatches.map((item) => `<button type="button" class="suggestion-item" data-type="category" data-name="${item.name}"><strong>${item.name}</strong><span>分类入口</span></button>`).join("")}`;
  container.querySelectorAll(".suggestion-item").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.type === "material") showDetail(button.dataset.id);
      else {
        setFilter({ category1: button.dataset.name, category2: "全部" });
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

function imageCard(image, fallbackText) {
  return `<article class="image-card"><button class="image-frame" type="button" data-preview-image="${image.src}" data-preview-alt="${image.alt}" data-preview-caption="${image.caption || image.alt}" aria-label="\u653e\u5927\u9884\u89c8${image.alt}"><img src="${image.src}" alt="${image.alt}" loading="lazy" onerror="this.closest('.image-card').classList.add('image-missing')" /><div class="image-fallback">${fallbackText}<br><small>${image.src}</small></div></button><p class="image-caption">${image.caption || image.alt}</p>${imageMeta(image)}</article>`;
}

function imagePanel(type, images, fallbackText) {
  const cards = hasItems(images)
    ? images.map((image) => imageCard(image, fallbackText)).join("")
    : `<article class="image-card image-missing"><div class="image-frame"><div class="image-fallback">${fallbackText}<br><small>\u540e\u7eed\u53ef\u8865\u5145\u56fe\u7247</small></div></div></article>`;
  return `<div class="image-tab-panel" data-image-panel="${type}">${cards}</div>`;
}

function materialImages(material) {
  const images = getImageSet(material, false);
  return `<section class="material-images"><div class="material-images-head"><h3>材料图像</h3><div class="image-tabs" role="tablist" aria-label="材料图像类型"><button class="image-tab active" type="button" data-image-tab="macro">宏观图</button><button class="image-tab" type="button" data-image-tab="micro">微观图</button><button class="image-tab" type="button" data-image-tab="structure">结构示意图</button></div></div><div class="image-tab-content">${imagePanel("macro", images.macro, "暂无宏观图")}${imagePanel("micro", images.micro, "暂无微观图")}${imagePanel("structure", images.structure, "暂无结构示意图")}</div><p class="image-rule">批量放图规则：assets/images/materials/${material.id}/macro_01.jpg、micro_01.jpg、structure.png；元数据见 metadata.json。</p></section>`;
}

function detailGroup(title, rows) {
  return `<article class="detail-card detail-card-wide"><h3>${title}</h3>${rows.map(([label, value]) => {
    const values = Array.isArray(value) ? value : [value || "无"];
    return `<div class="detail-row"><strong>${label}</strong><ul>${values.map((item) => `<li>${item}</li>`).join("")}</ul></div>`;
  }).join("")}</article>`;
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
  const firstPanel = scope.querySelector('.image-tab-panel[data-image-panel="macro"]');
  if (firstPanel) firstPanel.classList.add("active");
}

function bindImagePreview(scope) {
  scope.querySelectorAll("[data-preview-image]").forEach((button) => {
    button.addEventListener("click", () => openImagePreview(button.dataset.previewImage, button.dataset.previewAlt, button.dataset.previewCaption));
  });
}

function openImagePreview(src, alt, caption) {
  let preview = document.querySelector("#image-preview");
  if (!preview) {
    preview = document.createElement("div");
    preview.id = "image-preview";
    preview.className = "image-preview hidden";
    preview.innerHTML = `<div class="image-preview-backdrop" data-close-preview></div><figure class="image-preview-dialog"><button type="button" class="image-preview-close" data-close-preview aria-label="\u5173\u95ed\u56fe\u7247\u9884\u89c8">\u5173\u95ed</button><img alt="" /><figcaption></figcaption></figure>`;
    document.body.appendChild(preview);
    preview.querySelectorAll("[data-close-preview]").forEach((item) => item.addEventListener("click", () => preview.classList.add("hidden")));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") preview.classList.add("hidden"); });
  }
  preview.querySelector("img").src = src;
  preview.querySelector("img").alt = alt || "\u6750\u6599\u56fe\u7247\u9884\u89c8";
  preview.querySelector("figcaption").textContent = caption || alt || "\u6750\u6599\u56fe\u7247\u9884\u89c8";
  preview.classList.remove("hidden");
}

function showDetail(id) {
  const material = materialById(id);
  if (!material) return;
  const sameCategory = materials.filter((item) => item.id !== material.id && item.category_2 === material.category_2).slice(0, 3);
  const sameApplication = materials.filter((item) => item.id !== material.id && item.applications.some((app) => material.applications.includes(app))).slice(0, 3);
  const samePerformance = materials.filter((item) => item.id !== material.id && item.key_properties.some((tag) => material.key_properties.includes(tag))).slice(0, 3);
  const detail = $("#material-detail");
  detail.classList.remove("hidden");
  detail.innerHTML = `
    <div class="breadcrumb">首页 / 材料详情 / ${material.category_1} / ${material.category_2} / ${material.name_cn}</div>
    <div class="detail-hero">
      <div>
        <h2>${material.name_cn}</h2>
        <p class="detail-muted">${material.name_en}${material.abbreviation ? ` · ${material.abbreviation}` : ""}</p>
        <p class="detail-muted">${material.category_1} / ${material.category_2} / ${material.category_3}</p>
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
      ${detailGroup("基本信息", [["中文名", material.name_cn], ["英文名", material.name_en], ["缩写", material.abbreviation || "无"], ["学习层级", material.difficulty_level]])}
      ${detailGroup("结构与组成", [["组成/结构", material.composition_or_structure], ["补充说明", material.notes]])}
      ${detailGroup("性能表现", [["力学性能", material.mechanical_properties], ["热性能", material.thermal_properties], ["电性能", material.electrical_properties]])}
      ${detailGroup("加工与应用", [["加工方法", material.processing_methods], ["典型用途", material.applications], ["典型产品", material.typical_products]])}
      ${detailGroup("优缺点", [["优点", material.advantages], ["局限性", material.limitations]])}
      ${detailGroup("相关材料", [["相关材料", material.related_materials], ["同义词/别名", material.aliases]])}
    </div>
    <h3>关联推荐</h3>
    <div class="recommendation-grid">${sameCategory.map((item) => recommendationCard(item, "同二级分类")).join("")}${sameApplication.map((item) => recommendationCard(item, "同应用场景")).join("")}${samePerformance.map((item) => recommendationCard(item, "相似性能")).join("")}</div>
  `;
  detail.querySelectorAll(".property-pill").forEach((pill) => pill.addEventListener("click", () => {
    setFilter({ tag: pill.textContent });
    scrollToExplore();
  }));
  detail.querySelectorAll(".recommend-card").forEach((button) => button.addEventListener("click", () => showDetail(button.dataset.materialId)));
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

function compareRows() {
  return [
    ["查看详情", (m) => `<button class="compare-detail-button" type="button" data-compare-detail="${m.id}">查看详情</button>`],
    ["中文名", (m) => readableValue(m.name_cn)],
    ["英文名", (m) => readableValue(m.name_en)],
    ["简称/缩写", (m) => readableValue(m.abbreviation)],
    ["一级分类", (m) => readableValue(m.category_1)],
    ["二级分类", (m) => readableValue(m.category_2)],
    ["密度", (m) => engineeringValue(m, "density")],
    ["熔点", (m) => engineeringValue(m, "melting_point")],
    ["使用温度", (m) => engineeringValue(m, "service_temperature")],
    ["抗拉强度", (m) => engineeringValue(m, "tensile_strength")],
    ["弹性模量", (m) => engineeringValue(m, "elastic_modulus")],
    ["导热率", (m) => engineeringValue(m, "thermal_conductivity")],
    ["电阻率", (m) => engineeringValue(m, "electrical_resistivity")],
    ["成本等级", (m) => engineeringValue(m, "cost_level")],
    ["关键性能", (m) => arrayText(m.key_properties)],
    ["应用场景", (m) => arrayText(m.applications)],
    ["加工方法", (m) => arrayText(m.processing_methods)],
    ["优点", (m) => arrayText(m.advantages)],
    ["局限性", (m) => arrayText(m.limitations)]
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
  content.innerHTML = `<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>字段</th>${items.map((m) => `<th><div class="compare-material-head"><span>${m.name_cn}</span><button type="button" data-remove-compare="${m.id}" aria-label="从对比中移除${m.name_cn}">移除</button></div></th>`).join("")}</tr></thead><tbody>${compareRows().map(([label, getter]) => `<tr><th>${label}</th>${items.map((m) => `<td>${getter(m)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  content.querySelectorAll("[data-remove-compare]").forEach((button) => button.addEventListener("click", () => removeFromCompare(button.dataset.removeCompare)));
  content.querySelectorAll("[data-compare-detail]").forEach((button) => button.addEventListener("click", () => { closeComparePanel(); showDetail(button.dataset.compareDetail); }));
}

function openComparePanel() {
  $("#compare-panel").classList.remove("hidden");
  renderCompareContent();
}

function closeComparePanel() {
  $("#compare-panel").classList.add("hidden");
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
  $("#clear-filters").addEventListener("click", () => setFilter({ query: "", category1: "全部", category2: "全部", tag: "全部", application: "全部", processing: "全部", costLevel: "全部", temperatureRange: "全部" }));
  $("#compare-entry").addEventListener("click", openComparePanel);
  $("#nav-compare")?.addEventListener("click", openComparePanel);
  $("#hero-compare")?.addEventListener("click", openComparePanel);
  $("#nav-favorites")?.addEventListener("click", () => $("#favorites-section").scrollIntoView({ behavior: "smooth", block: "start" }));
  $("#hero-favorites")?.addEventListener("click", () => $("#favorites-section").scrollIntoView({ behavior: "smooth", block: "start" }));
  $("#clear-favorites")?.addEventListener("click", clearFavorites);
  $("#clear-compare")?.addEventListener("click", clearCompare);
  $$('[data-close-compare]').forEach((item) => item.addEventListener("click", closeComparePanel));
  $("#results-toggle")?.addEventListener("click", toggleResultsExpanded);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeComparePanel(); });
  $("#back-to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => $("#back-to-top").classList.toggle("visible", window.scrollY > 520));
  window.addEventListener("resize", debounce(() => renderResults(), 160));
}

async function init() {
  await loadMaterialsJsonPreferred();
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

