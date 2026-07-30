"use server";

import { createActivityRequest, createChamadoRequest } from "@/src/server/services/request-service";
import { redirect } from "next/navigation";

export async function createActivityRequestAction(formData: FormData) {
  await createActivityRequest(formData);
}

export async function createChamadoRequestAction(serviceTypeId: number, formData: FormData) {
  formData.set("service_type_id", serviceTypeId.toString());
  await createChamadoRequest(formData);
  redirect("/minhas-solicitacoes");
}
