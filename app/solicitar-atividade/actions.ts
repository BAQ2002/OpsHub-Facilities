"use server";

import { createActivityRequest, createChamadoRequest } from "@/src/server/services/request-service";
import { redirect } from "next/navigation";

/**
 * Acionada como Server Action pelo formulário ou controle de interface associado.
 *
 * Executa a operação de create activity request action e preserva as validações do domínio.
 * Durante o fluxo, aciona `createActivityRequest`.
 *
 * @param formData Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
export async function createActivityRequestAction(formData: FormData) {
  await createActivityRequest(formData);
}

/**
 * Acionada como Server Action pelo formulário ou controle de interface associado.
 *
 * Executa a operação de create chamado request action e preserva as validações do domínio.
 * Durante o fluxo, aciona `set`, `toString`, `createChamadoRequest`, `redirect`.
 *
 * @param serviceTypeId Dados necessários para executar esta função.
 * @param formData Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
export async function createChamadoRequestAction(serviceTypeId: number, formData: FormData) {
  formData.set("service_type_id", serviceTypeId.toString());
  await createChamadoRequest(formData);
  redirect("/minhas-solicitacoes");
}
