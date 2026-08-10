"use server";

import { revalidatePath } from "next/cache";
import { insertRequestTaskVisit } from "@/src/server/repositories/postgres/request-task-postgres-repository";

export type AddVisitState = { status: "idle" | "success" | "error"; message: string };

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
