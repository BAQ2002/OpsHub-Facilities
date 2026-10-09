import Link from "next/link";
import { activityStatuses, type PlannedRequestFilterViewModel, type ActivityStatus } from "@/app/entities/navigation_entities/home_viewModels";
import { buildBusinessFilterHref, type HomeSearchParams } from "../_lib/home-filters";

export function ActivityFilters({ searchParams, options, statuses, selectedBusiness }: {
  searchParams?: HomeSearchParams;
  options: PlannedRequestFilterViewModel[];
  statuses: readonly ActivityStatus[];
  selectedBusiness: string;
}) {
  return (
    <>
      <div
        data-ui="activity-record-filters"
        className="mt-4 flex flex-wrap items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
        aria-label="Filtros de unidades de negócio das solicitações planejadas"
      >
        <span className="mr-1 text-xs font-medium text-slate-500">
          Mostrar:
        </span>
        {options.map((option) => (
          <Link
            key={option.label}
            href={buildBusinessFilterHref(searchParams, option.value)}
            scroll={false}
            aria-current={option.isActive ? "true" : undefined}
            className={
              option.isActive
                ? "rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700"
                : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
            }
          >
            {option.label} ({option.count})
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">
            Status:
          </span>
          <fieldset
            aria-label="Status"
            className="flex min-h-8 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
          >
            {activityStatuses.map((status) => (
              <label key={status} className="flex items-center gap-1.5 whitespace-nowrap">
                <input
                  form="activity-filters"
                  name="status"
                  type="checkbox"
                  value={status}
                  defaultChecked={statuses.includes(status)}
                  className="h-3.5 w-3.5 accent-slate-900"
                />
                <span>{status}</span>
              </label>
            ))}
          </fieldset>
          <button
            form="activity-filters"
            type="submit"
            className="h-8 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white"
          >
            Aplicar
          </button>
        </div>
      </div>
      <form id="activity-filters" method="get">
        {selectedBusiness !== "all" && (
          <input type="hidden" name="business" value={selectedBusiness} />
        )}
      </form>
    </>
  );
}
