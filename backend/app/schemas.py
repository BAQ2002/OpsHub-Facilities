from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OrmSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class BusinessRead(OrmSchema):
    id: int
    name: str | None


class RegionRead(OrmSchema):
    id: int
    business_id: int | None
    name: str | None


class LocationRead(OrmSchema):
    id: int
    region_id: int | None
    name: str | None
    location_x: float | None
    location_y: float | None


class MembershipRead(OrmSchema):
    id: int
    name: str | None
    email: str | None


class RequestStatusRead(OrmSchema):
    id: int
    description: str | None


class RequestTypeRead(OrmSchema):
    id: int
    name: str | None


class ServiceCategoryRead(OrmSchema):
    id: int
    name: str | None


class ServiceTypeRead(OrmSchema):
    id: int
    category_id: int | None
    name: str | None
    description: str | None


class RequestRead(OrmSchema):
    id: int
    request_type_id: int
    requester_id: int
    responder_id: int | None
    location_id: int
    service_type_id: int
    status_id: int
    created_date: datetime | None
    agreed_date: datetime | None
    started_date: datetime | None
    finished_date: datetime | None
    canceled_date: datetime | None
    description: str | None


class ActivityRead(BaseModel):
    id: int
    request_type: str | None
    status: str
    category: str | None
    service: str | None
    business_unit: str | None
    business_unit_id: int | None
    region: str | None
    location: str | None
    created_date: datetime | None
    agreed_date: datetime | None
    started_date: datetime | None
    finished_date: datetime | None
    canceled_date: datetime | None
    description: str | None
    map_x: float | None
    map_y: float | None
