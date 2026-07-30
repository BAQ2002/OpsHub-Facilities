import { TrackingTabs } from "../_components/TrackingTabs";

type RequestCard = {
  id: number;
  title: string;
  requester: string;
  date: string;
  assignee?: string;
  age: string;
  sla?: string;
  slaTone?: "good" | "bad" | "info";
};

const columns: { title: string; count: number; color: string; requests: RequestCard[] }[] = [
  {
    title: "Abertos",
    count: 49,
    color: "bg-indigo-500",
    requests: [
      { id: 973, title: "Poda de árvore ou arbusto", requester: "Ana Paula", date: "30/07/26 às 15:42", age: "Há 4 horas", sla: "19d 8h 41m", slaTone: "good" },
      { id: 972, title: "Outros", requester: "Ana Paula", date: "30/07/26 às 15:39", age: "Há 4 horas" },
      { id: 971, title: "Fixação de Placas/Quadros", requester: "Marcos Santos De Almeida", date: "30/07/26 às 13:48", age: "Há 6 horas", sla: "19d 6h 47m", slaTone: "good" },
      { id: 969, title: "Fixação de Placas/Quadros", requester: "Tainara Carmo", date: "30/07/26 às 11:25", age: "Há 8 horas" },
    ],
  },
  {
    title: "Em Andamento",
    count: 7,
    color: "bg-sky-400",
    requests: [
      { id: 967, title: "Lâmpadas queimadas", requester: "Rogerio Santos Garcia", date: "30/07/26 às 09:12", assignee: "Rogerio Santos Garcia", age: "Há 11 horas", sla: "3d 2h 11m", slaTone: "good" },
      { id: 694, title: "Quadro elétrico desarmando", requester: "Braian Costa", date: "19/06/26 às 12:19", assignee: "Isys Hanaira Mato Grosso Souza", age: "Há um mês", sla: "- 25d 7h 36m", slaTone: "bad" },
      { id: 261, title: "Reparo de pisos e revestimentos", requester: "Isabella Valverde Santos", date: "06/05/26 às 08:00", assignee: "Isys Hanaira Mato Grosso Souza", age: "Há 3 meses" },
    ],
  },
  {
    title: "Fechados",
    count: 869,
    color: "bg-emerald-500",
    requests: [
      { id: 975, title: "PMOC MENSAL", requester: "Marcelo Lima De Jesus", date: "30/07/26 às 17:35", assignee: "Marcelo Lima De Jesus", age: "Há 2 horas", sla: "0 min", slaTone: "info" },
      { id: 974, title: "PMOC ANUAL", requester: "Luis Henrique Dos Santos Borba", date: "30/07/26 às 16:22", assignee: "Luis Henrique Dos Santos Borba", age: "Há 4 horas", sla: "1 min", slaTone: "info" },
      { id: 970, title: "PMOC ANUAL", requester: "Luis Henrique Dos Santos Borba", date: "30/07/26 às 11:16", assignee: "Luis Henrique Dos Santos Borba", age: "Há 8 horas", sla: "5h 7m", slaTone: "info" },
    ],
  },
];

