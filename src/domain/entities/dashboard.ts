export type ChartItem = {
  label: string;
  value: number;
  color: string;
};

export type MonthlyActivity = {
  month: string;
  open: number;
  closed: number;
};

export type SummaryCard = {
  label: string;
  value: string;
  detail: string;
  color: string;
  bg: string;
};

export type ActivityTrackingData = {
  categoryData: ChartItem[];
  statusData: ChartItem[];
  monthlyData: MonthlyActivity[];
  summaryCards: SummaryCard[];
  filterOptions: {
    businesses: { id: number; name: string }[];
    serviceCategories: { id: number; name: string }[];
  };
};

export type ActivityTrackingFilters = {
  startDate: string;
  endDate: string;
  businessId?: number;
  serviceCategoryId?: number;
};
