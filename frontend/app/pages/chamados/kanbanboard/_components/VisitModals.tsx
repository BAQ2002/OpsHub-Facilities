"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import type { RequestDetailsViewModel, RequestBoardVisit, ChecklistDefinition, MembershipOption as Executor } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";
import { InsertRequestTask, UpdateRequestTask, type AddVisitState } from "../actions";
import { AddChecklistModal, DraftChecklistModal, ChecklistDraftSummary, VisitChecklistList, serializeChecklists, type ChecklistDraft } from "./ChecklistComponents";
import { VisitMediaField, MediaGallery } from "./MediaGallery";
import { useMediaPreviews } from "../_hooks/useMediaPreviews";
import { ModalDetail } from "./DetailFields";
import { inputClass, readOnlyInputClass } from "./form-styles";
type Visit = RequestBoardVisit;
import { useVisitDetails } from "../_hooks/useVisitDetails";
import { useVisitCatalogs } from "../_hooks/useVisitCatalogs";
import { ResourceDialog } from "./ResourceDialog";
import { DataUnavailable } from "@/app/componentes/DataUnavailable";

export function VisitsModal({ request, onVisitChanged, onClose }: { request: RequestDetailsViewModel; onVisitChanged: () => void; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const selectedVisit = request.visits.find((visit) => visit.id === selectedVisitId) ?? null;

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/65 p-4"
      data-ui="request-visits-overlay"
      role="presentation"
      onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}
    >
      <section
        data-ui="request-visits-dialog"
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visits-modal-title"
      >
        <div className="max-h-[90vh] overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Solicitação #{request.id}</p>
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
              <p className="mt-1 text-sm text-slate-500">Esta solicitação ainda não possui registros de visita.</p>
            </div>
          )}
        </div>
        </div>
      </section>
      {selectedVisit ? <VisitDetailsModal key={selectedVisit.id} requestId={request.id} visitId={selectedVisit.id} onVisitChanged={onVisitChanged} onClose={() => setSelectedVisitId(null)} /> : null}
    </div>
  );
}

const initialUpdateVisitState: AddVisitState = { status: "idle", message: "" };

function VisitDetailsModal({ visitId, requestId, onVisitChanged, onClose }: { visitId: number; requestId: number; onVisitChanged: () => void; onClose: () => void }) {
  const query = useVisitDetails(visitId, requestId);
  if (query.error || !query.data) return <ResourceDialog label={`Visita #${visitId}`} error={query.error} pending={query.pending} retry={query.refresh} onClose={onClose} />;
  return <LoadedVisitDetails visit={query.data} onChanged={query.refresh} onVisitChanged={onVisitChanged} onClose={onClose} />;
}

function LoadedVisitDetails({ visit, onChanged, onVisitChanged, onClose }: { visit: Visit; onChanged: () => void; onVisitChanged: () => void; onClose: () => void }) {
  const action = UpdateRequestTask.bind(null, visit.id);
  const [state, formAction, pending] = useActionState(action, initialUpdateVisitState);
  const [editing, setEditing] = useState(false);
  const catalogs = useVisitCatalogs(editing);
  const executors = catalogs.data?.executors ?? visit.executors;
  const [selectedExecutorIds, setSelectedExecutorIds] = useState(visit.executors.map((executor) => executor.id));
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const newMedia = useMediaPreviews(newMediaFiles);
  const formRef = useRef<HTMLFormElement>(null);
  const [showChecklist, setShowChecklist] = useState(false);

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
    const timer = window.setTimeout(() => {
      setEditing(false);
      setNewMediaFiles([]);
      onChanged();
      onVisitChanged();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [state, onChanged, onVisitChanged]);

  return (
    <div data-ui="visit-details-overlay" className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section data-ui="visit-details-dialog" className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="visit-details-title">
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
          {editing && catalogs.error ? <DataUnavailable error={catalogs.error} retry={catalogs.refresh} pending={catalogs.pending} /> : null}
          {editing && !catalogs.data && !catalogs.error ? <p role="status">Carregando executores...</p> : null}
          <fieldset disabled={!editing || pending || !catalogs.data} className="space-y-6 disabled:pointer-events-none">
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
          <VisitChecklistList checklists={visit.checklists} onChanged={onChanged} onAdd={() => setShowChecklist(true)} />
          {state.message ? <p className={`rounded-lg p-3 text-sm ${state.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`} role="status">{state.message}</p> : null}
          {editing ? <footer className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={cancelEditing}>Cancelar</button><button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={pending || !catalogs.data || !!catalogs.error || catalogs.pending}>{pending ? "Salvando..." : "Salvar"}</button></footer> : null}
        </form>
        </div>
      </section>
      {showChecklist ? <ChecklistCatalogModal visitId={visit.id} onSaved={onChanged} onClose={() => setShowChecklist(false)} /> : null}
    </div>
  );
}

const initialVisitState: AddVisitState = { status: "idle", message: "" };

type AddVisitProps = { requestId: number; onSaved: () => void; onClose: () => void };
export function AddVisitModal(props: AddVisitProps) {
  const catalogs = useVisitCatalogs();
  if (catalogs.error || !catalogs.data) return <ResourceDialog label="Adicionar visita" error={catalogs.error} pending={catalogs.pending} retry={catalogs.refresh} onClose={props.onClose} />;
  return <LoadedAddVisitModal {...props} {...catalogs.data} />;
}

function ChecklistCatalogModal({ visitId, onSaved, onClose }: { visitId: number; onSaved: () => void; onClose: () => void }) {
  const catalogs = useVisitCatalogs();
  if (catalogs.error || !catalogs.data) return <ResourceDialog label="Adicionar checklist" error={catalogs.error} pending={catalogs.pending} retry={catalogs.refresh} onClose={onClose} />;
  return <AddChecklistModal visitId={visitId} definitions={catalogs.data.checklistDefinitions} onSaved={onSaved} onClose={onClose} />;
}

function LoadedAddVisitModal({ requestId, executors, checklistDefinitions, onSaved, onClose }: AddVisitProps & { executors: Executor[]; checklistDefinitions: ChecklistDefinition[] }) {
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
      const timer = window.setTimeout(() => { onSaved(); onClose(); }, 900);
      return () => window.clearTimeout(timer);
    }
  }, [state.status, onSaved, onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="visit-modal-title">
        <div className="max-h-[92vh] overflow-y-auto">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Solicitação #{requestId}</p><h2 id="visit-modal-title" className="mt-1 text-xl font-bold text-slate-900">Adicionar visita</h2></div>
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

function normalizeSearchValue(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function VisitField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-semibold text-slate-700">{label} <span className="text-red-500">*</span>{children}</label>; }

function EditIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m4 20 4.2-1 10.6-10.6a2 2 0 0 0-2.8-2.8L5.4 16.2 4 20Z"/><path d="m14.5 7.1 2.8 2.8"/></svg>; }
