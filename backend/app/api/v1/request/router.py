import os
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ....database import get_session
from .schemas import Activity, CreateRequest, RequestItem
from .service import create_request, get_activities, get_my_requests

router = APIRouter()


@router.get("/mine", response_model=list[RequestItem])
def mine(session: Session = Depends(get_session)):
    return get_my_requests(
        session,
        (
            int(os.environ["CURRENT_MEMBER_ID"])
            if os.getenv("CURRENT_MEMBER_ID")
            else None
        ),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create(data: CreateRequest, session: Session = Depends(get_session)):
    try:
        return {"id": create_request(session, data)}
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


@router.get("/activities", response_model=list[Activity])
def activities(
    start_date: date,
    end_date: date,
    status: list[str] = Query(default=[]),
    business_unit: list[int] = Query(default=[]),
    session: Session = Depends(get_session),
):
    return get_activities(session, start_date, end_date, status, business_unit)


@router.get("/home-metrics")
def home_metrics(
    start_date: date, end_date: date, session: Session = Depends(get_session)
):
    from .service import get_home_metrics

    return get_home_metrics(session, start_date, end_date)


@router.get("/activity-tracking")
def activity_tracking(
    start_date: date,
    end_date: date,
    business_id: int | None = None,
    service_category_id: int | None = None,
    session: Session = Depends(get_session),
):
    from .service import get_tracking

    return get_tracking(session, start_date, end_date, business_id, service_category_id)


@router.get("/board")
def board(start_date: date, end_date: date, session: Session = Depends(get_session)):
    from .service import get_board

    return get_board(session, start_date, end_date)
