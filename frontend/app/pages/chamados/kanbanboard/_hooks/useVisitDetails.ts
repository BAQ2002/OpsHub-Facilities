"use client";
import { useCallback } from "react";
import { loadVisitDetails } from "../actions";
import { useAsyncResource } from "./useAsyncResource";
import { useChamados } from "./useChamados";

export function useVisitDetails(visitId: number, requestId: number) {
  const { appliedFilters } = useChamados();
  const load = useCallback(() => loadVisitDetails(visitId, requestId, appliedFilters), [visitId, requestId, appliedFilters]);
  return useAsyncResource(load);
}
