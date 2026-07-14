#!/usr/bin/env python3
"""End-to-end local API test for the MaterialBox manager.

The test works in a temporary project copy and never writes sample data into the
real material library.
"""

from __future__ import annotations

import base64
import json
import shutil
import tempfile
import threading
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image

from material_manager import ADMIN_HEADER, ADMIN_HEADER_VALUE, HOST, MaterialManagerServer


ROOT = Path(__file__).resolve().parents[1]


def request_json(base: str, path: str, payload=None):
    data = None
    headers = {}
    method = "GET"
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers = {"Content-Type": "application/json", ADMIN_HEADER: ADMIN_HEADER_VALUE}
        method = "POST"
    request = Request(base + path, data=data, headers=headers, method=method)
    with urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def sample_image_data_url() -> str:
    image = Image.new("RGB", (320, 220), (73, 145, 138))
    buffer = BytesIO()
    image.save(buffer, "PNG")
    return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="materialbox-manager-test-") as temporary:
        project = Path(temporary) / "material_box"
        shutil.copytree(
            ROOT,
            project,
            ignore=shutil.ignore_patterns(".git", "backups", "artifacts", "__pycache__", "图片"),
        )
        server = MaterialManagerServer((HOST, 0), project)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base = f"http://{HOST}:{server.server_address[1]}"
        try:
            health = request_json(base, "/api/health")
            assert health["ok"] is True
            catalog = request_json(base, "/api/materials")
            assert catalog["stats"]["total"] == 459
            detail = request_json(base, "/api/material/stainless_steel")
            material = detail["material"]
            original_hardness = material.get("engineering_properties", {}).get("hardness")
            engineering = dict(material.get("engineering_properties") or {})
            engineering["hardness"] = "TEST 188 HV"
            save_payload = {
                "material": {
                    "id": "stainless_steel",
                    "name_cn": material["name_cn"],
                    "engineering_properties": engineering,
                    "data_status": "待核验",
                    "updated_at": "2026-07-14",
                    "data_sources": [
                        {
                            "title": "MaterialBox manager acceptance source",
                            "publisher": "Local test",
                            "url": "https://example.invalid/materialbox-test",
                            "accessed_at": "2026-07-14",
                            "note": "Temporary-copy acceptance data",
                        }
                    ],
                },
                "images": {
                    "macro": [
                        {
                            "slot": 1,
                            "action": "replace",
                            "dataUrl": sample_image_data_url(),
                            "metadata": {
                                "caption": "不锈钢宏观图测试",
                                "alt": "不锈钢宏观外观",
                                "source": "用户自有图片",
                                "author": "MaterialBox test",
                                "license": "All rights reserved",
                                "licenseUrl": "",
                                "sourceUrl": "",
                                "accessed_at": "2026-07-14",
                            },
                        }
                    ],
                    "micro": [],
                    "structure": [],
                },
            }
            result = request_json(base, "/api/material/stainless_steel/save", save_payload)
            assert result["ok"] is True
            updated = json.loads((project / "materials.json").read_text(encoding="utf-8"))
            record = next(item for item in updated if item["id"] == "stainless_steel")
            assert record["engineering_properties"]["hardness"] == "TEST 188 HV"
            assert record["data_sources"][0]["title"] == "MaterialBox manager acceptance source"
            assert "TEST 188 HV" in (project / "materials.js").read_text(encoding="utf-8")
            image_path = project / "assets" / "images" / "materials" / "stainless_steel" / "macro_01.webp"
            assert image_path.is_file()
            with Image.open(image_path) as image:
                assert image.format == "WEBP"
                assert max(image.size) <= 1600
            metadata = json.loads(image_path.with_name("metadata.json").read_text(encoding="utf-8"))
            assert metadata["images"]["macro"][0]["author"] == "MaterialBox test"
            assert "stainless_steel/macro_01.webp" in (project / "material-images.generated.js").read_text(encoding="utf-8")
            assert "MaterialBox test" in (project / "image-attribution.json").read_text(encoding="utf-8")
            fresh = request_json(base, "/api/material/stainless_steel")
            assert fresh["material"]["engineering_properties"]["hardness"] == "TEST 188 HV"
            assert fresh["images"]["macro"][0]["src"].endswith("macro_01.webp")
            restored = request_json(base, "/api/restore-latest", {"confirmation": "RESTORE"})
            assert restored["ok"] is True
            restored_detail = request_json(base, "/api/material/stainless_steel")
            assert restored_detail["material"]["engineering_properties"]["hardness"] == original_hardness
            assert not (project / "assets" / "images" / "materials" / "stainless_steel" / "macro_01.webp").exists()
            print("Material manager API acceptance test passed.")
            print("Verified materials.json, materials.js, WebP image, metadata, generated image map, attribution output and backup restore.")
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)


if __name__ == "__main__":
    main()
