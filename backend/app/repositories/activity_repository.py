from datetime import date, datetime, time, timedelta

from sqlalchemy import case, select
from sqlalchemy.orm import Session

from ..models import Business, Location, Region, Request, RequestStatus, RequestType, ServiceCategory, ServiceType


STATUS_DATE = case(
    (RequestStatus.description == "Programada", Request.agreed_date),
    (RequestStatus.description == "Em andamento", Request.started_date),
    (RequestStatus.description.in_(("Concluída", "Concluida")), Request.finished_date),
    (RequestStatus.description == "Cancelada", Request.canceled_date),
)


def list_activities(
    session: Session,
    start_date: date,
    end_date: date,
    statuses: list[str],
    business_units: list[int],
) -> list[dict[str, object]]:
    query = (
        select(
            Request.id,
            RequestType.name.label("request_type"),
            RequestStatus.description.label("status"),
            ServiceCategory.name.label("category"),
            ServiceType.name.label("service"),
            Business.name.label("business_unit"),
            Business.id.label("business_unit_id"),
            Region.name.label("region"),
            Location.name.label("location"),
            Request.created_date,
            Request.agreed_date,
            Request.started_date,
            Request.finished_date,
            Request.canceled_date,
            Request.description,
            Location.location_x.label("map_x"),
            Location.location_y.label("map_y"),
        )
        .join(Request.request_type)
        .join(Request.status)
        .join(Request.location)
        .join(Location.region)
        .join(Region.business)
        .join(Request.service_type)
        .join(ServiceType.category)
        .where(STATUS_DATE >= datetime.combine(start_date, time.min))
        .where(STATUS_DATE < datetime.combine(end_date + timedelta(days=1), time.min))
        .order_by(STATUS_DATE, Request.id)
    )
    if statuses:
        query = query.where(RequestStatus.description.in_(statuses))
    if business_units:
        query = query.where(Business.id.in_(business_units))

    return [dict(row) for row in session.execute(query).mappings().all()]
