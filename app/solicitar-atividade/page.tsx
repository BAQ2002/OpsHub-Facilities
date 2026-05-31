const requestCards = [
  {
    title: "Solicitar Atividade no Pátio",
    description:
      "Realize uma solicitação de atividade no pátio operacional para o setor de Facilities.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    title: "Solicitar Atividade de Chamado",
    description:
      "Realize uma solicitação de atividade no prédio administrativo para o setor de Facilities.",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
];

export default function SolicitarAtividadePage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-[#fbfcfe] px-5 py-8 text-slate-950 md:px-8 lg:px-9">
      <div className="w-full max-w-[760px]">
        <h1 className="sr-only">Solicitar Atividade</h1>

        <div className="grid gap-4 md:grid-cols-2">
          {requestCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
            >
              <div
                className={`mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-lg ${card.iconBg}`}
                aria-hidden="true"
              >
                <ClipboardIcon className={card.iconColor} />
              </div>

              <h2 className="text-base font-bold leading-tight text-slate-950">
                {card.title}
              </h2>
              <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">
                {card.description}
              </p>

              <button
                className={`mt-3 inline-flex items-center gap-2 text-xs font-bold ${card.iconColor}`}
                type="button"
              >
                Solicitar
                <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClipboardIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 5h6" />
      <path d="M9 3h6a1 1 0 0 1 1 1v2H8V4a1 1 0 0 1 1-1Z" />
      <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}
