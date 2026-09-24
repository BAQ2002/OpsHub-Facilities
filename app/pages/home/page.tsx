import { HandlingTimeDisplay } from "@/app/componentes/HandlingTimeDisplay";
import Link from "next/link";
import FacilitiesMap from "./_components/FacilitiesMap";
import { cookies } from "next/headers";
import HomeDateRange from "./_components/HomeDateRange";

import { getHomePageData } from "@/app/services/home-service";
import { activityStatuses } from "@/app/entities/navigation_entities/home_viewModels";

type HomeSearchParams = {
  startDate?: string;
  endDate?: string;
  status?: string | string[];
  business?: string;
};

/**
 * Acionada pelo Next.js durante a renderização da rota correspondente.
 *
 * Renderiza o componente Home com os dados recebidos.
 * Durante o fluxo, aciona {@link normalizeStatuses}, {@link slice}, {@link toISOString}, {@link getHomePageData} e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
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
    equipmentCards,
    totals,
    mapImage,
    activityMarkers,
    plannedRequestFilterOptions,
    averageHandlingTimeClock,
    activityRecords,
    categoryStyleMap,
  } = await getHomePageData(dateRange, selectedBusiness);
  const filteredActivityRecords = selectedBusiness === "all"
    ? activityRecords
    : activityRecords.filter((record) => record.businessUnit === selectedBusiness);

  return (
    <section data-ui="facilities-home-page" className="min-h-screen bg-white px-5 pb-8 pt-6 text-slate-950 md:px-8 lg:px-9">
      <div data-ui="facilities-home-content" className="mx-auto max-w-[1620px]">
        <header data-ui="facilities-home-header" className="mb-[18px] grid grid-cols-[1fr_auto] items-start gap-4 pt-2">
          <h1 className="mt-[57px] text-[26px] font-bold leading-none tracking-[-0.03em] text-slate-950">
            Facilities
          </h1>

          <div data-ui="facilities-home-controls" className="flex flex-col items-end gap-[22px]">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-base shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
              type="button"
              aria-label="Alternar tema"
            >
              🌙
            </button>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <button
                className="flex h-8 w-8 items-center justify-center text-lg leading-none text-slate-500"
                type="button"
                aria-label="Atualizar"
              >
                ↻
              </button>

              <select
                className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
                aria-label="Intervalo de atualização"
                defaultValue="5 min"
              >
                <option value="5 min">5 min</option>
                <option value="10 min">10 min</option>
                <option value="30 min">30 min</option>
              </select>
            </div>
          </div>
        </header>

        <section data-ui="facilities-home-overview" className="mb-4 space-y-3">
          <div data-ui="facilities-home-date-filter" className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center gap-2">
              <HomeDateRange startDate={dateRange.startDate} endDate={dateRange.endDate} statuses={effectiveStatuses} selectedBusiness={selectedBusiness} />

            </div>
          </div>

          <div data-ui="facilities-home-summary" className="grid gap-3 lg:grid-cols-3">
            <div data-ui="facilities-summary-cards" className="lg:col-span-2 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  value={String(totals.Completed)}
                  label="Concluídas"
                  bg="bg-emerald-50"
                  color="text-emerald-600"
                />
                <SummaryCard
                  value={String(totals.InProgress)}
                  label="Em andamento"
                  bg="bg-amber-50"
                  color="text-yellow-500"
                />
                <SummaryCard
                  value={String(totals.Planned)}
                  label="Programadas"
                  bg="bg-blue-50"
                  color="text-blue-600"
                />
                <HandlingTimeDisplay
                  displayValue={averageHandlingTimeClock.display}
                  caption={averageHandlingTimeClock.caption}
                />
              </div>
            </div>

            <div data-ui="facilities-quick-actions" className="lg:col-span-1 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
              <div className="grid gap-3 sm:grid-cols-1">
                <ActionCard
                  href="/pages/solicitar-atividade"
                  label="Nova solicitação"
                />
                <ActionCard
                  href="/pages/minhas-solicitacoes"
                  label="Minhas requests"
                />
              </div>
            </div>
          </div>
        </section>

        <section data-ui="equipment-summary" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9">
          {equipmentCards.map((card) => (
            <article
              data-ui="equipment-card"
              key={card.title}
              className="min-h-[132px] rounded-2xl border border-slate-200 bg-white px-2.5 py-3 shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
            >
              <div className="flex items-center justify-start gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: card.categoryStyle.backgroundColor }}
                  aria-hidden="true"
                >
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: card.categoryStyle.color }} />
                </div>

                <h3 className="min-w-0 whitespace-nowrap text-[13px] font-bold leading-tight text-slate-950">
                  {card.title}
                </h3>
              </div>

              <div className="mt-3">
                <dl className="space-y-2 text-sm">
                  <Metric
                    label="Programadas"
                    value={card.Planned}
                    valueClass="text-emerald-600"
                  />
                  <Metric
                    label="Em andamento"
                    value={card.InProgress}
                    valueClass="text-yellow-500"
                  />
                  <Metric
                    label="Concluídas"
                    value={card.Completed}
                    valueClass="text-blue-500"
                  />
                </dl>
              </div>
            </article>
          ))}
        </section>

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

          <FacilitiesMap image={mapImage} markers={activityMarkers} />

          <div
            data-ui="activity-record-filters"
            className="mt-4 flex flex-wrap items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
            aria-label="Filtros de business das requests planejadas"
          >
            <span className="mr-1 text-xs font-medium text-slate-500">
              Mostrar:
            </span>
            {plannedRequestFilterOptions.map((option) => (
              <Link
                key={option.label}
                href={buildBusinessFilterHref(resolvedSearchParams, option.value)}
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
                      defaultChecked={effectiveStatuses.includes(status)}
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
          
          <div data-ui="activity-records" className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <form id="activity-filters" method="get">
              {selectedBusiness !== "all" && (
                <input type="hidden" name="business" value={selectedBusiness} />
              )}
            </form>
            <div
              id="minhas-solicitacoes"
              className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"
            >
              <div>
                <h3 className="text-sm font-bold leading-tight text-slate-950">
                  Atividades
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Filtre pelo período, status da atividade e unidade de negócio
                </p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                {filteredActivityRecords.length} requests
              </span>
            </div>

            <div data-ui="activity-records-table" className="overflow-x-auto">
              <table className="min-w-[900px] w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.02em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Request type</th>
                    <th className="px-4 py-3">Unidade</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Service category</th>
                    <th className="px-4 py-3">Service type</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Data do status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {filteredActivityRecords.map((record) => (
                    <tr
                      key={record.id}
                      className={
                        record.activityType === "Atividade no Pátio"
                          ? "bg-teal-50/30"
                          : "bg-white"
                      }
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-950">
                        {record.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={
                            record.activityType === "Atividade no Pátio"
                              ? "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700"
                              : "rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700"
                          }
                        >
                          {record.activityType}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {record.businessUnit}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {record.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200"
                          style={{ backgroundColor: (categoryStyleMap[String(record.categoryId)] ?? categoryStyleMap.default).backgroundColor }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor:
                                (categoryStyleMap[String(record.categoryId)] ?? categoryStyleMap.default).color,
                            }}
                            aria-hidden="true"
                          />
                          {record.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {record.serviceType}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                        {record.location}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {record.statusDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

/**
 * Acionada pelos módulos que importam esta função ou pelo fluxo interno deste arquivo.
 *
 * Build business filter href para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link set}, {@link normalizeParam}, {@link append}, {@link toString}.
 *
 * @param searchParams Dados necessários para executar esta função.
 * @param business Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function buildBusinessFilterHref(
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

/**
 * Acionada pelos módulos que importam esta função ou pelo fluxo interno deste arquivo.
 *
 * Normalize param para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link isArray}.
 *
 * @param value Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function normalizeParam(value: string | string[] | undefined) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Acionada pelos módulos que importam esta função ou pelo fluxo interno deste arquivo.
 *
 * Normalize statuses para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link normalizeParam}, {@link filter}, {@link includes}.
 *
 * @param value Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function normalizeStatuses(value: string | string[] | undefined) {
  const values = normalizeParam(value);

  return activityStatuses.filter((status) => values.includes(status));
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente SummaryCard com os dados recebidos.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function SummaryCard({
  value,
  label,
  bg,
  color,
  raised = false,
}: {
  value: string;
  label: string;
  bg: string;
  color: string;
  raised?: boolean;
}) {
  return (
    <div
      className={`flex min-h-[76px] flex-col items-center justify-center rounded-xl ${bg} px-6 py-4 text-center ${
        raised ? "shadow-[0_2px_12px_rgba(225,29,72,0.16)]" : ""
      }`}
    >
      <p className={`text-[25px] font-bold leading-none ${color}`}>{value}</p>
      <p className="mt-2 text-[11px] leading-none text-slate-500">{label}</p>
    </div>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente ActionCard com os dados recebidos.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function ActionCard({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="flex min-h-[53px] items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-bold text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:bg-slate-50"
      href={href}
    >
      {label}
    </Link>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente Metric com os dados recebidos.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function Metric({
  label,
  value,
  valueClass = "text-slate-950",
  bordered = false,
}: {
  label: string;
  value: number;
  valueClass?: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        bordered ? "border-t border-slate-100 pt-2" : ""
      }`}
    >
      <dt className="text-slate-500">{label}</dt>
      <dd className={`font-semibold ${valueClass}`}>{value}</dd>
    </div>
  );
}
