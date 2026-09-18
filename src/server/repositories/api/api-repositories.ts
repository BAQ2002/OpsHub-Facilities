import "server-only";

import type { ChecklistDefinition, ChecklistSubmission } from "@/app/types/concrete_entity/checklist";
import type { LocationHierarchy } from "@/app/types/concrete_entity/activity-request-form";
import type { MembershipOption } from "@/app/types/concrete_entity/membership";
import type { CreateRequestInput } from "@/app/types/concrete_entity/request-input";
import type { RequestEntity } from "@/app/types/concrete_entity/request";
import type { UpdateVisitInput, VisitInput } from "@/app/types/concrete_entity/request-task";
import type {
  ActivityRequestFormData,
  ActivityRequestFormFilters,
  ServiceCatalogCategory,
} from "@/app/types/concrete_entity/service-catalog";
import { backendJson, serializeFile } from "@/src/server/api-client";

const json = (body: unknown, method = "POST"): RequestInit => ({ method, body: JSON.stringify(body) });

async function values(input: CreateRequestInput) {
  return Promise.all(
    Object.entries(input.additionalFields).map(async ([name, items]) => ({
      name,
      values: await Promise.all(items.map((value) => (typeof value === "string" ? value : serializeFile(value)))),
    })),
  );
}

export const apiChecklistRepository = {
  findActiveDefinitions: (): Promise<ChecklistDefinition[]> => backendJson("/checklists"),
  addToVisit: (id: number, submission: ChecklistSubmission): Promise<void> =>
    backendJson(`/checklists/visits/${id}`, json(submission)),
  deleteFromVisit: (id: number): Promise<void> => backendJson(`/checklists/${id}`, { method: "DELETE" }),
};

export const apiMembershipRepository = {
  findExecutorOptions: (): Promise<MembershipOption[]> => backendJson("/memberships/executors"),
};

export const apiOrganizationRepository = {
  findLocationHierarchy: (): Promise<LocationHierarchy> => backendJson("/organization/locations"),
};

export const apiRequestRepository = {
  findByCurrentUser: (): Promise<RequestEntity[]> => backendJson("/requests/mine"),
  async create(input: CreateRequestInput): Promise<number> {
    const result = await backendJson<{ id: number }>(
      "/requests",
      json({ ...input, additionalFields: await values(input) }),
    );
    return result.id;
  },
};

async function visitBody(input: VisitInput | UpdateVisitInput) {
  return { ...input, photos: await Promise.all(input.photos.map(serializeFile)) };
}

export const apiRequestTaskRepository = {
  createVisit: async (input: VisitInput): Promise<void> => {
    await backendJson("/request-tasks", json(await visitBody(input)));
  },
  updateVisit: async (input: UpdateVisitInput): Promise<void> => {
    await backendJson(`/request-tasks/${input.visitId}`, json(await visitBody(input), "PUT"));
  },
};

export const apiServiceCatalogRepository = {
  findCatalog: (): Promise<ServiceCatalogCategory[]> => backendJson("/service-catalog"),
  findRequestFormData: (filters: ActivityRequestFormFilters): Promise<ActivityRequestFormData> => {
    const query = new URLSearchParams();
    query.set("service_type_id", String(filters.serviceTypeId));
    return backendJson(`/service-catalog/request-form?${query}`);
  },
};
