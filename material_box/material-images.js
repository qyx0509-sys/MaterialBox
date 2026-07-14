// Optional hand-authored image overrides. Normal maintenance should use the
// local material manager, which writes metadata.json and regenerates
// material-images.generated.js. Entries here have the highest priority.
(function () {
  const imageTypes = ["macro", "micro", "structure"];

  function mergeLists(primary, secondary) {
    const output = [];
    const bySource = new Map();
    [...(primary || []), ...(secondary || [])].forEach((item) => {
      if (!item || !item.src) return;
      const existing = bySource.get(item.src);
      if (existing) {
        Object.entries(item).forEach(([key, value]) => {
          if ((existing[key] === undefined || existing[key] === "") && value !== undefined) existing[key] = value;
        });
        return;
      }
      const copy = { ...item };
      bySource.set(copy.src, copy);
      output.push(copy);
    });
    return output;
  }

  window.MaterialBoxMergeImageMaps = function (primary, secondary) {
    const output = { ...(primary || {}) };
    Object.entries(secondary || {}).forEach(([materialId, groups]) => {
      const current = output[materialId] || {};
      output[materialId] = { ...current };
      imageTypes.forEach((type) => {
        output[materialId][type] = mergeLists(current[type], groups?.[type]);
      });
    });
    return output;
  };

  window.MATERIAL_IMAGE_MAP = window.MaterialBoxMergeImageMaps(window.MATERIAL_IMAGE_MAP || {}, {
    // Add exceptional hand-authored overrides here only when the manager cannot
    // represent them. Keep macro, micro and structure as separate arrays.
  });
})();
