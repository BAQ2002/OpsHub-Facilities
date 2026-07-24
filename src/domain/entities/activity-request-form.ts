export type FormOption = {
  label: string;
  value: string;
};

export type ActivityRequestFieldType =
  | "select"
  | "multi-select"
  | "checkbox"
  | "text"
  | "number"
  | "date"
  | "datetime-local"
  | "textarea"
  | "file"
  | "hidden";

export type ActivityRequestField = {
  label: string;
  name: string;
  type: ActivityRequestFieldType;
  placeholder?: string;
  options?: FormOption[];
  fullWidth?: boolean;
  required?: boolean;
  helpText?: string;
  defaultValue?: string;
};
