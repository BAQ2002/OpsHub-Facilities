export type ChecklistFieldType = "TEXT" | "NUMBER" | "DATE" | "BOOL" | "SINGLE_SELECT" | "MULTI_SELECT";

export type ChecklistOption = { label: string; value: string };

export type ChecklistFieldDefinition = {
  id: number;
  name: string;
  type: ChecklistFieldType;
  options: ChecklistOption[];
  required: boolean;
};

export type ChecklistDefinition = {
  id: number;
  name: string;
  description: string;
  version: string;
  fields: ChecklistFieldDefinition[];
};

export type ChecklistSubmission = {
  checklistTypeId: number;
  corporation: string | null;
  equipmentTag: string | null;
  equipmentBrand: string | null;
  equipmentModel: string | null;
  rentedEquipment: boolean | null;
  serialNumber: string | null;
  ptNumber: string | null;
  values: { fieldId: number; value: unknown }[];
};

export type VisitChecklist = {
  id: number;
  checklistTypeId: number;
  name: string;
  description: string;
  version: string;
  corporation: string | null;
  equipmentTag: string | null;
  equipmentBrand: string | null;
  equipmentModel: string | null;
  rentedEquipment: boolean | null;
  serialNumber: string | null;
  ptNumber: string | null;
  values: { id: number; fieldId: number; name: string; type: string; value: unknown }[];
};
