import os
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from ....database import DatabaseConnection, get_connection
from .schemas import Activity, CreateRequest, RequestItem
from .service import create_request, get_activities, get_my_requests

router = APIRouter()


@router.get("/mine", response_model=list[RequestItem])
def mine(connection: DatabaseConnection = Depends(get_connection)):
    return get_my_requests(
        connection,
        (
            int(os.environ["CURRENT_MEMBER_ID"])
            if os.getenv("CURRENT_MEMBER_ID")
            else None
        ),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create(
    data: CreateRequest, connection: DatabaseConnection = Depends(get_connection)
):
    try:
        return {"id": create_request(connection, data)}
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


@router.get("/activities", response_model=list[Activity])
def activities(
    start_date: date,
    end_date: date,
    status: list[str] = Query(default=[]),
    business_unit: list[int] = Query(default=[]),
    connection: DatabaseConnection = Depends(get_connection),
):
    return get_activities(connection, start_date, end_date, status, business_unit)


@router.get("/home-metrics")
def home_metrics(
    start_date: date,
    end_date: date,
    connection: DatabaseConnection = Depends(get_connection),
):
    from .service import get_home_metrics

    return get_home_metrics(connection, start_date, end_date)


@router.get("/activity-tracking")
def activity_tracking(
    start_date: date,
    end_date: date,
    business_id: int | None = None,
    service_category_id: int | None = None,
    connection: DatabaseConnection = Depends(get_connection),
):
    from .service import get_tracking

    return get_tracking(
        connection, start_date, end_date, business_id, service_category_id
    )


@router.get("/board")
def board(
    start_date: date,
    end_date: date,
    connection: DatabaseConnection = Depends(get_connection),
):
    from .service import get_board

    return get_board(connection, start_date, end_date)
