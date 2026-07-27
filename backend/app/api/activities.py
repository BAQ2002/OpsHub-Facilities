from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_session
from ..schemas import ActivityRead
from ..services.activity_service import get_activities

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("", response_model=list[ActivityRead])
def read_activities(
    start_date: date,
    end_date: date,
    status: Annotated[list[str], Query()] = [],
    business_unit: Annotated[list[int], Query()] = [],
    session: Session = Depends(get_session),
) -> list[ActivityRead]:
    try:
        return get_activities(session, start_date, end_date, status, business_unit)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
