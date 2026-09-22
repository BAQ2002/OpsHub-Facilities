import type { SectorEntity } from "./sector";

/** Entidade MEMBERSHIP. Fonte: database/SqlScripts/CreateTables/MembersTables/CREATE_MEMBERSHIP.sql */
export type MembershipEntity = {
  id: number;
  idSector: SectorEntity["id"] | null;
  name: string | null;
  email: string | null;
  accessLevel: number | null;
};
