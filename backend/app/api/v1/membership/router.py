from fastapi import APIRouter, Depends
from ....database import DatabaseConnection, get_connection
from .schemas import MembershipOption
from .service import get_executor_options

router = APIRouter()


@router.get("/executors", response_model=list[MembershipOption])
def list_executors(connection: DatabaseConnection = Depends(get_connection)):
    return get_executor_options(connection)
