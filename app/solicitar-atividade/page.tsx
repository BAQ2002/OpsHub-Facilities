import Link from "next/link";

const serviceCategories = [
  {
    title: "ALMOXARIFADO",
    items: ["Coleta de Material"],
  },
  {
    title: "ARTÍFICE",
    items: [
      "Fixação de Placas/Quadros",
      "Outros",
      "Regulagem de porta",
      "Reparos em móveis",
      "Substituição de dispenser (papel higiênico, papel toalha e sabonete)",
      "Substituição de fitas de demarcação lisa/antiderrapante",
      "Substituição de tampa de vaso sanitário",
      "Troca de fechadura/miolo",
    ],
  },
  {
    title: "CLIMATIZAÇÃO E REFRIGERAÇÃO",
    items: [
      "Desinstalação de equipamentos",
      "Equipamento com avaria evidente",
      "Equipamento não liga",
      "Equipamento não refrigera/climatiza",
      "Instalação de equipamento",
      "Outros",
      "Remanejamento de unidade evaporadora/condensadora",
      "Vazamento de água em equipamento",
    ],
  },
  {
    title: "COPA",
    items: [
      "Abastecimento de água mineral",
      "Apoio em reunião/evento",
      "Reposição de café e descartáveis",
      "Outros",
    ],
  },
  {
    title: "ELÉTRICA",
    items: [
      "Lâmpada queimada ou piscando",
      "Tomada/interruptor com defeito",
      "Instalação de ponto elétrico",
      "Outros",
    ],
  },
];

export default function SolicitarAtividadePage() {
  return (
    <section className="min-h-screen bg-[#fbfcfe] px-5 pb-10 pt-8 text-slate-950 md:px-8 lg:px-9">
      <div className="mx-auto w-full max-w-[920px]">
        <header className="mb-6">
          <Link
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            href="/"
          >
            <span aria-hidden="true">←</span>
            Voltar para Facilities
          </Link>

          <div className="flex items-center gap-4">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-950 shadow-[0_1px_4px_rgba(15,23,42,0.08)]"
              aria-hidden="true"
            >
              <AlertIcon />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
                Solicitar atividade de chamado
              </p>
              <h1 className="mt-1 text-[30px] font-bold leading-none tracking-[-0.03em] text-slate-950">
                Chamados
              </h1>
            </div>
          </div>
        </header>

        <label className="relative mb-8 block">
          <span className="sr-only">Buscar chamado</span>
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          >
            <SearchIcon />
          </span>
          <input
            className="h-10 w-full rounded border border-slate-100 bg-[#f0f0f1] pl-11 pr-4 text-sm text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
            placeholder="Busque por nome ou categoria do chamado"
            type="search"
          />
        </label>

        <div className="space-y-5">
          {serviceCategories.map((category) => (
            <section
              key={category.title}
              className="border-b border-slate-200 pb-4 last:border-b-0"
            >
              <h2 className="mb-4 text-base font-extrabold uppercase tracking-[-0.01em] text-slate-800">
                {category.title}
              </h2>

              <div className="grid gap-3 md:grid-cols-2">
                {category.items.map((item) => (
                  <Link
                    key={`${category.title}-${item}`}
                    className="group flex h-11 items-center justify-between rounded border border-slate-100 bg-white px-4 text-[15px] font-medium text-slate-800 no-underline shadow-[0_6px_14px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:border-cyan-200 hover:text-cyan-700 hover:shadow-[0_10px_22px_rgba(15,23,42,0.14)] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    href={`/solicitar-atividade/chamado?categoria=${encodeURIComponent(category.title)}&servico=${encodeURIComponent(item)}`}
                    title={item}
                  >
                    <span className="truncate pr-3">{item}</span>
                    <ChevronRightIcon />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function AlertIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 9 9-9 9-9-9 9-9Z" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="shrink-0 text-slate-900 transition group-hover:translate-x-0.5 group-hover:text-cyan-700"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
