/** Entidade OHFC_CHECKLIST_TYPE. Fonte: database/SqlScripts/CreateTables/ChecklistsTables/CREATE_CHECKLIST_TYPE.sql */
export type ChecklistTypeEntity = {
  id: number;
  name: string;
  description: string | null;
  version: string;
  active: boolean;
};
