import type { RequestEntity } from "./request";
import type { TimestampString } from "./database-types";

/** Entidade REQUEST_TASK. Fonte: database/SqlScripts/CreateTables/RequestsTables/CREATE_REQUEST_TASK.sql */
export type RequestTaskEntity = {
  id: number;
  idRequest: RequestEntity["id"];
  startDatetime: TimestampString | null;
  stopDatetime: TimestampString | null;
  description: string | null;
};
