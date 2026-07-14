#!/usr/bin/env python3
"""Local-only material and image maintenance server for MaterialBox.

The server intentionally uses Python's standard HTTP stack. Pillow is the only
runtime dependency. It binds to 127.0.0.1 and never exposes write APIs without
the manager's custom same-origin header.
"""

from __future__ import annotations

import argparse
import base64
import binascii
import json
import mimetypes
import re
import shutil
import threading
import webbrowser
from datetime import date, datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlparse

from PIL import Image, ImageOps, UnidentifiedImageError

from image_catalog import (
    IMAGE_EXTENSIONS,
    IMAGE_TYPES,
    find_existing_image,
    generate_image_outputs,
    image_src,
    metadata_entries,
    normalized_entry,
    read_json,
)
from sync_materials import MaterialSyncError, sync_materials


DEFAULT_ROOT = Path(__file__).resolve().parents[1]
HOST = "127.0.0.1"
DEFAULT_PORT = 8765
MATERIAL_ID = re.compile(r"^[a-z0-9][a-z0-9_-]*$")
MAX_REQUEST_BYTES = 32 * 1024 * 1024
MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_IMAGE_EDGE = 1600
IMAGE_QUALITY = 85
ADMIN_HEADER = "X-MaterialBox-Admin"
ADMIN_HEADER_VALUE = "1"
ENGINEERING_FIELDS = (
    "density",
    "melting_point",
    "service_temperature",
    "tensile_strength",
    "elastic_modulus",
    "thermal_conductivity",
    "electrical_resistivity",
    "hardness",
    "hardness_condition",
    "corrosion_resistance",
    "cost_level",
)
SCORE_FIELDS = ("strength", "heat", "corrosion", "processability", "cost", "lightweight")
SCALAR_FIELDS = (
    "name_cn",
    "name_en",
    "abbreviation",
    "description",
    "composition_or_structure",
    "difficulty_level",
    "notes",
    "data_status",
    "updated_at",
)
ARRAY_FIELDS = (
    "aliases",
    "key_properties",
    "mechanical_properties",
    "thermal_properties",
    "electrical_properties",
    "advantages",
    "limitations",
    "applications",
    "processing_methods",
    "typical_products",
    "related_materials",
    "tags",
)
MISSING_VALUES = {"", "暂无数据", "暂无可靠数据", "待补充", "待评估", "null", "undefined"}
CORE_BACKUP_FILES = (
    "materials.json",
    "materials.js",
    "material-images.js",
    "material-images.generated.js",
    "image-attribution.json",
    "image-attribution.js",
    "image-attribution.csv",
)


class ManagerError(RuntimeError):
    """A validation error safe to show in the local manager UI."""


def atomic_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def safe_material_id(value: str) -> str:
    material_id = str(value or "").strip()
    if not MATERIAL_ID.fullmatch(material_id):
        raise ManagerError("材料 id 不合法。")
    return material_id


def clean_text(value) -> str:
    return "" if value is None else str(value).strip()


def clean_array(value) -> list[str]:
    if isinstance(value, str):
        value = value.splitlines()
    if not isinstance(value, list):
        return []
    output: list[str] = []
    for item in value:
        text = clean_text(item)
        if text and text not in output:
            output.append(text)
    return output


def clean_source(value) -> dict:
    value = value if isinstance(value, dict) else {}
    return {
        "title": clean_text(value.get("title")),
        "publisher": clean_text(value.get("publisher")),
        "url": clean_text(value.get("url")),
        "accessed_at": clean_text(value.get("accessed_at")),
        "note": clean_text(value.get("note")),
    }


def clean_image_metadata(value) -> dict:
    value = value if isinstance(value, dict) else {}
    return {
        "caption": clean_text(value.get("caption")),
        "alt": clean_text(value.get("alt")),
        "source": clean_text(value.get("source")),
        "author": clean_text(value.get("author")),
        "license": clean_text(value.get("license")),
        "licenseUrl": clean_text(value.get("licenseUrl")),
        "sourceUrl": clean_text(value.get("sourceUrl")),
        "accessed_at": clean_text(value.get("accessed_at")),
    }


def materials_from(root: Path) -> list[dict]:
    materials = read_json(root / "materials.json", None)
    if not isinstance(materials, list):
        raise ManagerError("materials.json 格式错误，顶层必须是数组。")
    return materials


