"use client";
import type { ApiResult } from "@/app/entities/api/api-result";
import { useState, type ReactNode } from "react";
import { useAutomaticFilters } from "@/app/componentes/useAutomaticFilters";
import type { DateRangeValue } from "@/app/componentes/DateRange";
import type { RequestBoardFilters } from "@/app/services/request-board-service";
import type { RequestBoardPageViewModel } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";
import { ChamadosContext } from "../_contexts/ChamadosContext";
import { filterRequestBoard } from "../actions";

/** Compartilha apenas o estado de consulta entre filtros, relatório e quadro. */
export function ChamadosProvider({ initialData, initialRange, children }: {
  initialData: ApiResult<RequestBoardPageViewModel>;
  initialRange: DateRangeValue;
  children: ReactNode;
}) {
  const query = useAutomaticFilters<RequestBoardFilters, RequestBoardPageViewModel>(
    { ...initialRange, search: "" }, initialData, filterRequestBoard,
  );
  const [selectedStatusIds, setSelectedStatusIds] = useState<number[]>([]);
  return <ChamadosContext.Provider value={{ ...query, selectedStatusIds, setSelectedStatusIds }}>{children}</ChamadosContext.Provider>;
}

