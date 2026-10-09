"use client";
import { useActionState, useEffect, useId, useState, useTransition } from "react";
import type { ChecklistDefinition, ChecklistSubmission, VisitChecklist } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";
import { InsertRequestTaskChecklist, DeleteRequestTaskChecklist, type AddVisitState } from "../actions";
import { ModalDetail } from "./DetailFields";
import { inputClass } from "./form-styles";
const initialVisitState: AddVisitState = { status: "idle", message: "" };

export type ChecklistDraft = {
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

export function AddChecklistModal({ visitId, definitions, onSaved, onClose }: { visitId: number; definitions: ChecklistDefinition[]; onSaved: () => void; onClose: () => void }) {
  const action = InsertRequestTaskChecklist.bind(null, visitId);
  const [state, formAction, pending] = useActionState(action, initialVisitState);
  const [drafts, setDrafts] = useState<ChecklistDraft[]>(() => definitions[0] ? [createChecklistDraft(definitions[0].id, Date.now())] : []);

  useEffect(() => {
    if (state.status !== "success") return;
    const timer = window.setTimeout(onClose, 900);
    return () => window.clearTimeout(timer);
  }, [onSaved, onClose, state.status]);

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

export function DraftChecklistModal({ definitions, initialDraft, onClose, onSave }: { definitions: ChecklistDefinition[]; initialDraft?: ChecklistDraft; onClose: () => void; onSave: (draft: ChecklistDraft) => void }) {
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

export function ChecklistDraftSummary({ definitions, drafts, onAdd, onEdit, onRemove }: { definitions: ChecklistDefinition[]; drafts: ChecklistDraft[]; onAdd: () => void; onEdit: (key: number) => void; onRemove: (key: number) => void }) {
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

function createChecklistDraft(checklistTypeId: number, key: number): ChecklistDraft {
  return { key, checklistTypeId, corporation: "", equipmentTag: "", equipmentBrand: "", equipmentModel: "", rentedEquipment: null, serialNumber: "", ptNumber: "", values: {} };
}

function ChecklistMetadataField({ label, maxLength, value, onChange, placeholder, hint }: { label: string; maxLength: number; value: string; onChange: (value: string) => void; placeholder?: string; hint?: string }) {
  return <label><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><input className={inputClass} type="text" maxLength={maxLength} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />{hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}</label>;
}

function ChecklistDynamicField({ field, value, onChange }: { field: ChecklistDefinition["fields"][number]; value: unknown; onChange: (value: unknown) => void }) {
  const id = `${useId()}-checklist-field-${field.id}`;
  const label = <span className="mb-2 block text-sm font-semibold text-slate-700">{field.name}{field.required ? <span className="text-red-500"> *</span> : null}</span>;
  if (field.type === "BOOL") return <label className="sm:col-span-2">{label}<select id={id} className={inputClass} required={field.required} value={value == null ? "" : String(value)} onChange={(event) => onChange(event.target.value === "true")}><option value="">Selecione...</option><option value="true">Sim</option><option value="false">Não</option></select></label>;
  if (field.type === "SINGLE_SELECT") return <label>{label}<select id={id} className={inputClass} required={field.required} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)}><option value="">Selecione...</option>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
  if (field.type === "MULTI_SELECT") return <fieldset><legend>{label}</legend><div className="max-h-40 space-y-2 overflow-auto rounded-xl border border-slate-300 p-3">{field.options.map((option) => { const selected = Array.isArray(value) ? value as string[] : []; return <label key={option.value} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(option.value)} onChange={() => onChange(selected.includes(option.value) ? selected.filter((item) => item !== option.value) : [...selected, option.value])} />{option.label}</label>; })}</div>{field.required && (!Array.isArray(value) || value.length === 0) ? <input className="sr-only" required value="" onChange={() => undefined} aria-label={field.name} /> : null}</fieldset>;
  const inputType = field.type === "NUMBER" ? "number" : field.type === "DATE" ? "date" : "text";
  return <label className={field.type === "TEXT" ? "sm:col-span-2" : undefined}>{label}<input id={id} className={inputClass} type={inputType} required={field.required} value={String(value ?? "")} onChange={(event) => onChange(field.type === "NUMBER" ? (event.target.value === "" ? "" : Number(event.target.value)) : event.target.value)} /></label>;
}

export function serializeChecklists(drafts: ChecklistDraft[]): string {
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

function formatChecklistValue(value: unknown): string {
  if (value == null || value === "") return "Não informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function VisitChecklistList({ checklists, onAdd, onChanged }: { checklists: VisitChecklist[]; onAdd: () => void; onChanged: () => void }) {
  const [deletingChecklist, startDeleteChecklist] = useTransition();
  const [checklistMessage, setChecklistMessage] = useState("");
  return (
    <section className="space-y-3 border-t border-slate-200 pt-5" aria-labelledby="visit-checklists-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 id="visit-checklists-title" className="font-bold text-slate-900">Checklists</h3><p className="text-sm text-slate-500">Registros imutáveis vinculados a esta visita.</p></div>
        <button className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" type="button" onClick={onAdd}>＋ Adicionar checklist</button>
      </div>
      {checklists.length ? <ul className="space-y-3">
        {checklists.map((checklist, index) => <li key={checklist.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div><p className="font-semibold text-slate-900">{checklist.name} <span className="font-normal text-slate-500">#{index + 1}</span></p><p className="text-xs text-slate-500">Versão {checklist.version}{checklist.description ? ` · ${checklist.description}` : ""}</p></div>
            <button disabled={deletingChecklist} className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50" type="button" onClick={() => {
              if (!window.confirm(`Excluir a ocorrência de ${checklist.name}?`)) return;
              startDeleteChecklist(async () => {
                const result = await DeleteRequestTaskChecklist(checklist.id);
                setChecklistMessage(result.message);
                if (result.status === "success") onChanged();
              });
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
  );
}
