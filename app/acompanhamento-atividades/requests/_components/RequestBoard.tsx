"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addVisitAction, type AddVisitState } from "../actions";

import type {
  RequestBoardCardViewModel,
  RequestBoardColumnViewModel,
} from "@/src/presentation/view-models/request-board-view-model";

type Executor = { id: number; name: string };

export function RequestBoard({ columns, executors }: { columns: RequestBoardColumnViewModel[]; executors: Executor[] }) {
  const [selectedRequest, setSelectedRequest] = useState<RequestBoardCardViewModel | null>(null);

  return (
    <>
      <section className="flex items-start gap-3 overflow-x-auto pb-6" aria-label="Quadro de chamados">
        {columns.map((column) => (
          <RequestColumn key={column.id} column={column} onOpen={setSelectedRequest} />
        ))}
      </section>
      {selectedRequest ? (
        <RequestDetailsModal request={selectedRequest} executors={executors} onClose={() => setSelectedRequest(null)} />
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
    <section className="min-w-[280px] flex-1 rounded-xl border border-slate-300 bg-[#f1f2f4] p-2 shadow-sm">
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

function RequestDetailsModal({ request, executors, onClose }: { request: RequestBoardCardViewModel; executors: Executor[]; onClose: () => void }) {
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

        <div className="flex flex-wrap justify-end gap-3 border-b border-slate-200 px-5 py-3 sm:px-7">
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
      {showVisits ? <VisitsModal request={request} onClose={() => setShowVisits(false)} /> : null}
      {showVisit ? <AddVisitModal requestId={request.id} executors={executors} onClose={() => setShowVisit(false)} /> : null}
    </div>
  );
}

function VisitsModal({ request, onClose }: { request: RequestBoardCardViewModel; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/65 p-4"
      role="presentation"
      onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}
    >
      <section
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visits-modal-title"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Request #{request.id}</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900" id="visits-modal-title">Visitas vinculadas</h2>
          </div>
          <button
            ref={closeButtonRef}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-2xl text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="button"
            aria-label="Fechar visitas vinculadas"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="p-5 sm:p-7">
          {request.visits.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {request.visits.map((visit) => (
                <article className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm" key={visit.id}>
                  <dl className="grid gap-4 border-b border-slate-200 pb-4 sm:grid-cols-2">
                    <ModalDetail label="Data de início" value={visit.startDate} />
                    <ModalDetail label="Data de fim" value={visit.endDate} />
                  </dl>
                  <dl className="pt-4">
                    <ModalDetail label="Descrição da visita" value={visit.description} />
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <p className="text-sm font-semibold text-slate-700">Nenhuma visita vinculada</p>
              <p className="mt-1 text-sm text-slate-500">Esta request ainda não possui registros de visita.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const initialVisitState: AddVisitState = { status: "idle", message: "" };

function AddVisitModal({ requestId, executors, onClose }: { requestId: number; executors: Executor[]; onClose: () => void }) {
  const action = addVisitAction.bind(null, requestId);
  const [state, formAction, pending] = useActionState(action, initialVisitState);
  const [photoNames, setPhotoNames] = useState<string[]>([]);

  useEffect(() => {
    if (state.status === "success") {
      const timer = window.setTimeout(onClose, 900);
      return () => window.clearTimeout(timer);
    }
  }, [state.status, onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/65 p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="visit-modal-title">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Request #{requestId}</p><h2 id="visit-modal-title" className="mt-1 text-xl font-bold text-slate-900">Adicionar visita</h2></div>
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-2xl text-slate-500 hover:bg-slate-100" aria-label="Fechar formulário de visita" onClick={onClose}>×</button>
        </header>
        <form action={formAction} className="space-y-6 p-6">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">Executantes <span className="text-red-500">*</span></legend>
            <div className="grid max-h-36 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3 sm:grid-cols-2">
              {executors.map((executor) => <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-blue-50" key={executor.id}><input className="h-4 w-4 accent-blue-600" type="checkbox" name="member_ids" value={executor.id} />{executor.name}</label>)}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <VisitField label="Data e hora do início"><input className={inputClass} name="start_datetime" type="datetime-local" required /></VisitField>
            <VisitField label="Data e hora do fim"><input className={inputClass} name="stop_datetime" type="datetime-local" required /></VisitField>
          </div>
          <VisitField label="Descrição"><textarea className={`${inputClass} min-h-28 resize-y`} maxLength={300} name="description" placeholder="Descreva as atividades realizadas durante a visita" required /></VisitField>
          <VisitField label="Registros fotográficos">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-4 py-6 text-center text-sm text-blue-700 hover:bg-blue-50">
              <span className="text-2xl" aria-hidden="true">＋</span><strong>Selecionar fotos</strong><span className="mt-1 text-xs text-slate-500">Imagens de até 10 MB cada</span>
              <input className="sr-only" name="photos" type="file" accept="image/*" multiple required onChange={(event) => setPhotoNames(Array.from(event.target.files ?? [], (file) => file.name))} />
            </label>
            {photoNames.length ? <ul className="mt-2 text-xs text-slate-500">{photoNames.map((name) => <li className="truncate" key={name}>• {name}</li>)}</ul> : null}
          </VisitField>
          {state.message ? <p className={`rounded-lg p-3 text-sm ${state.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`} role="status">{state.message}</p> : null}
          <footer className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={onClose}>Cancelar</button><button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={pending}>{pending ? "Salvando..." : "Adicionar visita"}</button></footer>
        </form>
      </section>
    </div>
  );
}

const inputClass = "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
function VisitField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-semibold text-slate-700">{label} <span className="text-red-500">*</span>{children}</label>; }

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
