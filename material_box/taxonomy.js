(function () {
  "use strict";

  const ENTITY_LABELS = {
    family: "材料家族",
    subfamily: "材料子体系",
    material: "具体材料",
    grade: "工程牌号",
    variant: "改性材料",
    state: "材料状态",
    form: "产品形态"
  };
  const QUALITY_LABELS = { reviewed: "已审核", partial: "部分数据", draft: "待完善", pending: "待审核" };
  const ARRAY_FIELDS = [
    "taxonomy_path", "classification_basis", "standard_designations", "material_states", "heat_treatments",
    "product_forms", "key_properties", "mechanical_properties", "thermal_properties", "electrical_properties",
    "optical_properties", "magnetic_properties", "advantages", "limitations", "applications", "processing_methods",
    "typical_products", "related_materials", "related_material_ids", "tags", "aliases", "application_collections",
    "property_records", "data_sources"
  ];

  function unique(values) {
    return [...new Set((values || []).filter(Boolean))];
  }

  function normalizeMaterial(material) {
    const item = material && typeof material === "object" ? material : {};
    ARRAY_FIELDS.forEach((field) => { item[field] = Array.isArray(item[field]) ? item[field] : []; });
    if (!item.taxonomy_path.length) item.taxonomy_path = unique([item.category_1, item.category_2, item.category_3, item.name_cn]);
    item.category_1 = item.taxonomy_path[0] || item.category_1 || "未分类";
    item.category_2 = item.taxonomy_path[1] || item.category_2 || "未分类";
    item.category_3 = item.taxonomy_path[2] || item.category_3 || item.name_cn || "未分类";
    item.entity_type = ENTITY_LABELS[item.entity_type] ? item.entity_type : "material";
    item.parent_id = item.parent_id || "";
    item.canonical_material_id = item.canonical_material_id || item.id;
    item.data_quality = item.data_quality && typeof item.data_quality === "object" ? item.data_quality : { status: "pending", reviewed: false, source_count: 0 };
    item.images = item.images && typeof item.images === "object" ? item.images : {};
    ["macro", "micro", "structure"].forEach((type) => { item.images[type] = Array.isArray(item.images[type]) ? item.images[type] : []; });
    return item;
  }

  function treeNode(name, path) {
    return { name, path, children: new Map(), directIds: [], materialIds: [], recordId: "" };
  }

  function buildTree(materials) {
    const root = treeNode("全部材料", []);
    materials.forEach((material) => {
      let current = root;
      current.materialIds.push(material.id);
      material.taxonomy_path.forEach((name, index) => {
        if (!current.children.has(name)) current.children.set(name, treeNode(name, material.taxonomy_path.slice(0, index + 1)));
        current = current.children.get(name);
        current.materialIds.push(material.id);
      });
      current.directIds.push(material.id);
      if (!current.recordId || material.name_cn === current.name) current.recordId = material.id;
    });
    return root;
  }

  function createModel(rawMaterials, rawCollections) {
    const materials = (Array.isArray(rawMaterials) ? rawMaterials : []).map(normalizeMaterial);
    const collections = Array.isArray(rawCollections) ? rawCollections : [];
    const byId = new Map(materials.map((material) => [material.id, material]));
    const childrenByParent = new Map();
    const collectionById = new Map(collections.map((collection) => [collection.id, collection]));
    materials.forEach((material) => {
      if (material.parent_id && byId.has(material.parent_id)) {
        if (!childrenByParent.has(material.parent_id)) childrenByParent.set(material.parent_id, []);
        childrenByParent.get(material.parent_id).push(material);
      }
    });
    function childrenOf(id) { return childrenByParent.get(id) || []; }
    function descendantsOf(id) {
      const output = [];
      const queue = [...childrenOf(id)];
      const seen = new Set();
      while (queue.length) {
        const item = queue.shift();
        if (!item || seen.has(item.id)) continue;
        seen.add(item.id);
        output.push(item);
        queue.push(...childrenOf(item.id));
      }
      return output;
    }
    function ancestorsOf(id) {
      const output = [];
      const seen = new Set();
      let current = byId.get(id);
      while (current?.parent_id && byId.has(current.parent_id) && !seen.has(current.parent_id)) {
        seen.add(current.parent_id);
        current = byId.get(current.parent_id);
        output.unshift(current);
      }
      return output;
    }
    function collectionNames(material) {
      return (material.application_collections || []).map((id) => collectionById.get(id)?.name_cn).filter(Boolean);
    }
    return { materials, collections, byId, collectionById, childrenByParent, tree: buildTree(materials), childrenOf, descendantsOf, ancestorsOf, collectionNames };
  }

  function resolveId(id) {
    const aliases = window.MATERIAL_ID_ALIASES || {};
    let current = id;
    const seen = new Set();
    while (aliases[current] && !seen.has(current)) {
      seen.add(current);
      current = aliases[current];
    }
    return current;
  }

  function migrateStoredIds(key, validIds) {
    try {
      const source = JSON.parse(localStorage.getItem(key) || "[]");
      const migrated = unique((Array.isArray(source) ? source : []).map(resolveId).filter((id) => validIds.has(id)));
      localStorage.setItem(key, JSON.stringify(migrated));
      return migrated;
    } catch {
      localStorage.setItem(key, "[]");
      return [];
    }
  }

  window.MaterialBoxTaxonomy = {
    ENTITY_LABELS,
    QUALITY_LABELS,
    normalizeMaterial,
    createModel,
    resolveId,
    migrateStoredIds,
    pathText(material, separator = " / ") { return (material?.taxonomy_path || []).join(separator) || "未分类"; },
    entityLabel(value) { const type = typeof value === "string" ? value : value?.entity_type; return ENTITY_LABELS[type] || "具体材料"; },
    qualityLabel(material) { return material?.data_quality?.reviewed ? QUALITY_LABELS.reviewed : (QUALITY_LABELS[material?.data_quality?.status] || QUALITY_LABELS.pending); }
  };
})();

