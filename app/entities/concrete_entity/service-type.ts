import type { ServiceCategoryEntity } from "./service-category";

/** Entidade OHFC_SERVICE_TYPE. Fonte: database/SqlScripts/CreateTables/ServicesTables/CREATE_SERVICE_TYPE.sql */
export type ServiceTypeEntity = {
  id: number;
  idServiceCategory: ServiceCategoryEntity["id"] | null;
  name: string | null;
  description: string | null;
};
