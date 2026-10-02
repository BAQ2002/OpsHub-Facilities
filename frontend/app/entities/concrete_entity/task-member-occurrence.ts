import type { RequestTaskEntity } from "./request-task";
import type { MembershipEntity } from "./membership";

/** Entidade OHFC_TASK_MEMBER_OCCURRENCE. Fonte: database/SqlScripts/CreateTables/MembersTables/CREATE_TASK_MEMBER_OCCURRENCE.sql */
/** ID_REQUEST_TASK é exposto como idTask pela API. */
export type TaskMemberOccurrenceEntity = {
  id: number;
  idTask: RequestTaskEntity["id"];
  idMembership: MembershipEntity["id"];
};
