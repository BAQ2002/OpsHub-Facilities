import type { IntervalString } from "./database-types";

/** Entidade OHFC_SLA. Fonte: database/SqlScripts/CreateTables/ServicesTables/CREATE_SLA.sql */
export type ServiceLevelAgreementEntity = {
  id: number;
  name: string | null;
  description: string | null;
  deadline: IntervalString;
};
