import "server-only";

import type { ChecklistDefinition, ChecklistFieldType, ChecklistSubmission } from "@/src/domain/entities/checklist";
import { getPostgresPool, type PgClient } from "@/src/server/db/postgres";
import type { ChecklistRepository } from "@/src/server/repositories/checklist/checklist-repository";

type DefinitionRow = {
  checklist_id: number | string;
  checklist_name: string;
  description: string | null;
  version: string;
  field_id: number | string | null;
  field_name: string | null;
  field_type: string | null;
  options: unknown;
  required: boolean | null;
};

const SUPPORTED_TYPES = new Set<ChecklistFieldType>(["TEXT", "NUMBER", "DATE", "BOOL", "SINGLE_SELECT", "MULTI_SELECT"]);

export const postgresChecklistRepository: ChecklistRepository = {
  findActiveDefinitions: findActiveChecklistDefinitions,
  addToVisit: insertChecklistForVisit,
  deleteFromVisit: deleteVisitChecklist,
};

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém active checklist definitions para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona {@link getPostgresPool}, {@link query}, {@link get}, {@link toUpperCase} e outras rotinas auxiliares.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function findActiveChecklistDefinitions(): Promise<ChecklistDefinition[]> {
  const pool = await getPostgresPool();
  const result = await pool.query<DefinitionRow>(
    `SELECT checklist.id AS checklist_id, checklist.name AS checklist_name,
            checklist.description, checklist.version, field.id AS field_id,
            field.name AS field_name, field.type AS field_type, field.options, field.required
       FROM checklist_type checklist
       LEFT JOIN checklist_field_type field
         ON field.id_checklist_type = checklist.id AND field.active IS TRUE
      WHERE checklist.active IS TRUE
      ORDER BY checklist.name, checklist.version, field.display_order, field.id`,
  );

  const definitions = new Map<number, ChecklistDefinition>();
  for (const row of result.rows) {
    const checklistId = Number(row.checklist_id);
    const definition = definitions.get(checklistId) ?? {
      id: checklistId,
      name: row.checklist_name,
      description: row.description ?? "",
      version: row.version,
      fields: [],
    };
    if (row.field_id != null && row.field_name && row.field_type) {
      const type = row.field_type.toUpperCase() as ChecklistFieldType;
      if (SUPPORTED_TYPES.has(type)) {
        definition.fields.push({
          id: Number(row.field_id),
          name: row.field_name,
          type,
          options: normalizeOptions(row.options),
          required: row.required ?? false,
        });
      }
    }
    definitions.set(checklistId, definition);
  }
  return [...definitions.values()];
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Executa a operação de insert checklist for visit e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link isSafeInteger}, {@link getPostgresPool}, {@link connect}, {@link query} e outras rotinas auxiliares.
 *
 * @param visitId Dados necessários para executar esta função.
 * @param submission Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
export async function insertChecklistForVisit(visitId: number, submission: ChecklistSubmission): Promise<void> {
  if (!Number.isSafeInteger(visitId) || visitId <= 0) throw new Error("Visita inválida.");
  const pool = await getPostgresPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const visit = await client.query("SELECT id FROM request_task WHERE id = $1", [visitId]);
    if (!visit.rows[0]) throw new Error("A visita informada não existe.");
    await insertChecklistSubmissions(client, visitId, [submission]);
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
 * Executa a operação de insert checklist submissions e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link isSafeInteger}, {@link query}, {@link map}, {@link has} e outras rotinas auxiliares.
 *
 * @param client Dados necessários para executar esta função.
 * @param visitId Dados necessários para executar esta função.
 * @param submissions Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
