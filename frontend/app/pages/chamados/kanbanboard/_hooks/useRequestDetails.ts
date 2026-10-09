"use client";
import { useCallback } from "react";
import { loadRequestDetails } from "../actions";
import { useAsyncResource } from "./useAsyncResource";
import { useChamados } from "./useChamados";

export function useRequestDetails(requestId: number) {
  const { appliedFilters } = useChamados();
  const load = useCallback(() => loadRequestDetails(requestId, appliedFilters), [requestId, appliedFilters]);
  return useAsyncResource(load);
}
