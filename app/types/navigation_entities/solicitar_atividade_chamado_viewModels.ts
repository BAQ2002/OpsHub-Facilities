import type { ActivityRequestField, LocationHierarchy } from "./solicitar_atividade_viewModels";

export type ActivityRequestFormFilters = {
  serviceTypeId: number;
};

export type ActivityRequestFormData = {
  serviceCategoryName?: string;
  serviceTypeId?: number;
  serviceTypeName?: string;
  fields: ActivityRequestField[];
};


export type ActivityRequestFormPageData = {
  title: string;
  subtitle: string;
  serviceTypeId?: number;
  fields: ActivityRequestField[];
  locationHierarchy: LocationHierarchy;
};
