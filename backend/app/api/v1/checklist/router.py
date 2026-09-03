from fastapi import APIRouter, Depends, Response, status
from ....database import DatabaseConnection, get_connection
from .schemas import ChecklistDefinition, ChecklistSubmission
from .service import add_to_visit, delete_from_visit, get_active_definitions

router = APIRouter()


@router.get("", response_model=list[ChecklistDefinition])
def definitions(connection: DatabaseConnection = Depends(get_connection)):
    return get_active_definitions(connection)


@router.post("/visits/{visit_id}", status_code=status.HTTP_204_NO_CONTENT)
def add(
    visit_id: int,
    data: ChecklistSubmission,
    connection: DatabaseConnection = Depends(get_connection),
):
    add_to_visit(connection, visit_id, data)
    return Response(status_code=204)


@router.delete("/{checklist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(checklist_id: int, connection: DatabaseConnection = Depends(get_connection)):
    delete_from_visit(connection, checklist_id)
    return Response(status_code=204)
