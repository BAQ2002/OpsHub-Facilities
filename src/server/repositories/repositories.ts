import "server-only";

import type { ChecklistRepository } from "@/src/server/repositories/checklist/checklist-repository";
import { postgresChecklistRepository } from "@/src/server/repositories/checklist/postgres/checklist-postgres-repository";
import type { MembershipRepository } from "@/src/server/repositories/membership/membership-repository";
import { postgresMembershipRepository } from "@/src/server/repositories/membership/postgres/membership-postgres-repository";
import type { OrganizationRepository } from "@/src/server/repositories/organization/organization-repository";
import { postgresOrganizationRepository } from "@/src/server/repositories/organization/postgres/organization-postgres-repository";
import type { RequestRepository } from "@/src/server/repositories/request/request-repository";
import { postgresRequestRepository } from "@/src/server/repositories/request/postgres/request-postgres-repository";
import { postgresRequestTaskMediaRepository } from "@/src/server/repositories/request-task/postgres/request-task-media-postgres-repository";
import { postgresRequestTaskRepository } from "@/src/server/repositories/request-task/postgres/request-task-postgres-repository";
import type { RequestTaskMediaRepository } from "@/src/server/repositories/request-task/request-task-media-repository";
import type { RequestTaskRepository } from "@/src/server/repositories/request-task/request-task-repository";
import { postgresRequestServiceMediaRepository } from "@/src/server/repositories/service-catalog/postgres/request-service-media-postgres-repository";
import { postgresServiceCatalogRepository } from "@/src/server/repositories/service-catalog/postgres/service-catalog-postgres-repository";
import type { RequestServiceMediaRepository } from "@/src/server/repositories/service-catalog/request-service-media-repository";
import type { ServiceCatalogRepository } from "@/src/server/repositories/service-catalog/service-catalog-repository";

export function getChecklistRepository(): ChecklistRepository {
  return postgresChecklistRepository;
}

export function getMembershipRepository(): MembershipRepository {
  return postgresMembershipRepository;
}

export function getOrganizationRepository(): OrganizationRepository {
  return postgresOrganizationRepository;
}

export function getRequestRepository(): RequestRepository {
  return postgresRequestRepository;
}

export function getRequestTaskMediaRepository(): RequestTaskMediaRepository {
  return postgresRequestTaskMediaRepository;
}

export function getRequestTaskRepository(): RequestTaskRepository {
  return postgresRequestTaskRepository;
}

export function getRequestServiceMediaRepository(): RequestServiceMediaRepository {
  return postgresRequestServiceMediaRepository;
}

export function getServiceCatalogRepository(): ServiceCatalogRepository {
  return postgresServiceCatalogRepository;
}
