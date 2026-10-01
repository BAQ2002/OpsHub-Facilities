from pydantic import BaseModel, Field
from ..entities import RequestContext
from ..uploads import UploadedFile


class UpdateRequestStatus(BaseModel):
    statusId: int = Field(gt=0, strict=True)


class FileValue(UploadedFile):
    pass


class AdditionalValue(BaseModel):
    name: str
    values: list[str | FileValue]


class CreateRequest(BaseModel):
    requesterId: int = Field(gt=0, strict=True)
    businessId: int
    regionId: int
    locationId: int
    serviceTypeId: int
    description: str = Field(min_length=1, max_length=300)
    additionalFields: list[AdditionalValue]


class EquipmentCount(BaseModel):
    categoryId: int
    categoryName: str
    planned: int
    inProgress: int
    completed: int


class HomeMetrics(BaseModel):
    equipment: list[EquipmentCount]
    handlingMinutes: list[float]


class ActivityPage(BaseModel):
    items: list[RequestContext]
    total: int
    page: int
    pageSize: int


class ActivityMapRecord(BaseModel):
    id: str
    categoryId: int | None
    category: str
    location: str
    x: float
    y: float


class ActivityBusinessCount(BaseModel):
    name: str
    count: int
