export const activityCategories = [
  "Artífice",
  "Civil",
  "Copa e Café",
  "Elétrica",
  "Hidráulica",
  "Jardinagem",
  "Refrigeração",
  "Limpeza",
] as const;

export type ActivityCategory = (typeof activityCategories)[number];

export type ActivityType = "Atividade no Pátio" | "Chamado";

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
  plannedAt: string;
  description: string;
  mapPosition: {
    x: number;
    y: number;
  };
};
