"use client";
import { createContext, type Dispatch, type SetStateAction } from "react";
import type { useAutomaticFilters } from "@/app/componentes/useAutomaticFilters";
import type { RequestBoardFilters } from "@/app/services/request-board-service";
import type { RequestBoardPageViewModel } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";
export type ChamadosContextValue = ReturnType<typeof useAutomaticFilters<RequestBoardFilters, RequestBoardPageViewModel>> & {
  selectedStatusIds: number[];
  setSelectedStatusIds: Dispatch<SetStateAction<number[]>>;
};
export const ChamadosContext = createContext<ChamadosContextValue | null>(null);

