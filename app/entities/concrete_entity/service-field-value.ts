import type { ServiceFieldTypeEntity } from "./service-field-type";
import type { RequestEntity } from "./request";
import type { JsonValue } from "./database-types";

/** Entidade OHFC_SERVICE_FIELD_VALUE. Fonte: database/SqlScripts/CreateTables/ServicesTables/CREATE_SERVICE_FIELD_VALUE.sql */
export type ServiceFieldValueEntity = {
  id: number;
  idServiceFieldType: ServiceFieldTypeEntity["id"];
  idRequest: RequestEntity["id"];
  value: JsonValue;
};
