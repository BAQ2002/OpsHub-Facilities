const equipmentCards = [
  {
    title: "Empilhadeira de Cheio",
    code: "EC",
    accent: "text-cyan-600",
    ring: "border-cyan-500",
    iconBg: "bg-cyan-50",
    percentage: 78,
    available: 7,
    maintenance: 2,
    total: 9,
    footer: "2 equipamentos parados",
  },
  {
    title: "Empilhadeira Elétrica",
    code: "EE",
    accent: "text-amber-500",
    ring: "border-amber-500",
    iconBg: "bg-amber-50",
    percentage: 100,
    available: 21,
    maintenance: 0,
    total: 21,
  },
  {
    title: "Empilhadeira de Vazio",
    code: "EV",
    accent: "text-emerald-500",
    ring: "border-emerald-300",
    iconBg: "bg-emerald-50",
    percentage: 0,
    available: 0,
    maintenance: 1,
    total: 1,
    footer: "1 equipamento parado",
  },
  {
    title: "Escavadeira",
    code: "MCA",
    accent: "text-violet-500",
    ring: "border-violet-500",
    iconBg: "bg-violet-50",
    percentage: 100,
    available: 1,
    maintenance: 0,
    total: 1,
  },
  {
    title: "Portainer",
    code: "PP",
    accent: "text-red-500",
    ring: "border-red-500",
    iconBg: "bg-red-50",
    percentage: 100,
    available: 8,
    maintenance: 0,
    total: 8,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f6f8] px-3 py-6 text-slate-900 md:px-5">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">Manutenção</h1>
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white text-xl">
            🌙
          </button>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-3xl font-semibold">Gate — Agendamentos</h2>
              <p className="mt-2 text-lg text-slate-500">
                Capacidade, Agendados e Atendidos • Todas as fainas • 26/05/2026 • atualizado em 26/05/2026 • atualizado em 26/05/2026 às 20:53:47
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-slate-700">
              <button className="rounded-xl border border-slate-300 px-4 py-2">◀</button>
              <span>De</span>
              <button className="rounded-2xl border border-slate-300 px-5 py-2">26/05/2026 📅</button>
              <button className="rounded-xl border border-slate-300 px-4 py-2">▶</button>
              <button className="rounded-2xl border border-slate-300 px-5 py-2">Hoje</button>
              <button className="rounded-xl border border-slate-300 px-4 py-2">↻</button>
              <button className="rounded-2xl border border-slate-300 px-5 py-2">5 min ▾</button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-3xl font-semibold">Disponibilidade de Equipamentos</h2>
          <p className="mt-1 text-lg text-slate-500">Painel de controle de manutenção — CCM • atualizado em 26/05/2026 às 20:49:27</p>

          <div className="mt-6 grid gap-3 lg:grid-cols-4">
            <SummaryCard value="127" label="Disponíveis" bg="bg-emerald-50" color="text-emerald-600" />
            <SummaryCard value="13" label="Em Manutenção" bg="bg-amber-50" color="text-amber-600" />
            <SummaryCard value="13" label="Parados" bg="bg-rose-50" color="text-rose-700" />
            <SummaryCard value="90.7%" label="Disp. Geral" bg="bg-indigo-50" color="text-indigo-600" />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          {equipmentCards.map((card) => (
            <article key={card.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <span className={`text-xl ${card.accent}`}>⚙</span>
                </div>
                <span className="text-xl text-emerald-600">◉</span>
              </div>

              <h3 className="mt-3 text-4xl font-semibold leading-tight">{card.title}</h3>
              <p className="text-xl text-slate-500">{card.code}</p>

              <div className="mt-4 grid grid-cols-[auto,1fr] gap-4">
                <div className={`flex h-20 w-20 items-center justify-center rounded-full border-4 ${card.ring} text-2xl font-bold ${card.accent}`}>
                  {card.percentage}%
                </div>
                <dl className="space-y-2 text-lg">
                  <div className="flex justify-between"><dt className="text-slate-500">Disponíveis</dt><dd className="font-semibold text-emerald-600">{card.available}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Manutenção</dt><dd className="font-semibold text-orange-500">{card.maintenance}</dd></div>
                  <div className="flex justify-between border-t border-slate-100 pt-2"><dt className="text-slate-500">Total</dt><dd className="font-semibold">{card.total}</dd></div>
                </dl>
              </div>

              {card.footer && <p className="mt-4 text-base text-slate-700">⌄ {card.footer}</p>}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  value,
  label,
  bg,
  color,
}: {
  value: string;
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <div className={`rounded-2xl ${bg} p-6 text-center`}>
      <p className={`text-5xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-lg text-slate-500">{label}</p>
    </div>
  );
}
