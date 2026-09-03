from fastapi import APIRouter, Depends
from ....database import DatabaseConnection, get_connection
from .schemas import CatalogCategory, RequestFormData
from .service import get_catalog, get_request_form

router = APIRouter()


@router.get("", response_model=list[CatalogCategory])
def catalog(connection: DatabaseConnection = Depends(get_connection)):
    return get_catalog(connection)


@router.get("/request-form", response_model=RequestFormData)
def request_form(
    service_category: str | None = None,
    service_type: str | None = None,
    service_type_id: int | None = None,
    connection: DatabaseConnection = Depends(get_connection),
):
    return get_request_form(connection, service_category, service_type, service_type_id)


@router.get("/media/{media_id}")
def request_media(
    media_id: int, connection: DatabaseConnection = Depends(get_connection)
):
    from fastapi import HTTPException, Response
    from .service import get_request_media

    row = get_request_media(connection, media_id)
    if not row:
        raise HTTPException(404, "Mídia não encontrada.")
    return Response(
        content=row["content"],
        media_type=row["mime_type"],
        headers={"Content-Disposition": f'inline; filename="{row["file_name"]}"'},
    )
