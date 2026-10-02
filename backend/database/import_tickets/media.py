"""Media URLs are provenance; Oracle CONTENT always receives actual file bytes."""
import hashlib
import json
import mimetypes
import re
import time
import urllib.request
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit

CACHE = Path(__file__).with_name("output") / "media"


def asset_state(row):
    row = {k.lower(): v for k, v in row.items()}
    return {k: row[k] for k in ("id_service_field_type", "file_name", "mime_type", "file_size")} | {
        "sha256": hashlib.sha256(row["content"]).hexdigest()}


def urls(value):
    found = re.findall(r'https?://[^\s<>"\[\]]+', str(value), re.I)
    return list(dict.fromkeys(url.rstrip(",;") for url in found
                             if not urlsplit(url).path.endswith("not-found-deskbee.jpg")))


def cache_key(url):
    return hashlib.sha256(url.encode("utf-8")).hexdigest()


def read_asset(url, directory=CACHE):
    directory = Path(directory)
    key = cache_key(url)
    try:
        metadata = json.loads((directory / (key + ".json")).read_text(encoding="utf-8"))
        content = (directory / (key + ".bin")).read_bytes()
    except (OSError, ValueError) as exc:
        raise ValueError(f"Arquivo de mídia indisponível no cache: {key}") from exc
    if not content or hashlib.sha256(content).hexdigest() != metadata["sha256"]:
        raise ValueError(f"Arquivo de mídia vazio ou alterado: {key}")
    return {"CONTENT": content, "FILE_NAME": metadata["file_name"],
            "MIME_TYPE": metadata["mime_type"], "FILE_SIZE": len(content)}


def media_entries(plan):
    for row in plan["rows"]:
        if row.get("duplicate_of") or not row.get("request"):
            continue
        for field in row["request"]["fields"]:
            if field.get("definition", {}).get("type") == "MEDIA" and field.get("import_media_content", True):
                for url in field["value"]:
                    yield row, field, url


def prepare_media(plan, download=False, directory=CACHE):
    """Report missing assets; fetching is an explicit CLI option before DB work."""
    directory = Path(directory)
    entries, resolved = [], {}
    for row, field, url in media_entries(plan):
        key = cache_key(url)
        if key not in resolved:
            try:
                try:
                    read_asset(url, directory)
                except ValueError:
                    if not download:
                        raise
                    parsed = urlsplit(url)
                    expires = parse_qs(parsed.query).get("Expires", [None])[0]
                    if expires and expires.isdigit() and int(expires) <= time.time():
                        raise ValueError("URL assinada expirada; fornecer URL renovada ou arquivo local")
                    with urllib.request.urlopen(url, timeout=20) as response:
                        content = response.read(25 * 1024 * 1024 + 1)
                        mime = response.headers.get_content_type()
                    if not content or len(content) > 25 * 1024 * 1024:
                        raise ValueError("Mídia vazia ou acima do limite de 25 MiB")
                    name = Path(unquote(parsed.path)).name[:255] or key
                    mime = mime or mimetypes.guess_type(name)[0] or "application/octet-stream"
                    if mime in ("text/html", "application/xml", "text/xml"):
                        raise ValueError("Resposta HTML/XML não será importada como anexo")
                    directory.mkdir(parents=True, exist_ok=True)
                    (directory / (key + ".bin")).write_bytes(content)
                    (directory / (key + ".json")).write_text(json.dumps({
                        "file_name": name, "mime_type": mime,
                        "sha256": hashlib.sha256(content).hexdigest()}, ensure_ascii=False), encoding="utf-8")
                resolved[key] = None
            except Exception as exc:
                # Never expose signed URLs or their credentials in console messages.
                resolved[key] = str(exc) if isinstance(exc, ValueError) else type(exc).__name__
        entries.append({"request_id": row["request"].get("import_id"), "field": field["name"],
                        "cache_key": key, "url": url, "error": resolved[key]})
    return {"references": len(entries), "unique_urls": len(resolved),
            "missing_references": sum(e["error"] is not None for e in entries), "entries": entries}


def require_media(plan):
    report = prepare_media(plan)
    if report["missing_references"]:
        raise ValueError(f"Carga bloqueada: {report['missing_references']} referências de mídia sem arquivo; consulte media_manifest.json")
