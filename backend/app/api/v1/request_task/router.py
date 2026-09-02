from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from ....database import get_session
from .schemas import VisitPayload
from .service import get_media, save_visit

router = APIRouter()


@router.post("", status_code=201)
def create(data: VisitPayload, session: Session = Depends(get_session)):
    return {"id": save_visit(session, data)}


@router.put("/{visit_id}", status_code=204)
def update(visit_id: int, data: VisitPayload, session: Session = Depends(get_session)):
    save_visit(session, data, visit_id)
    return Response(status_code=204)


@router.get("/media/{media_id}")
def media(media_id: int, session: Session = Depends(get_session)):
    row = get_media(session, media_id)
    if not row:
        raise HTTPException(404, "Mídia não encontrada.")
    return Response(
        content=row["content"],
        media_type=row["mime_type"],
        headers={"Content-Disposition": f'inline; filename="{row["file_name"]}"'},
    )
