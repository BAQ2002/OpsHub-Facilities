import "server-only";
import type { ChecklistRepository } from "@/app/types/checklist";
import type { MembershipRepository } from "@/app/types/membership";
import type { OrganizationRepository } from "@/app/types/organization";
import type { CreateRequestInput, RequestRepository } from "@/app/types/request";
import type { RequestTaskMediaRepository } from "@/app/types/request-task-media";
import type { RequestTaskRepository, UpdateVisitInput, VisitInput } from "@/app/types/request-task";
import type { RequestServiceMediaRepository } from "@/app/types/request-service-media";
import type { ActivityRequestFormFilters, ServiceCatalogRepository } from "@/app/types/service-catalog";
import { backendJson, backendResponse, serializeFile } from "@/src/server/api-client";

const json = (body: unknown, method = "POST"): RequestInit => ({ method, body: JSON.stringify(body) });
async function values(input: CreateRequestInput) {
 return Promise.all(Object.entries(input.additionalFields).map(async ([name, items]) => ({ name, values: await Promise.all(items.map((v) => typeof v === "string" ? v : serializeFile(v))) })));
}
export const apiChecklistRepository: ChecklistRepository = {
 findActiveDefinitions: () => backendJson("/checklists"),
 addToVisit: (id, submission) => backendJson(`/checklists/visits/${id}`, json(submission)),
 deleteFromVisit: (id) => backendJson(`/checklists/${id}`, { method: "DELETE" }),
};
export const apiMembershipRepository: MembershipRepository = { findExecutorOptions: () => backendJson("/memberships/executors") };
export const apiOrganizationRepository: OrganizationRepository = { findLocationHierarchy: () => backendJson("/organization/locations") };
export const apiRequestRepository: RequestRepository = {
 findByCurrentUser: () => backendJson("/requests/mine"),
 async create(input) { const result = await backendJson<{id:number}>("/requests", json({ ...input, additionalFields: await values(input) })); return result.id; },
};
async function visitBody(input: VisitInput | UpdateVisitInput) { return { ...input, photos: await Promise.all(input.photos.map(serializeFile)) }; }
export const apiRequestTaskRepository: RequestTaskRepository = {
 createVisit: async (input) => { await backendJson("/request-tasks", json(await visitBody(input))); },
 updateVisit: async (input) => { await backendJson(`/request-tasks/${input.visitId}`, json(await visitBody(input), "PUT")); },
};
async function media(path:string) { const response=await backendResponse(path); if (!response.ok) return null; return { content:new Uint8Array(await response.arrayBuffer()), fileName:"media", mimeType:response.headers.get("content-type") ?? "application/octet-stream" }; }
export const apiRequestTaskMediaRepository: RequestTaskMediaRepository = { findById: (id) => media(`/request-tasks/media/${id}`) };
export const apiRequestServiceMediaRepository: RequestServiceMediaRepository = { findById: (id) => media(`/service-catalog/media/${id}`) };
export const apiServiceCatalogRepository: ServiceCatalogRepository = {
 findCatalog: () => backendJson("/service-catalog"),
 findRequestFormData: (filters: ActivityRequestFormFilters) => { const q=new URLSearchParams(); if(filters.serviceCategory)q.set("service_category",filters.serviceCategory);if(filters.serviceType)q.set("service_type",filters.serviceType);if(filters.serviceTypeId)q.set("service_type_id",String(filters.serviceTypeId));return backendJson(`/service-catalog/request-form?${q}`); },
};
