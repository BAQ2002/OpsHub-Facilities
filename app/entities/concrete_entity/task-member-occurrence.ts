import type { RequestTaskEntity } from "./request-task";
import type { MembershipEntity } from "./membership";

/** Entidade TASK_MEMBER_OCCURRENCE. Fonte: database/SqlScripts/CreateTables/MembersTables/CREATE_TASK_MEMBER_OCCURRENCE.sql */
export type TaskMemberOccurrenceEntity = {
  id: number;
  idTask: RequestTaskEntity["id"];
  idMembership: MembershipEntity["id"];
};
