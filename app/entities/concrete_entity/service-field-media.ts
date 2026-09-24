import type { ServiceFieldTypeEntity } from "./service-field-type";
import type { RequestEntity } from "./request";
import type { Base64String, TimestampString } from "./database-types";

/** Entidade OHFC_SERVICE_FIELD_MEDIA. Fonte: database/SqlScripts/CreateTables/ServicesTables/CREATE_SERVICE_FIELD_MEDIA.sql */
export type ServiceFieldMediaEntity = {
  id: number;
  idServiceFieldType: ServiceFieldTypeEntity["id"];
  idRequest: RequestEntity["id"];
  content: Base64String;
  fileName: string | null;
  mimeType: string;
  fileSize: number | null;
  createdAt: TimestampString;
};
