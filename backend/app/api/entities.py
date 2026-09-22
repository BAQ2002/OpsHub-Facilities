"""Persisted entities and read envelopes. UI formatting belongs to Next.js."""
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, JsonValue
from pydantic.alias_generators import to_camel


class EntityModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class BusinessEntity(EntityModel):
    id: int
    name: str | None


class RegionEntity(EntityModel):
    id: int
    id_business: int | None
    name: str | None


class LocationEntity(EntityModel):
    id: int
    id_region: int | None
    name: str | None
    location_x: Decimal | None
    location_y: Decimal | None


class RequestEntity(EntityModel):
    id: int
    id_request_type: int
    id_member_requester: int
    id_member_responder: int | None
    id_location: int
    id_service_type: int
    id_request_status: int
    created_date: datetime | None
    agreed_date: datetime | None
    started_date: datetime | None
    finished_date: datetime | None
    canceled_date: datetime | None
    description: str | None


class RequestTypeEntity(EntityModel):
    id: int
    name: str | None


class RequestStatusEntity(EntityModel):
    id: int
    description: str | None


class ServiceTypeEntity(EntityModel):
    id: int
    id_service_category: int | None
    name: str | None
    description: str | None


class ServiceCategoryEntity(EntityModel):
    id: int
    name: str | None


class ServiceFieldTypeEntity(EntityModel):
    id: int
    id_service_type: int | None
    name: str | None
    type: str | None
    options: JsonValue
    required: bool | None
    active: bool | None
    display_order: int | None


class ServiceFieldValueEntity(EntityModel):
    id: int
    id_service_field_type: int
    id_request: int
    value: JsonValue


class RequestTaskEntity(EntityModel):
    id: int
    id_request: int
    start_datetime: datetime | None
    stop_datetime: datetime | None
    description: str | None


class TaskMemberOccurrenceEntity(EntityModel):
    id: int
    id_task: int
    id_membership: int


class ChecklistTypeEntity(EntityModel):
    id: int
    name: str
    description: str | None
    version: str
    active: bool


class ChecklistFieldTypeEntity(EntityModel):
    id: int
    id_checklist_type: int
    name: str
    type: str
    options: JsonValue
    required: bool
    active: bool
    display_order: int


class ChecklistFieldValueEntity(EntityModel):
    id: int
    id_checklist_field_type: int
    id_request_task_checklist: int
    value: JsonValue


class RequestTaskChecklistEntity(EntityModel):
    id: int
    id_checklist_type: int
    id_request_task: int
    corporation: str | None
    equipment_tag: str | None
    equipment_brand: str | None
    equipment_model: str | None
    rented_equipment: bool | None
    serial_number: str | None
    pt_number: str | None


class MemberSummary(EntityModel):
    id: int
    name: str | None


class RequestContext(EntityModel):
    request: RequestEntity
    request_status: RequestStatusEntity
    request_type: RequestTypeEntity | None
    service_type: ServiceTypeEntity | None
    category: ServiceCategoryEntity | None
    location: LocationEntity | None
    region: RegionEntity | None
    business: BusinessEntity | None
    requester: MemberSummary | None


class CatalogEntities(EntityModel):
    categories: list[ServiceCategoryEntity]
    service_types: list[ServiceTypeEntity]


class RequestFormEntities(EntityModel):
    service_type: ServiceTypeEntity | None = None
    category: ServiceCategoryEntity | None = None
    fields: list[ServiceFieldTypeEntity]


class OrganizationEntities(EntityModel):
    businesses: list[BusinessEntity]
    regions: list[RegionEntity]
    locations: list[LocationEntity]


class ChecklistEntities(EntityModel):
    checklist: ChecklistTypeEntity
    fields: list[ChecklistFieldTypeEntity]


class ChecklistValueEntities(EntityModel):
    value: ChecklistFieldValueEntity
    field: ChecklistFieldTypeEntity


class VisitChecklistEntities(EntityModel):
    checklist: RequestTaskChecklistEntity
    definition: ChecklistTypeEntity
    values: list[ChecklistValueEntities]


class TaskExecutorEntities(EntityModel):
    occurrence: TaskMemberOccurrenceEntity
    member: MemberSummary


class MediaReference(EntityModel):
    id: int
    file_name: str | None
    mime_type: str
    url: str


class RequestMediaReference(MediaReference):
    field_label: str | None
    file_size: int | None


class VisitEntities(EntityModel):
    task: RequestTaskEntity
    executors: list[TaskExecutorEntities]
    photos: list[MediaReference]
    checklists: list[VisitChecklistEntities]


class ServiceValueEntities(EntityModel):
    value: ServiceFieldValueEntity
    field: ServiceFieldTypeEntity


class BoardRequestEntities(RequestContext):
    values: list[ServiceValueEntities]
    media: list[RequestMediaReference]
    visits: list[VisitEntities]


class BoardEntities(EntityModel):
    statuses: list[RequestStatusEntity]
    requests: list[BoardRequestEntities]
