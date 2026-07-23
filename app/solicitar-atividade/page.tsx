import Link from "next/link";

const requestCards = [
  {
    title: "Nova request: Atividade de Pátio",
    description:
      "Crie um registro request com request_type Atividade de Pátio para o setor de Facilities.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    href: "/solicitar-atividade/patio",
  },
  {
    title: "Nova request: Chamado",
    description:
      "Crie um registro request com request_type Chamado para o setor de Facilities.",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    href: "/solicitar-atividade/chamado",
  },
];

export default function SolicitarAtividadePage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-[#fbfcfe] px-5 py-8 text-slate-950 md:px-8 lg:px-9">
      <div className="w-full max-w-[760px]">
        <h1 className="sr-only">Nova request</h1>

        <div className="grid gap-4 md:grid-cols-2">
          {requestCards.map((card) => (
            <Link
              key={card.title}
              className="block rounded-2xl border border-slate-200 bg-white p-5 no-underline shadow-[0_1px_4px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              href={card.href}
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

              <span
                className={`mt-3 inline-flex items-center gap-2 text-xs font-bold ${card.iconColor}`}
              >
                Criar request
                <span aria-hidden="true">→</span>
              </span>
            </Link>
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
