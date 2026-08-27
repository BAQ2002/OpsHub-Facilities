import "server-only";

import type { MembershipRepository } from "@/src/server/repositories/membership/membership-repository";
import { postgresMembershipRepository } from "@/src/server/repositories/membership/postgres/membership-postgres-repository";

export function getMembershipRepository(): MembershipRepository {
  return postgresMembershipRepository;
}