def material_index(materials: list[dict], material_id: str) -> int:
    for index, material in enumerate(materials):
        if material.get("id") == material_id:
            return index
    raise ManagerError(f"找不到材料：{material_id}")


def image_directory(root: Path, material_id: str) -> Path:
    return root / "assets" / "images" / "materials" / safe_material_id(material_id)


def load_material_images(root: Path, material: dict) -> dict[str, list[dict]]:
    material_id = safe_material_id(material.get("id"))
    directory = image_directory(root, material_id)
    metadata = metadata_entries(read_json(directory / "metadata.json", {}))
    names = {
        image_type: {
            Path(str(item.get("src") or item.get("file") or "")).name.lower(): item
            for item in metadata[image_type]
        }
        for image_type in IMAGE_TYPES
    }
    result = {image_type: [] for image_type in IMAGE_TYPES}
    for image_type in IMAGE_TYPES:
        for slot in range(1, 4):
            path = find_existing_image(directory, image_type, slot)
            if not path:
                continue
            src = image_src(root, path)
            entry = normalized_entry(
                names[image_type].get(path.name.lower(), {}),
                src=src,
                material_name=material.get("name_cn", material_id),
                image_type=image_type,
            )
            entry.update({"slot": slot, "url": f"/project/{src}"})
            result[image_type].append(entry)
    return result


def parameter_completeness(material: dict) -> tuple[int, int]:
    engineering = material.get("engineering_properties") or {}
    filled = sum(clean_text(engineering.get(key, material.get(key))) not in MISSING_VALUES for key in ENGINEERING_FIELDS)
    return filled, len(ENGINEERING_FIELDS)


def list_payload(root: Path) -> dict:
    items = []
    configured = 0
    missing_any = 0
    completed_fields = 0
    total_fields = 0
    for material in materials_from(root):
        images = load_material_images(root, material)
        presence = {image_type: bool(images[image_type]) for image_type in IMAGE_TYPES}
        if any(presence.values()):
            configured += 1
        if not all(presence.values()):
            missing_any += 1
        filled, count = parameter_completeness(material)
        completed_fields += filled
        total_fields += count
        items.append(
            {
                "id": material.get("id", ""),
                "name_cn": material.get("name_cn", ""),
                "name_en": material.get("name_en", ""),
                "abbreviation": material.get("abbreviation", ""),
                "category_1": material.get("category_1", ""),
                "category_2": material.get("category_2", ""),
                "data_status": material.get("data_status", "待补充"),
                "images": presence,
                "engineering_filled": filled,
                "engineering_total": count,
            }
        )
    total = len(items)
    return {
        "items": items,
        "stats": {
            "total": total,
            "configured_images": configured,
            "missing_images": missing_any,
            "parameter_completeness": round((completed_fields / total_fields * 100) if total_fields else 0),
        },
    }


def timestamped_backup(root: Path, material_id: str) -> Path:
    stamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    backup = root / "backups" / stamp
    suffix = 1
    while backup.exists():
        backup = root / "backups" / f"{stamp}_{suffix:02d}"
        suffix += 1
    backup.mkdir(parents=True, exist_ok=False)
    copied = []
    for relative in CORE_BACKUP_FILES:
        source = root / relative
        if source.is_file():
            target = backup / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
            copied.append(relative)
    source_images = image_directory(root, material_id)
    image_existed = source_images.is_dir()
    if image_existed:
        target_images = backup / "assets" / "images" / "materials" / material_id
        target_images.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(source_images, target_images)
    atomic_json(
        backup / "backup_manifest.json",
        {
            "created_at": datetime.now().isoformat(timespec="seconds"),
            "material_id": material_id,
            "files": copied,
            "image_directory_existed": image_existed,
        },
    )
    return backup


def decode_image_data(data_url: str) -> bytes:
    if not isinstance(data_url, str) or not data_url.startswith("data:image/") or ";base64," not in data_url:
        raise ManagerError("上传图片格式无效。")
    media, encoded = data_url.split(",", 1)
    if not any(media.startswith(f"data:image/{kind}") for kind in ("jpeg", "jpg", "png", "webp")):
        raise ManagerError("仅支持 JPG、PNG 和 WebP 图片。")
    try:
        payload = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error) as exc:
        raise ManagerError("图片 Base64 数据损坏。") from exc
    if not payload or len(payload) > MAX_IMAGE_BYTES:
        raise ManagerError("单张图片不得超过 10 MB。")
    return payload


