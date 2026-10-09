import { Suspense } from "react";
import { apiResult } from "@/app/entities/api/api-result";
import { getRequestBoardPageData, getRequestBoardFilterOptions } from "@/app/services/request-board-service";
import { TrackingTabs } from "../_components/TrackingTabs";
import { ChamadosProvider } from "./_components/ChamadosProvider";
import { ChamadosFiltersLoader } from "./_components/ChamadosFiltersLoader";
import { DownloadReportButton } from "./_components/DownloadReportButton";
import { ChamadosKanbanBoard } from "./_components/chamadosKanbanBoard";
import { ChamadosSort } from "./_components/ChamadosSort";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const initialRange = { startDate: today.slice(0, 4) + "-01-01", endDate: today };
  const options = apiResult(getRequestBoardFilterOptions);
  const initialData = await apiResult(() => getRequestBoardPageData(initialRange));

  return (
    <ChamadosProvider initialData={initialData} initialRange={initialRange}>
      <section data-ui="requests-workspace-page" className="min-h-screen bg-white p-4 text-slate-700 md:p-6">
        <div data-ui="requests-workspace-content" className="mx-auto max-w-[1800px]">
          <div data-ui="requests-workspace-header" className="flex items-start justify-between border-b border-slate-300/70">
            <TrackingTabs active="requests" />
            <div className="flex overflow-hidden rounded-lg border border-blue-500 bg-white text-blue-600">
              <DownloadReportButton />
              <button type="button" aria-label="Configurações" className="flex h-9 w-11 items-center justify-center border-l border-blue-500"><SettingsIcon /></button>
            </div>
          </div>

          <Suspense fallback={<p role="status">Carregando filtros...</p>}>
            <ChamadosFiltersLoader options={options} />
          </Suspense>

          <div data-ui="requests-workspace-view-options" className="my-4 flex flex-wrap items-center justify-end gap-3">
            <ChamadosSort />
          </div>

          <ChamadosKanbanBoard />
        </div>
      </section>
    </ChamadosProvider>
  );
}

function SettingsIcon() { return <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7-.7-2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z"/></svg>; }
