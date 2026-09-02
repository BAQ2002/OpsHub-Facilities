from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ....database import get_session
from .schemas import CatalogCategory, RequestFormData
from .service import get_catalog, get_request_form

router = APIRouter()


@router.get("", response_model=list[CatalogCategory])
def catalog(session: Session = Depends(get_session)):
    return get_catalog(session)


@router.get("/request-form", response_model=RequestFormData)
def request_form(
    service_category: str | None = None,
    service_type: str | None = None,
    service_type_id: int | None = None,
    session: Session = Depends(get_session),
):
    return get_request_form(session, service_category, service_type, service_type_id)


@router.get("/media/{media_id}")
def request_media(media_id: int, session: Session = Depends(get_session)):
    from fastapi import HTTPException, Response
    from .service import get_request_media

    row = get_request_media(session, media_id)
    if not row:
        raise HTTPException(404, "Mídia não encontrada.")
    return Response(
        content=row["content"],
        media_type=row["mime_type"],
        headers={"Content-Disposition": f'inline; filename="{row["file_name"]}"'},
    )
