import type { RequestEntity } from "./request";
import type { TimestampString } from "./database-types";

/** Entidade OHFC_REQUEST_TASK. Fonte: database/SqlScripts/CreateTables/RequestsTables/CREATE_REQUEST_TASK.sql */
/** STARTED_DATE/FINISHED_DATE são expostos como startDatetime/stopDatetime pela API. */
export type RequestTaskEntity = {
  id: number;
  idRequest: RequestEntity["id"];
  startDatetime: TimestampString | null;
  stopDatetime: TimestampString | null;
  description: string | null;
};
