import Link from "next/link";
import FacilitiesMap from "./_components/FacilitiesMap";

const equipmentCards = [
  {
    title: "Artífice",
    accent: "text-cyan-600",
    iconBg: "bg-cyan-50",
    Planned: 8,
    InProgress: 2,
  },
  {
    title: "Civil",
    accent: "text-violet-500",
    iconBg: "bg-violet-50",
    Planned: 4,
    InProgress: 6,
  },
  {
    title: "Copa e Café",
    accent: "text-red-500",
    iconBg: "bg-red-50",
    Planned: 6,
    InProgress: 4,
  },
  {
    title: "Elétrica",
    accent: "text-yellow-500",
    iconBg: "bg-yellow-50",
    Planned: 6,
    InProgress: 4,
  },
  {
    title: "Hidráulica",
    accent: "text-blue-500",
    iconBg: "bg-blue-50",
    Planned: 5,
    InProgress: 5,
    total: 10,
  },
  {
    title: "Jardinagem",
    accent: "text-green-500",
    iconBg: "bg-green-50",
    Planned: 7,
    InProgress: 3,
  },
  {
    title: "Refrigeração",
    accent: "text-orange-500",
    iconBg: "bg-orange-50",
    Planned: 6,
    InProgress: 4,
  },
  {
    title: "Limpeza",
    accent: "text-teal-500",
    iconBg: "bg-teal-50",
    Planned: 4,
    InProgress: 6,
  },
];

const totals = equipmentCards.reduce(
  (acc, card) => ({
    Planned: acc.Planned + card.Planned,
    InProgress: acc.InProgress + card.InProgress,
  }),
  { Planned: 0, InProgress: 0 },
);

const mapImage = {
  src: "/facilities-map.png",
  width: 1544,
  height: 908,
  alt: "Mapa AIS com posições atuais das atividades de facilities",
};

const activityRecords = [
  {
    id: "ATV-001",
    activityType: "Atividade no Pátio",
    businessUnit: "Unidade 1",
    category: "—",
    serviceType: "Manutenção",
    location: "Fila: G-11",
    plannedAt: "2026-06-03 08:30",
    description: "Reparo preventivo em iluminação do pátio.",
  },
  {
    id: "ATV-002",
    activityType: "Chamado",
    businessUnit: "Unidade 2",
    category: "Predial",
    serviceType: "Limpeza",
    location: "Bloco administrativo, 2º andar",
    plannedAt: "2026-06-03 09:00",
    description: "Higienização emergencial da sala de reunião.",
  },
  {
    id: "ATV-003",
    activityType: "Atividade no Pátio",
    businessUnit: "Unidade 3",
    category: "—",
    serviceType: "Apoio operacional",
    location: "Fila: B-04",
    plannedAt: "2026-06-03 09:45",
    description: "Apoio para isolamento de área operacional.",
  },
  {
    id: "ATV-004",
    activityType: "Chamado",
    businessUnit: "Unidade 1",
    category: "Administrativo",
    serviceType: "Copa e café",
    location: "Recepção principal",
    plannedAt: "2026-06-03 10:15",
    description: "Reposição de insumos de copa para visita técnica.",
  },
  {
    id: "ATV-005",
    activityType: "Atividade no Pátio",
    businessUnit: "Unidade 2",
    category: "—",
    serviceType: "Limpeza",
    location: "Fila: D-18",
    plannedAt: "2026-06-03 11:00",
    description: "Limpeza de resíduos próximos à faixa de circulação.",
  },
  {
    id: "ATV-006",
    activityType: "Chamado",
    businessUnit: "Unidade 3",
    category: "Suporte",
    serviceType: "Manutenção",
    location: "Sala de controle operacional",
    plannedAt: "2026-06-03 11:30",
    description: "Verificação de tomada sem energização.",
  },
  {
    id: "ATV-007",
    activityType: "Atividade no Pátio",
    businessUnit: "Unidade 1",
    category: "—",
    serviceType: "Outro",
    location: "Fila: H-07",
    plannedAt: "2026-06-03 13:00",
    description: "Sinalização temporária para manutenção de piso.",
  },
  {
    id: "ATV-008",
    activityType: "Chamado",
    businessUnit: "Unidade 2",
    category: "Outro",
    serviceType: "Outro",
    location: "Portaria de acesso interno",
    plannedAt: "2026-06-03 13:45",
    description: "Ajuste em mobiliário da área de espera.",
  },
  {
    id: "ATV-009",
    activityType: "Atividade no Pátio",
    businessUnit: "Unidade 3",
    category: "—",
    serviceType: "Manutenção",
    location: "Fila: A-22",
    plannedAt: "2026-06-03 14:10",
    description: "Inspeção em proteção metálica próxima aos lotes.",
  },
  {
    id: "ATV-010",
    activityType: "Chamado",
    businessUnit: "Unidade 1",
    category: "Predial",
    serviceType: "Limpeza",
    location: "Corredor térreo do administrativo",
    plannedAt: "2026-06-03 14:40",
    description: "Remoção de marcas no piso e revisão de lixeiras.",
  },
  {
    id: "ATV-011",
    activityType: "Atividade no Pátio",
    businessUnit: "Unidade 2",
    category: "—",
    serviceType: "Apoio operacional",
    location: "Fila: C-15",
    plannedAt: "2026-06-03 15:20",
    description: "Apoio de equipe para reorganização de materiais.",
  },
  {
    id: "ATV-012",
    activityType: "Chamado",
    businessUnit: "Unidade 3",
    category: "Administrativo",
    serviceType: "Copa e café",
    location: "Auditório",
    plannedAt: "2026-06-03 16:00",
    description: "Preparação de copa para treinamento interno.",
  },
  {
    id: "ATV-013",
    activityType: "Atividade no Pátio",
    businessUnit: "Unidade 1",
    category: "—",
    serviceType: "Limpeza",
    location: "Fila: F-09",
    plannedAt: "2026-06-03 16:30",
    description: "Coleta de materiais soltos no pátio.",
  },
  {
    id: "ATV-014",
    activityType: "Chamado",
    businessUnit: "Unidade 2",
    category: "Suporte",
    serviceType: "Manutenção",
    location: "Sala de TI",
    plannedAt: "2026-06-03 17:00",
    description: "Correção de ponto de iluminação intermitente.",
  },
  {
    id: "ATV-015",
    activityType: "Atividade no Pátio",
    businessUnit: "Unidade 3",
    category: "—",
    serviceType: "Outro",
    location: "Fila: E-13",
    plannedAt: "2026-06-04 08:00",
    description: "Avaliação de necessidade de pintura de demarcação.",
  },
  {
    id: "ATV-016",
    activityType: "Chamado",
    businessUnit: "Unidade 1",
    category: "Outro",
    serviceType: "Outro",
    location: "Área externa do administrativo",
    plannedAt: "2026-06-04 08:40",
    description: "Verificação de banco com fixação irregular.",
  },
  {
    id: "ATV-017",
    activityType: "Atividade no Pátio",
    businessUnit: "Unidade 2",
    category: "—",
    serviceType: "Manutenção",
    location: "Fila: I-02",
    plannedAt: "2026-06-04 09:20",
    description: "Revisão de ponto hidráulico de apoio operacional.",
  },
  {
    id: "ATV-018",
    activityType: "Chamado",
    businessUnit: "Unidade 3",
    category: "Predial",
    serviceType: "Limpeza",
    location: "Vestiário operacional",
    plannedAt: "2026-06-04 10:00",
    description: "Limpeza programada após intervenção predial.",
  },
  {
    id: "ATV-019",
    activityType: "Atividade no Pátio",
    businessUnit: "Unidade 1",
    category: "—",
    serviceType: "Apoio operacional",
    location: "Fila: J-06",
    plannedAt: "2026-06-04 10:45",
    description: "Organização de área para chegada de equipamentos.",
  },
  {
    id: "ATV-020",
    activityType: "Chamado",
    businessUnit: "Unidade 2",
    category: "Administrativo",
    serviceType: "Manutenção",
    location: "Sala da gerência",
    plannedAt: "2026-06-04 11:15",
    description: "Ajuste de fechadura e revisão de dobradiças.",
  },
];

