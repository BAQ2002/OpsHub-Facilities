"use server";

import { revalidatePath } from "next/cache";
import { getChecklistRepository, getRequestTaskRepository } from "@/src/server/repositories/repositories";
import type { ChecklistSubmission } from "@/src/domain/entities/checklist";

export type AddVisitState = { status: "idle" | "success" | "error"; message: string };
export type UpdateVisitState = AddVisitState;

/**
 * Acionada como Server Action pelo formulário ou controle de interface associado.
 *
 * Executa a Server Action InsertRequestTask com os dados enviados pela interface.
 * Durante o fluxo, aciona {@link map}, {@link getAll}, {@link filter}, {@link createVisit} e outras rotinas auxiliares.
 *
 * @param requestId Dados necessários para executar esta função.
 * @param _previousState Dados necessários para executar esta função.
 * @param formData Dados necessários para executar esta função.
 * @returns O estado da operação para atualização da interface.
 */
export async function InsertRequestTask(
  requestId: number,
  _previousState: AddVisitState,
  formData: FormData,
): Promise<AddVisitState> {
  try {
    const memberIds = [...new Set(formData.getAll("member_ids").map(Number))];
    const photos = formData.getAll("photos").filter((value): value is File => value instanceof File && value.size > 0);
    await getRequestTaskRepository().createVisit({
      requestId,
      description: String(formData.get("description") ?? "").trim(),
      startDatetime: String(formData.get("start_datetime") ?? ""),
      stopDatetime: String(formData.get("stop_datetime") ?? ""),
      memberIds,
      photos,
      checklists: parseChecklistSubmissions(formData.get("checklists_json")),
    });
    revalidatePath("/acompanhamento-atividades/requests");
    return { status: "success", message: "Visita adicionada com sucesso." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível adicionar a visita." };
  }
}

/**
 * Acionada como Server Action pelo formulário ou controle de interface associado.
 *
 * Executa a Server Action UpdateRequestTask com os dados enviados pela interface.
 * Durante o fluxo, aciona {@link updateVisit}, {@link getRequestTaskRepository}, {@link trim}, {@link get} e outras rotinas auxiliares.
 *
 * @param visitId Dados necessários para executar esta função.
 * @param _previousState Dados necessários para executar esta função.
 * @param formData Dados necessários para executar esta função.
 * @returns O estado da operação para atualização da interface.
 */
export async function UpdateRequestTask(visitId: number, _previousState: UpdateVisitState, formData: FormData): Promise<UpdateVisitState> {
  try {
    await getRequestTaskRepository().updateVisit({
      visitId,
      description: String(formData.get("description") ?? "").trim(),
      startDatetime: String(formData.get("start_datetime") ?? ""),
      stopDatetime: String(formData.get("stop_datetime") ?? ""),
      memberIds: [...new Set(formData.getAll("member_ids").map(Number))],
      photos: formData.getAll("photos").filter((value): value is File => value instanceof File && value.size > 0),
      checklists: [],
    });
    revalidatePath("/acompanhamento-atividades/requests");
    return { status: "success", message: "Visita atualizada com sucesso." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível atualizar a visita." };
  }
}

/**
 * Acionada como Server Action pelo formulário ou controle de interface associado.
 *
 * Executa a Server Action InsertRequestTaskChecklist com os dados enviados pela interface.
 * Durante o fluxo, aciona {@link parseChecklistSubmissions}, {@link get}, {@link addToVisit}, {@link getChecklistRepository} e outras rotinas auxiliares.
 *
 * @param visitId Dados necessários para executar esta função.
 * @param _previousState Dados necessários para executar esta função.
 * @param formData Dados necessários para executar esta função.
 * @returns O estado da operação para atualização da interface.
 */
export async function InsertRequestTaskChecklist(visitId: number, _previousState: AddVisitState, formData: FormData): Promise<AddVisitState> {
  try {
    const submissions = parseChecklistSubmissions(formData.get("checklists_json"));
    if (submissions.length !== 1) throw new Error("Selecione um checklist para adicionar.");
    await getChecklistRepository().addToVisit(visitId, submissions[0]);
    revalidatePath("/acompanhamento-atividades/requests");
    return { status: "success", message: "Checklist adicionado com sucesso." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível adicionar o checklist." };
  }
}

/**
 * Acionada como Server Action pelo formulário ou controle de interface associado.
 *
 * Executa a Server Action DeleteRequestTaskChecklist com os dados enviados pela interface.
 * Durante o fluxo, aciona {@link deleteFromVisit}, {@link getChecklistRepository}, {@link revalidatePath}.
 *
 * @param checklistId Dados necessários para executar esta função.
 * @returns O estado da operação para atualização da interface.
 */
export async function DeleteRequestTaskChecklist(checklistId: number): Promise<AddVisitState> {
  try {
    await getChecklistRepository().deleteFromVisit(checklistId);
    revalidatePath("/acompanhamento-atividades/requests");
    return { status: "success", message: "Checklist excluído com sucesso." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível excluir o checklist." };
  }
}

/**
 * Acionada como Server Action pelo formulário ou controle de interface associado.
 *
 * Parse checklist submissions para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link trim}, {@link parse}, {@link isArray}, {@link map} e outras rotinas auxiliares.
 *
 * @param value Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function parseChecklistSubmissions(value: FormDataEntryValue | null): ChecklistSubmission[] {
  if (typeof value !== "string" || !value.trim()) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { throw new Error("Os dados dos checklists são inválidos."); }
  if (!Array.isArray(parsed)) throw new Error("Os dados dos checklists são inválidos.");
  return parsed.map((item) => {
    if (!item || typeof item !== "object" || !("checklistTypeId" in item) || !("values" in item) || !Array.isArray(item.values)) {
      throw new Error("Os dados de um checklist são inválidos.");
    }
    return {
      checklistTypeId: Number(item.checklistTypeId),
      corporation: optionalText(item, "corporation", 255, "Empresa/Setor"),
      equipmentTag: optionalText(item, "equipmentTag", 100, "Tag"),
      equipmentBrand: optionalText(item, "equipmentBrand", 255, "Marca"),
      equipmentModel: optionalText(item, "equipmentModel", 255, "Modelo"),
      rentedEquipment: optionalBoolean(item, "rentedEquipment", "Equipamento alugado"),
      serialNumber: optionalText(item, "serialNumber", 255, "Nº Série ou Patrimônio"),
      ptNumber: optionalText(item, "ptNumber", 20, "PT"),
      values: item.values as ChecklistSubmission["values"],
    };
  });
}

/**
 * Acionada como Server Action pelo formulário ou controle de interface associado.
 *
 * Executa optional text no fluxo atual.
 * Durante o fluxo, aciona {@link trim}.
 *
 * @param item Dados necessários para executar esta função.
 * @param property Dados necessários para executar esta função.
 * @param maximum Dados necessários para executar esta função.
 * @param label Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function optionalText(item: object, property: string, maximum: number, label: string): string | null {
  const value = (item as Record<string, unknown>)[property];
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new Error(`O campo ${label} é inválido.`);
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > maximum) throw new Error(`O campo ${label} deve ter no máximo ${maximum} caracteres.`);
  return normalized;
}

/**
 * Acionada como Server Action pelo formulário ou controle de interface associado.
 *
 * Executa optional boolean no fluxo atual.
 *
 * @param item Dados necessários para executar esta função.
 * @param property Dados necessários para executar esta função.
 * @param label Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function optionalBoolean(item: object, property: string, label: string): boolean | null {
  const value = (item as Record<string, unknown>)[property];
  if (value == null || value === "") return null;
  if (typeof value !== "boolean") throw new Error(`O campo ${label} é inválido.`);
  return value;
}
