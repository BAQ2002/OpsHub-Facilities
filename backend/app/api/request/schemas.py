from pydantic import BaseModel, Field


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


class EquipmentCount(BaseModel):
    categoryId: int
    categoryName: str
    planned: int
    inProgress: int
    completed: int


class HomeMetrics(BaseModel):
    equipment: list[EquipmentCount]
    handlingMinutes: list[float]
