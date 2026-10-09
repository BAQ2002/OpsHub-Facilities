"use server";

import { apiResult } from "@/app/entities/api/api-result";
import { createActivityRequest, createChamadoRequest } from "@/app/services/request-service";
import { redirect } from "next/navigation";

/**
 * Acionada como Server Action pelo formulário ou controle de interface associado.
 *
 * Executa a operação de create activity request action e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link createActivityRequest}.
 *
 * @param formData Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
export async function createActivityRequestAction(formData: FormData) {
  return apiResult(async () => { await createActivityRequest(formData); });
}

/**
 * Acionada como Server Action pelo formulário ou controle de interface associado.
 *
 * Executa a operação de create chamado request action e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link set}, {@link toString}, {@link createChamadoRequest}, {@link redirect}.
 *
 * @param serviceTypeId Dados necessários para executar esta função.
 * @param formData Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
export async function createChamadoRequestAction(serviceTypeId: number, formData: FormData) {
  formData.set("service_type_id", serviceTypeId.toString());
  const result = await apiResult(async () => { await createChamadoRequest(formData); });
  if (!result.ok) return result;
  redirect("/pages/minhas-solicitacoes");
}
