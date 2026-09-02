from typing import Any
from pydantic import BaseModel


class ChecklistValue(BaseModel):
    fieldId: int
    value: Any


class ChecklistSubmission(BaseModel):
    checklistTypeId: int
    corporation: str | None = None
    equipmentTag: str | None = None
    equipmentBrand: str | None = None
    equipmentModel: str | None = None
    rentedEquipment: bool | None = None
    serialNumber: str | None = None
    ptNumber: str | None = None
    values: list[ChecklistValue]


class ChecklistField(BaseModel):
    id: int
    name: str
    type: str
    options: list[dict[str, str]]
    required: bool


class ChecklistDefinition(BaseModel):
    id: int
    name: str
    description: str
    version: str
    fields: list[ChecklistField]
