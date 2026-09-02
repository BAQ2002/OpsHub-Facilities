from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ....database import get_session
from .schemas import MembershipOption
from .service import get_executor_options

router = APIRouter()


@router.get("/executors", response_model=list[MembershipOption])
def list_executors(session: Session = Depends(get_session)):
    return get_executor_options(session)
