import "server-only";

import type { ActivityTrackingData } from "@/src/domain/entities/dashboard";

const categoryData = [
  { label: "Manutenção", value: 42, color: "#14b8a6" },
  { label: "Limpeza", value: 28, color: "#38bdf8" },
  { label: "Copa e café", value: 16, color: "#f59e0b" },
  { label: "Apoio operacional", value: 14, color: "#8b5cf6" },
];

const statusData = [
  { label: "Abertos", value: 37, color: "#f97316" },
  { label: "Em atendimento", value: 21, color: "#0ea5e9" },
  { label: "Fechados", value: 63, color: "#84cc16" },
];

const monthlyData = [
  { month: "Jan", open: 18, closed: 22 },
  { month: "Fev", open: 24, closed: 20 },
  { month: "Mar", open: 20, closed: 27 },
  { month: "Abr", open: 32, closed: 26 },
  { month: "Mai", open: 28, closed: 34 },
  { month: "Jun", open: 22, closed: 31 },
  { month: "Jul", open: 35, closed: 30 },
  { month: "Ago", open: 27, closed: 36 },
  { month: "Set", open: 30, closed: 32 },
  { month: "Out", open: 25, closed: 38 },
  { month: "Nov", open: 21, closed: 35 },
  { month: "Dez", open: 19, closed: 33 },
];

const summaryCards = [
  { label: "Chamados no período", value: "121", detail: "+8% vs. período anterior", color: "text-teal-600", bg: "bg-teal-50" },
  { label: "Em atendimento", value: "21", detail: "Equipes acionadas", color: "text-sky-600", bg: "bg-sky-50" },
  { label: "SLA médio", value: "2h 18min", detail: "Meta operacional: 3h", color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Pendentes críticos", value: "7", detail: "Prioridade alta", color: "text-orange-600", bg: "bg-orange-50" },
];


export async function findActivityTrackingData(): Promise<ActivityTrackingData> {
  return {
    categoryData,
    statusData,
    monthlyData,
    summaryCards,
    filterOptions: { businesses: [], serviceCategories: [] },
  };
}
