import type { RequestBoardColumnViewModel } from "@/src/presentation/view-models/request-board-view-model";
import { getRequestBoardPageData } from "@/src/server/services/request-board-service";
import { TrackingTabs } from "../_components/TrackingTabs";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const { columns } = await getRequestBoardPageData();

  return (
    <section className="min-h-screen bg-[#eef4ff] p-4 text-slate-700 md:p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="flex items-start justify-between border-b border-slate-300/70">
          <TrackingTabs active="requests" />
          <div className="flex overflow-hidden rounded-lg border border-blue-500 bg-white text-blue-600">
            <IconButton label="Baixar chamados"><DownloadIcon /></IconButton>
            <IconButton label="Configurações" divider><SettingsIcon /></IconButton>
          </div>
        </div>

        <section className="mt-5 grid gap-2 md:grid-cols-[250px_1fr_auto_auto]" aria-label="Busca de chamados">
          <label className="rounded-md bg-white/80 px-5 py-3 text-xs font-medium uppercase text-slate-500">
            <span>Data cadastro</span>
            <input className="sr-only" type="date" aria-label="Data cadastro" />
          </label>
          <label className="rounded-md bg-white/80 px-4 py-3 text-xs font-medium uppercase text-slate-500">
            <span className="sr-only">Buscar chamado</span>
            <input className="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="BUSCAR CHAMADO" />
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-500 bg-white px-6 py-3 text-sm text-blue-600" type="button"><FilterIcon /> Filtros</button>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-8 py-3 text-sm font-semibold text-white" type="button"><SearchIcon /> Buscar</button>
        </section>

        <div className="my-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex overflow-hidden rounded border border-slate-300">
            <button className="bg-blue-100 px-5 py-2 text-blue-600" type="button" aria-label="Visualização em quadro"><BoardIcon /></button>
            <button className="border-l border-slate-300 bg-white px-5 py-2 text-slate-500" type="button" aria-label="Visualização em lista"><ListIcon /></button>
          </div>
          <label className="flex items-center gap-6 text-sm text-slate-500">Ordenar por:
            <select className="min-w-48 border-b border-slate-300 bg-transparent px-2 py-2 outline-none" defaultValue="recent"><option value="recent">Últimos Chamados</option></select>
          </label>
        </div>

        {columns.length > 0 ? (
          <section className="flex items-start gap-3 overflow-x-auto pb-6" aria-label="Quadro de chamados">
            {columns.map((column) => <RequestColumn key={column.id} column={column} />)}
          </section>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Nenhum status de request cadastrado.
          </p>
        )}
      </div>
    </section>
  );
}

function RequestColumn({ column }: { column: RequestBoardColumnViewModel }) {
  return (
    <section className="w-[280px] shrink-0 rounded-xl border border-slate-300 bg-[#f1f2f4] p-2 shadow-sm">
      <header className="flex items-center justify-between gap-3 px-2 pb-2 pt-1">
        <h2 className="min-w-0 truncate text-sm font-semibold text-slate-800" title={column.title}>{column.title}</h2>
        <span className="text-sm tabular-nums text-slate-500" aria-label={`${column.requests.length} requests`}>{column.requests.length}</span>
      </header>
      <div className="max-h-[620px] space-y-2 overflow-y-auto">
        {column.requests.map((request) => (
          <article className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm transition-shadow hover:shadow-md" key={request.id}>
            <div className="mb-3 border-b border-slate-100 pb-2">
              <strong className="rounded-md bg-blue-50 px-2 py-1 text-sm font-bold tabular-nums text-blue-700">#{request.id}</strong>
            </div>
            <dl className="space-y-2.5">
              <CardDetail icon={<RequesterIcon />} label="Solicitante" value={request.requesterName} />
              <CardDetail icon={<LocationIcon />} label="Local solicitado" value={request.locationName} />
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function CardDetail({ icon: detailIcon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[18px_1fr] gap-x-2">
      <span className="mt-0.5 text-slate-400" aria-hidden="true">{detailIcon}</span>
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
        <dd className="mt-0.5 break-words text-[13px] font-medium leading-5 text-slate-700">{value}</dd>
      </div>
    </div>
  );
}

function IconButton({ label, divider, children }: { label: string; divider?: boolean; children: React.ReactNode }) { return <button type="button" aria-label={label} className={`flex h-9 w-11 items-center justify-center ${divider ? "border-l border-blue-500" : ""}`}>{children}</button>; }
const icon = "h-[18px] w-[18px]";
function DownloadIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 18v3h14v-3" /></svg>; }
function SettingsIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7-.7-2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z"/></svg>; }
function FilterIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M4 5h16l-6 7v6l-4 2v-8z"/></svg>; }
function SearchIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg>; }
function BoardIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="3" y="3" width="18" height="18"/><path d="M9 3v18m6-18v18"/></svg>; }
function ListIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="3" y="4" width="18" height="16"/><path d="M3 9h18M3 14h18M9 4v16"/></svg>; }
function RequesterIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.6-4 3-6 7-6s6.4 2 7 6"/></svg>; }
function LocationIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>; }
