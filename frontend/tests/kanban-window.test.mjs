import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function load(relative) {
  const source = readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
  const exports = {};
  new Function("require", "exports", outputText)((name) => {
    if (name === "@/app/entities/api/api-result") return load("app/entities/api/api-result.ts");
    throw new Error(name);
  }, exports);
  return exports;
}
const { kanbanWindowOffset } = load("app/componentes/kanban-window.ts");
const { createColumnWindowLoader } = load("app/pages/chamados/kanbanboard/_lib/column-window-loader.ts");
const tick = () => new Promise((resolve) => setImmediate(resolve));
const success = (id, offset) => ({ ok: true, data: { id, offset, total: 100, pageSize: 10,
  requests: Array.from({ length: 10 }, (_, index) => ({ id: offset + index })) } });

test("rolagem avança e retorna com sobreposição, alcançando o último registro", () => {
  assert.equal(kanbanWindowOffset(4, 0, 100, 10, true), 0);
  assert.equal(kanbanWindowOffset(5, 0, 100, 10, true), 5);
  assert.equal(kanbanWindowOffset(6, 5, 100, 10, false), 0);
  assert.equal(kanbanWindowOffset(88, 0, 100, 10, true), 85);
  assert.equal(kanbanWindowOffset(99, 85, 100, 10, true), 90);
  assert.equal(kanbanWindowOffset(22, 10, 23, 10, true), 13);
  assert.equal(kanbanWindowOffset(0, 0, 4, 10, false), 0);
});

test("rolagem rápida mantém uma busca por coluna e ignora posições superadas", async () => {
  const calls = [];
  const updates = [];
  const loader = createColumnWindowLoader((id, offset) => new Promise((resolve) => calls.push({ id, offset, resolve })),
    (id, state) => updates.push({ id, ...state }));
  loader.request(4, 5);
  loader.request(4, 10);
  loader.request(4, 30);
  loader.request(1, 5);
  assert.deepEqual(calls.map(({ id, offset }) => [id, offset]), [[4, 5], [1, 5]]);
  calls[0].resolve(success(4, 5));
  await tick();
  assert.equal(calls[2].offset, 30);
  assert.equal(updates.some((update) => update.data?.offset === 5 && update.id === 4), false);
  calls[2].resolve(success(4, 30));
  calls[1].resolve(success(1, 5));
  await tick();
  assert.equal(updates.filter((update) => update.data).length, 2);
  assert.equal(updates.find((update) => update.data?.offset === 30).data.requests.length, 10);
  loader.dispose();
});

test("voltar ao bloco atual cancela a aplicação do bloco pendente", async () => {
  let resolve;
  const updates = [];
  const loader = createColumnWindowLoader(() => new Promise((done) => { resolve = done; }), (_, state) => updates.push(state));
  loader.request(4, 5);
  loader.request(4, 0);
  resolve(success(4, 5));
  await tick();
  assert.equal(updates.some((update) => update.data), false);
  assert.equal(updates.at(-1).pending, false);
  loader.dispose();
});

test("troca de filtros descarta respostas antigas; falhas permitem nova tentativa", async () => {
  let resolve;
  const updates = [];
  const loader = createColumnWindowLoader(() => new Promise((done) => { resolve = done; }), (_, state) => updates.push(state));
  loader.request(4, 5);
  loader.dispose();
  resolve(success(4, 5));
  await tick();
  assert.equal(updates.length, 1);
  loader.activate();
  loader.request(4, 5);
  resolve({ ok: false, error: { kind: "http", status: 503, message: "HTTP 503" } });
  await tick();
  assert.equal(updates.at(-1).error.status, 503);
  loader.request(4, 5);
  resolve(success(4, 5));
  await tick();
  assert.equal(updates.at(-1).data.offset, 5);
  loader.dispose();
});
