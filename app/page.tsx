import Link from "next/link";
import FacilitiesMap from "./_components/FacilitiesMap";

import { getHomePageData } from "@/src/server/services/home-service";

const sevenSegmentPaths = [
  { id: "a", x: 5, y: 0, width: 18, height: 4 },
  { id: "b", x: 24, y: 4, width: 4, height: 19 },
  { id: "c", x: 24, y: 27, width: 4, height: 19 },
  { id: "d", x: 5, y: 46, width: 18, height: 4 },
  { id: "e", x: 0, y: 27, width: 4, height: 19 },
  { id: "f", x: 0, y: 4, width: 4, height: 19 },
  { id: "g", x: 5, y: 23, width: 18, height: 4 },
] as const;

const sevenSegmentMap: Record<
  string,
  (typeof sevenSegmentPaths)[number]["id"][]
> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "d", "e", "g"],
  "3": ["a", "b", "c", "d", "g"],
  "4": ["b", "c", "f", "g"],
  "5": ["a", "c", "d", "f", "g"],
  "6": ["a", "c", "d", "e", "f", "g"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
};

export default async function Home() {
  const {
    equipmentCards,
    totals,
    mapImage,
    activityMarkers,
    plannedRequestFilterOptions,
    averageSlaClock,
    activityRecords,
    categoryColorMap,
  } = await getHomePageData();

  return (
    <section className="min-h-screen bg-[#fbfcfe] px-5 pb-8 pt-6 text-slate-950 md:px-8 lg:px-9">
      <div className="mx-auto max-w-[1620px]">
        <header className="mb-[18px] grid grid-cols-[1fr_auto] items-start gap-4 pt-2">
          <h1 className="mt-[57px] text-[26px] font-bold leading-none tracking-[-0.03em] text-slate-950">
            Facilities
          </h1>

          <div className="flex flex-col items-end gap-[22px]">
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

        <section className="mb-4 space-y-3">
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
                type="button"
                aria-label="Dia anterior"
              >
                <ChevronLeftIcon />
              </button>

              <label className="flex items-center gap-2 text-xs text-slate-500">
                <span>De</span>
                <input
                  aria-label="Data inicial"
                  className="h-[30px] w-[124px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)] [color-scheme:light]"
                  defaultValue="2026-06-05"
                  type="date"
                />
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-500">
                <span>Até</span>
                <input
                  aria-label="Data final"
                  className="h-[30px] w-[124px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)] [color-scheme:light]"
                  defaultValue="2026-06-05"
                  type="date"
                />
              </label>

              <button
                className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
                type="button"
                aria-label="Próximo dia"
              >
                <ChevronRightIcon />
              </button>

              <button
                className="h-[30px] rounded-lg border border-slate-200 bg-white px-4 text-xs text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
                type="button"
              >
                Hoje
              </button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
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
                  label="Planejadas"
                  bg="bg-blue-50"
                  color="text-blue-600"
                />
                <SlaDisplay
                  displayValue={averageSlaClock.display}
                  caption={averageSlaClock.caption}
                />
              </div>
            </div>

            <div className="lg:col-span-1 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
              <div className="grid gap-3 sm:grid-cols-1">
                <ActionCard
                  href="/solicitar-atividade"
                  label="Nova solicitação"
                />
                <ActionCard
                  href="/minhas-solicitacoes"
                  label="Minhas requests"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9">
          {equipmentCards.map((card) => (
            <article
              key={card.title}
              className="min-h-[132px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
            >
              <div className="flex items-center justify-start gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}
                ></div>

                <h3 className="flex items-center justify-start truncate text-base font-bold text-slate-950">
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
                </dl>
              </div>
            </article>
          ))}
        </section>

        <section
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
            className="mt-4 flex flex-wrap items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
            aria-label="Filtros de business das requests planejadas"
          >
            <span className="mr-1 text-xs font-medium text-slate-500">
              Mostrar:
            </span>
            {plannedRequestFilterOptions.map((option) => (
              <span
                key={option.label}
                className={
                  option.isActive
                    ? "rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700"
                    : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                }
              >
                {option.label} ({option.count})
              </span>
            ))}
          </div>
          
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div
              id="minhas-solicitacoes"
              className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"
            >
              <div>
                <h3 className="text-sm font-bold leading-tight text-slate-950">
                  Requests planejadas
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Registros da tabela request distribuídos por request_type
                </p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                {activityRecords.length} requests
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.02em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Request type</th>
                    <th className="px-4 py-3">Business</th>
                    <th className="px-4 py-3">Service category</th>
                    <th className="px-4 py-3">Service type</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Agreed date</th>
                    <th className="px-4 py-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {activityRecords.map((record) => (
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
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor:
                                categoryColorMap[record.category],
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
                        {record.plannedAt}
                      </td>
                      <td className="min-w-[280px] px-4 py-3">
                        {record.description}
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

function SlaDisplay({
  displayValue,
  caption,
}: {
  displayValue: string;
  caption: string;
}) {
  const [hours, minutes] = displayValue.split(":");

  return (
    <section
      className="flex min-h-[118px] flex-col items-center justify-center rounded-xl bg-white px-3 py-2 text-center"
      aria-labelledby="sla-display-title"
    >
      <h2
        id="sla-display-title"
        className="mb-2 text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-[#45628a]"
      >
        Tempo médio de SLA
      </h2>

      <div
        className="flex h-[70px] w-[178px] items-center justify-center rounded-[15px] bg-[#070d14] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
        aria-label={`SLA médio ${caption}`}
        role="img"
      >
        <div className="flex items-center gap-[4.5px]">
          <SevenSegmentDigit value={hours[0]} />
          <SevenSegmentDigit value={hours[1]} />
        </div>
        <BlinkingColon />
        <div className="flex items-center gap-[4.5px]">
          <SevenSegmentDigit value={minutes[0]} />
          <SevenSegmentDigit value={minutes[1]} />
        </div>
      </div>

      <p className="mt-2 text-sm font-semibold leading-none text-[#45628a]">
        {caption}
      </p>
    </section>
  );
}

function BlinkingColon() {
  return (
    <svg
      aria-hidden="true"
      className="mx-[9px] h-[45px] w-[9px] shrink-0 animate-[sla-caret-blink_1s_steps(1,end)_infinite] text-[#08c6e8]"
      fill="currentColor"
      viewBox="0 0 10 50"
    >
      <circle cx="5" cy="16" r="3" />
      <circle cx="5" cy="30" r="3" />
    </svg>
  );
}

function SevenSegmentDigit({ value }: { value: string }) {
  const activeSegments = sevenSegmentMap[value] ?? sevenSegmentMap["0"];

  return (
    <svg
      aria-hidden="true"
      className="h-[45px] w-[25.5px] shrink-0"
      viewBox="0 0 28 50"
    >
      {sevenSegmentPaths.map((segment) => (
        <rect
          key={segment.id}
          x={segment.x}
          y={segment.y}
          width={segment.width}
          height={segment.height}
          rx="1"
          className={
            activeSegments.includes(segment.id)
              ? "fill-[#08c6e8]"
              : "fill-[#0b2938] opacity-80"
          }
        />
      ))}
    </svg>
  );
}

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

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M10 3.5 5.5 8l4.5 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
