"use client";

import { useEffect, useRef, useState, useTransition } from "react";

/** Debounces text edits and ignores results for superseded filters. */
export function useAutomaticFilters<F, D>(initialFilters: F, initialData: D, query: (filters: F) => Promise<D>) {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState("");
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
    setError("");
    startTransition(async () => {
      try {
        const result = await query(next);
        if (request === revision.current) setData(result);
      } catch {
        if (request === revision.current) {
          submitted.current = "";
          setError("Não foi possível atualizar os resultados. Tente novamente.");
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

  return { filters, data, error, isPending, update, apply };
}
