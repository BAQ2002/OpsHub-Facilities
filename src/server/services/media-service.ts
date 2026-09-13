import "server-only";

import { apiRequestServiceMediaRepository, apiRequestTaskMediaRepository } from "@/src/server/repositories/api/api-repositories";

/** Obtém a mídia vinculada a uma visita. */
export function getRequestTaskMedia(id: number) {
  return apiRequestTaskMediaRepository.findById(id);
}

/** Obtém a mídia vinculada a uma solicitação de serviço. */
export function getRequestMedia(id: number) {
  return apiRequestServiceMediaRepository.findById(id);
}
