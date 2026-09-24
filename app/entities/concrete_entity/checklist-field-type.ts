import type { ChecklistTypeEntity } from "./checklist";
import type { JsonValue } from "./database-types";

/** Entidade OHFC_CHECKLIST_FIELD_TYPE. Fonte: database/SqlScripts/CreateTables/ChecklistsTables/CREATE_CHECKLIST_FIELD_TYPE.sql */
export type ChecklistFieldTypeEntity = {
  id: number;
  idChecklistType: ChecklistTypeEntity["id"];
  name: string;
  type: string;
  options: JsonValue;
  required: boolean;
  active: boolean;
  displayOrder: number;
};
