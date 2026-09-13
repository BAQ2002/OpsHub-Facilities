export type MembershipOption = { id: number; name: string };

export interface MembershipRepository {
  findExecutorOptions(): Promise<MembershipOption[]>;
}
