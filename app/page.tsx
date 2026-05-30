const equipmentCards = [
  {
    title: "Artífice",
    code: "EC",
    accent: "text-cyan-600",
    ring: "border-cyan-500",
    iconBg: "bg-cyan-50",
    percentage: 78,
    available: 8,
    maintenance: 2,
    total: 10,
  },
  {
    title: "Civil",
    code: "MCA",
    accent: "text-violet-500",
    ring: "border-violet-500",
    iconBg: "bg-violet-50",
    percentage: 100,
    available: 4,
    maintenance: 6,
    total: 10,
  },
  {
    title: "Copa e Café",
    code: "PP",
    accent: "text-red-500",
    ring: "border-red-500",
    iconBg: "bg-red-50",
    percentage: 100,
    available: 6,
    maintenance: 4,
    total: 10,
  },
  {
    title: "Hidráulica",
    code: "EE",
    accent: "text-amber-500",
    ring: "border-amber-500",
    iconBg: "bg-amber-50",
    percentage: 100,
    available: 4,
    maintenance: 6,
    total: 10,
  },
  {
    title: "Refrigeração e Climatização",
    code: "EAV",
    accent: "text-emerald-500",
    ring: "border-emerald-300",
    iconBg: "bg-emerald-50",
    percentage: 0,
    available: 7,
    maintenance: 3,
    total: 10,
  },
  {
    title: "Pintura",
    code: "PP",
    accent: "text-orange-500",
    ring: "border-orange-500",
    iconBg: "bg-orange-50",
    percentage: 100,
    available: 6,
    maintenance: 4,
    total: 10,
  },
  {
    title: "Elétrica",
    code: "EL",
    accent: "text-blue-500",
    ring: "border-blue-500",
    iconBg: "bg-blue-50",
    percentage: 100,
    available: 6,
    maintenance: 4,
    total: 10,
  },
  {
    title: "Limpeza",
    code: "LP",
    accent: "text-teal-500",
    ring: "border-teal-500",
    iconBg: "bg-teal-50",
    percentage: 100,
    available: 4,
    maintenance: 6,
    total: 10,
  },
];

const totals = equipmentCards.reduce(
  (acc, card) => ({
    available: acc.available + card.available,
    maintenance: acc.maintenance + card.maintenance,
    total: acc.total + card.total,
  }),
  { available: 0, maintenance: 0, total: 0 },
);

const availability = Math.round((totals.available / totals.total) * 1000) / 10;

export default function Home() {
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
              <button className="flex h-8 w-8 items-center justify-center text-lg leading-none text-slate-500" type="button" aria-label="Atualizar">
                ↻
              </button>
              <select
                className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
                aria-label="Intervalo de atualização"
                defaultValue="5 min"
              >
                <option>5 min</option>
              </select>
            </div>
          </div>
        </header>

        <section className="mb-5 rounded-[20px] border border-slate-200 bg-white px-5 pb-5 pt-[15px] shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
          <div className="mb-[30px] flex flex-wrap items-center gap-2">
            <h2 className="mr-1 text-base font-bold leading-tight text-slate-950">
              Atividades programadas
            </h2>
            <button
              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
              type="button"
              aria-label="Dia anterior"
            >
              <ChevronLeftIcon />
            </button>
            <button
              className="flex h-[30px] items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
              type="button"
              aria-label="Selecionar data"
            >
              <span>29/05/2026</span>
              <CalendarIcon />
            </button>
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

          <div className="grid gap-3 lg:grid-cols-4">
            <SummaryCard value={String(totals.available)} label="Atividades" bg="bg-emerald-50" color="text-emerald-600" />
            <SummaryCard value={String(totals.maintenance)} label="Disponíveis" bg="bg-amber-50" color="text-amber-600" />
            <SummaryCard value={String(totals.total - totals.available)} label="Pendentes" bg="bg-rose-100" color="text-slate-950" raised />
            <SummaryCard value={`${availability}%`} label="Disp. Geral" bg="bg-blue-50" color="text-blue-600" />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {equipmentCards.map((card) => (
            <article
              key={card.title}
              className="min-h-[194px] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
            >
              <div className="grid grid-cols-[36px_1fr_auto] items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <span className={`text-lg ${card.accent}`}>⚙</span>
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold leading-tight text-slate-950">
                    {card.title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-tight text-slate-500">{card.code}</p>
                </div>

                <span className="pt-1 text-base leading-none text-emerald-500">⊙</span>
              </div>

              <div className="mt-4 grid grid-cols-[80px_1fr] items-center gap-4">
                <div
                  className={`flex h-[70px] w-[70px] items-center justify-center rounded-full border-[5px] ${card.ring} text-sm font-bold ${card.accent}`}
                >
                  {card.percentage}%
                </div>
                <dl className="space-y-2 text-xs">
                  <Metric label="Atividades" value={card.available} valueClass="text-emerald-600" />
                  <Metric label="Disponível" value={card.maintenance} valueClass="text-orange-500" />
                  <Metric label="Total" value={card.total} bordered />
                </dl>
              </div>
            </article>
          ))}
        </section>
      </div>
    </section>
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
    <div className={`rounded-xl ${bg} px-6 py-4 text-center ${raised ? "shadow-[0_2px_12px_rgba(225,29,72,0.16)]" : ""}`}>
      <p className={`text-[25px] font-bold leading-none ${color}`}>{value}</p>
      <p className="mt-2 text-[11px] leading-none text-slate-500">{label}</p>
    </div>
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
    <div className={`flex justify-between gap-3 ${bordered ? "border-t border-slate-100 pt-2" : ""}`}>
      <dt className="text-slate-500">{label}</dt>
      <dd className={`font-bold ${valueClass}`}>{value}</dd>
    </div>
  );
}
function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}
