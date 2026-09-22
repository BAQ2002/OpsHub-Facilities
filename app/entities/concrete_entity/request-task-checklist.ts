import type { ChecklistTypeEntity } from "./checklist";
import type { RequestTaskEntity } from "./request-task";

/** Entidade REQUEST_TASK_CHECKLIST. Fonte: database/SqlScripts/CreateTables/ChecklistsTables/CREATE_REQUES_TASK_CHECKLIST.sql */
export type RequestTaskChecklistEntity = {
  id: number;
  idChecklistType: ChecklistTypeEntity["id"];
  idRequestTask: RequestTaskEntity["id"];
  corporation: string | null;
  equipmentTag: string | null;
  equipmentBrand: string | null;
  equipmentModel: string | null;
  rentedEquipment: boolean | null;
  serialNumber: string | null;
  ptNumber: string | null;
};
