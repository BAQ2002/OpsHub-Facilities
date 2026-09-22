import type { ServiceTypeEntity } from "./service-type";
import type { JsonValue } from "./database-types";

/** Entidade SERVICE_FIELD_TYPE. Fonte: database/SqlScripts/CreateTables/ServicesTables/CREATE_SERVICE_FIELD_TYPE.sql */
export type ServiceFieldTypeEntity = {
  id: number;
  idServiceType: ServiceTypeEntity["id"] | null;
  name: string | null;
  type: string | null;
  options: JsonValue;
  required: boolean | null;
  active: boolean | null;
  displayOrder: number | null;
};
