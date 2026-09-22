import type { JsonValue, ServiceFieldTypeEntity } from "@/app/entities/concrete_entity";
import type {
  CatalogEntities, OrganizationEntities, RequestContext, ChecklistEntities,
  VisitChecklistEntities, BoardRequestEntities, VisitEntities,
} from "@/app/entities/api/entity-responses";
import type {
  ActivityRequestField, ActivityRequestFieldType, LocationHierarchy, ServiceCatalogCategory,
} from "@/app/entities/navigation_entities/solicitar_atividade_viewModels";
import type { RequestCardViewModel } from "@/app/entities/navigation_entities/minhas_solicitacoes_viewModels";
import type {
  ChecklistDefinition, ChecklistFieldType, VisitChecklist, RequestBoardCardViewModel, RequestBoardVisit,
} from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";
import type { ActivityRecord, ActivityStatus } from "@/app/entities/navigation_entities/home_viewModels";

const fallbackName = (name: string | null | undefined) => name || "Não informado";

// TIMESTAMP sem timezone: mantém o dia civil devolvido pelo PostgreSQL.
function calendarDate(value: string | null): string {
  if (!value) return "";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function fieldText(value: JsonValue): string {
  if (value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function selectOptions(value: JsonValue) {
  return Array.isArray(value) ? value.map((item) => ({ label: fieldText(item), value: fieldText(item) })) : [];
}

export function mapCatalog(data: CatalogEntities): ServiceCatalogCategory[] {
  return data.categories.map((category) => ({
    id: category.id,
    name: fallbackName(category.name),
    serviceTypes: data.serviceTypes.filter((service) => service.idServiceCategory === category.id)
      .map((service) => ({ id: service.id, name: fallbackName(service.name) })),
  }));
}

export function mapOrganization(data: OrganizationEntities): LocationHierarchy {
  return {
    businesses: data.businesses.map((business) => ({ id: business.id, name: fallbackName(business.name) })),
    regions: data.regions.flatMap((region) => region.idBusiness === null ? [] : [{
      id: region.id, businessId: region.idBusiness, name: fallbackName(region.name),
    }]),
    locations: data.locations.flatMap((location) => location.idRegion === null ? [] : [{
      id: location.id, regionId: location.idRegion, name: fallbackName(location.name),
    }]),
  };
}

export function mapServiceField(field: ServiceFieldTypeEntity): ActivityRequestField {
  const type = (field.type || "TEXT").toUpperCase();
  const controls: Record<string, ActivityRequestFieldType> = {
    SINGLE_SELECT: "select", MULTI_SELECT: "multi-select", NUMBER: "number", DATE: "date", BOOL: "checkbox", MEDIA: "file",
  };
  const options = field.options;
  const media = type === "MEDIA" && options !== null && typeof options === "object" && !Array.isArray(options)
    ? { accept: Array.isArray(options.accept) ? options.accept.filter((value): value is string => typeof value === "string") : [], multiple: options.multiple === true }
    : undefined;
  return {
    label: field.name || "Campo adicional", name: `service_field_${field.id}`,
    type: controls[type] ?? "text", options: selectOptions(options), required: field.required ?? false,
    fullWidth: type === "TEXT" || type === "MEDIA", mediaOptions: media,
  };
}

export function mapRequestCard(data: RequestContext): RequestCardViewModel {
  return {
    id: data.request.id, title: data.serviceType?.name ?? "Solicitação",
    createdAt: calendarDate(data.request.createdDate),
    status: ["Concluída", "Concluida", "Cancelada"].includes(data.requestStatus.description ?? "") ? "Fechado" : "Aberto",
    hasUnreadMessage: false,
  };
}

export function mapChecklistDefinition(data: ChecklistEntities): ChecklistDefinition {
  const allowed: ChecklistFieldType[] = ["TEXT", "NUMBER", "DATE", "BOOL", "SINGLE_SELECT", "MULTI_SELECT"];
  return {
    id: data.checklist.id, name: data.checklist.name, description: data.checklist.description ?? "", version: data.checklist.version,
    fields: data.fields.map((field) => ({
      id: field.id, name: field.name,
      type: allowed.find((type) => type === field.type) ?? "TEXT",
      options: selectOptions(field.options), required: field.required,
    })),
  };
}

function mapVisitChecklist(data: VisitChecklistEntities): VisitChecklist {
  const record = data.checklist;
  return {
    id: record.id, checklistTypeId: record.idChecklistType,
    name: data.definition.name, description: data.definition.description ?? "", version: data.definition.version,
    corporation: record.corporation, equipmentTag: record.equipmentTag, equipmentBrand: record.equipmentBrand,
    equipmentModel: record.equipmentModel, rentedEquipment: record.rentedEquipment, serialNumber: record.serialNumber, ptNumber: record.ptNumber,
    values: data.values.map(({ value, field }) => ({ id: value.id, fieldId: field.id, name: field.name, type: field.type, value: value.value })),
  };
}

export function mapVisit(data: VisitEntities): RequestBoardVisit {
  return {
    id: data.task.id, startDate: calendarDate(data.task.startDatetime), endDate: calendarDate(data.task.stopDatetime),
    startDatetime: data.task.startDatetime?.slice(0, 16) ?? "", endDatetime: data.task.stopDatetime?.slice(0, 16) ?? "",
    description: data.task.description ?? "",
    executors: data.executors.map(({ member }) => ({ id: member.id, name: fallbackName(member.name) })),
    photos: data.photos.map((photo) => ({ ...photo, fileName: photo.fileName || "media" })),
    checklists: data.checklists.map(mapVisitChecklist),
  };
}

export function mapBoardCard(data: BoardRequestEntities): RequestBoardCardViewModel {
  const details = data.values.map(({ value, field }) => ({
    id: String(value.id), label: field.name || "Campo adicional",
    value: Array.isArray(value.value) ? value.value.map(fieldText).join(", ") : fieldText(value.value),
  }));
  if (data.request.description) details.unshift({ id: "description", label: "Descrição", value: data.request.description });
  return {
    id: data.request.id, serviceTypeName: fallbackName(data.serviceType?.name),
    requesterName: fallbackName(data.requester?.name), locationName: fallbackName(data.location?.name), details,
    media: data.media.map((media) => ({ ...media, fileName: media.fileName || "media", fieldLabel: media.fieldLabel ?? "", fileSize: media.fileSize ?? undefined })),
    visits: data.visits.map(mapVisit),
  };
}

const activityDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Sao_Paulo",
});

export function mapActivity(data: RequestContext): ActivityRecord {
  const status = data.requestStatus.description === "Concluida" ? "Concluída" : data.requestStatus.description;
  const dates: Record<string, string | null> = {
    Programada: data.request.agreedDate, "Em andamento": data.request.startedDate,
    Concluída: data.request.finishedDate, Cancelada: data.request.canceledDate,
  };
  const formatted = (date: string | null | undefined) => date ? activityDateFormatter.format(new Date(date)) : "Não informado";
  return {
    id: String(data.request.id), activityType: data.requestType?.name === "Atividade no Pátio" ? "Atividade no Pátio" : "Chamado",
    businessUnit: fallbackName(data.business?.name), categoryId: data.category?.id ?? null, category: fallbackName(data.category?.name),
    serviceType: fallbackName(data.serviceType?.name), location: fallbackName(data.location?.name), status: status as ActivityStatus,
    statusDate: formatted(dates[status ?? ""]), plannedAt: formatted(data.request.agreedDate),
    mapPosition: { x: Number(data.location?.locationX ?? 0), y: Number(data.location?.locationY ?? 0) },
  };
}
