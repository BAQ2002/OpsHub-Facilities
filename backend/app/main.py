from datetime import date, datetime, time

from fastapi import Depends, FastAPI, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .database import get_session
from .models import Business, Location, Membership, Region, Request, RequestStatus, RequestType, ServiceCategory, ServiceType

app = FastAPI(title="OpsHub Facilities API")

ENTITIES = {
    "requests": Request,
    "request-statuses": RequestStatus,
    "request-types": RequestType,
    "service-types": ServiceType,
    "service-categories": ServiceCategory,
    "businesses": Business,
    "regions": Region,
    "locations": Location,
    "memberships": Membership,
}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/activities")
def list_activities(
    start_date: date,
    end_date: date,
    status: list[str] = Query(default=[]),
    business_unit: list[int] = Query(default=[]),
    session: Session = Depends(get_session),
) -> list[dict]:
    statement = (
        select(Request)
        .join(Request.status)
        .join(Request.location)
        .join(Location.region)
        .options(
            selectinload(Request.status),
            selectinload(Request.request_type),
            selectinload(Request.service_type).selectinload(ServiceType.category),
            selectinload(Request.location).selectinload(Location.region).selectinload(Region.business),
        )
        .where(Request.agreed_date >= datetime.combine(start_date, time.min))
        .where(Request.agreed_date <= datetime.combine(end_date, time.max))
    )
    if status:
        statement = statement.where(RequestStatus.description.in_(status))
    if business_unit:
        statement = statement.where(Region.id_business.in_(business_unit))

    requests = session.scalars(statement.order_by(Request.agreed_date, Request.id)).all()
    return [
        {
            "id": request.id,
            "request_type": request.request_type.name,
            "business_unit": request.location.region.business.name if request.location.region.business else None,
            "category": request.service_type.category.name if request.service_type.category else None,
            "service": request.service_type.name,
            "location": request.location.name,
            "status": request.status.description,
            "created_date": request.created_date,
            "agreed_date": request.agreed_date,
            "started_date": request.started_date,
            "finished_date": request.finished_date,
            "canceled_date": request.canceled_date,
            "description": request.description,
            "map_x": request.location.location_x,
            "map_y": request.location.location_y,
        }
        for request in requests
    ]


def _list_entities(model: type, session: Session, offset: int, limit: int) -> list[dict]:
    rows = session.scalars(select(model).offset(offset).limit(limit)).all()
    return [{column.name: getattr(row, column.name) for column in model.__table__.columns} for row in rows]


def make_list_endpoint(entity: type):
    def endpoint(
        offset: int = 0,
        limit: int = 100,
        session: Session = Depends(get_session),
    ) -> list[dict]:
        return _list_entities(entity, session, offset, min(limit, 500))

    return endpoint


for path, entity in ENTITIES.items():
    endpoint = make_list_endpoint(entity)

    app.add_api_route(f"/{path}", endpoint, methods=["GET"], name=f"list_{path.replace('-', '_')}")