def save_webp(payload: bytes, target: Path) -> None:
    try:
        with Image.open(BytesIO(payload)) as opened:
            image = ImageOps.exif_transpose(opened)
            image.load()
            if image.width < 32 or image.height < 32:
                raise ManagerError("图片尺寸过小，宽高至少为 32 像素。")
            image = image.convert("RGB")
            image.thumbnail((MAX_IMAGE_EDGE, MAX_IMAGE_EDGE), Image.Resampling.LANCZOS)
            target.parent.mkdir(parents=True, exist_ok=True)
            image.save(target, "WEBP", quality=IMAGE_QUALITY, method=6)
    except (UnidentifiedImageError, OSError) as exc:
        raise ManagerError("无法识别图片，请确认文件未损坏且格式受支持。") from exc


def remove_slot_files(directory: Path, image_type: str, slot: int) -> None:
    stem = f"{image_type}_{slot:02d}"
    for extension in IMAGE_EXTENSIONS:
        candidate = directory / f"{stem}{extension}"
        if candidate.is_file():
            candidate.unlink()


def apply_images(root: Path, material: dict, payload) -> None:
    material_id = safe_material_id(material.get("id"))
    directory = image_directory(root, material_id)
    directory.mkdir(parents=True, exist_ok=True)
    old_metadata = metadata_entries(read_json(directory / "metadata.json", {}))
    old_by_file = {
        image_type: {
            Path(str(item.get("src") or item.get("file") or "")).name.lower(): item
            for item in old_metadata[image_type]
        }
        for image_type in IMAGE_TYPES
    }
    instructions = payload if isinstance(payload, dict) else {}
    instruction_map: dict[tuple[str, int], dict] = {}
    for image_type in IMAGE_TYPES:
        values = instructions.get(image_type, [])
        if not isinstance(values, list):
            raise ManagerError(f"{image_type} 图片数据格式错误。")
        for item in values:
            if not isinstance(item, dict):
                continue
            slot = int(item.get("slot", 0))
            if slot not in (1, 2, 3):
                raise ManagerError("图片槽位只能是 1、2 或 3。")
            instruction_map[(image_type, slot)] = item

    for image_type in IMAGE_TYPES:
        for slot in range(1, 4):
            instruction = instruction_map.get((image_type, slot), {})
            action = instruction.get("action", "keep")
            if action == "delete":
                remove_slot_files(directory, image_type, slot)
            elif action == "replace":
                image_bytes = decode_image_data(instruction.get("dataUrl", ""))
                remove_slot_files(directory, image_type, slot)
                save_webp(image_bytes, directory / f"{image_type}_{slot:02d}.webp")
            elif action != "keep":
                raise ManagerError("未知的图片操作。")

    metadata = {"materialId": material_id, "images": {image_type: [] for image_type in IMAGE_TYPES}}
    for image_type in IMAGE_TYPES:
        for slot in range(1, 4):
            path = find_existing_image(directory, image_type, slot)
            if not path:
                continue
            instruction = instruction_map.get((image_type, slot), {})
            supplied = clean_image_metadata(instruction.get("metadata"))
            old = old_by_file[image_type].get(path.name.lower(), {})
            merged = {**old, **supplied} if instruction else old
            entry = normalized_entry(
                merged,
                src=image_src(root, path),
                material_name=material.get("name_cn", material_id),
                image_type=image_type,
                origin="manual",
            )
            if instruction.get("action") == "replace" or any(supplied.values()):
                entry["origin"] = "manual"
            metadata["images"][image_type].append(entry)
    atomic_json(directory / "metadata.json", metadata)