const slaSamplesInMinutes = [53];

const averageSlaInMinutes = Math.round(
  slaSamplesInMinutes.reduce((acc, minutes) => acc + minutes, 0) /
    slaSamplesInMinutes.length,
);

const averageSlaClock = formatClockDuration(averageSlaInMinutes);

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
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryCard
                  value={String(totals.Planned)}
                  label="Programadas"
                  bg="bg-emerald-50"
                  color="text-emerald-600"
                />
                <SummaryCard
                  value={String(totals.Planned)}
                  label="Em andamento"
                  bg="bg-amber-50"
                  color="text-yellow-500"
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
                  label="Solicitar Atividade"
                />
                <ActionCard
                  href="/minhas-solicitacoes"
                  label="Minhas solicitações"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {equipmentCards.map((card) => (
            <article
              key={card.title}
              className="min-h-[132px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
            >
              <div className="flex items-center justify-start gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}
                >

                </div>

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
            TECON Salvador - Atividades Facilities
          </h2>

          <FacilitiesMap image={mapImage} />

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div
              id="minhas-solicitacoes"
              className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"
            >
              <div>
                <h3 className="text-sm font-bold leading-tight text-slate-950">
                  Solicitações planejadas
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  20 registros distribuídos entre Atividade no Pátio e Chamado
                </p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                {activityRecords.length} atividades
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.02em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Tipo de atividade</th>
                    <th className="px-4 py-3">Unidade de Negócio</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Tipo de Serviço</th>
                    <th className="px-4 py-3">Local</th>
                    <th className="px-4 py-3">Data e hora planejada</th>
                    <th className="px-4 py-3">Descrição</th>
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
                        {record.category}
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
        Tempo médio de atendimento
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

function formatClockDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");

  return {
    display: `${hours}:${minutes}`,
    caption: `${hours}h${minutes}min`,
  };
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
