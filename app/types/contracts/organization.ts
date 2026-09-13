import type { LocationHierarchy } from "@/app/types/concrete_entity/activity-request-form";

export interface OrganizationRepository {
  findLocationHierarchy(): Promise<LocationHierarchy>;
}
