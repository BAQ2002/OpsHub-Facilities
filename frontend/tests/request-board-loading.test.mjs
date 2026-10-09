import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { posix } from "node:path";
import ts from "typescript";

const require = createRequire(import.meta.url);
const cache = new Map();
function load(relative) {
  if (cache.has(relative)) return cache.get(relative);
  const source = readFileSync(fileURLToPath(new URL(`../${relative}`, import.meta.url)), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
  const exports = {};
  cache.set(relative, exports);
  new Function("require", "exports", outputText)((name) => {
    if (name === "server-only") return {};
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`);
    if (name.startsWith(".")) return load(`${posix.join(posix.dirname(relative), name)}.ts`);
    return require(name);
  }, exports);
  return exports;
}

const board = load("app/services/request-board-service.ts");
const visits = load("app/services/request-task-service.ts");
const fixture = JSON.parse(readFileSync(new URL("./fixtures/entity-data.json", import.meta.url), "utf8"));

test("HTTP 404 dos endpoints novos recupera detalhes e visitas pelo contrato antigo", async () => {
  const originalFetch = globalThis.fetch;
  const request = fixture.board.requests[0];
  const paths = [];
  globalThis.fetch = async (url) => {
    const parsed = new URL(url);
    paths.push(parsed);
    if (parsed.pathname.endsWith("/details")) return new Response('{"detail":"Not Found"}', { status: 404 });
    const wrongId = { ...request, request: { ...request.request, id: Number(`${request.request.id}0`) } };
    return new Response(JSON.stringify({ ...fixture.board, requests: [wrongId, request] }));
  };
  try {
    const filters = { startDate: "2026-01-01", endDate: "2026-10-08", businessId: 7, search: "bomba" };
    const details = await board.getRequestDetails(request.request.id, filters);
    assert.equal(details.id, request.request.id);
    assert.ok(details.details.some((field) => field.id === "description"));
    assert.equal(details.media[0].url, request.media[0].url);
    assert.equal(details.visits[0].id, request.visits[0].task.id);
    const visit = await visits.getVisitDetails(request.visits[0].task.id, request.request.id, filters);
    assert.equal(visit.id, request.visits[0].task.id);
    assert.equal(visit.checklists[0].values[0].value, false);
    for (const url of paths.filter((url) => url.pathname.endsWith("/board"))) {
      assert.equal(url.searchParams.get("search"), String(request.request.id));
      assert.equal(url.searchParams.get("business_id"), "7");
      assert.equal(url.searchParams.get("start_date"), filters.startDate);
      assert.equal(url.searchParams.get("end_date"), filters.endDate);
    }
  } finally { globalThis.fetch = originalFetch; }
});

test("compatibilidade de detalhes preserva erros reais e nunca retorna outro chamado ou visita", async () => {
  const originalFetch = globalThis.fetch;
  let status = 503;
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls++;
    if (new URL(url).pathname.endsWith("/details")) return new Response("{}", { status });
    return new Response(JSON.stringify(fixture.board));
  };
  try {
    await assert.rejects(board.getRequestDetails(999), (error) => error.failure.status === 503);
    assert.equal(calls, 1);
    status = 404;
    await assert.rejects(board.getRequestDetails(999), (error) => error.failure.status === 404);
    await assert.rejects(visits.getVisitDetails(999, fixture.board.requests[0].request.id), (error) => error.failure.status === 404);
  } finally { globalThis.fetch = originalFetch; }
});

test("quadro preserva chamados retornados pelo backend no contrato anterior", async () => {
  const originalFetch = globalThis.fetch;
  const request = fixture.board.requests[0];
  let requestedUrl;
  globalThis.fetch = async (url) => {
    requestedUrl = new URL(url);
    return new Response(JSON.stringify(fixture.board));
  };
  try {
    const result = await board.getRequestBoardPageData({ startDate: "2026-01-01", endDate: "2026-10-08", businessId: 7, serviceCategoryIds: [2, 10], search: " bomba " });
    const column = result.columns.find((item) => item.id === request.request.idRequestStatus);
    assert.ok(column);
    assert.equal(column.requests.length, 1);
    assert.deepEqual(column.requests[0], {
      id: request.request.id, serviceTypeName: request.serviceType.name,
      requesterName: request.requester?.name || "Não informado", locationName: request.location?.name || "Não informado",
    });
    assert.equal(result.columns.flatMap((item) => item.requests).length, fixture.board.requests.length);
    assert.equal(requestedUrl.searchParams.get("business_id"), "7");
    assert.deepEqual(requestedUrl.searchParams.getAll("service_category_ids"), ["2", "10"]);
    assert.equal(requestedUrl.searchParams.get("search"), "bomba");
    assert.equal("visits" in column.requests[0], false);
  } finally { globalThis.fetch = originalFetch; }
});

test("quadro limita cartões por status e mantém totais independentes da janela", async () => {
  const originalFetch = globalThis.fetch;
  const requests = Array.from({ length: 10 }, (_, index) => ({ id: 100 - index, statusId: 4,
    serviceTypeName: "Serviço", requesterName: null, locationName: null }));
  const urls = [];
  globalThis.fetch = async (url) => {
    const parsed = new URL(url);
    urls.push(parsed);
    return new Response(JSON.stringify(parsed.pathname.endsWith("/board")
      ? { statuses: [{ id: 4, description: "Concluída" }], requests, counts: { 4: 1569 }, pageSize: 10 }
      : { statusId: 4, requests, total: 1569, offset: 25, pageSize: 10 }));
  };
  try {
    const filters = { startDate: "2026-01-01", endDate: "2026-10-08", businessId: 7, serviceCategoryIds: [2, 10], sort: "recent" };
    const initial = await board.getRequestBoardPageData(filters);
    assert.equal(initial.columns[0].total, 1569);
    assert.equal(initial.columns[0].requests.length, 10);
    assert.equal(initial.columns[0].offset, 0);
    const next = await board.getRequestBoardColumnData(filters, 4, 25);
    assert.equal(next.total, 1569);
    assert.equal(next.offset, 25);
    assert.equal(next.requests.length, 10);
    assert.ok(urls[1].pathname.endsWith("/board/columns/4"));
    assert.equal(urls[1].searchParams.get("offset"), "25");
    for (const url of urls) {
      assert.equal(url.searchParams.get("page_size"), "10");
      assert.equal(url.searchParams.get("sort"), "recent");
      assert.equal(url.searchParams.get("business_id"), "7");
      assert.deepEqual(url.searchParams.getAll("service_category_ids"), ["2", "10"]);
    }
  } finally { globalThis.fetch = originalFetch; }
});

test("compatibilidade antiga retorna somente a janela solicitada, na ordem dos mais recentes", async () => {
  const originalFetch = globalThis.fetch;
  const original = fixture.board.requests[0];
  const requests = Array.from({ length: 23 }, (_, index) => ({ ...original,
    request: { ...original.request, id: index + 1, idRequestStatus: 4, createdDate: "2026-10-01T12:00:00" },
  }));
  globalThis.fetch = async (url) => new URL(url).pathname.includes("/board/columns/")
    ? new Response("{}", { status: 404 })
    : new Response(JSON.stringify({ statuses: [{ id: 4, description: "Concluída" }], requests }));
  try {
    const filters = { startDate: "2026-01-01", endDate: "2026-10-08" };
    const initial = await board.getRequestBoardPageData(filters);
    assert.equal(initial.columns[0].requests.length, 10);
    assert.equal(initial.columns[0].total, 23);
    assert.equal(initial.columns[0].requests[0].id, 23);
    const last = await board.getRequestBoardColumnData(filters, 4, 20);
    assert.equal(last.offset, 13);
    assert.equal(last.requests.length, 10);
    assert.equal(last.requests.at(-1).id, 1);
  } finally { globalThis.fetch = originalFetch; }
});

test("quadro consulta somente cartões; detalhes e catálogos são solicitados separadamente", async () => {
  const originalFetch = globalThis.fetch;
  const paths = [];
  const request = fixture.board.requests[0];
  globalThis.fetch = async (url) => {
    const path = new URL(url).pathname.replace("/api/v1", "");
    paths.push(path);
    let data;
    if (path === "/requests/board") data = { statuses: [{ id: 1, description: "Em aberto" }], requests: [{ id: 42, statusId: 1, serviceTypeName: "Serviço", requesterName: null, locationName: "Local" }] };
    else if (path === "/requests/42/details") data = { ...request, visits: request.visits.map((visit) => visit.task) };
    else if (path === `/request-tasks/${request.visits[0].task.id}/details`) data = request.visits[0];
    else if (path === "/memberships/executors") data = [{ id: 1, name: null }];
    else if (path === "/checklists") data = fixture.checklists;
    else throw new Error(`Unexpected endpoint: ${path}`);
    return new Response(JSON.stringify(data));
  };
  try {
    const result = await board.getRequestBoardPageData({ startDate: "2026-01-01", endDate: "2026-10-08" });
    assert.deepEqual(paths, ["/requests/board"]);
    assert.deepEqual(result.columns[0].requests[0], { id: 42, serviceTypeName: "Serviço", requesterName: "Não informado", locationName: "Local" });
    const details = await board.getRequestDetails(42);
    assert.equal(details.visits[0].id, request.visits[0].task.id);
    assert.equal("checklists" in details.visits[0], false);
    assert.equal("executors" in details.visits[0], false);
    assert.ok(details.details.some((field) => field.id === "created-at"));
    const visit = await visits.getVisitDetails(details.visits[0].id);
    assert.equal(visit.checklists[0].values[0].value, false);
    assert.equal(paths.some((path) => path === "/checklists"), false);
    const catalogs = await visits.getVisitCatalogs();
    assert.equal(catalogs.executors[0].name, "Não informado");
    assert.equal(catalogs.checklistDefinitions[0].id, fixture.checklists[0].checklist.id);
    assert.deepEqual(paths.slice(-2).sort(), ["/checklists", "/memberships/executors"]);
  } finally { globalThis.fetch = originalFetch; }
});
