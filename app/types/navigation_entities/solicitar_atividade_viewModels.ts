// Catálogo e tipos compartilhados pelos formulários de Chamado e Pátio.
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
  mediaOptions?: {
    accept: string[];
    multiple: boolean;
  };
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

export type RequestFieldValue = string | File;

export type CreateRequestInput = {
  businessId: number;
  regionId: number;
  locationId: number;
  serviceTypeId: number;
  description: string;
  additionalFields: Readonly<Record<string, RequestFieldValue[]>>;
};

export type ServiceCatalogCategory = {
  id: number;
  name: string;
  serviceTypes: { id: number; name: string }[];
};
