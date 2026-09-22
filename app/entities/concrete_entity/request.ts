import type { RequestTypeEntity } from "./request-type";
import type { MembershipEntity } from "./membership";
import type { LocationEntity } from "./location";
import type { ServiceTypeEntity } from "./service-type";
import type { RequestStatusEntity } from "./request-status";
import type { TimestampString } from "./database-types";

/** Entidade REQUEST. Fonte: database/SqlScripts/CreateTables/RequestsTables/CREATE_REQUEST.sql */
export type RequestEntity = {
  id: number;
  idRequestType: RequestTypeEntity["id"];
  idMemberRequester: MembershipEntity["id"];
  idMemberResponder: MembershipEntity["id"] | null;
  idLocation: LocationEntity["id"];
  idServiceType: ServiceTypeEntity["id"];
  idRequestStatus: RequestStatusEntity["id"];
  createdDate: TimestampString | null;
  agreedDate: TimestampString | null;
  startedDate: TimestampString | null;
  finishedDate: TimestampString | null;
  canceledDate: TimestampString | null;
  description: string | null;
};
