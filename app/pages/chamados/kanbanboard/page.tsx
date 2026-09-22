import { getRequestBoardWorkspaceData } from "@/app/services/request-board-service";
import { MinhasSolicitacoes } from "./_components/minhas-solicitacoes";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const initialRange = { startDate: `${today.slice(0, 4)}-01-01`, endDate: today };
  const { initialData, executors, checklistDefinitions } = await getRequestBoardWorkspaceData(initialRange);
  return <MinhasSolicitacoes initialData={initialData} initialRange={initialRange} executors={executors} checklistDefinitions={checklistDefinitions} />;
}
