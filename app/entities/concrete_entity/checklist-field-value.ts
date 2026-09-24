import type { ChecklistFieldTypeEntity } from "./checklist-field-type";
import type { RequestTaskChecklistEntity } from "./request-task-checklist";
import type { JsonValue } from "./database-types";

/** Entidade OHFC_CHECKLIST_FIELD_VALUE. Fonte: database/SqlScripts/CreateTables/ChecklistsTables/CREATE_CHECKLIST_FIELD_VALUE.sql */
export type ChecklistFieldValueEntity = {
  id: number;
  idChecklistFieldType: ChecklistFieldTypeEntity["id"];
  idRequestTaskChecklist: RequestTaskChecklistEntity["id"];
  value: JsonValue;
};
