import type { IntervalString } from "./database-types";

/** Entidade SERVICE_LEVEL_AGREEMENT. Fonte: database/SqlScripts/CreateTables/ServicesTables/CREATE_SERVICE_LEVEL_AGREEMENT.sql */
export type ServiceLevelAgreementEntity = {
  id: number;
  name: string | null;
  description: string | null;
  deadline: IntervalString;
};
