"use client";
import { useEffect, useMemo, useState } from "react";
import type { ApiFailure } from "@/app/entities/api/api-result";
import type { RequestBoardPageViewModel } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";
import type { RequestBoardFilters } from "@/app/services/request-board-service";
import { loadRequestBoardColumn } from "../actions";
import { createColumnWindowLoader } from "../_lib/column-window-loader";

function initialState(source: RequestBoardPageViewModel) {
  return { source, version: 0, columns: source.columns.map((column) => ({ ...column, pending: false,
    error: null as ApiFailure | null, requestedOffset: column.offset })) };
}

export function useRequestBoardWindows(source: RequestBoardPageViewModel, filters: RequestBoardFilters) {
  const [state, setState] = useState(() => initialState(source));
  // Reset each window when filters or refreshed board data produce a new dataset.
  if (state.source !== source) setState({ ...initialState(source), version: state.version + 1 });
  const loader = useMemo(() => createColumnWindowLoader(
    (id, offset) => loadRequestBoardColumn(filters, id, offset),
    (id, update) => setState((previous) => previous.source !== source ? previous : ({ ...previous,
      columns: previous.columns.map((column) => column.id !== id ? column : { ...column,
        ...update.data, pending: update.pending, error: update.error }),
    })),
  ), [source, filters]);
  useEffect(() => { loader.activate(); return () => loader.dispose(); }, [loader]);

  function request(id: number, offset: number) {
    setState((previous) => previous.columns.find((column) => column.id === id)?.requestedOffset === offset
      ? previous : ({ ...previous, columns: previous.columns.map((column) => column.id === id
        ? { ...column, requestedOffset: offset } : column) }));
    loader.request(id, offset);
  }

  return { columns: state.source === source ? state.columns : initialState(source).columns,
    version: state.version, request };
}
