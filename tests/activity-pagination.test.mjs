import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../app/pages/home/_components/activity-pagination.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } });
const { readActivityPagination, saveActivityPagination } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("restaura a página e tamanho somente para os mesmos filtros", () => {
  let saved = null;
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: {
    getItem: () => saved, setItem: (_key, value) => { saved = value; },
  } });
  assert.deepEqual(readActivityPagination("periodo-a"), { page: 1, pageSize: 30 });
  saveActivityPagination("periodo-a", { page: 4, pageSize: 60 });
  assert.deepEqual(readActivityPagination("periodo-a"), { page: 4, pageSize: 60 });
  assert.deepEqual(readActivityPagination("periodo-b"), { page: 1, pageSize: 60 });
  for (const page of [-1, 0, 1.5, "2", 2147483648]) {
    saved = JSON.stringify({ filterKey: "periodo-a", page, pageSize: 60 });
    assert.deepEqual(readActivityPagination("periodo-a"), { page: 1, pageSize: 60 });
  }
  saved = JSON.stringify({ filterKey: "periodo-a", page: 2, pageSize: 999 });
  assert.equal(readActivityPagination("periodo-a").pageSize, 30);
  saved = "invalid json";
  assert.deepEqual(readActivityPagination("periodo-a"), { page: 1, pageSize: 30 });
});

test("continua funcionando quando sessionStorage está bloqueado", () => {
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, get() { throw new Error("Blocked"); } });
  assert.deepEqual(readActivityPagination("filtros"), { page: 1, pageSize: 30 });
  assert.doesNotThrow(() => saveActivityPagination("filtros", { page: 2, pageSize: 90 }));
  delete globalThis.sessionStorage;
});
