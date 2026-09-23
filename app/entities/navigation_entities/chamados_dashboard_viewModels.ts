import { getServiceCategoryStyle, type ServiceCategoryStyle } from "./service_category_styles";

export type ChartItem = {
  label: string;
  value: number;
  color: string;
  backgroundColor?: string;
};

// Correlação do Dashboard: fatias e legendas usam o mesmo ID de categoria da Home.
export type CategoryChartItem = ChartItem & ServiceCategoryStyle & { categoryId: number };

export function mapCategoryChartItem(item: { categoryId: number; label: string; value: number }): CategoryChartItem {
  return { ...item, ...getServiceCategoryStyle(item.categoryId) };
}

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
  categoryData: CategoryChartItem[];
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

export type ActivityTrackingPageViewModel = ActivityTrackingData & {
  maxMonthlyValue: number;
};
