import Link from "next/link";
import { getServiceCatalogPageData } from "@/src/server/services/activity-request-form-service";

export const dynamic = "force-dynamic";

/**
 * Acionada pelo Next.js durante a renderização da rota correspondente.
 *
 * Monta os dados e a interface da página de solicitar atividade.
 * Durante o fluxo, aciona `getServiceCatalogPageData`, `map`.
 *
 * @returns O elemento React que representa esta interface.
 */
export default async function SolicitarAtividadePage() {
  const serviceCategories = await getServiceCatalogPageData();
  return (
    <section className="min-h-screen bg-[#fbfcfe] px-5 pb-10 pt-8 text-slate-950 md:px-8 lg:px-9">
      <div className="mx-auto w-full max-w-[980px]">
        <header className="mb-6">
          <div className="flex items-center gap-4">
            <span
              className="flex h-9 w-9 items-center justify-center text-slate-950"
              aria-hidden="true"
            >
              <AlertDiamondIcon />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600">
                Solicitar atividade de chamado
              </p>
              <h1 className="mt-1 text-[28px] font-semibold leading-none tracking-[-0.03em] text-slate-800">
                Chamados
              </h1>
            </div>
          </div>

          <label className="relative mt-6 block" htmlFor="service-search">
            <span className="sr-only">Busque por nome ou categoria do chamado</span>
            <span
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            >
              <SearchIcon />
            </span>
            <input
              className="h-10 w-full rounded-[4px] border border-slate-100 bg-slate-100 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
              id="service-search"
              name="busca"
              placeholder="Busque por nome ou categoria do chamado"
              type="search"
            />
          </label>
        </header>

        <div className="space-y-6">
          {serviceCategories.map((category) => (
            <section
              className="border-b border-slate-200 pb-4 last:border-b-0"
              key={category.id}
              aria-labelledby={`category-${category.id}`}
            >
              <h2
                className="mb-4 text-sm font-bold uppercase tracking-[0.02em] text-slate-800"
                id={`category-${category.id}`}
              >
                {category.name}
              </h2>

              <div className="grid gap-3 md:grid-cols-2">
                {category.serviceTypes.map((serviceType) => (
                  <Link
                    className="group flex min-h-11 items-center justify-between gap-4 rounded-[4px] border border-slate-100 bg-white px-4 py-3 text-sm font-medium text-slate-800 no-underline shadow-[0_4px_14px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:border-teal-200 hover:text-teal-700 hover:shadow-[0_8px_22px_rgba(15,23,42,0.14)] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    href={`/solicitar-atividade/chamado?service_category=${encodeURIComponent(category.name)}&service_type=${encodeURIComponent(serviceType.name)}&service_type_id=${serviceType.id}`}
                    key={serviceType.id}
                    title={serviceType.name}
                  >
                    <span className="truncate">{serviceType.name}</span>
                    <span
                      className="shrink-0 text-xl leading-none text-slate-800 transition group-hover:translate-x-0.5 group-hover:text-teal-700"
                      aria-hidden="true"
                    >
                      ›
                    </span>
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

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de alert diamond.
 *
 * @returns O elemento React que representa esta interface.
 */
function AlertDiamondIcon() {
  return (
    <svg width="31" height="31" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.75 21.25 12 12 21.25 2.75 12 12 2.75Z" stroke="currentColor" strokeWidth="1.35" />
      <path d="M12 7.25v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 16.85h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de search.
 *
 * @returns O elemento React que representa esta interface.
 */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
