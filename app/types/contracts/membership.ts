import type { MembershipOption } from "@/app/types/concrete_entity/membership";

export interface MembershipRepository {
  findExecutorOptions(): Promise<MembershipOption[]>;
}
