import type { ChartItem } from "@/src/domain/entities/dashboard";
import { getActivityTrackingPageData } from "@/src/server/services/activity-tracking-service";
import { TrackingTabs } from "./_components/TrackingTabs";

export default async function ActivityTrackingPage() {
  const { categoryData, statusData, monthlyData, summaryCards, maxMonthlyValue } = await getActivityTrackingPageData();

  return (
    <section className="min-h-screen bg-[#fbfcfe] px-5 pb-8 pt-8 text-slate-950 md:px-8 lg:px-9">
      <div className="mx-auto max-w-[1620px]">
        <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-600">
              Administração
            </p>
            <h1 className="mt-2 text-[26px] font-bold leading-none tracking-[-0.03em] text-slate-950">
              Acompanhamento de requests
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Monitore registros da tabela request por status, service_category e evolução mensal.
            </p>
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center self-start rounded-xl border border-slate-300 bg-white text-base shadow-[0_1px_1px_rgba(15,23,42,0.04)] lg:self-auto"
            type="button"
            aria-label="Alternar tema"
          >
            🌙
          </button>
        </header>

        <div className="mb-3">
          <TrackingTabs active="dashboard" />
        </div>

        <section
          id="requests"
          className="mb-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]"
          aria-label="Filtros de requests"
        >
          <div className="grid gap-3 lg:grid-cols-[170px_1fr_1fr_auto_auto]">
            <FilterField label="Período" value="06/06/2026 - 06/06/2026" />
            <SelectField label="Business" value="Todos os business" />
            <SelectField label="Service category" value="Todas as service_category" />

            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-teal-500 bg-white px-5 text-sm font-semibold text-teal-600 shadow-[0_1px_1px_rgba(15,23,42,0.04)] transition hover:bg-teal-50"
              type="button"
            >
              <FilterIcon />
              Filtros
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-bold text-white shadow-[0_2px_4px_rgba(15,23,42,0.18)] transition hover:bg-teal-700"
              type="button"
            >
              <SearchIcon />
              Buscar
            </button>
          </div>
        </section>

        <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo do período">
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]"
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                <ActivityIcon className={card.color} />
              </div>
              <p className={`text-[25px] font-bold leading-none ${card.color}`}>{card.value}</p>
              <h2 className="mt-2 text-sm font-bold text-slate-950">{card.label}</h2>
              <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
            </article>
          ))}
        </section>

        <section id="dashboard" className="grid gap-4 xl:grid-cols-2">
          <ChartCard title="Requests por service_category">
            <DonutChart data={categoryData} />
          </ChartCard>
          <ChartCard title="Requests por request_status">
            <DonutChart data={statusData} />
          </ChartCard>
        </section>

        <section className="mt-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]" aria-labelledby="monthly-chart-title">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="monthly-chart-title" className="text-base font-bold leading-tight text-slate-950">
                Requests por mês
              </h2>
              <p className="mt-1 text-xs text-slate-500">Comparativo anual entre requests abertas e fechadas.</p>
            </div>
            <div className="flex gap-4 text-xs text-slate-600">
              <LegendItem color="#f97316" label="Abertas" />
              <LegendItem color="#84cc16" label="Fechadas" />
            </div>
          </div>

          <MonthlyBarChart data={monthlyData} maxMonthlyValue={maxMonthlyValue} />
        </section>
      </div>
    </section>
  );
}

function FilterField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 outline-none transition [color-scheme:light] focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
        defaultValue={value}
        aria-label={label}
        type="text"
      />
    </label>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
        defaultValue={value}
        aria-label={label}
      >
        <option>{value}</option>
      </select>
    </label>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="min-h-[280px] rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
      <h2 className="text-base font-bold leading-tight text-slate-950">{title}</h2>
      <div className="mt-6">{children}</div>
    </article>
  );
}

function DonutChart({ data }: { data: ChartItem[] }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const segments = data.reduce<
    (ChartItem & { strokeDasharray: string; strokeDashoffset: number })[]
  >((acc, item) => {
    const segmentPercentage = (item.value / total) * 100;
    const previousOffset = acc.at(-1)?.strokeDashoffset ?? 25;
    const previousPercentage = acc.at(-1)
      ? (acc.at(-1)!.value / total) * 100
      : 0;

    return [
      ...acc,
      {
        ...item,
        strokeDasharray: `${segmentPercentage} ${100 - segmentPercentage}`,
        strokeDashoffset: previousOffset - previousPercentage,
      },
    ];
  }, []);

  return (
    <div className="grid items-center gap-6 md:grid-cols-[210px_1fr]">
      <div className="relative mx-auto h-[210px] w-[210px]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 42 42" role="img" aria-label={`Total de ${total} requests`}>
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#eef2f7" strokeWidth="6" />
          {segments.map((item) => (
            <circle
              key={item.label}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={item.color}
              strokeDasharray={item.strokeDasharray}
              strokeDashoffset={item.strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="6"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <strong className="text-3xl font-bold text-slate-950">{total}</strong>
          <span className="mt-1 text-xs font-medium text-slate-500">requests</span>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2">
            <LegendItem color={item.color} label={item.label} />
            <span className="text-sm font-bold text-slate-950">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyBarChart({
  data,
  maxMonthlyValue,
}: {
  data: { month: string; open: number; closed: number }[];
  maxMonthlyValue: number;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[980px] grid-cols-[42px_1fr] gap-3">
        <div className="flex h-[260px] flex-col justify-between pb-8 text-right text-[11px] text-slate-400">
          {[40, 30, 20, 10, 0].map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div className="relative h-[260px] border-b border-slate-200">
          <div className="absolute inset-x-0 top-0 grid h-[220px] grid-rows-4 border-t border-slate-100">
            <span className="border-b border-slate-100" />
            <span className="border-b border-slate-100" />
            <span className="border-b border-slate-100" />
            <span className="border-b border-slate-100" />
          </div>
          <div className="relative z-10 grid h-full grid-cols-12 items-end gap-4 px-2 pb-8">
            {data.map((item) => (
              <div key={item.month} className="flex h-full flex-col justify-end gap-2">
                <div className="flex h-[220px] items-end justify-center gap-1.5">
                  <span
                    className="w-4 rounded-t-md bg-orange-500"
                    style={{ height: `${(item.open / maxMonthlyValue) * 100}%` }}
                    title={`${item.open} requests abertos`}
                  />
                  <span
                    className="w-4 rounded-t-md bg-lime-500"
                    style={{ height: `${(item.closed / maxMonthlyValue) * 100}%` }}
                    title={`${item.closed} requests fechados`}
                  />
                </div>
                <span className="text-center text-xs font-medium text-slate-500">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

function ActivityIcon({ className }: { className: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 5h18" />
      <path d="M6 12h12" />
      <path d="M10 19h4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
