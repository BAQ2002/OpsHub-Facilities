"use client";
import { useState } from "react";
import DateRange from "@/app/componentes/DateRange";
import { MultiSelectFilter, SelectField } from "../../_components/TrackingFilters";
import type { RequestBoardWorkspaceData } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";
import { useChamados } from "../_hooks/useChamados";

export function ChamadosFilters({ filterOptions }: { filterOptions: RequestBoardWorkspaceData["filterOptions"] }) {
  const { data, filters, update, apply, isPending, selectedStatusIds, setSelectedStatusIds } = useChamados();
  const [showStatusFilters, setShowStatusFilters] = useState(false);
  return (
    <section data-ui="requests-workspace-filters" className="relative mt-5 flex flex-wrap items-center gap-2 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]" aria-label="Busca de chamados">
      <DateRange commitOnBlur {...filters} onChange={(range) => update({ ...filters, ...range })} />
      <SelectField label="Unidade de negócio" name="businessId" value={filters.businessId} placeholder="Todas unidades de negócio" options={filterOptions.businesses} onChange={(businessId) => update({ ...filters, businessId })} />
      <MultiSelectFilter label="Categorias de serviço" placeholder="Todas as categorias" options={filterOptions.serviceCategories} value={filters.serviceCategoryIds ?? []} onChange={(serviceCategoryIds) => update({ ...filters, serviceCategoryIds })} />
      <label className="min-w-0 basis-full sm:basis-48 flex-1 text-xs font-medium text-slate-500">
        <span className="sr-only">Buscar chamado</span>
        <input className="h-[30px] w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-950 shadow-sm outline-none focus:ring-2 focus:ring-teal-100" name="search" type="search" value={filters.search} onChange={(event) => update({ ...filters, search: event.target.value }, event.target.value ? 400 : 0)} onBlur={apply} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); apply(); } }} placeholder="BUSCAR CHAMADO" />
      </label>
      <button className="inline-flex h-[30px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-950 shadow-sm" type="button" aria-expanded={showStatusFilters} onClick={() => setShowStatusFilters((visible) => !visible)}><FilterIcon /> Filtros{selectedStatusIds.length ? ` (${selectedStatusIds.length})` : ""}</button>
      <span role="status" className="text-xs text-slate-500">{isPending ? "Atualizando..." : ""}</span>
      {showStatusFilters ? (
        <fieldset className="w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <legend className="px-1 text-xs font-semibold uppercase text-slate-500">Status exibidos</legend>
          <div className="flex flex-wrap gap-4">{data?.columns.map((column) => <label className="flex items-center gap-2 text-sm" key={column.id}><input className="h-4 w-4 accent-blue-600" type="checkbox" checked={selectedStatusIds.includes(column.id)} onChange={() => setSelectedStatusIds((ids) => ids.includes(column.id) ? ids.filter((id) => id !== column.id) : [...ids, column.id])} />{column.title}</label>)}</div>
        </fieldset>
      ) : null}
    </section>
  );
}
const icon = "h-[18px] w-[18px]";

function FilterIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M4 5h16l-6 7v6l-4 2v-8z"/></svg>; }