export async function insertChecklistSubmissions(client: PgClient, visitId: number, submissions: ChecklistSubmission[]) {
  for (const submission of submissions) {
    const typeId = Number(submission.checklistTypeId);
    if (!Number.isSafeInteger(typeId) || typeId <= 0) throw new Error("Tipo de checklist inválido.");
    const fields = await client.query<{
      id: number; type: string; options: unknown; required: boolean;
    }>(
      `SELECT field.id, field.type, field.options, field.required
         FROM checklist_type checklist
         JOIN checklist_field_type field ON field.id_checklist_type = checklist.id
        WHERE checklist.id = $1 AND checklist.active IS TRUE AND field.active IS TRUE
        ORDER BY field.display_order, field.id`,
      [typeId],
    );
    if (!fields.rows.length) throw new Error("O checklist selecionado não existe, está inativo ou não possui campos ativos.");

    const submitted = new Map(submission.values.map((item) => [Number(item.fieldId), item.value]));
    for (const field of fields.rows) {
      if (!SUPPORTED_TYPES.has(field.type.toUpperCase() as ChecklistFieldType)) {
        throw new Error(`O campo ${field.id} possui um tipo não suportado.`);
      }
      validateFieldValue(field, submitted.get(Number(field.id)));
    }
    if ([...submitted.keys()].some((id) => !fields.rows.some((field) => Number(field.id) === id))) {
      throw new Error("O checklist contém um campo inválido ou inativo.");
    }

    const checklist = await client.query<{ id: number }>(
      `INSERT INTO request_task_checklist
         (id_checklist_type, id_request_task, corporation, equipment_tag, equipment_brand,
          equipment_model, rented_equipment, serial_number, pt_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        typeId,
        visitId,
        submission.corporation,
        submission.equipmentTag,
        submission.equipmentBrand,
        submission.equipmentModel,
        submission.rentedEquipment,
        submission.serialNumber,
        submission.ptNumber,
      ],
    );
    for (const field of fields.rows) {
      const value = submitted.get(Number(field.id));
      if (isEmpty(value) && !field.required) continue;
      await client.query(
        `INSERT INTO checklist_field_value (id_checklist_field_type, id_request_task_checklist, value)
         VALUES ($1, $2, $3::jsonb)`,
        [field.id, checklist.rows[0].id, JSON.stringify(value)],
      );
    }
  }
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Executa a operação de delete visit checklist e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link isSafeInteger}, {@link getPostgresPool}, {@link connect}, {@link query} e outras rotinas auxiliares.
 *
 * @param checklistId Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
export async function deleteVisitChecklist(checklistId: number): Promise<void> {
  if (!Number.isSafeInteger(checklistId) || checklistId <= 0) throw new Error("Checklist inválido.");
  const pool = await getPostgresPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM checklist_field_value WHERE id_request_task_checklist = $1", [checklistId]);
    const deleted = await client.query("DELETE FROM request_task_checklist WHERE id = $1 RETURNING id", [checklistId]);
    if (!deleted.rows[0]) throw new Error("O checklist informado não existe.");
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
 * Executa a operação de validate field value e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link isEmpty}, {@link toUpperCase}, {@link isFinite}, {@link isArray} e outras rotinas auxiliares.
 *
 * @param field Dados necessários para executar esta função.
 * @param value Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
function validateFieldValue(field: { id: number; type: string; options: unknown; required: boolean }, value: unknown) {
  if (isEmpty(value)) {
    if (field.required) throw new Error(`Preencha o campo obrigatório ${field.id}.`);
    return;
  }
  const type = field.type.toUpperCase();
  if (type === "NUMBER" && (typeof value !== "number" || !Number.isFinite(value))) throw new Error(`O campo ${field.id} deve ser numérico.`);
  if (type === "BOOL" && typeof value !== "boolean") throw new Error(`O campo ${field.id} deve ser verdadeiro ou falso.`);
  if (type === "MULTI_SELECT" && !Array.isArray(value)) throw new Error(`O campo ${field.id} deve possuir uma lista de opções.`);
  if (["TEXT", "DATE", "SINGLE_SELECT"].includes(type) && typeof value !== "string") throw new Error(`O campo ${field.id} possui um valor inválido.`);
  if (type === "SINGLE_SELECT" || type === "MULTI_SELECT") {
    const allowed = new Set(normalizeOptions(field.options).map((option) => option.value));
    const values = Array.isArray(value) ? value : [value];
    if (values.some((item) => typeof item !== "string" || !allowed.has(item))) throw new Error(`O campo ${field.id} possui uma opção inválida.`);
  }
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Normalize options para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link parse}, {@link isArray}, {@link map}.
 *
 * @param options Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function normalizeOptions(options: unknown): { label: string; value: string }[] {
  let parsed = options;
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { return []; }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.map((option) => {
    if (typeof option === "object" && option && "value" in option) {
      const value = String(option.value);
      return { value, label: "label" in option ? String(option.label) : value };
    }
    const value = String(option);
    return { value, label: value };
  });
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Executa is empty no fluxo atual.
 * Durante o fluxo, aciona {@link isArray}.
 *
 * @param value Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function isEmpty(value: unknown) {
  return value == null || value === "" || (Array.isArray(value) && value.length === 0);
}
