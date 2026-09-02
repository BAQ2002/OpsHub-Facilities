import "server-only";

import { apiChecklistRepository, apiMembershipRepository, apiOrganizationRepository, apiRequestRepository, apiRequestServiceMediaRepository, apiRequestTaskMediaRepository, apiRequestTaskRepository, apiServiceCatalogRepository } from "@/src/server/repositories/api/api-repositories";
import type { ChecklistRepository } from "@/src/server/repositories/checklist/checklist-repository";
import type { MembershipRepository } from "@/src/server/repositories/membership/membership-repository";
import type { OrganizationRepository } from "@/src/server/repositories/organization/organization-repository";
import type { RequestRepository } from "@/src/server/repositories/request/request-repository";
import type { RequestTaskMediaRepository } from "@/src/server/repositories/request-task/request-task-media-repository";
import type { RequestTaskRepository } from "@/src/server/repositories/request-task/request-task-repository";
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
  return apiChecklistRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém membership repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getMembershipRepository(): MembershipRepository {
  return apiMembershipRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém organization repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getOrganizationRepository(): OrganizationRepository {
  return apiOrganizationRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém request repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getRequestRepository(): RequestRepository {
  return apiRequestRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém request task media repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getRequestTaskMediaRepository(): RequestTaskMediaRepository {
  return apiRequestTaskMediaRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém request task repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getRequestTaskRepository(): RequestTaskRepository {
  return apiRequestTaskRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém request service media repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getRequestServiceMediaRepository(): RequestServiceMediaRepository {
  return apiRequestServiceMediaRepository;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém service catalog repository para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getServiceCatalogRepository(): ServiceCatalogRepository {
  return apiServiceCatalogRepository;
}
