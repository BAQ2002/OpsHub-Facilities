"use client";

import { useState, useTransition } from "react";
import DateRange, { type DateRangeValue } from "@/shared/DateRange";
import type { ChecklistDefinition } from "@/src/domain/entities/checklist";
import type { RequestBoardPageViewModel } from "@/src/presentation/view-models/request-board-view-model";
import { TrackingTabs } from "@/shared/TrackingTabs";
import { filterRequestBoard } from "../actions";
import { RequestBoard } from "./RequestBoard";

type Executor = { id: number; name: string };

export function RequestsWorkspace({ initialData, initialRange, executors, checklistDefinitions }: { initialData: RequestBoardPageViewModel; initialRange: DateRangeValue; executors: Executor[]; checklistDefinitions: ChecklistDefinition[] }) {
  const [data, setData] = useState(initialData);
  const [range, setRange] = useState(initialRange);
  const [isPending, startTransition] = useTransition();

  function applyFilters() {
    startTransition(async () => setData(await filterRequestBoard(range)));
  }

  return (
    <section className="min-h-screen bg-[#eef4ff] p-4 text-slate-700 md:p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="flex items-start justify-between border-b border-slate-300/70">
          <TrackingTabs active="requests" />
          <div className="flex overflow-hidden rounded-lg border border-blue-500 bg-white text-blue-600">
            <IconButton label="Baixar chamados"><DownloadIcon /></IconButton>
            <IconButton label="Configurações" divider><SettingsIcon /></IconButton>
          </div>
        </div>

        <section className="mt-5 flex flex-wrap items-center gap-3 rounded-md bg-white/80 px-4 py-3" aria-label="Busca de chamados">
          <DateRange {...range} disabled={isPending} onChange={setRange} />
          <label className="min-w-64 flex-1 text-xs font-medium uppercase text-slate-500">
            <span className="sr-only">Buscar chamado</span>
            <input className="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="BUSCAR CHAMADO" />
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-500 bg-white px-6 py-3 text-sm text-blue-600" type="button"><FilterIcon /> Filtros</button>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-8 py-3 text-sm font-semibold text-white disabled:opacity-60" type="button" disabled={isPending} onClick={applyFilters}><SearchIcon /> {isPending ? "Buscando..." : "Buscar"}</button>
        </section>

        <div className="my-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex overflow-hidden rounded border border-slate-300">
            <button className="bg-blue-100 px-5 py-2 text-blue-600" type="button" aria-label="Visualização em quadro"><BoardIcon /></button>
            <button className="border-l border-slate-300 bg-white px-5 py-2 text-slate-500" type="button" aria-label="Visualização em lista"><ListIcon /></button>
          </div>
          <label className="flex items-center gap-6 text-sm text-slate-500">Ordenar por:<select className="min-w-48 border-b border-slate-300 bg-transparent px-2 py-2 outline-none" defaultValue="recent"><option value="recent">Últimos Chamados</option></select></label>
        </div>

        {data.columns.length > 0 ? <RequestBoard columns={data.columns} executors={executors} checklistDefinitions={checklistDefinitions} /> : <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">Nenhum chamado encontrado no período selecionado.</p>}
      </div>
    </section>
  );
}

function IconButton({ label, divider, children }: { label: string; divider?: boolean; children: React.ReactNode }) { return <button type="button" aria-label={label} className={`flex h-9 w-11 items-center justify-center ${divider ? "border-l border-blue-500" : ""}`}>{children}</button>; }
const icon = "h-[18px] w-[18px]";
function DownloadIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 18v3h14v-3" /></svg>; }
function SettingsIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7-.7-2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z"/></svg>; }
function FilterIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M4 5h16l-6 7v6l-4 2v-8z"/></svg>; }
function SearchIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg>; }
function BoardIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="3" y="3" width="18" height="18"/><path d="M9 3v18m6-18v18"/></svg>; }
function ListIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="3" y="4" width="18" height="16"/><path d="M3 9h18M3 14h18M9 4v16"/></svg>; }
