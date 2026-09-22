from collections.abc import Mapping
from typing import Any
from urllib.parse import quote

from fastapi import Response


def media_response(row: Mapping[str, Any], max_age: int) -> Response:
    """Monta uma resposta binária segura para uma mídia persistida."""
    file_name = str(row["file_name"] or "media")
    encoded_file_name = quote(file_name, safe="")

    return Response(
        content=row["content"],
        media_type=row["mime_type"] or "application/octet-stream",
        headers={
            "Cache-Control": f"private, max-age={max_age}",
            "Content-Disposition": (
                f"inline; filename=\"media\"; filename*=UTF-8''{encoded_file_name}"
            ),
            "Content-Security-Policy": "default-src 'none'; sandbox",
            "X-Content-Type-Options": "nosniff",
        },
    )
