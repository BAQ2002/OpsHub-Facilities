"use client";
import { ResilientMedia } from "@/app/componentes/ResilientMedia";
import { useEffect, useRef, useState } from "react";
import type { RequestBoardCardViewModel, RequestBoardColumnViewModel, RequestDetailsViewModel } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";
import { RequestStatusSelect } from "./RequestStatusSelect";
import { useRequestDetails } from "../_hooks/useRequestDetails";
import { ResourceDialog } from "./ResourceDialog";
import { VisitsModal, AddVisitModal } from "./VisitModals";
import { ModalDetail, ModalDetailCard } from "./DetailFields";
const STANDARD_REQUEST_DETAIL_IDS = new Set([
  "business",
  "region",
  "location",
  "service-type",
  "requester",
  "created-at",
  "description",
]);

type DetailsProps = { card: RequestBoardCardViewModel; statuses: RequestBoardColumnViewModel[]; statusId: number; onStatusChanged: () => void; onClose: () => void };

export function ChamadoDetailsModal(props: DetailsProps) {
  const query = useRequestDetails(props.card.id);
  if (query.error || !query.data) return <ResourceDialog label={`Solicitação #${props.card.id}`} error={query.error} pending={query.pending} retry={query.refresh} onClose={props.onClose} />;
  return <LoadedChamadoDetails {...props} request={query.data} onDetailsChanged={query.refresh} />;
}

function LoadedChamadoDetails({ request, statuses, statusId, onStatusChanged, onDetailsChanged, onClose }: Omit<DetailsProps, "card"> & { request: RequestDetailsViewModel; onDetailsChanged: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [showVisit, setShowVisit] = useState(false);
  const [showVisits, setShowVisits] = useState(false);
  const detailsById = new Map(request.details.map((detail) => [detail.id, detail]));
  const businessDetail = detailsById.get("business");
  const regionDetail = detailsById.get("region");
  const locationDetail = detailsById.get("location");
  const createdAtDetail = detailsById.get("created-at");
  const descriptionDetail = detailsById.get("description");
  const serviceSpecificDetails = request.details.filter(
    (detail) => !STANDARD_REQUEST_DETAIL_IDS.has(detail.id),
  );

  useEffect(() => {
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    /**
     * Acionada internamente pela função ou pelo componente que a declara.
     *
     * Atualiza o estado da interface para close on escape.
     * Durante o fluxo, aciona {@link setShowVisit}, {@link setShowVisits}, {@link onClose}.
     *
     * @param event Dados necessários para executar esta função.
     * @returns Não retorna valor.
     */
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (showVisit) setShowVisit(false);
      else if (showVisits) setShowVisits(false);
      else onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, showVisit, showVisits]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
      data-ui="request-details-overlay"
      role="presentation"
      onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}
    >
      <section
        data-ui="request-details-dialog"
        aria-labelledby="request-modal-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
      >
        <div className="max-h-[90vh] overflow-y-auto">
        <header data-ui="request-details-header" className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Detalhes da solicitação</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900" id="request-modal-title">
              #{request.id} - {request.serviceTypeName}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-2xl text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="button"
            aria-label="Fechar detalhes da solicitação"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="flex flex-wrap items-center justify-end gap-3 border-b border-slate-200 px-5 py-5 sm:px-7">
          <RequestStatusSelect key={`${request.id}:${statusId}`} requestId={request.id} statusId={statusId} statuses={statuses} onSaved={onStatusChanged} />
          <button
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="button"
            onClick={() => setShowVisits(true)}
          >
            Visualizar visitas
          </button>
          <button
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="button"
            onClick={() => setShowVisit(true)}
          >
            Adicionar visita
          </button>
        </div>

        <div data-ui="request-details-content" className="space-y-7 p-5 sm:p-7">
          <dl className="grid gap-x-8 gap-y-5 border-b border-slate-200 pb-7 sm:grid-cols-2">
            <ModalDetail label="Solicitante" value={request.requesterName} />
            <ModalDetail
              label={createdAtDetail?.label ?? "Data de abertura"}
              value={createdAtDetail?.value ?? "Não informada"}
            />
          </dl>

          <dl className="grid gap-4 md:grid-cols-3">
            <ModalDetailCard label={businessDetail?.label ?? "Unidade de negócio"} value={businessDetail?.value ?? "Não informado"} />
            <ModalDetailCard label={regionDetail?.label ?? "Região"} value={regionDetail?.value ?? "Não informado"} />
            <ModalDetailCard label={locationDetail?.label ?? "Localização"} value={locationDetail?.value ?? request.locationName} />
          </dl>

          <dl>
            <ModalDetailCard
              label={descriptionDetail?.label ?? "Descrição"}
              value={descriptionDetail?.value ?? "Não informado"}
            />
          </dl>

          {serviceSpecificDetails.length > 0 ? (
            <section aria-labelledby="request-specific-fields-title">
              <h3
                className="mb-4 border-b border-slate-200 pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                id="request-specific-fields-title"
              >
                Campos específicos do serviço
              </h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                {serviceSpecificDetails.map((detail) => (
                  <ModalDetailCard key={detail.id} label={detail.label} value={detail.value} />
                ))}
              </dl>
            </section>
          ) : null}

          {request.media.length > 0 ? (
            <section aria-labelledby="request-media-title">
              <h3 className="mb-3 text-base font-bold text-slate-900" id="request-media-title">Anexos</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {request.media.map((media) => (
                  <figure className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50" key={media.id}>
                    {media.mimeType.startsWith("image/") ? (
                      <ResilientMedia className="h-64 w-full bg-slate-100 object-contain" src={media.url} alt={`${media.fieldLabel}: ${media.fileName}`} />
                    ) : (
                      <div className="flex h-32 items-center justify-center p-4 text-center text-sm text-slate-500">Pré-visualização indisponível</div>
                    )}
                    <figcaption className="border-t border-slate-200 bg-white p-3">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{media.fieldLabel}</span>
                      <a className="mt-1 block break-all text-sm font-medium text-blue-700 hover:underline" href={media.url} target="_blank" rel="noreferrer">{media.fileName}</a>
                      {media.fileSize ? <span className="mt-1 block text-xs text-slate-400">{formatFileSize(media.fileSize)}</span> : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}
        </div>
        </div>
      </section>
      {showVisits ? <VisitsModal request={request} onVisitChanged={onDetailsChanged} onClose={() => setShowVisits(false)} /> : null}
      {showVisit ? <AddVisitModal requestId={request.id} onSaved={onDetailsChanged} onClose={() => setShowVisit(false)} /> : null}
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
