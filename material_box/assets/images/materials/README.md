# MaterialBox material images

Batch image convention used by `material-images.js` and `tools/fetch_material_images.py`:

- Macro images: `assets/images/materials/{material_id}/macro_01.jpg`, `macro_02.jpg`, ...
- Micro images: `assets/images/materials/{material_id}/micro_01.jpg`, `micro_02.jpg`, ...
- Per-material metadata: `assets/images/materials/{material_id}/metadata.json`

The fetch script downloads candidate macro images from Wikimedia Commons and writes metadata for manual review. Images are not assumed correct until reviewed.

The detail page handles missing files gracefully: if a listed image does not exist, the card shows a placeholder instead of a broken image.
