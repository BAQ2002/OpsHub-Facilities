type RequestStatus = "Aberto" | "Fechado";

type Request = {
  id: number;
  title: string;
  createdAt: string;
  status: RequestStatus;
  hasUnreadMessage?: boolean;
};

const requests: Request[] = [
  {
    id: 212,
    title: "Teste10",
    createdAt: "29/04/2026 10:38",
    status: "Aberto" as const,
  },
  {
    id: 213,
    title: "Reparos em móveis",
    createdAt: "29/04/2026 11:35",
    status: "Aberto" as const,
  },
  {
    id: 214,
    title: "Pintura de segurança/operacional/predial/metálica",
    createdAt: "29/04/2026 11:38",
    status: "Aberto" as const,
  },
  {
    id: 215,
    title: "Reparos em móveis",
    createdAt: "29/04/2026 11:39",
    status: "Aberto" as const,
  },
  {
    id: 218,
    title: "Outros",
    createdAt: "29/04/2026 13:25",
    status: "Aberto" as const,
    hasUnreadMessage: true,
  },
  {
    id: 219,
    title: "Pintura de segurança/operacional/predial/metálica",
    createdAt: "29/04/2026 13:28",
    status: "Aberto" as const,
  },
  {
    id: 17,
    title: "Interruptor ou Tomada com defeito/quebrado",
    createdAt: "12/03/2026 10:28",
    status: "Fechado" as const,
  },
  {
    id: 217,
    title: "Outros",
    createdAt: "29/04/2026 13:15",
    status: "Fechado" as const,
  },
];

const openRequests = requests.filter((request) => request.status === "Aberto");
const closedRequests = requests.filter((request) => request.status === "Fechado");

export default function MyRequestsPage() {
  return (
    <section className="min-h-screen bg-[#fbfcfe] px-5 pb-10 pt-8 text-slate-950 md:px-8 lg:px-9">
      <div className="mx-auto w-full max-w-[980px]">
        <header className="mb-9 flex items-center gap-4 pt-1">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
            <AlertIcon />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-600">
              Acompanhamento
            </p>
            <h1 className="mt-1 text-[30px] font-bold leading-none tracking-[-0.03em] text-slate-950 md:text-[34px]">
              Minhas solicitações
            </h1>
          </div>
        </header>

        <section
          className="mb-10 grid gap-3 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)] md:grid-cols-[1fr_auto]"
          aria-label="Busca e filtros das minhas solicitações"
        >
          <label className="relative block">
            <span className="sr-only">Buscar por solicitação</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <SearchIcon />
            </span>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
              type="search"
              placeholder="Buscar por solicitação"
            />
          </label>

          <button
            className="inline-flex h-11 items-center justify-center gap-3 rounded-xl bg-teal-600 px-7 text-sm font-bold uppercase text-white shadow-[0_2px_4px_rgba(15,23,42,0.18)] transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 md:min-w-[250px]"
            type="button"
          >
            <FilterIcon />
            Adicionar filtro
          </button>
        </section>

        <RequestGroup title="Abertos" requests={openRequests} />
        <RequestGroup title="Fechados" requests={closedRequests} className="mt-10" />
      </div>
    </section>
  );
}

function RequestGroup({
  title,
  requests,
  className = "",
}: {
  title: string;
  requests: Request[];
  className?: string;
}) {
  return (
    <section className={className} aria-labelledby={`${title.toLowerCase()}-title`}>
      <div className="mb-5 flex items-center justify-between gap-4 px-3">
        <h2 id={`${title.toLowerCase()}-title`} className="text-base font-bold text-slate-950">
          {title}
        </h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {requests.length} solicitações
        </span>
      </div>

      <div className="space-y-3">
        {requests.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
    </section>
  );
}

function RequestCard({ request }: { request: Request }) {
  const isOpen = request.status === "Aberto";

  return (
    <article className="group rounded-[16px] border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_4px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.12)] sm:px-5">
      <div className="grid min-h-[64px] grid-cols-[1fr_auto] gap-4">
        <div className="min-w-0 self-center">
          <h3 className="truncate text-sm font-bold leading-tight text-slate-950">
            #{request.id} - {request.title}
          </h3>
          <time className="mt-2 block text-sm font-medium leading-none text-slate-600">
            {request.createdAt}
          </time>
        </div>

        <div className="flex min-w-[92px] flex-col items-end justify-between gap-3">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-950 transition hover:bg-slate-100"
            type="button"
            aria-label={`Abrir ações da solicitação ${request.id}`}
          >
            <MoreIcon />
          </button>

          <div className="flex items-center gap-2">
            {request.hasUnreadMessage ? <MessageIndicator /> : null}
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase leading-none text-white ${
                isOpen ? "bg-teal-600" : "bg-slate-400"
              }`}
            >
              {request.status}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function MessageIndicator() {
  return (
    <span className="relative inline-flex text-slate-400" aria-label="Mensagem não lida">
      <MessageIcon />
      <span className="absolute -right-0.5 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
    </span>
  );
}

function AlertIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.6 2.8a2 2 0 0 1 2.8 0l7.8 7.8a2 2 0 0 1 0 2.8l-7.8 7.8a2 2 0 0 1-2.8 0l-7.8-7.8a2 2 0 0 1 0-2.8l7.8-7.8Z" />
      <path d="M12 7.5v6" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4.1-4.1" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 5a1 1 0 0 1 .9-.55h14.2a1 1 0 0 1 .78 1.63L14 13.42V19a1 1 0 0 1-.45.84l-3 2A1 1 0 0 1 9 21v-7.58L4.12 6.08A1 1 0 0 1 4 5Z" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v7A2.5 2.5 0 0 1 16.5 15H9.6L5 19v-3.8A2.5 2.5 0 0 1 3 12.75V5.5Z" />
    </svg>
  );
}
