import Image from "next/image";
import Link from "next/link";

const equipmentCards = [
  {
    title: "Artífice",
    code: "EC",
    accent: "text-cyan-600",
    iconBg: "bg-cyan-50",
    available: 8,
    maintenance: 2,
    total: 10,
  },
  {
    title: "Civil",
    code: "MCA",
    accent: "text-violet-500",
    iconBg: "bg-violet-50",
    available: 4,
    maintenance: 6,
    total: 10,
  },
  {
    title: "Copa e Café",
    code: "PP",
    accent: "text-red-500",
    iconBg: "bg-red-50",
    available: 6,
    maintenance: 4,
    total: 10,
  },
  {
    title: "Elétrica",
    code: "EL",
    accent: "text-yellow-500",
    iconBg: "bg-yellow-50",
    available: 6,
    maintenance: 4,
    total: 10,
  },
  {
    title: "Hidráulica",
    code: "HD",
    accent: "text-blue-500",
    iconBg: "bg-blue-50",
    available: 5,
    maintenance: 5,
    total: 10,
  },
  {
    title: "Jardinagem",
    code: "JD",
    accent: "text-green-500",
    iconBg: "bg-green-50",
    available: 7,
    maintenance: 3,
    total: 10,
  },
  {
    title: "Refrigeração",
    code: "MN",
    accent: "text-orange-500",
    iconBg: "bg-orange-50",
    available: 6,
    maintenance: 4,
    total: 10,
  },
  {
    title: "Limpeza",
    code: "LP",
    accent: "text-teal-500",
    iconBg: "bg-teal-50",
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

const mapImage = {
  src: "/facilities-map.png",
  width: 1544,
  height: 908,
  alt: "Mapa AIS com posições atuais das atividades de facilities",
};

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

        <section className="mb-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
                type="button"
                aria-label="Dia anterior"
              >
                <ChevronLeftIcon />
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

            <Link
              className="flex h-[30px] items-center rounded-lg border border-slate-200 bg-white px-4 text-xs text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
              href="/solicitar-atividade"
            >
              Solicitar Atividade
            </Link>
          </div>

          <div className="grid gap-3 lg:grid-cols-4">
            <SummaryCard
              value={String(totals.available)}
              label="Atividades"
              bg="bg-emerald-50"
              color="text-emerald-600"
            />
            <SummaryCard
              value={String(totals.maintenance)}
              label="Disponíveis"
              bg="bg-amber-50"
              color="text-amber-600"
            />
            <SummaryCard
              value={String(totals.total - totals.available)}
              label="Pendentes"
              bg="bg-rose-100"
              color="text-slate-950"
              raised
            />
            <SummaryCard
              value={`${availability}%`}
              label="Disp. Geral"
              bg="bg-blue-50"
              color="text-blue-600"
            />
          </div>
        </section>

        <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {equipmentCards.map((card) => (
            <article
              key={card.title}
              className="min-h-[132px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
            >
              <div className="grid grid-cols-[32px_1fr_auto] items-start gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}
                >
                  <span className={`text-lg ${card.accent}`}>⚙</span>
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold leading-tight text-slate-950">
                    {card.title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-tight text-slate-500">
                    {card.code}
                  </p>
                </div>

                <span className="pt-1 text-base leading-none text-emerald-500">
                  ⊙
                </span>
              </div>

              <div className="mt-3">
                <dl className="space-y-2 text-xs">
                  <Metric
                    label="Atividades"
                    value={card.available}
                    valueClass="text-emerald-600"
                  />
                  <Metric
                    label="Disponível"
                    value={card.maintenance}
                    valueClass="text-orange-500"
                  />
                  <Metric label="Total" value={card.total} bordered />
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
            TECON Salvador - Atividades Facilities
          </h2>

          <div
            className="overflow-hidden rounded-xl border border-slate-200 bg-sky-50"
            style={{ aspectRatio: `${mapImage.width} / ${mapImage.height}` }}
          >
            <Image
              src={mapImage.src}
              alt={mapImage.alt}
              width={mapImage.width}
              height={mapImage.height}
              className="h-full w-full object-contain"
              priority
              sizes="(min-width: 1680px) 1544px, calc(100vw - 96px)"
            />
          </div>
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
    <div
      className={`rounded-xl ${bg} px-6 py-4 text-center ${
        raised ? "shadow-[0_2px_12px_rgba(225,29,72,0.16)]" : ""
      }`}
    >
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
