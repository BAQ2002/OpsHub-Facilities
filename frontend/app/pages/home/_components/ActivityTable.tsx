"use client";

import { useEffect, useState } from "react";
import type { ActivityCategoryStyle, ActivityPage } from "@/app/entities/navigation_entities/home_viewModels";
import { readActivityPagination, saveActivityPagination } from "./activity-pagination";

type Pagination = { page: number; pageSize: number };
type Props = {
  startDate: string;
  endDate: string;
  statuses: string[];
  selectedBusiness: string;
  categoryStyleMap: Record<string, ActivityCategoryStyle>;
};

export default function ActivityTable({ startDate, endDate, statuses, selectedBusiness, categoryStyleMap }: Props) {
  const filterKey = JSON.stringify([startDate, endDate, statuses, selectedBusiness]);
  const [query, setQuery] = useState<Pagination | null>(null);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ key: string; data?: ActivityPage; error?: boolean } | null>(null);
  const requestKey = JSON.stringify([filterKey, query, retry]);
  const current = result?.key === requestKey ? result : null;
  const data = current?.data;
  const error = current?.error;
  const loading = !current;

  useEffect(() => {
    let active = true;
    // Restore only after hydration; restricted/corrupt storage falls back to page 1.
    Promise.resolve().then(() => {
      if (active) setQuery(readActivityPagination(filterKey));
    });
    return () => { active = false; };
  }, [filterKey]);

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate, page: String(query.page), page_size: String(query.pageSize) });
    statuses.forEach((status) => params.append("status", status));
    if (selectedBusiness !== "all") params.set("business_name", selectedBusiness);
    saveActivityPagination(filterKey, query);
    async function load() {
      try {
        const response = await fetch(`/api/home/activities?${params}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Falha ao carregar atividades");
        const page: ActivityPage = await response.json();
        if (!controller.signal.aborted) {
          saveActivityPagination(filterKey, { page: page.page, pageSize: page.pageSize });
          setResult({ key: requestKey, data: page });
        }
      } catch {
        if (!controller.signal.aborted) setResult({ key: requestKey, error: true });
      }
    }
    void load();
    return () => controller.abort();
  }, [startDate, endDate, statuses, selectedBusiness, filterKey, query, requestKey]);

  return (
    <div aria-busy={loading} data-ui="activity-records" className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">

      <div
        id="minhas-solicitacoes"
        className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"
      >
        <div>
          <h3 className="text-sm font-bold leading-tight text-slate-950">
            Atividades
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Filtre pelo período, status da atividade e unidade de negócio
          </p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          {data ? `${data.total} solicitações` : error ? "Indisponível" : "Carregando..."}
        </span>
      </div>

      {error && <div role="alert" className="px-4 py-3 text-sm text-red-700">
        Não foi possível carregar as atividades. <button type="button" className="underline" onClick={() => setRetry((value) => value + 1)}>Tentar novamente</button>
      </div>}
      <p role="status" className="px-4 pt-2 text-xs text-slate-500">{loading ? "Carregando atividades..." : ""}</p>
      <div data-ui="activity-records-table" className="overflow-x-auto">
        <table className="min-w-[900px] w-full border-collapse text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.02em] text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Tipo de solicitação</th>
              <th className="px-4 py-3">Unidade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Categoria de serviço</th>
              <th className="px-4 py-3">Service type</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Data do status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {(data?.items ?? []).map((record) => (
              <tr
                key={record.id}
                className={
                  record.activityType === "Atividade no Pátio"
                    ? "bg-teal-50/30"
                    : "bg-white"
                }
              >
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-950">
                  {record.id}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={
                      record.activityType === "Atividade no Pátio"
                        ? "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700"
                        : "rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700"
                    }
                  >
                    {record.activityType}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {record.businessUnit}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {record.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200"
                    style={{ backgroundColor: (categoryStyleMap[String(record.categoryId)] ?? categoryStyleMap.default).backgroundColor }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          (categoryStyleMap[String(record.categoryId)] ?? categoryStyleMap.default).color,
                      }}
                      aria-hidden="true"
                    />
                    {record.category}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {record.serviceType}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                  {record.location}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {record.statusDate}
                </td>
              </tr>
            ))}
            {!loading && !error && data?.total === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Nenhuma atividade encontrada para os filtros selecionados.</td></tr>}
          </tbody>
        </table>
      </div>
      <nav aria-label="Paginação das atividades" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
        <label className="flex items-center gap-2">
          Linhas por página
          <select aria-label="Linhas por página" value={query?.pageSize ?? 30} disabled={loading} onChange={(event) => setQuery({ page: 1, pageSize: Number(event.target.value) })} className="rounded border border-slate-300 p-2">
            {[30, 60, 90].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        <span>{data ? `Exibindo ${data.total ? (data.page - 1) * data.pageSize + 1 : 0}–${Math.min(data.page * data.pageSize, data.total)} de ${data.total} atividades` : ""}</span>
        <div className="flex items-center gap-3">
          <button type="button" disabled={loading || !data || data.page <= 1} onClick={() => setQuery({ page: (data?.page ?? 1) - 1, pageSize: query?.pageSize ?? 30 })} className="rounded border border-slate-300 px-3 py-2 disabled:opacity-40">Anterior</button>
          <span>Página {data?.page ?? 1} de {Math.max(1, Math.ceil((data?.total ?? 0) / (data?.pageSize ?? 30)))}</span>
          <button type="button" disabled={loading || !data || data.page * data.pageSize >= data.total} onClick={() => setQuery({ page: (data?.page ?? 1) + 1, pageSize: query?.pageSize ?? 30 })} className="rounded border border-slate-300 px-3 py-2 disabled:opacity-40">Próxima</button>
        </div>
      </nav>
    </div>
  );
}
