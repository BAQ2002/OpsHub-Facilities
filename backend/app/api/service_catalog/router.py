from fastapi import APIRouter, Depends, HTTPException
from ...database import DatabaseConnection, get_connection
from ..media_response import media_response
from ..entities import CatalogEntities, RequestFormEntities
from .service import get_catalog, get_request_form, get_request_media

router = APIRouter()


@router.get("", response_model=CatalogEntities)
def catalog(connection: DatabaseConnection = Depends(get_connection)):
    return get_catalog(connection)


@router.get("/request-form", response_model=RequestFormEntities)
def request_form(
    service_type_id: int,
    connection: DatabaseConnection = Depends(get_connection),
):
    return get_request_form(connection, service_type_id)


@router.get("/media/{media_id}")
def request_media(
    media_id: int, connection: DatabaseConnection = Depends(get_connection)
):
    if media_id <= 0:
        raise HTTPException(400, "Identificador de mídia inválido.")

    row = get_request_media(connection, media_id)
    if not row:
        raise HTTPException(404, "Mídia não encontrada.")
    return media_response(row, max_age=300)
