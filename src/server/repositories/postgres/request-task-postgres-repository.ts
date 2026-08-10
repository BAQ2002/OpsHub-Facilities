import "server-only";

import { getPostgresPool } from "@/src/server/db/postgres";

export type MembershipOption = { id: number; name: string };

type VisitInput = {
  requestId: number;
  description: string;
  startDatetime: string;
  stopDatetime: string;
  memberIds: number[];
  photos: File[];
};

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;

export async function findMembershipOptions(): Promise<MembershipOption[]> {
  const pool = await getPostgresPool();
  const result = await pool.query<MembershipOption>(
    `SELECT id, name FROM membership WHERE name IS NOT NULL ORDER BY name, id`,
  );
  return result.rows;
}

export async function insertRequestTaskVisit(input: VisitInput) {
  validateVisit(input);
  const photoBuffers = await Promise.all(
    input.photos.map(async (photo) => ({
      content: Buffer.from(await photo.arrayBuffer()),
      fileName: photo.name,
      fileSize: photo.size.toString(),
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
        `INSERT INTO request_task_media (id_request_task, content, file_name, file_size)
         VALUES ($1, $2, $3, $4)`,
        [taskId, photo.content, photo.fileName, photo.fileSize],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function validateVisit(input: VisitInput) {
  if (!Number.isSafeInteger(input.requestId) || input.requestId <= 0) throw new Error("Request inválida.");
  if (!input.description || input.description.length > 300) throw new Error("A descrição deve possuir entre 1 e 300 caracteres.");
  const start = new Date(input.startDatetime);
  const stop = new Date(input.stopDatetime);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(stop.valueOf())) throw new Error("Informe datas e horários válidos.");
  if (stop < start) throw new Error("O fim da visita não pode ser anterior ao início.");
  if (input.memberIds.length === 0) throw new Error("Selecione ao menos um executante.");
  if (input.memberIds.some((id) => !Number.isSafeInteger(id) || id <= 0)) throw new Error("A lista de executantes é inválida.");
  if (input.photos.length === 0) throw new Error("Adicione ao menos um registro fotográfico.");
  if (input.photos.reduce((total, photo) => total + photo.size, 0) > MAX_TOTAL_SIZE) throw new Error("As fotos excedem o limite total de 25 MB.");
  for (const photo of input.photos) {
    if (!photo.type.startsWith("image/")) throw new Error(`${photo.name} não é uma imagem válida.`);
    if (!photo.name || photo.name.length > 255 || photo.size > MAX_PHOTO_SIZE) throw new Error(`${photo.name || "A foto"} excede o limite permitido de 10 MB.`);
  }
}
