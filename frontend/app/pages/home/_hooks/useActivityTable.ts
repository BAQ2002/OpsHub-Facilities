"use client";
import { connectionFailure, httpFailure, type ApiFailure } from "@/app/entities/api/api-result";
import { useEffect, useState } from "react";
import type { ActivityPage } from "@/app/entities/navigation_entities/home_viewModels";
import { readActivityPagination, saveActivityPagination } from "../_lib/activity-pagination";

type Pagination = { page: number; pageSize: number };
export type ActivityTableFilters = {
  startDate: string;
  endDate: string;
  statuses: string[];
  selectedBusiness: string;
};

/** Consulta atividades e mantém a paginação associada aos filtros. */
export function useActivityTable({ startDate, endDate, statuses, selectedBusiness }: ActivityTableFilters) {
  const filterKey = JSON.stringify([startDate, endDate, statuses, selectedBusiness]);
  const [query, setQuery] = useState<Pagination | null>(null);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ key: string; data?: ActivityPage; error?: ApiFailure } | null>(null);
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
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          if (!controller.signal.aborted) setResult({ key: requestKey, error: body?.error?.message ? body.error : httpFailure(response.status) });
          return;
        }
        const page: ActivityPage = await response.json();
        if (!controller.signal.aborted) {
          saveActivityPagination(filterKey, { page: page.page, pageSize: page.pageSize });
          setResult({ key: requestKey, data: page });
        }
      } catch {
        if (!controller.signal.aborted) setResult({ key: requestKey, error: connectionFailure });
      }
    }
    void load();
    return () => controller.abort();
  }, [startDate, endDate, statuses, selectedBusiness, filterKey, query, requestKey]);

  return { data, error, loading, query, setQuery, retry: () => setRetry((value) => value + 1) };
}
