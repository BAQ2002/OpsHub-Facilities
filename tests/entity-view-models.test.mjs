import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../app/services/mappers/entity-view-models.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } });
const mappers = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const fixtures = JSON.parse(readFileSync(new URL("./fixtures/entity-data.json", import.meta.url), "utf8"));

test("solicitações preservam o dia civil e classificam todos os status de fechamento", () => {
  const card = mappers.mapRequestCard(fixtures.context);
  assert.deepEqual(card, { id: 42, title: "Bomba", createdAt: "20/09/2026", status: "Fechado", hasUnreadMessage: false });
  for (const description of ["Concluída", "Concluida", "Cancelada"]) {
    assert.equal(mappers.mapRequestCard({ ...fixtures.context, requestStatus: { id: 4, description } }).status, "Fechado");
  }
  assert.equal(mappers.mapRequestCard({ ...fixtures.context, requestStatus: { id: 1, description: "Em andamento" } }).status, "Aberto");
});

test("organização adapta nomes nulos e IDs sem fabricar vínculos ausentes", () => {
  const result = mappers.mapOrganization(fixtures.organization);
  assert.deepEqual(result.businesses, [{ id: 1, name: "Não informado" }]);
  assert.deepEqual(result.regions, [{ id: 2, businessId: 1, name: "Não informado" }]);
  assert.deepEqual(result.locations, [{ id: 3, regionId: 2, name: "Não informado" }]);
});

test("catálogo agrupa pelos relacionamentos e mantém categorias sem serviços", () => {
  assert.deepEqual(mappers.mapCatalog(fixtures.catalog), [
    { id: 1, name: "Manutenção", serviceTypes: [{ id: 2, name: "Bomba" }] },
    { id: 9, name: "Não informado", serviceTypes: [] },
  ]);
});

test("campos persistidos viram controles e mantêm a configuração de upload", () => {
  const field = fixtures.form.fields[0];
  const result = mappers.mapServiceField(field);
  assert.equal(result.type, "file");
  assert.equal(result.name, "service_field_10");
  assert.equal(result.fullWidth, true);
  assert.deepEqual(result.mediaOptions, { multiple: true, accept: ["image/*", "video/*"] });
  assert.deepEqual(mappers.mapServiceField({ ...field, type: "SINGLE_SELECT", options: [0, false, "A"] }).options,
    [{ label: "0", value: "0" }, { label: "false", value: "false" }, { label: "A", value: "A" }]);
  const legacy = mappers.mapServiceField({ ...field, name: null, type: null, required: null, options: null });
  assert.equal(legacy.label, "Campo adicional");
  assert.equal(legacy.type, "text");
  assert.equal(legacy.required, false);
});

test("kanban formata detalhes sem perder zero, false ou alterar as entidades", () => {
  const before = structuredClone(fixtures.board.requests[0]);
  const card = mappers.mapBoardCard(before);
  assert.deepEqual(card.details.map((detail) => detail.value), ["Trocar bomba", "0", "false"]);
  assert.equal(card.locationName, "Não informado");
  assert.equal(card.media[0].fileName, "media");
  assert.equal(card.media[0].url, "/api/v1/service-catalog/media/3");
  assert.equal(card.media[0].fileSize, undefined);
  assert.deepEqual(before, fixtures.board.requests[0]);
});

test("visitas preservam datetime-local, datas nulas, executores e respostas de checklist", () => {
  const visit = mappers.mapVisit(fixtures.board.requests[0].visits[0]);
  assert.equal(visit.startDate, "21/09/2026");
  assert.equal(visit.startDatetime, "2026-09-21T00:30");
  assert.equal(visit.endDate, "");
  assert.equal(visit.endDatetime, "");
  assert.equal(visit.executors[0].name, "Não informado");
  assert.equal(visit.checklists[0].description, "");
  assert.equal(visit.checklists[0].values[0].value, false);
});

test("definições de checklist mantêm campos booleanos e adaptam opções", () => {
  const result = mappers.mapChecklistDefinition(fixtures.checklists[0]);
  assert.equal(result.description, "");
  assert.equal(result.fields[0].type, "BOOL");
  assert.deepEqual(result.fields[0].options, []);
});

test("Home monta atividade a partir dos relacionamentos e coordenadas decimais", () => {
  const result = mappers.mapActivity(fixtures.context);
  assert.equal(result.id, "42");
  assert.equal(result.status, "Concluída");
  assert.equal(result.category, "Manutenção");
  assert.equal(result.businessUnit, "Não informado");
  assert.deepEqual(result.mapPosition, { x: 12.12345678, y: 123.12345678 });
  assert.ok(result.statusDate.includes("21/09/2026"));
  const missing = mappers.mapActivity({ ...fixtures.context, location: null, category: null, serviceType: null });
  assert.equal(missing.categoryId, null);
  assert.deepEqual(missing.mapPosition, { x: 0, y: 0 });
});
