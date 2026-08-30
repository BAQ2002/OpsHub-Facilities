import Link from "next/link";

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente TrackingTabs com os dados recebidos.
 * Durante o fluxo, aciona {@link map}.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
export function TrackingTabs({ active }: { active: "dashboard" | "requests" }) {
  const tabs = [
    { key: "requests" as const, label: "Chamados", href: "/acompanhamento-atividades/requests" },
    { key: "dashboard" as const, label: "Dashboard", href: "/acompanhamento-atividades" },
  ];

  return (
    <nav className="flex border-b border-slate-200" aria-label="Seções do acompanhamento">
      {tabs.map((tab) => {
        const selected = active === tab.key;

        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={selected ? "page" : undefined}
            className={`inline-flex h-11 min-w-28 items-center justify-center rounded-t-lg border px-6 text-sm transition ${
              selected
                ? "border-b-white border-slate-200 bg-white font-semibold text-slate-700"
                : "border-transparent font-medium text-blue-600 hover:bg-blue-50"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
