import { activityStatuses } from "@/app/entities/navigation_entities/home_viewModels";

export type HomeSearchParams = {
  startDate?: string;
  endDate?: string;
  status?: string | string[];
  business?: string;
};

export function buildBusinessFilterHref(
  searchParams: HomeSearchParams | undefined,
  business: string,
) {
  const params = new URLSearchParams();

  for (const status of normalizeParam(searchParams?.status)) {
    params.append("status", status);
  }
  if (business !== "all") params.set("business", business);

  const query = params.toString();
  return query ? `/pages/home?${query}` : "/pages/home";
}

function normalizeParam(value: string | string[] | undefined) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function normalizeStatuses(value: string | string[] | undefined) {
  const values = normalizeParam(value);

  return activityStatuses.filter((status) => values.includes(status));
}
