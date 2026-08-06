"use client";

import { useEffect, useRef, useState } from "react";

import type {
  RequestBoardCardViewModel,
  RequestBoardColumnViewModel,
} from "@/src/presentation/view-models/request-board-view-model";

export function RequestBoard({ columns }: { columns: RequestBoardColumnViewModel[] }) {
  const [selectedRequest, setSelectedRequest] = useState<RequestBoardCardViewModel | null>(null);

  return (
    <>
      <section className="flex items-start gap-3 overflow-x-auto pb-6" aria-label="Quadro de chamados">
        {columns.map((column) => (
          <RequestColumn key={column.id} column={column} onOpen={setSelectedRequest} />
        ))}
      </section>
      {selectedRequest ? (
        <RequestDetailsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      ) : null}
    </>
  );
}

function RequestColumn({
  column,
  onOpen,
}: {
  column: RequestBoardColumnViewModel;
  onOpen: (request: RequestBoardCardViewModel) => void;
}) {
  return (
    <section className="w-[280px] shrink-0 rounded-xl border border-slate-300 bg-[#f1f2f4] p-2 shadow-sm">
      <header className="flex items-center justify-between gap-3 px-2 pb-2 pt-1">
        <h2 className="min-w-0 truncate text-sm font-semibold text-slate-800" title={column.title}>{column.title}</h2>
        <span className="text-sm tabular-nums text-slate-500" aria-label={`${column.requests.length} requests`}>{column.requests.length}</span>
      </header>
      <div className="max-h-[620px] space-y-2 overflow-y-auto">
        {column.requests.map((request) => (
          <article className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm transition-shadow hover:shadow-md" key={request.id}>
            <div className="mb-3 flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
              <strong className="min-w-0 break-words rounded-md bg-blue-50 px-2 py-1 text-sm font-bold text-blue-700">
                #{request.id} - {request.serviceTypeName}
              </strong>
              <button
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xl font-bold leading-none text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                type="button"
                aria-label={`Ver detalhes da request #${request.id}`}
                onClick={() => onOpen(request)}
              >
                <span aria-hidden="true">•••</span>
              </button>
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

function RequestDetailsModal({ request, onClose }: { request: RequestBoardCardViewModel; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
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
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}
    >
      <section
        aria-labelledby="request-modal-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Detalhes da request</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900" id="request-modal-title">
              #{request.id} - {request.serviceTypeName}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-2xl text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="button"
            aria-label="Fechar detalhes da request"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="space-y-7 p-5 sm:p-7">
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
                      // The source is an authenticated application route, not user-provided HTML.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="h-64 w-full bg-slate-100 object-contain" src={media.url} alt={`${media.fieldLabel}: ${media.fileName}`} />
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
      </section>
    </div>
  );
}

const STANDARD_REQUEST_DETAIL_IDS = new Set([
  "business",
  "region",
  "location",
  "service-type",
  "requester",
  "created-at",
  "description",
]);

function ModalDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-2 whitespace-pre-wrap break-words text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function ModalDetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="h-full rounded-xl border border-slate-200 bg-slate-50 p-4">
      <ModalDetail label={label} value={value} />
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CardDetail({ icon: detailIcon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="grid grid-cols-[18px_1fr] gap-x-2"><span className="mt-0.5 text-slate-400" aria-hidden="true">{detailIcon}</span><div className="min-w-0"><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-0.5 break-words text-[13px] font-medium leading-5 text-slate-700">{value}</dd></div></div>;
}

function RequesterIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.6-4 3-6 7-6s6.4 2 7 6"/></svg>; }
function LocationIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>; }
