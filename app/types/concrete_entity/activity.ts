export type ActivityCategory = string;

export type ActivityCategoryStyle = {
  accent: string;
  iconBg: string;
  color: string;
};

export const defaultActivityCategoryStyle: ActivityCategoryStyle = {
  accent: "text-slate-600",
  iconBg: "bg-slate-100",
  color: "#64748b",
};

export const activityCategoryStylesById: Readonly<Record<number, ActivityCategoryStyle>> = {
  1: { accent: "text-cyan-600", iconBg: "bg-cyan-50", color: "#0891b2" },
  2: { accent: "text-orange-500", iconBg: "bg-orange-50", color: "#f97316" },
  3: { accent: "text-red-500", iconBg: "bg-red-50", color: "#ef4444" },
  4: { accent: "text-yellow-500", iconBg: "bg-yellow-50", color: "#eab308" },
  5: { accent: "text-blue-500", iconBg: "bg-blue-50", color: "#3b82f6" },
  6: { accent: "text-green-500", iconBg: "bg-green-50", color: "#22c55e" },
  7: { accent: "text-violet-500", iconBg: "bg-violet-50", color: "#8b5cf6" },
  8: { accent: "text-indigo-500", iconBg: "bg-indigo-50", color: "#6366f1" },
  9: { accent: "text-rose-500", iconBg: "bg-rose-50", color: "#f43f5e" },
  10: { accent: "text-teal-500", iconBg: "bg-teal-50", color: "#14b8a6" },
};

/**
 * Acionada pelos módulos que importam esta função ou pelo fluxo interno deste arquivo.
 *
 * Obtém activity category style para uso pelo fluxo solicitante.
 *
 * @param categoryId Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getActivityCategoryStyle(categoryId: number | null | undefined): ActivityCategoryStyle {
  if (categoryId === null || categoryId === undefined) return defaultActivityCategoryStyle;
  return activityCategoryStylesById[categoryId] ?? defaultActivityCategoryStyle;
}

export type ActivityType = "Atividade no Pátio" | "Chamado";

export const activityStatuses = [
  "Programada",
  "Em andamento",
  "Concluída",
  "Cancelada",
] as const;

export type ActivityStatus = (typeof activityStatuses)[number];

export type EquipmentCard = {
  title: string;
  accent: string;
  iconBg: string;
  Planned: number;
  InProgress: number;
  Completed: number;
  total?: number;
};

export type MapImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type ActivityRecord = {
  id: string;
  activityType: ActivityType;
  businessUnit: string;
  categoryId: number | null;
  category: ActivityCategory;
  serviceType: string;
  location: string;
  status: ActivityStatus;
  statusDate: string;
  plannedAt: string;
  mapPosition: {
    x: number;
    y: number;
  };
};