def update_material_record(material: dict, incoming) -> None:
    incoming = incoming if isinstance(incoming, dict) else {}
    for field in SCALAR_FIELDS:
        if field in incoming:
            material[field] = clean_text(incoming.get(field))
    for field in ARRAY_FIELDS:
        if field in incoming:
            material[field] = clean_array(incoming.get(field))

    engineering_in = incoming.get("engineering_properties")
    engineering_in = engineering_in if isinstance(engineering_in, dict) else {}
    engineering = dict(material.get("engineering_properties") or {})
    for key in ENGINEERING_FIELDS:
        value = clean_text(engineering_in.get(key, engineering.get(key, material.get(key)))) or "暂无数据"
        engineering[key] = value
        material[key] = value
    material["engineering_properties"] = engineering

    scores_in = incoming.get("performance_scores")
    scores_in = scores_in if isinstance(scores_in, dict) else {}
    scores = {}
    for key in SCORE_FIELDS:
        try:
            value = float(scores_in.get(key))
        except (TypeError, ValueError):
            continue
        if 1 <= value <= 5:
            scores[key] = int(value) if value.is_integer() else value
    material["performance_scores"] = scores if len(scores) == len(SCORE_FIELDS) else {}
    material["performance_score_source"] = "已录入评分" if material["performance_scores"] else ""

    sources = incoming.get("data_sources")
    if isinstance(sources, list):
        material["data_sources"] = [clean_source(item) for item in sources]
        material["data_sources"] = [item for item in material["data_sources"] if any(item.values())]
    status = material.get("data_status")
    if status not in {"待补充", "待核验", "已核验"}:
        material["data_status"] = "待补充"
    material["updated_at"] = clean_text(material.get("updated_at")) or date.today().isoformat()
    quality = dict(material.get("data_quality") or {})
    quality["reviewed"] = material["data_status"] == "已核验"
    quality["source_count"] = len(material.get("data_sources") or [])
    material["data_quality"] = quality


def save_material(root: Path, material_id: str, payload) -> dict:
    material_id = safe_material_id(material_id)
    if not isinstance(payload, dict):
        raise ManagerError("保存请求格式错误。")
    materials = materials_from(root)
    index = material_index(materials, material_id)
    incoming = payload.get("material")
    if isinstance(incoming, dict) and incoming.get("id") not in (None, material_id):
        raise ManagerError("材料 id 为只读字段，不能修改。")
    backup = timestamped_backup(root, material_id)
    material = materials[index]
    update_material_record(material, incoming)
    apply_images(root, material, payload.get("images"))
    atomic_json(root / "materials.json", materials)
    try:
        sync_result = sync_materials(root, create_backup=False, extended_validation=True)
        image_result = generate_image_outputs(root)
    except (MaterialSyncError, OSError, ValueError) as exc:
        raise ManagerError(f"数据已备份，但生成静态文件失败：{exc}") from exc
    return {
        "message": f"{material.get('name_cn', material_id)} 已保存并同步到主网站。",
        "backup": str(backup),
        "materials": sync_result["materials"],
        "images": image_result["images"],
    }


def latest_manager_backup(root: Path) -> Path | None:
    backups = root / "backups"
    if not backups.is_dir():
        return None
    candidates = [path for path in backups.iterdir() if (path / "backup_manifest.json").is_file()]
    return max(candidates, key=lambda path: path.name) if candidates else None


def restore_latest(root: Path, confirmation: str) -> dict:
    if confirmation != "RESTORE":
        raise ManagerError("恢复操作需要明确确认。")
    backup = latest_manager_backup(root)
    if not backup:
        raise ManagerError("没有找到由材料管理器创建的备份。")
    manifest = read_json(backup / "backup_manifest.json", {})
    material_id = safe_material_id(manifest.get("material_id"))
    for relative in manifest.get("files", []):
        relative_path = PurePosixPath(relative)
        if relative_path.is_absolute() or ".." in relative_path.parts:
            raise ManagerError("备份清单包含不安全路径。")
        source = backup / Path(*relative_path.parts)
        target = root / Path(*relative_path.parts)
        if source.is_file():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
    current_images = image_directory(root, material_id)
    backup_images = backup / "assets" / "images" / "materials" / material_id
    if current_images.exists():
        shutil.rmtree(current_images)
    if manifest.get("image_directory_existed") and backup_images.is_dir():
        current_images.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(backup_images, current_images)
    sync_materials(root, create_backup=False, extended_validation=True)
    generate_image_outputs(root)
    return {"message": f"已恢复备份：{backup.name}", "backup": str(backup)}


class MaterialManagerServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, address, root: Path):
        super().__init__(address, MaterialManagerHandler)
        self.project_root = root.resolve()
        self.write_lock = threading.Lock()


class MaterialManagerHandler(BaseHTTPRequestHandler):
    server_version = "MaterialBoxManager/1.0"

    @property
    def root(self) -> Path:
        return self.server.project_root  # type: ignore[attr-defined]

    def log_message(self, format_string: str, *args) -> None:
        print(f"[{self.log_date_time_string()}] {format_string % args}")

    def send_json(self, value, status: int = 200) -> None:
        payload = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(payload)

    def send_file(self, path: Path) -> None:
        if not path.is_file():
            self.send_error(404)
            return
        payload = path.read_bytes()
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", f"{mime}; charset=utf-8" if mime.startswith("text/") else mime)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(payload)

    def safe_project_file(self, value: str) -> Path | None:
        relative = PurePosixPath(unquote(value))
        if relative.is_absolute() or ".." in relative.parts:
            return None
        candidate = (self.root / Path(*relative.parts)).resolve()
        try:
            candidate.relative_to(self.root)
        except ValueError:
            return None
        return candidate

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        try:
            if path in {"/", "/material-manager.html"}:
                self.send_file(self.root / "tools" / "material-manager.html")
            elif path == "/api/health":
                self.send_json({"ok": True, "root": str(self.root), "host": HOST})
            elif path == "/api/materials":
                self.send_json(list_payload(self.root))
            elif path.startswith("/api/material/"):
                material_id = safe_material_id(path.removeprefix("/api/material/"))
                materials = materials_from(self.root)
                material = materials[material_index(materials, material_id)]
                self.send_json({"material": material, "images": load_material_images(self.root, material)})
            elif path.startswith("/project/"):
                target = self.safe_project_file(path.removeprefix("/project/"))
                if not target:
                    self.send_error(403)
                else:
                    self.send_file(target)
            else:
                self.send_error(404)
        except ManagerError as exc:
            self.send_json({"ok": False, "error": str(exc)}, 400)
        except Exception as exc:  # keep the local UI usable and report a clear error
            self.send_json({"ok": False, "error": f"服务器错误：{exc}"}, 500)

    def read_body_json(self):
        if self.headers.get(ADMIN_HEADER) != ADMIN_HEADER_VALUE:
            raise ManagerError("写入请求缺少本地管理器校验头。")
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as exc:
            raise ManagerError("请求长度无效。") from exc
        if length <= 0 or length > MAX_REQUEST_BYTES:
            raise ManagerError("请求为空或超过 32 MB。")
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ManagerError("请求 JSON 格式错误。") from exc

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        try:
            payload = self.read_body_json()
            with self.server.write_lock:  # type: ignore[attr-defined]
                if path.startswith("/api/material/") and path.endswith("/save"):
                    material_id = path.removeprefix("/api/material/").removesuffix("/save").strip("/")
                    result = save_material(self.root, material_id, payload)
                elif path == "/api/restore-latest":
                    result = restore_latest(self.root, clean_text(payload.get("confirmation")))
                else:
                    self.send_error(404)
                    return
            self.send_json({"ok": True, **result})
        except ManagerError as exc:
            self.send_json({"ok": False, "error": str(exc)}, 400)
        except Exception as exc:
            self.send_json({"ok": False, "error": f"保存失败：{exc}"}, 500)


def run_server(root: Path, port: int, open_browser: bool = True) -> None:
    server = MaterialManagerServer((HOST, port), root)
    url = f"http://{HOST}:{port}"
    print("MaterialBox 本地材料管理器已启动。")
    print(f"项目目录：{root.resolve()}")
    print(f"管理地址：{url}")
    print("关闭此窗口或按 Ctrl+C 可停止管理器。")
    if open_browser:
        threading.Timer(0.7, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n材料管理器已停止。")
    finally:
        server.server_close()


def main() -> None:
    parser = argparse.ArgumentParser(description="MaterialBox 本地材料维护工具")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--root", type=Path, default=DEFAULT_ROOT, help=argparse.SUPPRESS)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    if not (1024 <= args.port <= 65535):
        raise SystemExit("端口必须在 1024 到 65535 之间。")
    run_server(args.root, args.port, not args.no_browser)


if __name__ == "__main__":
    main()
