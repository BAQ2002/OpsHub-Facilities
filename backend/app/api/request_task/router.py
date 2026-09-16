from fastapi import APIRouter, Depends, HTTPException, Response
from ...database import DatabaseConnection, get_connection
from ..media_response import media_response
from .schemas import VisitPayload
from .service import get_media, save_visit

router = APIRouter()


@router.post("", status_code=201)
def create(
    data: VisitPayload, connection: DatabaseConnection = Depends(get_connection)
):
    return {"id": save_visit(connection, data)}


@router.put("/{visit_id}", status_code=204)
def update(
    visit_id: int,
    data: VisitPayload,
    connection: DatabaseConnection = Depends(get_connection),
):
    save_visit(connection, data, visit_id)
    return Response(status_code=204)


@router.get("/media/{media_id}")
def media(media_id: int, connection: DatabaseConnection = Depends(get_connection)):
    if media_id <= 0:
        raise HTTPException(400, "Identificador de mídia inválido.")

    row = get_media(connection, media_id)
    if not row:
        raise HTTPException(404, "Mídia não encontrada.")
    return media_response(row, max_age=3600)
