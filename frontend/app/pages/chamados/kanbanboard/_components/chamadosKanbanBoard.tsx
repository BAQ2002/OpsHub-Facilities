"use client";
import { DataUnavailable } from "@/app/componentes/DataUnavailable";
import { AvailabilityNotice } from "@/app/componentes/AvailabilityNotice";
import { KanbanBoard } from "@/app/componentes/KanbanBoard";
import type { RequestBoardCardViewModel, RequestBoardPageViewModel } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";
import type { RequestBoardFilters } from "@/app/services/request-board-service";
import { ChamadoDetailsModal } from "./ChamadoDetailsModal";
import { useChamados } from "../_hooks/useChamados";
import { useRequestBoardWindows } from "../_hooks/useRequestBoardWindows";

/** Adapta os view models de chamados ao quadro reutilizável. */
export function ChamadosKanbanBoard() {
  const { data, appliedFilters, refresh, selectedStatusIds, error, isPending } = useChamados();
  if (error) return <section aria-label="Quadro de chamados"><AvailabilityNotice /><DataUnavailable error={error} retry={refresh} pending={isPending} /></section>;
  if (!data) return <p role="status">Carregando chamados...</p>;
  return <LoadedBoard data={data} filters={appliedFilters} refresh={refresh} selectedStatusIds={selectedStatusIds} />;
}

function LoadedBoard({ data, filters, refresh, selectedStatusIds }: {
  data: RequestBoardPageViewModel; filters: RequestBoardFilters; refresh: () => void; selectedStatusIds: number[];
}) {
  const windows = useRequestBoardWindows(data, filters);
  const columns = windows.columns.map((column) => ({ id: column.id, title: column.title, items: column.requests, total: column.total,
    pagination: { offset: column.offset, total: column.total, pageSize: column.pageSize, pending: column.pending,
      error: column.error?.message, request: (offset: number) => windows.request(column.id, offset),
      retry: () => windows.request(column.id, column.requestedOffset) },
  }));
  return (
    <KanbanBoard
      datasetVersion={windows.version}
      columns={columns}
      visibleColumnIds={selectedStatusIds.length ? selectedStatusIds : undefined}
      getItemKey={(request) => request.id}
      getCountLabel={(column) => `${column.total} solicitações`}
      ariaLabel="Quadro de chamados"
      emptyMessage="Nenhum chamado encontrado para os filtros informados."
      dataUi="request-board"
      renderCard={(request, onOpen) => <RequestCard request={request} onOpen={onOpen} />}
      renderDetails={(request, column, onClose) => (
        <ChamadoDetailsModal
          key={request.id}
          card={request}
          statuses={data.columns}
          statusId={Number(column.id)}
          onStatusChanged={refresh}
          onClose={onClose}
        />
      )}
    />
  );
}
type RequestCardProps = {
  request: RequestBoardCardViewModel;
  onOpen: () => void;
};

function RequestCard({ request, onOpen }: RequestCardProps) {
  return (
    <article data-ui="request-board-card" className="h-full overflow-hidden rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
        <strong title={`#${request.id} - ${request.serviceTypeName}`} className="line-clamp-2 min-w-0 break-words rounded-md bg-blue-50 px-2 py-1 text-sm font-bold text-blue-700">
          #{request.id} - {request.serviceTypeName}
        </strong>
        <button
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xl font-bold leading-none text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          type="button"
          aria-label={`Ver detalhes da solicitação #${request.id}`}
          onClick={onOpen}
        >
          <span aria-hidden="true">•••</span>
        </button>
      </div>
      <dl className="space-y-2.5">
        <CardDetail icon={<RequesterIcon />} label="Solicitante" value={request.requesterName} />
        <CardDetail icon={<LocationIcon />} label="Local solicitado" value={request.locationName} />
      </dl>
    </article>
  );
}

function CardDetail({ icon: detailIcon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="grid grid-cols-[18px_1fr] gap-x-2"><span className="mt-0.5 text-slate-400" aria-hidden="true">{detailIcon}</span><div className="min-w-0"><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd title={value} className="mt-0.5 truncate text-[13px] font-medium leading-5 text-slate-700">{value}</dd></div></div>;
}

function RequesterIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.6-4 3-6 7-6s6.4 2 7 6"/></svg>; }

function LocationIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>; }
