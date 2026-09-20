import type {
  ActivityRequestField,
  LocationHierarchy,
} from "@/app/types/concrete_entity/activity-request-form";

export type ActivityRequestFormPageData = {
  title: string;
  subtitle: string;
  serviceTypeId?: number;
  fields: ActivityRequestField[];
  locationHierarchy: LocationHierarchy;
};
