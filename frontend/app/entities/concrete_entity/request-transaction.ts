import type { RequestEntity } from "./request";
import type { MembershipEntity } from "./membership";
import type { RequestTransactionStatusEntity } from "./request-transaction-status";

/** Entidade OHFC_REQUEST_TRANSACTION. Fonte: database/SqlScripts/CreateTables/RequestsTables/CREATE_REQUEST_TRANSACTION.sql */
/** Colunas SQL: ID_MEMBERSHIP_REQUESTER/RESPONDER; nomes do contrato: idMemberRequester/Responder. */
export type RequestTransactionEntity = {
  id: number;
  idRequest: RequestEntity["id"];
  idMemberRequester: MembershipEntity["id"];
  idMemberResponder: MembershipEntity["id"];
  idRequestTransactionStatus: RequestTransactionStatusEntity["id"];
  description: string | null;
};
