# MaterialBox 图片放置规则

MaterialBox 是静态前端网页，浏览器不能自动扫描文件夹，所以图片使用固定路径规则：

- 宏观照片：`assets/materials/材料id/macro.jpg`
- 微观照片：`assets/materials/材料id/micro.jpg`
- 结构示意图：`assets/materials/材料id/structure.jpg`

例如木材：

- `assets/materials/wood/macro.jpg`
- `assets/materials/wood/micro.jpg`
- `assets/materials/wood/structure.jpg`

优先级：

1. `materials.js` 中材料对象的 `images` 字段。
2. `assets/materials/image-manifest.js` 中的 `MATERIAL_IMAGE_MANIFEST`。
3. 程序自动按固定路径生成默认图片路径。

如果图片文件还没有放入，对应图片卡会显示“暂无宏观照片 / 暂无微观照片”的占位状态，不会显示破图。
