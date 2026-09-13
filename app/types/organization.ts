import type { LocationHierarchy } from "@/src/domain/entities/activity-request-form";

export interface OrganizationRepository {
  findLocationHierarchy(): Promise<LocationHierarchy>;
}
