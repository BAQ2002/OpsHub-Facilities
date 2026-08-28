"use client";

import { useActionState, useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { DeleteRequestTaskChecklist, InsertRequestTask, InsertRequestTaskChecklist, UpdateRequestTask, type AddVisitState } from "../actions";
import type { ChecklistDefinition, ChecklistSubmission } from "@/src/domain/entities/checklist";

import type {
  RequestBoardCardViewModel,
  RequestBoardColumnViewModel,
} from "@/src/presentation/view-models/request-board-view-model";

type Executor = { id: number; name: string };
type Visit = RequestBoardCardViewModel["visits"][number];

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente RequestBoard com os dados recebidos.
 * Durante o fluxo, aciona {@link useState}, {@link find}, {@link flatMap}, {@link map} e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
export function RequestBoard({ columns, executors, checklistDefinitions }: { columns: RequestBoardColumnViewModel[]; executors: Executor[]; checklistDefinitions: ChecklistDefinition[] }) {
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const selectedRequest = columns.flatMap((column) => column.requests).find((request) => request.id === selectedRequestId) ?? null;

  return (
    <>
      <section className="flex items-start gap-3 overflow-x-auto pb-6" aria-label="Quadro de chamados">
        {columns.map((column) => (
          <RequestColumn key={column.id} column={column} onOpen={(request) => setSelectedRequestId(request.id)} />
        ))}
      </section>
      {selectedRequest ? (
        <RequestDetailsModal request={selectedRequest} executors={executors} checklistDefinitions={checklistDefinitions} onClose={() => setSelectedRequestId(null)} />
      ) : null}
    </>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente RequestColumn com os dados recebidos.
 * Durante o fluxo, aciona {@link map}, {@link onOpen}.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
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

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente RequestDetailsModal com os dados recebidos.
 * Durante o fluxo, aciona {@link useRef}, {@link useState}, {@link map}, {@link get} e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function RequestDetailsModal({ request, executors, checklistDefinitions, onClose }: { request: RequestBoardCardViewModel; executors: Executor[]; checklistDefinitions: ChecklistDefinition[]; onClose: () => void }) {
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
      role="presentation"
      onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}
    >
      <section
        aria-labelledby="request-modal-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
      >
        <div className="max-h-[90vh] overflow-y-auto">
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
        </div>
      </section>
      {showVisits ? <VisitsModal request={request} executors={executors} checklistDefinitions={checklistDefinitions} onClose={() => setShowVisits(false)} /> : null}
      {showVisit ? <AddVisitModal requestId={request.id} executors={executors} checklistDefinitions={checklistDefinitions} onClose={() => setShowVisit(false)} /> : null}
    </div>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente VisitsModal com os dados recebidos.
 * Durante o fluxo, aciona {@link useRef}, {@link useState}, {@link find}, {@link useEffect} e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function VisitsModal({ request, executors, checklistDefinitions, onClose }: { request: RequestBoardCardViewModel; executors: Executor[]; checklistDefinitions: ChecklistDefinition[]; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const selectedVisit = request.visits.find((visit) => visit.id === selectedVisitId) ?? null;

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
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visits-modal-title"
      >
        <div className="max-h-[90vh] overflow-y-auto">
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
                <button className="w-full rounded-xl border border-slate-200 bg-slate-50 p-5 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300" key={visit.id} type="button" onClick={() => setSelectedVisitId(visit.id)} aria-label={`Visualizar visita de ${visit.startDate}`}>
                  <dl className="grid gap-4 border-b border-slate-200 pb-4 sm:grid-cols-2">
                    <ModalDetail label="Data de início" value={visit.startDate} />
                    <ModalDetail label="Data de fim" value={visit.endDate} />
                  </dl>
                  <dl className="pt-4">
                    <ModalDetail label="Descrição da visita" value={visit.description} />
                  </dl>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <p className="text-sm font-semibold text-slate-700">Nenhuma visita vinculada</p>
              <p className="mt-1 text-sm text-slate-500">Esta request ainda não possui registros de visita.</p>
            </div>
          )}
        </div>
        </div>
      </section>
      {selectedVisit ? <VisitDetailsModal visit={selectedVisit} executors={executors} checklistDefinitions={checklistDefinitions} onClose={() => setSelectedVisitId(null)} /> : null}
    </div>
  );
}

const initialUpdateVisitState: AddVisitState = { status: "idle", message: "" };

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente VisitDetailsModal com os dados recebidos.
 * Durante o fluxo, aciona {@link bind}, {@link useActionState}, {@link useState}, {@link map} e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function VisitDetailsModal({ visit, executors, checklistDefinitions, onClose }: { visit: Visit; executors: Executor[]; checklistDefinitions: ChecklistDefinition[]; onClose: () => void }) {
  const action = UpdateRequestTask.bind(null, visit.id);
  const [state, formAction, pending] = useActionState(action, initialUpdateVisitState);
  const [editing, setEditing] = useState(false);
  const [selectedExecutorIds, setSelectedExecutorIds] = useState(visit.executors.map((executor) => executor.id));
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const newMedia = useMediaPreviews(newMediaFiles);
  const formRef = useRef<HTMLFormElement>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [deletingChecklist, startDeleteChecklist] = useTransition();
  const [checklistMessage, setChecklistMessage] = useState("");

  /**
   * Acionada internamente pela função ou pelo componente que a declara.
   *
   * Atualiza o estado da interface para cancel editing.
   * Durante o fluxo, aciona {@link reset}, {@link setSelectedExecutorIds}, {@link map}, {@link setNewMediaFiles} e outras rotinas auxiliares.
   *
   * @returns Não retorna valor.
   */
  function cancelEditing() {
    formRef.current?.reset();
    setSelectedExecutorIds(visit.executors.map((executor) => executor.id));
    setNewMediaFiles([]);
    setEditing(false);
  }

  useEffect(() => {
    if (state.status !== "success") return;
    const timer = window.setTimeout(() => setEditing(false), 0);
    return () => window.clearTimeout(timer);
  }, [state.status]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="visit-details-title">
        <div className="max-h-[92vh] overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Detalhes da visita</p><h2 id="visit-details-title" className="mt-1 text-xl font-bold text-slate-900">Visita #{visit.id}</h2></div>
          <div className="flex items-center gap-2">
            <button type="button" disabled={editing} onClick={() => setEditing(true)} className="flex h-9 items-center gap-2 rounded-lg border border-blue-200 px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400" aria-label="Editar visita"><EditIcon /> Editar</button>
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-2xl text-slate-500 hover:bg-slate-100" aria-label="Fechar detalhes da visita" onClick={onClose}>×</button>
          </div>
        </header>
        <form ref={formRef} action={formAction} className="space-y-6 p-6">
          {selectedExecutorIds.map((id) => <input key={id} type="hidden" name="member_ids" value={id} />)}
          <fieldset disabled={!editing || pending} className="space-y-6 disabled:pointer-events-none">
            <VisitField label="Executantes">
              <div className={`mt-2 max-h-44 space-y-1 overflow-y-auto rounded-xl border p-3 ${editing ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-100"}`}>
                {executors.map((executor) => <label className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm" key={executor.id}><input type="checkbox" className="h-4 w-4 accent-blue-600" checked={selectedExecutorIds.includes(executor.id)} onChange={() => setSelectedExecutorIds((ids) => ids.includes(executor.id) ? ids.filter((id) => id !== executor.id) : [...ids, executor.id])} />{executor.name}</label>)}
              </div>
            </VisitField>
            <div className="grid gap-4 sm:grid-cols-2">
              <VisitField label="Data e hora do início"><input className={editing ? inputClass : readOnlyInputClass} name="start_datetime" type="datetime-local" defaultValue={visit.startDatetime} required /></VisitField>
              <VisitField label="Data e hora do fim"><input className={editing ? inputClass : readOnlyInputClass} name="stop_datetime" type="datetime-local" defaultValue={visit.endDatetime} required /></VisitField>
            </div>
            <VisitField label="Descrição"><textarea className={`${editing ? inputClass : readOnlyInputClass} min-h-28 resize-none`} name="description" defaultValue={visit.description} maxLength={300} required /></VisitField>
          </fieldset>
          <VisitMediaField
            media={[...visit.photos, ...newMedia]}
            input={editing ? (
              <input
                className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700"
                name="photos"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(event) => setNewMediaFiles(Array.from(event.target.files ?? []))}
              />
            ) : null}
          />
          <section className="space-y-3 border-t border-slate-200 pt-5" aria-labelledby="visit-checklists-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h3 id="visit-checklists-title" className="font-bold text-slate-900">Checklists</h3><p className="text-sm text-slate-500">Registros imutáveis vinculados a esta visita.</p></div>
              <button className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" type="button" onClick={() => setShowChecklist(true)}>＋ Adicionar checklist</button>
            </div>
            {visit.checklists.length ? <ul className="space-y-3">
              {visit.checklists.map((checklist, index) => <li key={checklist.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="font-semibold text-slate-900">{checklist.name} <span className="font-normal text-slate-500">#{index + 1}</span></p><p className="text-xs text-slate-500">Versão {checklist.version}{checklist.description ? ` · ${checklist.description}` : ""}</p></div>
                  <button disabled={deletingChecklist} className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50" type="button" onClick={() => {
                    if (!window.confirm(`Excluir a ocorrência de ${checklist.name}?`)) return;
                    startDeleteChecklist(async () => { const result = await DeleteRequestTaskChecklist(checklist.id); setChecklistMessage(result.message); });
                  }}>Excluir</button>
                </div>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <ModalDetail label="Empresa/Setor" value={formatChecklistValue(checklist.corporation)} />
                  <ModalDetail label="Tag" value={formatChecklistValue(checklist.equipmentTag)} />
                  <ModalDetail label="Marca" value={formatChecklistValue(checklist.equipmentBrand)} />
                  <ModalDetail label="Modelo" value={formatChecklistValue(checklist.equipmentModel)} />
                  <ModalDetail label="Equipamento alugado?" value={formatChecklistValue(checklist.rentedEquipment)} />
                  <ModalDetail label="Nº Série ou Patrimônio" value={formatChecklistValue(checklist.serialNumber)} />
                  <ModalDetail label="PT" value={formatChecklistValue(checklist.ptNumber)} />
                  {checklist.values.map((item) => <ModalDetail key={item.id} label={item.name} value={formatChecklistValue(item.value)} />)}
                </dl>
              </li>)}
            </ul> : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">Nenhum checklist vinculado.</p>}
            {checklistMessage ? <p className="text-sm text-slate-600" role="status">{checklistMessage}</p> : null}
          </section>
          {state.message ? <p className={`rounded-lg p-3 text-sm ${state.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`} role="status">{state.message}</p> : null}
          {editing ? <footer className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={cancelEditing}>Cancelar</button><button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={pending}>{pending ? "Salvando..." : "Salvar"}</button></footer> : null}
        </form>
        </div>
      </section>
      {showChecklist ? <AddChecklistModal visitId={visit.id} definitions={checklistDefinitions} onClose={() => setShowChecklist(false)} /> : null}
    </div>
  );
}

const initialVisitState: AddVisitState = { status: "idle", message: "" };

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente AddVisitModal com os dados recebidos.
 * Durante o fluxo, aciona {@link bind}, {@link useActionState}, {@link useState}, {@link useMediaPreviews} e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function AddVisitModal({ requestId, executors, checklistDefinitions, onClose }: { requestId: number; executors: Executor[]; checklistDefinitions: ChecklistDefinition[]; onClose: () => void }) {
  const action = InsertRequestTask.bind(null, requestId);
  const [state, formAction, pending] = useActionState(action, initialVisitState);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const mediaPreviews = useMediaPreviews(mediaFiles);
  const [executorSearch, setExecutorSearch] = useState("");
  const [selectedExecutorIds, setSelectedExecutorIds] = useState<number[]>([]);
  const normalizedSearch = normalizeSearchValue(executorSearch);
  const filteredExecutors = executors.filter((executor) => normalizeSearchValue(executor.name).includes(normalizedSearch));
  const [checklists, setChecklists] = useState<ChecklistDraft[]>([]);
  const [checklistModalKey, setChecklistModalKey] = useState<number | "new" | null>(null);

  /**
   * Acionada internamente pela função ou pelo componente que a declara.
   *
   * Toggle executor para o formato esperado pelo fluxo.
   * Durante o fluxo, aciona {@link setSelectedExecutorIds}, {@link includes}, {@link filter}.
   *
   * @param executorId Dados necessários para executar esta função.
   * @returns Não retorna valor.
   */
  function toggleExecutor(executorId: number) {
    setSelectedExecutorIds((currentIds) => (
      currentIds.includes(executorId)
        ? currentIds.filter((id) => id !== executorId)
        : [...currentIds, executorId]
    ));
  }

  useEffect(() => {
    if (state.status === "success") {
      const timer = window.setTimeout(onClose, 900);
      return () => window.clearTimeout(timer);
    }
  }, [state.status, onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="visit-modal-title">
        <div className="max-h-[92vh] overflow-y-auto">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Request #{requestId}</p><h2 id="visit-modal-title" className="mt-1 text-xl font-bold text-slate-900">Adicionar visita</h2></div>
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-2xl text-slate-500 hover:bg-slate-100" aria-label="Fechar formulário de visita" onClick={onClose}>×</button>
        </header>
        <form action={formAction} className="space-y-5 p-6">
          <input type="hidden" name="checklists_json" value={serializeChecklists(checklists)} />
          <div className="grid gap-5 md:grid-cols-2 md:items-start">
            <div className="grid gap-5">
              <VisitField label="Data e hora do início"><input className={inputClass} name="start_datetime" type="datetime-local" required /></VisitField>
              <VisitField label="Data e hora do fim"><input className={inputClass} name="stop_datetime" type="datetime-local" required /></VisitField>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-700">Executante(s) <span className="text-red-500">*</span></legend>
              <label className="relative block">
                <span className="sr-only">Buscar executante pelo nome</span>
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400" aria-hidden="true">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>
                </span>
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  type="search"
                  value={executorSearch}
                  onChange={(event) => setExecutorSearch(event.target.value)}
                  placeholder="Buscar executante pelo nome"
                />
              </label>
              {selectedExecutorIds.map((executorId) => <input key={executorId} type="hidden" name="member_ids" value={executorId} />)}
              <div className="mt-2 h-[132px] space-y-0.5 overflow-y-auto rounded-lg border border-slate-200 p-2">
                {filteredExecutors.length ? filteredExecutors.map((executor) => (
                  <label className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-blue-50" key={executor.id}>
                    <input
                      className="h-4 w-4 accent-blue-600"
                      type="checkbox"
                      checked={selectedExecutorIds.includes(executor.id)}
                      onChange={() => toggleExecutor(executor.id)}
                    />
                    {executor.name}
                  </label>
                )) : <p className="px-2 py-4 text-center text-sm text-slate-500">Nenhum executante encontrado.</p>}
              </div>
            </fieldset>
          </div>
          <VisitField label="Descrição"><textarea className={`${inputClass} min-h-24 resize-y`} maxLength={300} name="description" placeholder="Descreva as atividades realizadas durante a visita" required /></VisitField>
          <VisitField label="Registros fotográficos">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/30 px-4 py-4 text-center text-sm text-blue-700 hover:bg-blue-50">
              <span className="text-2xl" aria-hidden="true">＋</span><strong>Selecionar fotos ou vídeos</strong><span className="mt-1 text-xs text-slate-500">Arquivos de até 10 MB cada</span>
              <input className="sr-only" name="photos" type="file" accept="image/*,video/*" multiple required onChange={(event) => setMediaFiles(Array.from(event.target.files ?? []))} />
            </label>
          </VisitField>
          <MediaGallery media={mediaPreviews} emptyMessage="Selecione fotos ou vídeos para pré-visualizá-los." />
          <ChecklistDraftSummary
            definitions={checklistDefinitions}
            drafts={checklists}
            onAdd={() => setChecklistModalKey("new")}
            onEdit={setChecklistModalKey}
            onRemove={(key) => setChecklists((drafts) => drafts.filter((draft) => draft.key !== key))}
          />
          {state.message ? <p className={`rounded-lg p-3 text-sm ${state.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`} role="status">{state.message}</p> : null}
          <footer className="flex justify-end gap-3 border-t border-slate-200 pt-4"><button className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={onClose}>Cancelar</button><button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={pending}>{pending ? "Salvando..." : "Adicionar visita"}</button></footer>
        </form>
        </div>
      </section>
      {checklistModalKey !== null ? (
        <DraftChecklistModal
          definitions={checklistDefinitions}
          initialDraft={checklistModalKey === "new" ? undefined : checklists.find((draft) => draft.key === checklistModalKey)}
          onClose={() => setChecklistModalKey(null)}
          onSave={(draft) => {
            setChecklists((drafts) => checklistModalKey === "new"
              ? [...drafts, draft]
              : drafts.map((item) => item.key === checklistModalKey ? draft : item));
            setChecklistModalKey(null);
          }}
        />
      ) : null}
    </div>
  );
}

type ChecklistDraft = {
  key: number;
  checklistTypeId: number;
  corporation: string;
  equipmentTag: string;
  equipmentBrand: string;
  equipmentModel: string;
  rentedEquipment: boolean | null;
  serialNumber: string;
  ptNumber: string;
  values: Record<number, unknown>;
};

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente AddChecklistModal com os dados recebidos.
 * Durante o fluxo, aciona {@link bind}, {@link useActionState}, {@link useState}, {@link createChecklistDraft} e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function AddChecklistModal({ visitId, definitions, onClose }: { visitId: number; definitions: ChecklistDefinition[]; onClose: () => void }) {
  const action = InsertRequestTaskChecklist.bind(null, visitId);
  const [state, formAction, pending] = useActionState(action, initialVisitState);
  const [drafts, setDrafts] = useState<ChecklistDraft[]>(() => definitions[0] ? [createChecklistDraft(definitions[0].id, Date.now())] : []);

  useEffect(() => {
    if (state.status !== "success") return;
    const timer = window.setTimeout(onClose, 900);
    return () => window.clearTimeout(timer);
  }, [onClose, state.status]);

  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <section className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="add-checklist-title">
      <div className="max-h-[92vh] overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Checklist</p><h2 id="add-checklist-title" className="mt-1 text-xl font-bold text-slate-950">Aplicar checklist</h2></div><button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-2xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-800" type="button" onClick={onClose} aria-label="Fechar formulário de checklist">×</button></header>
      <form action={formAction} className="space-y-6 p-6">
        <input type="hidden" name="checklists_json" value={serializeChecklists(drafts)} />
        <ApplyChecklistEditor definitions={definitions} draft={drafts[0]} onChange={(draft) => setDrafts(draft ? [draft] : [])} />
        {state.message ? <p className={`rounded-lg p-3 text-sm ${state.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`} role="status">{state.message}</p> : null}
        <footer className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" onClick={onClose}>Cancelar</button><button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50" type="submit" disabled={pending || drafts.length !== 1}>{pending ? "Salvando..." : "Salvar checklist"}</button></footer>
      </form>
      </div>
    </section>
  </div>;
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente DraftChecklistModal com os dados recebidos.
 * Durante o fluxo, aciona {@link useState}, {@link createChecklistDraft}, {@link now}, {@link onClose} e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function DraftChecklistModal({ definitions, initialDraft, onClose, onSave }: { definitions: ChecklistDefinition[]; initialDraft?: ChecklistDraft; onClose: () => void; onSave: (draft: ChecklistDraft) => void }) {
  const [draft, setDraft] = useState<ChecklistDraft | undefined>(() => initialDraft ?? (definitions[0] ? createChecklistDraft(definitions[0].id, Date.now()) : undefined));

  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <section className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="draft-checklist-title">
      <div className="max-h-[92vh] overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Checklist</p><h2 id="draft-checklist-title" className="mt-1 text-xl font-bold text-slate-950">Aplicar checklist</h2></div><button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-2xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-800" type="button" onClick={onClose} aria-label="Fechar formulário de checklist">×</button></header>
        <form className="space-y-6 p-6" onSubmit={(event) => { event.preventDefault(); if (draft) onSave(draft); }}>
          <ApplyChecklistEditor definitions={definitions} draft={draft} onChange={setDraft} />
          <footer className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" onClick={onClose}>Cancelar</button><button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50" type="submit" disabled={!draft}>Salvar checklist</button></footer>
        </form>
      </div>
    </section>
  </div>;
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente ChecklistDraftSummary com os dados recebidos.
 * Durante o fluxo, aciona {@link map}, {@link find}, {@link onEdit}, {@link onRemove}.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function ChecklistDraftSummary({ definitions, drafts, onAdd, onEdit, onRemove }: { definitions: ChecklistDefinition[]; drafts: ChecklistDraft[]; onAdd: () => void; onEdit: (key: number) => void; onRemove: (key: number) => void }) {
  return <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4" aria-labelledby="checklist-summary-title">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 id="checklist-summary-title" className="font-bold text-slate-900">Checklists da visita</h3><p className="text-sm text-slate-500">Adicione os checklists em uma janela separada.</p></div>
      <button className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50" disabled={!definitions.length} type="button" onClick={onAdd}>＋ Adicionar checklist</button>
    </div>
    {!definitions.length ? <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">Nenhum tipo de checklist ativo disponível.</p> : null}
    {drafts.length ? <ul className="space-y-2">{drafts.map((draft, index) => {
      const definition = definitions.find((item) => item.id === draft.checklistTypeId);
      return <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3" key={draft.key}>
        <div><p className="text-sm font-semibold text-slate-900">{definition?.name ?? "Checklist"} <span className="font-normal text-slate-500">#{index + 1}</span></p><p className="text-xs text-slate-500">{definition ? `Versão ${definition.version}` : "Tipo não disponível"}</p></div>
        <div className="flex items-center gap-3"><button className="text-sm font-semibold text-blue-700 hover:text-blue-800" type="button" onClick={() => onEdit(draft.key)}>Editar</button><button className="text-sm font-semibold text-red-600 hover:text-red-700" type="button" onClick={() => onRemove(draft.key)}>Remover</button></div>
      </li>;
    })}</ul> : definitions.length ? <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">Nenhum checklist adicionado.</p> : null}
  </section>;
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente ApplyChecklistEditor com os dados recebidos.
 * Durante o fluxo, aciona {@link find}, {@link filter}, {@link onChange}, {@link update} e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function ApplyChecklistEditor({ definitions, draft, onChange }: { definitions: ChecklistDefinition[]; draft?: ChecklistDraft; onChange: (draft?: ChecklistDraft) => void }) {
  if (!definitions.length || !draft) return <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Nenhum tipo de checklist ativo disponível.</p>;

  const definition = definitions.find((item) => item.id === draft.checklistTypeId) ?? definitions[0];
  const singleSelectFields = definition.fields.filter((field) => field.type === "SINGLE_SELECT");
  const otherFields = definition.fields.filter((field) => field.type !== "SINGLE_SELECT");
  /**
   * Acionada internamente pela função ou pelo componente que a declara.
   *
   * Executa a operação de update e preserva as validações do domínio.
   * Durante o fluxo, aciona {@link onChange}.
   *
   * @param values Dados necessários para executar esta função.
   * @returns Não retorna valor.
   */
  const update = (values: Partial<ChecklistDraft>) => onChange({ ...draft, ...values });
  /**
   * Acionada internamente pela função ou pelo componente que a declara.
   *
   * Executa a operação de update value e preserva as validações do domínio.
   * Durante o fluxo, aciona {@link update}.
   *
   * @param fieldId Dados necessários para executar esta função.
   * @param value Dados necessários para executar esta função.
   * @returns Não retorna valor.
   */
  const updateValue = (fieldId: number, value: unknown) => update({ values: { ...draft.values, [fieldId]: value } });

  return <div className="space-y-7">
    <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-5" aria-labelledby="checklist-information-title">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600" aria-hidden="true">▣</span>
        <h3 id="checklist-information-title" className="font-bold text-slate-900">Informações do checklist</h3>
      </div>
      <dl className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(10rem,1fr)]">
        <div><dt className="mb-2 text-xs font-semibold text-slate-600">Tipo de checklist</dt><dd><select className={inputClass} value={draft.checklistTypeId} onChange={(event) => onChange(createChecklistDraft(Number(event.target.value), draft.key))}>{definitions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></dd></div>
        <div><dt className="text-xs font-semibold text-slate-600">Revisão</dt><dd className="mt-3 text-sm font-medium text-slate-800">{definition.version}</dd></div>
      </dl>
    </section>

    <section className="space-y-4" aria-labelledby="equipment-data-title">
      <h3 id="equipment-data-title" className="font-bold text-slate-900">Dados gerais do equipamento</h3>
      <div className="grid gap-x-5 gap-y-4 md:grid-cols-3">
        <ChecklistMetadataField label="Empresa / Setor" maxLength={255} placeholder="Selecione ou digite" value={draft.corporation} onChange={(corporation) => update({ corporation })} />
        <ChecklistMetadataField label="TAG (não preencher se alugado)" maxLength={100} placeholder="Digite a TAG" value={draft.equipmentTag} onChange={(equipmentTag) => update({ equipmentTag })} />
        <ChecklistMetadataField label="Marca" maxLength={255} placeholder="Digite a marca" value={draft.equipmentBrand} onChange={(equipmentBrand) => update({ equipmentBrand })} />
        <ChecklistMetadataField label="Modelo" maxLength={255} placeholder="Digite o modelo" value={draft.equipmentModel} onChange={(equipmentModel) => update({ equipmentModel })} />
        <fieldset><legend className="mb-3 text-sm font-semibold text-slate-700">Equipamento alugado?</legend><div className="flex h-10 items-center gap-5">{[[true, "Sim"], [false, "Não"]].map(([value, label]) => <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700" key={label as string}><input className="h-4 w-4 accent-blue-600" type="radio" name={`rented-equipment-${draft.key}`} checked={draft.rentedEquipment === value} onChange={() => update({ rentedEquipment: value as boolean })} />{label as string}</label>)}</div></fieldset>
        <ChecklistMetadataField label="Nº Série ou Patrimônio" maxLength={255} placeholder="Digite o nº de série ou patrimônio" value={draft.serialNumber} onChange={(serialNumber) => update({ serialNumber })} />
        <ChecklistMetadataField label="PT (Permissão de Trabalho)" maxLength={20} placeholder="Digite o nº da PT (se aplicável)" hint="Opcional" value={draft.ptNumber} onChange={(ptNumber) => update({ ptNumber })} />
      </div>
    </section>

    {singleSelectFields.length ? <section className="space-y-4 border-t border-slate-200 pt-6" aria-labelledby="checklist-items-title">
      <h3 id="checklist-items-title" className="font-bold text-slate-900">Itens do checklist</h3>
      <p className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white" aria-hidden="true">i</span>Responda cada item abaixo conforme a inspeção realizada.</p>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="hidden grid-cols-[3rem_minmax(14rem,1fr)_minmax(18rem,1.4fr)] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 md:grid"><span>#</span><span>Item</span><span>Resposta</span></div>
        <ol className="divide-y divide-slate-200">{singleSelectFields.map((field, index) => <SingleSelectChecklistItem key={field.id} field={field} index={index} value={draft.values[field.id]} onChange={(value) => updateValue(field.id, value)} />)}</ol>
      </div>
    </section> : null}

    {otherFields.length ? <section className="space-y-4 border-t border-slate-200 pt-6" aria-labelledby="additional-fields-title"><h3 id="additional-fields-title" className="font-bold text-slate-900">Informações complementares</h3><div className="grid gap-4 sm:grid-cols-2">{otherFields.map((field) => <ChecklistDynamicField key={field.id} field={field} value={draft.values[field.id]} onChange={(value) => updateValue(field.id, value)} />)}</div></section> : null}
  </div>;
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente SingleSelectChecklistItem com os dados recebidos.
 * Durante o fluxo, aciona {@link useId}, {@link map}, {@link onChange}.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function SingleSelectChecklistItem({ field, index, value, onChange }: { field: ChecklistDefinition["fields"][number]; index: number; value: unknown; onChange: (value: string) => void }) {
  const groupName = `${useId()}-single-select-${field.id}`;
  const optionStyles = ["border-emerald-200 bg-emerald-50 text-emerald-700", "border-red-200 bg-red-50 text-red-600", "border-slate-200 bg-slate-50 text-slate-600"];
  return <li className="grid gap-3 px-4 py-4 md:grid-cols-[3rem_minmax(14rem,1fr)_minmax(18rem,1.4fr)] md:items-center md:gap-4">
    <span className="text-sm font-semibold text-slate-700"><span className="md:hidden">Item </span>{index + 1}</span>
    <p className="text-sm leading-6 text-slate-800">{field.name}{field.required ? <span className="ml-1 text-red-500" aria-label="obrigatório">*</span> : null}</p>
    <fieldset><legend className="sr-only">Resposta para {field.name}</legend><div className="flex flex-wrap gap-2">{field.options.map((option, optionIndex) => {
      const checked = value === option.value;
      return <label key={option.value} className={`cursor-pointer rounded-lg border px-5 py-2 text-sm font-semibold transition focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 ${checked ? "border-blue-600 bg-blue-600 text-white shadow-sm" : optionStyles[optionIndex] ?? optionStyles[2]}`}><input className="sr-only" type="radio" name={groupName} value={option.value} checked={checked} required={field.required} onChange={() => onChange(option.value)} />{option.label}</label>;
    })}</div></fieldset>
  </li>;
}

/**
 * Acionada pelos módulos que importam esta função ou pelo fluxo interno deste arquivo.
 *
 * Executa a operação de create checklist draft e preserva as validações do domínio.
 *
 * @param checklistTypeId Dados necessários para executar esta função.
 * @param key Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function createChecklistDraft(checklistTypeId: number, key: number): ChecklistDraft {
  return { key, checklistTypeId, corporation: "", equipmentTag: "", equipmentBrand: "", equipmentModel: "", rentedEquipment: null, serialNumber: "", ptNumber: "", values: {} };
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente ChecklistMetadataField com os dados recebidos.
 * Durante o fluxo, aciona {@link onChange}.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function ChecklistMetadataField({ label, maxLength, value, onChange, placeholder, hint }: { label: string; maxLength: number; value: string; onChange: (value: string) => void; placeholder?: string; hint?: string }) {
  return <label><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><input className={inputClass} type="text" maxLength={maxLength} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />{hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}</label>;
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente ChecklistDynamicField com os dados recebidos.
 * Durante o fluxo, aciona {@link useId}, {@link onChange}, {@link map}, {@link isArray} e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function ChecklistDynamicField({ field, value, onChange }: { field: ChecklistDefinition["fields"][number]; value: unknown; onChange: (value: unknown) => void }) {
  const id = `${useId()}-checklist-field-${field.id}`;
  const label = <span className="mb-2 block text-sm font-semibold text-slate-700">{field.name}{field.required ? <span className="text-red-500"> *</span> : null}</span>;
  if (field.type === "BOOL") return <label className="sm:col-span-2">{label}<select id={id} className={inputClass} required={field.required} value={value == null ? "" : String(value)} onChange={(event) => onChange(event.target.value === "true")}><option value="">Selecione...</option><option value="true">Sim</option><option value="false">Não</option></select></label>;
  if (field.type === "SINGLE_SELECT") return <label>{label}<select id={id} className={inputClass} required={field.required} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)}><option value="">Selecione...</option>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
  if (field.type === "MULTI_SELECT") return <fieldset><legend>{label}</legend><div className="max-h-40 space-y-2 overflow-auto rounded-xl border border-slate-300 p-3">{field.options.map((option) => { const selected = Array.isArray(value) ? value as string[] : []; return <label key={option.value} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(option.value)} onChange={() => onChange(selected.includes(option.value) ? selected.filter((item) => item !== option.value) : [...selected, option.value])} />{option.label}</label>; })}</div>{field.required && (!Array.isArray(value) || value.length === 0) ? <input className="sr-only" required value="" onChange={() => undefined} aria-label={field.name} /> : null}</fieldset>;
  const inputType = field.type === "NUMBER" ? "number" : field.type === "DATE" ? "date" : "text";
  return <label className={field.type === "TEXT" ? "sm:col-span-2" : undefined}>{label}<input id={id} className={inputClass} type={inputType} required={field.required} value={String(value ?? "")} onChange={(event) => onChange(field.type === "NUMBER" ? (event.target.value === "" ? "" : Number(event.target.value)) : event.target.value)} /></label>;
}

/**
 * Acionada pelos módulos que importam esta função ou pelo fluxo interno deste arquivo.
 *
 * Serialize checklists para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link map}, {@link entries}, {@link stringify}.
 *
 * @param drafts Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function serializeChecklists(drafts: ChecklistDraft[]): string {
  const submissions: ChecklistSubmission[] = drafts.map((draft) => ({
    checklistTypeId: draft.checklistTypeId,
    corporation: draft.corporation || null,
    equipmentTag: draft.equipmentTag || null,
    equipmentBrand: draft.equipmentBrand || null,
    equipmentModel: draft.equipmentModel || null,
    rentedEquipment: draft.rentedEquipment,
    serialNumber: draft.serialNumber || null,
    ptNumber: draft.ptNumber || null,
    values: Object.entries(draft.values).map(([fieldId, value]) => ({ fieldId: Number(fieldId), value })),
  }));
  return JSON.stringify(submissions);
}

/**
 * Acionada pelos módulos que importam esta função ou pelo fluxo interno deste arquivo.
 *
 * Format checklist value para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link isArray}, {@link join}, {@link stringify}.
 *
 * @param value Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function formatChecklistValue(value: unknown): string {
  if (value == null || value === "") return "Não informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

type GalleryMedia = {
  id: number | string;
  fileName: string;
  mimeType: string;
  url: string;
};

/**
 * Acionada durante a renderização do componente que consome este hook.
 *
 * Mantém media previews sincronizado com o ciclo de vida do componente.
 * Durante o fluxo, aciona {@link useMemo}, {@link map}, {@link createObjectURL}, {@link useEffect} e outras rotinas auxiliares.
 *
 * @param files Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function useMediaPreviews(files: File[]): GalleryMedia[] {
  const previews = useMemo(() => files.map((file, index) => ({
      id: `preview-${index}-${file.name}-${file.lastModified}`,
      fileName: file.name,
      mimeType: file.type,
      url: URL.createObjectURL(file),
    })), [files]);

  useEffect(() => {
    return () => previews.forEach((media) => URL.revokeObjectURL(media.url));
  }, [previews]);

  return previews;
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente VisitMediaField com os dados recebidos.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function VisitMediaField({ media, input }: { media: GalleryMedia[]; input?: React.ReactNode }) {
  return (
    <section aria-labelledby="visit-media-label">
      <h3 className="text-sm font-semibold text-slate-700" id="visit-media-label">Registros fotográficos</h3>
      <div className="mt-2">
        <MediaGallery media={media} />
      </div>
      {input}
    </section>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente MediaGallery com os dados recebidos.
 * Durante o fluxo, aciona {@link useState}, {@link useEffect}, {@link setTimeout}, {@link setActiveIndex} e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function MediaGallery({ media, emptyMessage = "Nenhum registro fotográfico." }: { media: GalleryMedia[]; emptyMessage?: string }) {
  const [mode, setMode] = useState<"carousel" | "grid">("carousel");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex < media.length) return;
    const timer = window.setTimeout(() => setActiveIndex(Math.max(0, media.length - 1)), 0);
    return () => window.clearTimeout(timer);
  }, [activeIndex, media.length]);

  if (!media.length) {
    return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">{emptyMessage}</div>;
  }

  const activeMedia = media[activeIndex] ?? media[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{media.length} {media.length === 1 ? "anexo" : "anexos"}</p>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1" aria-label="Modo de visualização" role="group">
          <GalleryModeButton active={mode === "carousel"} onClick={() => setMode("carousel")}>Carrossel</GalleryModeButton>
          <GalleryModeButton active={mode === "grid"} onClick={() => setMode("grid")}>Grid</GalleryModeButton>
        </div>
      </div>

      {mode === "carousel" ? (
        <div>
          <MediaItem media={activeMedia} featured />
          <div className="mt-3 flex items-center justify-between gap-3">
            <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={media.length < 2} onClick={() => setActiveIndex((index) => (index - 1 + media.length) % media.length)} aria-label="Exibir anexo anterior">‹ Anterior</button>
            <span className="text-xs font-semibold tabular-nums text-slate-500" aria-live="polite">{activeIndex + 1} de {media.length}</span>
            <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={media.length < 2} onClick={() => setActiveIndex((index) => (index + 1) % media.length)} aria-label="Exibir próximo anexo">Próximo ›</button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => <MediaItem key={item.id} media={item} />)}
        </div>
      )}
    </div>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente GalleryModeButton com os dados recebidos.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function GalleryModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`} type="button" aria-pressed={active} onClick={onClick}>{children}</button>;
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente MediaItem com os dados recebidos.
 * Durante o fluxo, aciona {@link startsWith}.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function MediaItem({ media, featured = false }: { media: GalleryMedia; featured?: boolean }) {
  const mediaClass = featured ? "h-[min(52vh,30rem)] w-full" : "aspect-video w-full";
  return (
    <figure className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {media.mimeType.startsWith("video/") ? (
        <video className={`${mediaClass} bg-slate-950 object-contain`} controls playsInline preload="metadata" src={media.url}>
          Seu navegador não suporta a reprodução deste vídeo.
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- URLs locais e binárias não possuem dimensões conhecidas.
        <img className={`${mediaClass} bg-slate-100 object-contain`} src={media.url} alt={`Registro fotográfico: ${media.fileName}`} />
      )}
      <figcaption className="truncate border-t border-slate-200 px-3 py-2 text-xs font-medium text-slate-600" title={media.fileName}>{media.fileName}</figcaption>
    </figure>
  );
}

/**
 * Acionada pelos módulos que importam esta função ou pelo fluxo interno deste arquivo.
 *
 * Normalize search value para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link toLocaleLowerCase}, {@link replace}, {@link normalize}.
 *
 * @param value Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function normalizeSearchValue(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

const inputClass = "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const readOnlyInputClass = "mt-2 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 opacity-100";
/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente VisitField com os dados recebidos.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
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

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente ModalDetail com os dados recebidos.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function ModalDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-2 whitespace-pre-wrap break-words text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente ModalDetailCard com os dados recebidos.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function ModalDetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="h-full rounded-xl border border-slate-200 bg-slate-50 p-4">
      <ModalDetail label={label} value={value} />
    </div>
  );
}

/**
 * Acionada pelos módulos que importam esta função ou pelo fluxo interno deste arquivo.
 *
 * Format file size para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link toFixed}.
 *
 * @param bytes Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente CardDetail com os dados recebidos.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function CardDetail({ icon: detailIcon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="grid grid-cols-[18px_1fr] gap-x-2"><span className="mt-0.5 text-slate-400" aria-hidden="true">{detailIcon}</span><div className="min-w-0"><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-0.5 break-words text-[13px] font-medium leading-5 text-slate-700">{value}</dd></div></div>;
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de requester.
 *
 * @returns O elemento React que representa esta interface.
 */
function RequesterIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.6-4 3-6 7-6s6.4 2 7 6"/></svg>; }
/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de location.
 *
 * @returns O elemento React que representa esta interface.
 */
function LocationIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>; }
/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de edit.
 *
 * @returns O elemento React que representa esta interface.
 */
function EditIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m4 20 4.2-1 10.6-10.6a2 2 0 0 0-2.8-2.8L5.4 16.2 4 20Z"/><path d="m14.5 7.1 2.8 2.8"/></svg>; }
