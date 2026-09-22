from fastapi import APIRouter, Depends
from ...database import DatabaseConnection, get_connection
from ..entities import MemberSummary
from .service import get_executor_options

router = APIRouter()


@router.get("/executors", response_model=list[MemberSummary])
def list_executors(connection: DatabaseConnection = Depends(get_connection)):
    return get_executor_options(connection)
