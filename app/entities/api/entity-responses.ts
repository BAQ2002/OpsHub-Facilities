import type {
  BusinessEntity, RegionEntity, LocationEntity, RequestEntity, RequestTypeEntity,
  RequestStatusEntity, ServiceCategoryEntity, ServiceTypeEntity, ServiceFieldTypeEntity,
  ServiceFieldValueEntity, MembershipEntity, RequestTaskEntity, TaskMemberOccurrenceEntity,
  ChecklistTypeEntity, ChecklistFieldTypeEntity, ChecklistFieldValueEntity,
  RequestTaskChecklistEntity, RequestTaskMediaEntity, ServiceFieldMediaEntity,
} from "../concrete_entity";
import type { ActivityTrackingData } from "../navigation_entities/chamados_dashboard_viewModels";

// Envelopes HTTP: composição de entidades, sem formatação de apresentação.
export type MemberSummary = Pick<MembershipEntity, "id" | "name">;

export type RequestContext = {
  request: RequestEntity;
  requestStatus: RequestStatusEntity;
  requestType: RequestTypeEntity | null;
  serviceType: ServiceTypeEntity | null;
  category: ServiceCategoryEntity | null;
  location: LocationEntity | null;
  region: RegionEntity | null;
  business: BusinessEntity | null;
  requester: MemberSummary | null;
};

export type CatalogEntities = {
  categories: ServiceCategoryEntity[];
  serviceTypes: ServiceTypeEntity[];
};

export type RequestFormEntities = {
  serviceType: ServiceTypeEntity | null;
  category: ServiceCategoryEntity | null;
  fields: ServiceFieldTypeEntity[];
};

export type OrganizationEntities = {
  businesses: BusinessEntity[];
  regions: RegionEntity[];
  locations: LocationEntity[];
};

export type ChecklistEntities = {
  checklist: ChecklistTypeEntity;
  fields: ChecklistFieldTypeEntity[];
};

export type VisitChecklistEntities = {
  checklist: RequestTaskChecklistEntity;
  definition: ChecklistTypeEntity;
  values: { value: ChecklistFieldValueEntity; field: ChecklistFieldTypeEntity }[];
};

export type MediaReference = Pick<RequestTaskMediaEntity, "id" | "fileName" | "mimeType"> & { url: string };
export type RequestMediaReference = Pick<ServiceFieldMediaEntity, "id" | "fileName" | "mimeType" | "fileSize"> & {
  fieldLabel: string | null;
  url: string;
};

export type VisitEntities = {
  task: RequestTaskEntity;
  executors: { occurrence: TaskMemberOccurrenceEntity; member: MemberSummary }[];
  photos: MediaReference[];
  checklists: VisitChecklistEntities[];
};

export type BoardRequestEntities = RequestContext & {
  values: { value: ServiceFieldValueEntity; field: ServiceFieldTypeEntity }[];
  media: RequestMediaReference[];
  visits: VisitEntities[];
};

export type BoardEntities = {
  statuses: RequestStatusEntity[];
  requests: BoardRequestEntities[];
};

export type ActivityTrackingResponse = Omit<ActivityTrackingData, "filterOptions"> & {
  filterOptions: { businesses: BusinessEntity[]; serviceCategories: ServiceCategoryEntity[] };
};
