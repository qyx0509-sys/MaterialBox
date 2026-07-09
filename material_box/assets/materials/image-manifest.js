// Optional image manifest for MaterialBox.
// Main rule: put images under assets/materials/{material_id}/macro.jpg and micro.jpg.
// material.images in materials.js has priority; this manifest is a lightweight override/fallback.
window.MATERIAL_IMAGE_MANIFEST = {
  wood: {
    macro: [{ src: "assets/materials/wood/macro.jpg", alt: "木材宏观纹理照片", caption: "木材的宏观纹理与年轮结构" }],
    micro: [{ src: "assets/materials/wood/micro.jpg", alt: "木材微观结构照片", caption: "木材细胞壁、导管和纤维组织的显微结构" }]
  },
  bamboo: {
    macro: [{ src: "assets/materials/bamboo/macro.jpg", alt: "竹材宏观照片", caption: "竹材的表面纹理、竹节和板材形态" }],
    micro: [{ src: "assets/materials/bamboo/micro.jpg", alt: "竹材微观结构照片", caption: "竹材维管束、纤维束和薄壁组织结构" }]
  },
  paper: {
    macro: [{ src: "assets/materials/paper/macro.jpg", alt: "纸张宏观照片", caption: "纸张表面、折痕和纤维纹理" }],
    micro: [{ src: "assets/materials/paper/micro.jpg", alt: "纸张微观结构照片", caption: "纸纤维交织网络与孔隙结构" }]
  },
  steel: {
    macro: [{ src: "assets/materials/steel/macro.jpg", alt: "钢材宏观照片", caption: "钢材板材、型材或断口宏观形态" }],
    micro: [{ src: "assets/materials/steel/micro.jpg", alt: "钢材显微组织照片", caption: "钢的铁素体、珠光体或马氏体显微组织" }]
  },
  aluminum_alloy: {
    macro: [{ src: "assets/materials/aluminum_alloy/macro.jpg", alt: "铝合金宏观照片", caption: "铝合金型材、板材和加工表面" }],
    micro: [{ src: "assets/materials/aluminum_alloy/micro.jpg", alt: "铝合金显微组织照片", caption: "铝合金晶粒和第二相颗粒显微组织" }]
  },
  titanium_alloy: {
    macro: [{ src: "assets/materials/titanium_alloy/macro.jpg", alt: "钛合金宏观照片", caption: "钛合金锻件、打印件或植入件外观" }],
    micro: [{ src: "assets/materials/titanium_alloy/micro.jpg", alt: "钛合金显微组织照片", caption: "钛合金 α/β 相组织与晶粒结构" }]
  },
  peek: {
    macro: [{ src: "assets/materials/peek/macro.jpg", alt: "PEEK宏观照片", caption: "PEEK棒材、板材或注塑件外观" }],
    micro: [{ src: "assets/materials/peek/micro.jpg", alt: "PEEK微观结构照片", caption: "PEEK半结晶结构和断口形貌" }]
  },
  carbon_fiber_epoxy: {
    macro: [{ src: "assets/materials/carbon_fiber_epoxy/macro.jpg", alt: "碳纤维环氧复合材料宏观照片", caption: "碳纤维/环氧复合材料编织纹理和层合板外观" }],
    micro: [{ src: "assets/materials/carbon_fiber_epoxy/micro.jpg", alt: "碳纤维环氧复合材料微观结构照片", caption: "碳纤维束、树脂基体和界面结构" }]
  },
  alumina_ceramic: {
    macro: [{ src: "assets/materials/alumina_ceramic/macro.jpg", alt: "氧化铝陶瓷宏观照片", caption: "氧化铝陶瓷基板、结构件或抛光表面" }],
    micro: [{ src: "assets/materials/alumina_ceramic/micro.jpg", alt: "氧化铝陶瓷显微结构照片", caption: "氧化铝陶瓷晶粒、晶界和孔隙结构" }]
  },
  graphene: {
    macro: [{ src: "assets/materials/graphene/macro.jpg", alt: "石墨烯宏观照片", caption: "石墨烯粉体、薄膜或分散液外观" }],
    micro: [{ src: "assets/materials/graphene/micro.jpg", alt: "石墨烯微观结构照片", caption: "石墨烯片层、褶皱和堆叠结构" }]
  }
};
