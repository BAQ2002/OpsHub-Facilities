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

export type BusinessOption = {
  id: number;
  name: string;
};

export type RegionOption = {
  id: number;
  businessId: number;
  name: string;
};

export type LocationOption = {
  id: number;
  regionId: number;
  name: string;
};

export type LocationHierarchy = {
  businesses: BusinessOption[];
  regions: RegionOption[];
  locations: LocationOption[];
};
