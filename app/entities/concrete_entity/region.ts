import type { BusinessEntity } from "./business";

/** Entidade REGION. Fonte: database/SqlScripts/CreateTables/LocationsTables/CREATE_REGION.sql */
export type RegionEntity = {
  id: number;
  idBusiness: BusinessEntity["id"] | null;
  name: string | null;
};
