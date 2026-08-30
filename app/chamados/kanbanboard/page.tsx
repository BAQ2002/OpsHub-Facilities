import { getRequestBoardPageData } from "@/src/server/services/request-board-service";
import { getChecklistRepository, getMembershipRepository } from "@/src/server/repositories/repositories";
import { RequestsWorkspace } from "./_components/RequestsWorkspace";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const initialRange = { startDate: `${today.slice(0, 4)}-01-01`, endDate: today };
  const membershipRepository = getMembershipRepository();
  const checklistRepository = getChecklistRepository();
  const [initialData, executors, checklistDefinitions] = await Promise.all([
    getRequestBoardPageData(initialRange),
    membershipRepository.findExecutorOptions(),
    checklistRepository.findActiveDefinitions(),
  ]);
  return <RequestsWorkspace initialData={initialData} initialRange={initialRange} executors={executors} checklistDefinitions={checklistDefinitions} />;
}
