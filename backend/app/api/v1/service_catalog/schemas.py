from typing import Any
from pydantic import BaseModel


class ServiceTypeOption(BaseModel):
    id: int
    name: str


class CatalogCategory(BaseModel):
    id: int
    name: str
    serviceTypes: list[ServiceTypeOption]


class FormOption(BaseModel):
    label: str
    value: str


class FormField(BaseModel):
    label: str
    name: str
    type: str
    options: list[FormOption] | None = None
    required: bool = False
    fullWidth: bool = False
    mediaOptions: dict[str, Any] | None = None


class RequestFormData(BaseModel):
    serviceCategoryName: str | None = None
    serviceTypeId: int | None = None
    serviceTypeName: str | None = None
    serviceTypeOptions: list[FormOption]
    fields: list[FormField]
