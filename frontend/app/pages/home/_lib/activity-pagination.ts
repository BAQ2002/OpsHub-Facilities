const STORAGE_KEY = "facilities-home-pagination";
type Pagination = { page: number; pageSize: number };

export function readActivityPagination(filterKey: string): Pagination {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    return {
      page: saved?.filterKey === filterKey && Number.isInteger(saved.page) && saved.page > 0 && saved.page <= 2147483647 ? saved.page : 1,
      pageSize: [30, 60, 90].includes(saved?.pageSize) ? saved.pageSize : 30,
    };
  } catch {
    return { page: 1, pageSize: 30 };
  }
}

export function saveActivityPagination(filterKey: string, pagination: Pagination) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ filterKey, ...pagination }));
  } catch {
    // Pagination remains usable when browser storage is unavailable.
  }
}
