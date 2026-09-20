// Contratos JSON recebidos do backend, antes das transformações de apresentação.
export type ActivityEntity = {
  id: number;
  request_type: string | null;
  business_unit: string | null;
  category_id: number | null;
  category: string | null;
  service: string | null;
  location: string | null;
  status: string | null;
  status_date: string | null;
  agreed_date: string | null;
  map_x: number | null;
  map_y: number | null;
};

export type HomeMetrics = {
  equipment: Array<{
    categoryId: number;
    categoryName: string;
    planned: number;
    inProgress: number;
    completed: number;
  }>;
  handlingMinutes: number[];
};
