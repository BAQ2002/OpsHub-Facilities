from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from ....database import get_session
from .schemas import ChecklistDefinition, ChecklistSubmission
from .service import add_to_visit, delete_from_visit, get_active_definitions

router = APIRouter()


@router.get("", response_model=list[ChecklistDefinition])
def definitions(session: Session = Depends(get_session)):
    return get_active_definitions(session)


@router.post("/visits/{visit_id}", status_code=status.HTTP_204_NO_CONTENT)
def add(
    visit_id: int, data: ChecklistSubmission, session: Session = Depends(get_session)
):
    add_to_visit(session, visit_id, data)
    return Response(status_code=204)


@router.delete("/{checklist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(checklist_id: int, session: Session = Depends(get_session)):
    delete_from_visit(session, checklist_id)
    return Response(status_code=204)
