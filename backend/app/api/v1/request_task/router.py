from fastapi import APIRouter, Depends, HTTPException, Response
from ....database import DatabaseConnection, get_connection
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
    row = get_media(connection, media_id)
    if not row:
        raise HTTPException(404, "Mídia não encontrada.")
    return Response(
        content=row["content"],
        media_type=row["mime_type"],
        headers={"Content-Disposition": f'inline; filename="{row["file_name"]}"'},
    )
