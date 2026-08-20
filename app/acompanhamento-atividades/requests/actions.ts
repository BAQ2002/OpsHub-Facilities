"use server";

import { revalidatePath } from "next/cache";
import { insertRequestTaskVisit, updateRequestTaskVisit } from "@/src/server/repositories/postgres/request-task-postgres-repository";
import { deleteVisitChecklist, insertChecklistForVisit } from "@/src/server/repositories/postgres/checklist-postgres-repository";
import type { ChecklistSubmission } from "@/src/domain/entities/checklist";

export type AddVisitState = { status: "idle" | "success" | "error"; message: string };
export type UpdateVisitState = AddVisitState;

export async function addVisitAction(
  requestId: number,
  _previousState: AddVisitState,
  formData: FormData,
): Promise<AddVisitState> {
  try {
    const memberIds = [...new Set(formData.getAll("member_ids").map(Number))];
    const photos = formData.getAll("photos").filter((value): value is File => value instanceof File && value.size > 0);
    await insertRequestTaskVisit({
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

export async function updateVisitAction(visitId: number, _previousState: UpdateVisitState, formData: FormData): Promise<UpdateVisitState> {
  try {
    await updateRequestTaskVisit({
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

export async function addChecklistAction(visitId: number, _previousState: AddVisitState, formData: FormData): Promise<AddVisitState> {
  try {
    const submissions = parseChecklistSubmissions(formData.get("checklists_json"));
    if (submissions.length !== 1) throw new Error("Selecione um checklist para adicionar.");
    await insertChecklistForVisit(visitId, submissions[0]);
    revalidatePath("/acompanhamento-atividades/requests");
    return { status: "success", message: "Checklist adicionado com sucesso." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível adicionar o checklist." };
  }
}

export async function deleteChecklistAction(checklistId: number): Promise<AddVisitState> {
  try {
    await deleteVisitChecklist(checklistId);
    revalidatePath("/acompanhamento-atividades/requests");
    return { status: "success", message: "Checklist excluído com sucesso." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível excluir o checklist." };
  }
}

function parseChecklistSubmissions(value: FormDataEntryValue | null): ChecklistSubmission[] {
  if (typeof value !== "string" || !value.trim()) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { throw new Error("Os dados dos checklists são inválidos."); }
  if (!Array.isArray(parsed)) throw new Error("Os dados dos checklists são inválidos.");
  return parsed.map((item) => {
    if (!item || typeof item !== "object" || !("checklistTypeId" in item) || !("values" in item) || !Array.isArray(item.values)) {
      throw new Error("Os dados de um checklist são inválidos.");
    }
    return { checklistTypeId: Number(item.checklistTypeId), values: item.values as ChecklistSubmission["values"] };
  });
}
