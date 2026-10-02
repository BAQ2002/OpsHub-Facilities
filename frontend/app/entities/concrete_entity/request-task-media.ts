import type { RequestTaskEntity } from "./request-task";
import type { Base64String, TimestampString } from "./database-types";

/** Entidade OHFC_REQUEST_TASK_MEDIA. Fonte: database/SqlScripts/CreateTables/RequestsTables/CREATE_REQUEST_TASK_MEDIA.sql */
export type RequestTaskMediaEntity = {
  id: number;
  idRequestTask: RequestTaskEntity["id"];
  content: Base64String;
  fileName: string | null;
  mimeType: string;
  fileSize: number | null;
  createdDate: TimestampString;
};
