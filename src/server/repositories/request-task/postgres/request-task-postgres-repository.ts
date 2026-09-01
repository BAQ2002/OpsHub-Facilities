import "server-only";

import { getPostgresPool } from "@/src/server/db/postgres";
import type { ChecklistSubmission } from "@/src/domain/entities/checklist";
import { insertChecklistSubmissions } from "@/src/server/repositories/checklist/postgres/checklist-postgres-repository";
import type { RequestTaskRepository } from "@/src/server/repositories/request-task/request-task-repository";

export type VisitInput = {
  requestId: number;
  description: string;
  startDatetime: string;
  stopDatetime: string;
  memberIds: number[];
  photos: File[];
  checklists: ChecklistSubmission[];
};

export type UpdateVisitInput = Omit<VisitInput, "requestId"> & { visitId: number };

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;

export const postgresRequestTaskRepository: RequestTaskRepository = {
  createVisit: insertRequestTaskVisit,
  updateVisit: updateRequestTaskVisit,
};

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Executa a operação de insert request task visit e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link validateVisit}, {@link all}, {@link map}, {@link from} e outras rotinas auxiliares.
 *
 * @param input Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
export async function insertRequestTaskVisit(input: VisitInput) {
  validateVisit(input);
  const photoBuffers = await Promise.all(
    input.photos.map(async (photo) => ({
      content: Buffer.from(await photo.arrayBuffer()),
      fileName: photo.name,
      mimeType: photo.type,
      fileSize: photo.size,
    })),
  );
  const pool = await getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const request = await client.query<{ id: number }>("SELECT id FROM request WHERE id = $1", [input.requestId]);
    if (!request.rows[0]) throw new Error("A request informada não existe.");

    const memberships = await client.query<{ id: number }>(
      "SELECT id FROM membership WHERE id = ANY($1::integer[])",
      [input.memberIds],
    );
    if (memberships.rows.length !== input.memberIds.length) {
      throw new Error("Um ou mais executantes selecionados não existem.");
    }

    const task = await client.query<{ id: number }>(
      `INSERT INTO request_task (id_request, start_datetime, stop_datetime, description)
       VALUES ($1, $2::timestamp, $3::timestamp, $4) RETURNING id`,
      [input.requestId, input.startDatetime, input.stopDatetime, input.description],
    );
    const taskId = task.rows[0]?.id;
    if (!taskId) throw new Error("Não foi possível criar o registro da visita.");

    for (const memberId of input.memberIds) {
      await client.query(
        "INSERT INTO task_member_occurrence (id_task, id_membership) VALUES ($1, $2)",
        [taskId, memberId],
      );
    }
    for (const photo of photoBuffers) {
      await client.query(
        `INSERT INTO request_task_media (id_request_task, content, file_name, mime_type, file_size)
         VALUES ($1, $2, $3, $4, $5)`,
        [taskId, photo.content, photo.fileName, photo.mimeType, photo.fileSize],
      );
    }
    await insertChecklistSubmissions(client, taskId, input.checklists);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Executa a operação de update request task visit e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link validateVisit}, {@link isSafeInteger}, {@link all}, {@link map} e outras rotinas auxiliares.
 *
 * @param input Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
export async function updateRequestTaskVisit(input: UpdateVisitInput) {
  validateVisit({ ...input, requestId: 1, checklists: [] }, false);
  if (!Number.isSafeInteger(input.visitId) || input.visitId <= 0) throw new Error("Visita inválida.");
  const photoBuffers = await Promise.all(input.photos.map(async (photo) => ({
    content: Buffer.from(await photo.arrayBuffer()), fileName: photo.name, mimeType: photo.type, fileSize: photo.size,
  })));
  const pool = await getPostgresPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const updated = await client.query(
      `UPDATE request_task SET start_datetime = $2::timestamp, stop_datetime = $3::timestamp, description = $4
       WHERE id = $1 RETURNING id`,
      [input.visitId, input.startDatetime, input.stopDatetime, input.description],
    );
    if (!updated.rows[0]) throw new Error("A visita informada não existe.");
    const memberships = await client.query<{ id: number }>("SELECT id FROM membership WHERE id = ANY($1::integer[])", [input.memberIds]);
    if (memberships.rows.length !== input.memberIds.length) throw new Error("Um ou mais executantes selecionados não existem.");
    await client.query("DELETE FROM task_member_occurrence WHERE id_task = $1", [input.visitId]);
    for (const memberId of input.memberIds) await client.query("INSERT INTO task_member_occurrence (id_task, id_membership) VALUES ($1, $2)", [input.visitId, memberId]);
    for (const photo of photoBuffers) await client.query(
      `INSERT INTO request_task_media (id_request_task, content, file_name, mime_type, file_size) VALUES ($1, $2, $3, $4, $5)`,
      [input.visitId, photo.content, photo.fileName, photo.mimeType, photo.fileSize],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Executa a operação de validate visit e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link isSafeInteger}, {@link valueOf}, {@link some}, {@link reduce} e outras rotinas auxiliares.
 *
 * @param input Dados necessários para executar esta função.
 * @param requirePhotos Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
function validateVisit(input: VisitInput, requirePhotos = true) {
  if (!Number.isSafeInteger(input.requestId) || input.requestId <= 0) throw new Error("Request inválida.");
  if (!input.description || input.description.length > 300) throw new Error("A descrição deve possuir entre 1 e 300 caracteres.");
  const start = new Date(input.startDatetime);
  const stop = new Date(input.stopDatetime);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(stop.valueOf())) throw new Error("Informe datas e horários válidos.");
  if (stop < start) throw new Error("O fim da visita não pode ser anterior ao início.");
  if (input.memberIds.length === 0) throw new Error("Selecione ao menos um executante.");
  if (input.memberIds.some((id) => !Number.isSafeInteger(id) || id <= 0)) throw new Error("A lista de executantes é inválida.");
  if (requirePhotos && input.photos.length === 0) throw new Error("Adicione ao menos um registro fotográfico.");
  if (input.photos.reduce((total, photo) => total + photo.size, 0) > MAX_TOTAL_SIZE) throw new Error("Os registros de mídia excedem o limite total de 25 MB.");
  for (const photo of input.photos) {
    if (!photo.type.startsWith("image/") && !photo.type.startsWith("video/")) {
      throw new Error(`${photo.name} não é uma imagem ou um vídeo válido.`);
    }
    if (!photo.name || photo.name.length > 255 || photo.size > MAX_PHOTO_SIZE) throw new Error(`${photo.name || "O arquivo"} excede o limite permitido de 10 MB.`);
  }
}
