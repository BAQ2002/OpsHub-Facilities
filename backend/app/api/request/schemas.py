from typing import Any, Literal
from pydantic import BaseModel, Field


class RequestItem(BaseModel):
    id: int
    title: str
    createdAt: str
    status: Literal["Aberto", "Fechado"]
    hasUnreadMessage: bool = False


class FileValue(BaseModel):
    fileName: str
    mimeType: str
    contentBase64: str


class AdditionalValue(BaseModel):
    name: str
    values: list[str | FileValue]


class CreateRequest(BaseModel):
    businessId: int
    regionId: int
    locationId: int
    serviceTypeId: int
    description: str = Field(min_length=1, max_length=300)
    additionalFields: list[AdditionalValue]


class Activity(BaseModel):
    id: int
    request_type: str | None
    business_unit: str | None
    category_id: int | None
    category: str | None
    service: str | None
    location: str | None
    status: str | None
    status_date: Any = None
    agreed_date: Any = None
    map_x: float | None
    map_y: float | None


class EquipmentCount(BaseModel):
    categoryId: int
    categoryName: str
    planned: int
    inProgress: int
    completed: int


class HomeMetrics(BaseModel):
    equipment: list[EquipmentCount]
    handlingMinutes: list[float]
