const materials = window.MATERIALS_DATA || [];
const categorySystem = window.MATERIAL_CATEGORIES || [];
const materialImageMap = window.MATERIAL_IMAGE_MAP || {};
const legacyImageManifest = window.MATERIAL_IMAGE_MANIFEST || {};
mergeMaterialImages();

const quickTags = ["木材", "塑料", "金属", "陶瓷", "建筑", "纺织", "电子", "医用", "储能", "天然材料"];
const hotApplications = ["航空航天", "汽车轻量化", "电子封装", "医疗植入", "锂电池", "光伏能源", "建筑工程", "室内装饰", "纺织", "3D打印"];
const recommendedIds = ["wood", "bamboo", "peek", "carbon_fiber_epoxy", "aluminum_alloy", "alumina_ceramic", "graphene", "natural_stone"];

const state = {
  query: "",
  category1: "全部",
  category2: "全部",
  tag: "全部",
  application: "全部",
  processing: "全部",
  favorites: new Set(readStorageArray("materialbox:favorites")),
  compareItems: new Set(readStorageArray("materialbox:compare"))
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const hasItems = (value) => Array.isArray(value) && value.length > 0;


function normalizeImageItem(item, material, type, index) {
  return {
    src: item?.src || `assets/images/materials/${material.id}/${type}_${String(index + 1).padStart(2, "0")}.jpg`,
    alt: item?.alt || `${material.name_cn}${type === "macro" ? "\u5b8f\u89c2\u56fe" : "\u5fae\u89c2\u56fe"}`,
    source: item?.source || "",
    author: item?.author || "",
    license: item?.license || "",
    licenseUrl: item?.licenseUrl || "",
    sourceUrl: item?.sourceUrl || "",
    caption: item?.caption || item?.alt || `${material.name_cn}${type === "macro" ? "\u5b8f\u89c2\u56fe" : "\u5fae\u89c2\u56fe"}`
  };
}

function mergeMaterialImages() {
  if (!Array.isArray(window.MATERIALS_DATA)) return;
  window.MATERIALS_DATA.forEach((material) => {
    const mapped = materialImageMap[material.id];
    const legacy = legacyImageManifest[material.id];
    const current = material.images || {};
    const source = mapped || current || legacy || {};
    material.images = {
      macro: (source.macro || []).map((item, index) => normalizeImageItem(item, material, "macro", index)),
      micro: (source.micro || []).map((item, index) => normalizeImageItem(item, material, "micro", index))
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
  return Array.isArray(items) ? items.join("、") : String(items || "");
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

function filteredMaterials() {
  return materials.filter((material) => {
    const categoryOk = state.category1 === "全部" || material.category_1 === state.category1;
    const subcategoryOk = state.category2 === "全部" || material.category_2 === state.category2;
    const tagOk = state.tag === "全部" || material.tags.includes(state.tag) || material.key_properties.includes(state.tag);
    const appOk = state.application === "全部" || material.applications.includes(state.application);
    const processingOk = state.processing === "全部" || material.processing_methods.includes(state.processing);
    return categoryOk && subcategoryOk && tagOk && appOk && processingOk && matchesQuery(material, state.query);
  });
}

function setFilter(partial) {
  Object.assign(state, partial);
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
  if (!useDefault) return { macro, micro };
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

function renderFilters() {
  populateSelect($("#category-filter"), uniqueValues(materials, (item) => [item.category_1]), state.category1);
  updateSubcategoryOptions();
  populateSelect($("#tag-filter"), uniqueValues(materials, (item) => [...item.tags, ...item.key_properties]), state.tag);
  populateSelect($("#application-filter"), uniqueValues(materials, (item) => item.applications), state.application);
  populateSelect($("#processing-filter"), uniqueValues(materials, (item) => item.processing_methods), state.processing);

  $("#category-filter").addEventListener("change", (event) => setFilter({ category1: event.target.value, category2: "全部" }));
  $("#subcategory-filter").addEventListener("change", (event) => setFilter({ category2: event.target.value }));
  $("#tag-filter").addEventListener("change", (event) => setFilter({ tag: event.target.value }));
  $("#application-filter").addEventListener("change", (event) => setFilter({ application: event.target.value }));
  $("#processing-filter").addEventListener("change", (event) => setFilter({ processing: event.target.value }));
}

function updateSubcategoryOptions() {
  const scoped = state.category1 === "全部" ? materials : materials.filter((item) => item.category_1 === state.category1);
  populateSelect($("#subcategory-filter"), uniqueValues(scoped, (item) => [item.category_2]), state.category2);
}

function syncControls() {
  $("#search-input").value = state.query;
  $("#category-filter").value = state.category1;
  updateSubcategoryOptions();
  $("#tag-filter").value = state.tag;
  $("#application-filter").value = state.application;
  $("#processing-filter").value = state.processing;
}

function renderActiveFilters() {
  const filters = [["关键词", state.query], ["一级分类", state.category1], ["二级分类", state.category2], ["性能", state.tag], ["应用", state.application], ["加工", state.processing]].filter(([, value]) => value && value !== "全部");
  $("#active-filters").innerHTML = filters.map(([label, value]) => `<button class="filter-chip" type="button" data-label="${label}">${label}: ${value} ×</button>`).join("");
  $("#active-filters").querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const resetMap = { 关键词: { query: "" }, 一级分类: { category1: "全部", category2: "全部" }, 二级分类: { category2: "全部" }, 性能: { tag: "全部" }, 应用: { application: "全部" }, 加工: { processing: "全部" } };
      setFilter(resetMap[chip.dataset.label]);
    });
  });
}

function materialCard(material) {
  const isFavorite = state.favorites.has(material.id);
  const isCompared = state.compareItems.has(material.id);
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
    <div class="tag-row">${material.key_properties.slice(0, 3).map((tag) => `<button class="mini-chip" type="button">${tag}</button>`).join("")}</div>
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
  const container = $("#material-list");
  container.innerHTML = "";
  list.forEach((material) => container.appendChild(materialCard(material)));
  $("#empty-state").classList.toggle("hidden", list.length > 0);
  $("#empty-state").innerHTML = `<h3>未找到该材料，可能尚未收录</h3><p>你可以尝试：木材、竹材、天然材料、建筑材料、塑料、玻璃钢、航空材料。</p><p>后续可按 materials.js 的字段结构添加到材料库。</p>`;
  $("#result-summary").textContent = `当前显示 ${list.length} / ${materials.length} 个材料`;
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
  return `<section class="material-images"><div class="material-images-head"><h3>\u6750\u6599\u56fe\u50cf</h3><div class="image-tabs" role="tablist" aria-label="\u6750\u6599\u56fe\u50cf\u7c7b\u578b"><button class="image-tab active" type="button" data-image-tab="macro">\u5b8f\u89c2\u56fe</button><button class="image-tab" type="button" data-image-tab="micro">\u5fae\u89c2\u56fe</button></div></div><div class="image-tab-content">${imagePanel("macro", images.macro, "\u6682\u65e0\u5b8f\u89c2\u56fe")}${imagePanel("micro", images.micro, "\u6682\u65e0\u5fae\u89c2\u56fe")}</div><p class="image-rule">\u6279\u91cf\u653e\u56fe\u89c4\u5219\uff1aassets/images/materials/${material.id}/macro_01.jpg\u3001micro_01.jpg\uff1b\u5143\u6570\u636e\u89c1 metadata.json\u3002</p></section>`;
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
  if (state.compareItems.size >= 4) {
    toast("最多同时对比 4 个材料，请先移除一个。", "warning");
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
    ["材料名称", (m) => m.name_cn],
    ["英文名/缩写", (m) => `${m.name_en}${m.abbreviation ? ` / ${m.abbreviation}` : ""}`],
    ["一级分类", (m) => m.category_1],
    ["二级分类", (m) => m.category_2],
    ["关键性能", (m) => arrayText(m.key_properties)],
    ["力学性能", (m) => arrayText(m.mechanical_properties)],
    ["热性能", (m) => arrayText(m.thermal_properties)],
    ["电性能", (m) => arrayText(m.electrical_properties)],
    ["优点", (m) => arrayText(m.advantages)],
    ["局限性", (m) => arrayText(m.limitations)],
    ["加工方法", (m) => arrayText(m.processing_methods)],
    ["典型用途", (m) => arrayText(m.applications)],
    ["典型产品", (m) => arrayText(m.typical_products)]
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

function bindGlobalEvents() {
  const debouncedSearch = debounce((value) => setFilter({ query: value }), 130);
  $("#search-input").addEventListener("input", (event) => debouncedSearch(event.target.value));
  $("#search-input").addEventListener("focus", renderSearchSuggestions);
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-shell") && !event.target.closest("#search-suggestions")) $("#search-suggestions").classList.add("hidden");
  });
  $("#search-button").addEventListener("click", () => { setFilter({ query: $("#search-input").value }); scrollToExplore(); });
  $("#clear-filters").addEventListener("click", () => setFilter({ query: "", category1: "全部", category2: "全部", tag: "全部", application: "全部", processing: "全部" }));
  $("#compare-entry").addEventListener("click", openComparePanel);
  $("#nav-compare")?.addEventListener("click", openComparePanel);
  $("#hero-compare")?.addEventListener("click", openComparePanel);
  $("#nav-favorites")?.addEventListener("click", () => $("#favorites-section").scrollIntoView({ behavior: "smooth", block: "start" }));
  $("#hero-favorites")?.addEventListener("click", () => $("#favorites-section").scrollIntoView({ behavior: "smooth", block: "start" }));
  $("#clear-favorites")?.addEventListener("click", clearFavorites);
  $("#clear-compare")?.addEventListener("click", clearCompare);
  $$('[data-close-compare]').forEach((item) => item.addEventListener("click", closeComparePanel));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeComparePanel(); });
  $("#back-to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => $("#back-to-top").classList.toggle("visible", window.scrollY > 520));
}

function init() {
  renderQuickTags();
  renderStats();
  renderCategoryCards();
  renderApplications();
  renderFilters();
  renderActiveFilters();
  renderAllMaterialAreas();
  renderCompareContent();
  bindGlobalEvents();
}

window.addEventListener("DOMContentLoaded", init);
