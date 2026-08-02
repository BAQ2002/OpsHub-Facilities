export const activityCategoryByServiceCategoryId = {
  1: "ARTÍFICE",
  2: "CLIMATIZAÇÃO E REFRIGERAÇÃO",
  3: "COPA",
  4: "INSTALAÇÕES ELÉTRICAS",
  5: "INSTALAÇÕES HIDRÁULICAS",
  6: "JARDINAGEM",
  7: "MANUTENÇÃO CIVIL",
  8: "NOVOS PROJETOS",
  9: "PINTURA DE SINALIZAÇÃO DE SEGURANÇA/OPERACIONAL/PREDIAL/METÁLICA",
  10: "PMOC",
} as const;

export const activityCategories = Object.values(activityCategoryByServiceCategoryId);

export type ActivityCategory = (typeof activityCategories)[number];

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
  category: ActivityCategory;
  serviceType: string;
  location: string;
  status: ActivityStatus;
  statusDate: string;
  plannedAt: string;
  description: string;
  mapPosition: {
    x: number;
    y: number;
  };
};
