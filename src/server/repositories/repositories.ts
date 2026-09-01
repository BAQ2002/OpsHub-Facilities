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

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém checklist repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getChecklistRepository(): ChecklistRepository {
  return postgresChecklistRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém membership repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getMembershipRepository(): MembershipRepository {
  return postgresMembershipRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém organization repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getOrganizationRepository(): OrganizationRepository {
  return postgresOrganizationRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém request repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getRequestRepository(): RequestRepository {
  return postgresRequestRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém request task media repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getRequestTaskMediaRepository(): RequestTaskMediaRepository {
  return postgresRequestTaskMediaRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém request task repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getRequestTaskRepository(): RequestTaskRepository {
  return postgresRequestTaskRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém request service media repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getRequestServiceMediaRepository(): RequestServiceMediaRepository {
  return postgresRequestServiceMediaRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém service catalog repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getServiceCatalogRepository(): ServiceCatalogRepository {
  return postgresServiceCatalogRepository;
}
