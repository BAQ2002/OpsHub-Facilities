"use server";

import { revalidatePath } from "next/cache";
import { insertRequestTaskVisit, updateRequestTaskVisit } from "@/src/server/repositories/postgres/request-task-postgres-repository";

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
    });
    revalidatePath("/acompanhamento-atividades/requests");
    return { status: "success", message: "Visita atualizada com sucesso." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível atualizar a visita." };
  }
}