export default function RequestsPage() {
  return (
    <section className="min-h-screen bg-[#fafafa] p-4 text-slate-700 md:p-6">
      <div className="mx-auto max-w-[1640px]">
        <div className="flex items-start justify-between border-b border-slate-200">
          <TrackingTabs active="requests" />
          <div className="flex overflow-hidden rounded-lg border border-blue-500 bg-white text-blue-600">
            <IconButton label="Baixar chamados"><DownloadIcon /></IconButton>
            <IconButton label="Configurações" divider><SettingsIcon /></IconButton>
          </div>
        </div>

        <section className="mt-5 grid gap-2 md:grid-cols-[250px_1fr_auto_auto]" aria-label="Busca de chamados">
          <label className="bg-slate-100 px-5 py-3 text-xs font-medium uppercase text-slate-500">
            <span>Data cadastro</span>
            <input className="sr-only" type="date" aria-label="Data cadastro" />
          </label>
          <label className="bg-slate-100 px-4 py-3 text-xs font-medium uppercase text-slate-500">
            <span className="sr-only">Buscar chamado</span>
            <input className="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="BUSCAR CHAMADO" />
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-500 bg-white px-6 text-sm text-blue-600" type="button"><FilterIcon /> Filtros</button>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-8 py-3 text-sm font-semibold text-white" type="button"><SearchIcon /> Buscar</button>
        </section>

        <div className="my-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex overflow-hidden rounded border border-slate-300">
            <button className="bg-blue-100 px-5 py-2 text-blue-600" type="button" aria-label="Visualização em quadro"><BoardIcon /></button>
            <button className="border-l border-slate-300 bg-white px-5 py-2 text-slate-500" type="button" aria-label="Visualização em lista"><ListIcon /></button>
          </div>
          <label className="flex items-center gap-6 text-sm text-slate-500">Ordenar por:
            <select className="min-w-48 border-b border-slate-300 bg-transparent px-2 py-2 outline-none" defaultValue="recent"><option value="recent">Últimos Chamados</option></select>
          </label>
        </div>

        <section className="grid gap-3 lg:grid-cols-3" aria-label="Quadro de chamados">
          {columns.map((column) => <RequestColumn key={column.title} {...column} />)}
        </section>
      </div>
    </section>
  );
}

function RequestColumn({ title, count, color, requests }: (typeof columns)[number]) {
  return (
    <section className="min-w-0">
      <header className="flex items-center gap-5 px-1 pb-2 text-sm"><h2>{title}</h2><span className="text-xs text-slate-400">{count}</span></header>
      <div className={`h-[3px] ${color}`} />
      <div className="mt-2 max-h-[610px] space-y-1 overflow-y-auto bg-slate-100 p-1.5">
        {requests.map((request) => <RequestItem key={request.id} request={request} />)}
      </div>
    </section>
  );
}

function RequestItem({ request }: { request: RequestCard }) {
  const tone = request.slaTone === "bad" ? "bg-rose-100 text-rose-500" : request.slaTone === "info" ? "bg-sky-100 text-sky-500" : "bg-emerald-100 text-emerald-600";
  return (
    <article className="overflow-hidden rounded-sm bg-white shadow-sm">
      <div className="p-4">
        <div className="flex justify-between gap-3"><h3 className="font-medium text-slate-700">#{request.id} - {request.title}</h3><button className="text-xl leading-none text-slate-700" aria-label={`Opções do chamado ${request.id}`}>⋮</button></div>
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><PersonIcon /> {request.requester}</p>
        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><ClockIcon /> {request.date}</p>
        {request.assignee && <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><AssigneeIcon /> {request.assignee}</p>}
        {request.sla && <div className="mt-1 flex justify-end"><span className={`rounded-full px-3 py-1 text-xs ${tone}`}>{request.sla}</span></div>}
      </div>
      <footer className="bg-slate-50 px-3 py-2 text-xs text-slate-500">{request.age}</footer>
    </article>
  );
}

function IconButton({ label, divider, children }: { label: string; divider?: boolean; children: React.ReactNode }) { return <button type="button" aria-label={label} className={`flex h-9 w-11 items-center justify-center ${divider ? "border-l border-blue-500" : ""}`}>{children}</button>; }
const icon = "h-[18px] w-[18px]";
function DownloadIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 18v3h14v-3" /></svg>; }
function SettingsIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7-.7-2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z"/></svg>; }
function FilterIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 5h16l-6 7v6l-4 2v-8z"/></svg>; }
function SearchIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg>; }
function BoardIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18"/><path d="M9 3v18m6-18v18"/></svg>; }
function ListIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="16"/><path d="M3 9h18M3 14h18M9 4v16"/></svg>; }
function PersonIcon() { return <svg className="h-4 w-4 shrink-0 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2z"/></svg>; }
function ClockIcon() { return <svg className="h-4 w-4 shrink-0 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>; }
function AssigneeIcon() { return <svg className="h-4 w-4 shrink-0 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="3"/><path d="M3 20a6 6 0 0 1 9-5m2 3 2 2 5-6"/></svg>; }
