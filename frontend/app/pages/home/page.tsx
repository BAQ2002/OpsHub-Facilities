import { DataUnavailable } from "@/app/componentes/DataUnavailable";
import { AvailabilityNotice } from "@/app/componentes/AvailabilityNotice";
import { cookies } from "next/headers";
import { getHomePageData } from "@/app/services/home-service";
import { activityStatuses } from "@/app/entities/navigation_entities/home_viewModels";
import { normalizeStatuses, type HomeSearchParams } from "./_lib/home-filters";
import { HomeHeader } from "./_components/HomeHeader";
import { HomeSummary } from "./_components/HomeSummary";
import { HomeQuickActions } from "./_components/HomeQuickActions";
import { EquipmentSummary } from "./_components/EquipmentSummary";
import { ActivityFilters } from "./_components/ActivityFilters";
import FacilitiesMap from "./_components/FacilitiesMap";
import ActivityTable from "./_components/ActivityTable";
import HomeDateRange from "./_components/HomeDateRange";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<HomeSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const selectedStatuses = normalizeStatuses(resolvedSearchParams?.status);
  const effectiveStatuses = selectedStatuses.length
    ? selectedStatuses
    : [...activityStatuses];
  const selectedBusiness = resolvedSearchParams?.business ?? "all";
  const today = new Date().toISOString().slice(0, 10);
  const dateRange = {
    startDate: cookieStore.get("facilities-start-date")?.value ?? today,
    endDate: cookieStore.get("facilities-end-date")?.value ?? today,
    statuses: effectiveStatuses,
  };

  const {
    metrics,
    mapImage,
    activityMarkers,
    plannedRequestFilterOptions,
    categoryStyleMap,
  } = await getHomePageData(dateRange, selectedBusiness);

  return (
    <section data-ui="facilities-home-page" className="min-h-screen bg-white px-5 pb-8 pt-6 text-slate-950 md:px-8 lg:px-9">
      <div data-ui="facilities-home-content" className="mx-auto max-w-[1620px]">
        <HomeHeader />
        {(!metrics.ok || !activityMarkers.ok || !plannedRequestFilterOptions.ok) && <AvailabilityNotice />}

        <section data-ui="facilities-home-overview" className="mb-4 space-y-3">
          <div data-ui="facilities-home-date-filter" className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center gap-2">
              <HomeDateRange startDate={dateRange.startDate} endDate={dateRange.endDate} statuses={effectiveStatuses} selectedBusiness={selectedBusiness} />

            </div>
          </div>

          <div data-ui="facilities-home-summary" className="grid gap-3 lg:grid-cols-3">
            {metrics.ok ? <HomeSummary totals={metrics.data.totals} averageHandlingTimeClock={metrics.data.averageHandlingTimeClock} /> : <DataUnavailable error={metrics.error} />}

            <HomeQuickActions />
          </div>
        </section>

        {metrics.ok ? <EquipmentSummary equipmentCards={metrics.data.equipmentCards} /> : <section aria-label="Indicadores por equipamento"><DataUnavailable error={metrics.error} /></section>}

        <section
          data-ui="facilities-map-section"
          className="mt-4 rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_1px_4px_rgba(15,23,42,0.08)]"
          aria-labelledby="map-title"
        >
          <h2
            id="map-title"
            className="mb-2 px-1 text-sm font-bold leading-tight text-slate-950"
          >
            TECON Salvador - Solicitações Facilities
          </h2>

          <FacilitiesMap image={mapImage} markers={activityMarkers.ok ? activityMarkers.data : []} />
          {!activityMarkers.ok && <DataUnavailable error={activityMarkers.error} />}

          {plannedRequestFilterOptions.ok ? <ActivityFilters searchParams={resolvedSearchParams} options={plannedRequestFilterOptions.data} statuses={effectiveStatuses} selectedBusiness={selectedBusiness} /> : <DataUnavailable error={plannedRequestFilterOptions.error} />}
          <ActivityTable
            key={JSON.stringify([dateRange.startDate, dateRange.endDate, effectiveStatuses, selectedBusiness])}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            statuses={effectiveStatuses}
            selectedBusiness={selectedBusiness}
            categoryStyleMap={categoryStyleMap}
          />
        </section>
      </div>
    </section>
  );
}
