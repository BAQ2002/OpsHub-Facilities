"use client";

import { connectionFailure, type ApiResult, type ApiFailure } from "@/app/entities/api/api-result";
import { useEffect, useRef, useState, useTransition } from "react";

/** Debounces text edits and ignores results for superseded filters. */
export function useAutomaticFilters<F, D>(initialFilters: F, initialData: ApiResult<D>, query: (filters: F) => Promise<ApiResult<D>>) {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [data, setData] = useState<D | null>(initialData.ok ? initialData.data : null);
  const [error, setError] = useState<ApiFailure | null>(initialData.ok ? null : initialData.error);
  const [previousInitial, setPreviousInitial] = useState(initialData);
  if (previousInitial !== initialData) {
    setPreviousInitial(initialData);
    if (JSON.stringify(filters) === JSON.stringify(initialFilters)) {
      setData(initialData.ok ? initialData.data : null);
      setError(initialData.ok ? null : initialData.error);
    }
  }
  const [isPending, startTransition] = useTransition();
  const current = useRef(initialFilters);
  const revision = useRef(0);
  const submitted = useRef(JSON.stringify(initialFilters));
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => { clearTimeout(timer.current); revision.current++; }, []);

  function apply() {
    clearTimeout(timer.current);
    const next = current.current;
    const key = JSON.stringify(next);
    if (key === submitted.current) return;
    submitted.current = key;
    const request = revision.current;
    startTransition(async () => {
      try {
        const result = await query(next);
        if (request === revision.current) {
          if (result.ok) {
            setError(null);
            setData(result.data);
            setAppliedFilters(next);
          } else {
            submitted.current = "";
            setError(result.error);
          }
        }
      } catch {
        if (request === revision.current) {
          submitted.current = "";
          setError(connectionFailure);
        }
      }
    });
  }

  function update(next: F, delay = 0) {
    clearTimeout(timer.current);
    if (JSON.stringify(next) !== JSON.stringify(current.current)) {
      revision.current++;
      // A pending response for the previous selection must never be reused.
      submitted.current = "";
    }
    current.current = next;
    setFilters(next);
    if (delay) timer.current = setTimeout(apply, delay);
    else apply();
  }

  function refresh() {
    revision.current++;
    submitted.current = "";
    apply();
  }

  return { filters, appliedFilters, data, error, isPending, update, apply, refresh };
}
