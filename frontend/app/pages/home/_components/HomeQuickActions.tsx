import Link from "next/link";

export function HomeQuickActions() {
  return (
    <div data-ui="facilities-quick-actions" className="lg:col-span-1 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
      <div className="grid gap-3 sm:grid-cols-1">
        <ActionCard
          href="/pages/solicitar-atividade"
          label="Nova solicitação"
        />
        <ActionCard
          href="/pages/minhas-solicitacoes"
          label="Minhas solicitações"
        />
      </div>
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
