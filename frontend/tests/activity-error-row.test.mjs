import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
function renderTable(state) {
  function load(path) {
    const { outputText } = ts.transpileModule(readFileSync(new URL(`../app/${path}`, import.meta.url), "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    });
    const exports = {};
    new Function("require", "exports", outputText)((name) => {
      if (name === "next/navigation") return { useRouter: () => ({ refresh() {} }) };
      if (name.includes("useActivityTable")) return { useActivityTable: () => ({ retry() {}, setQuery() {}, ...state }) };
      if (name.startsWith("@/app/")) return load(`${name.slice(6)}.tsx`);
      return require(name);
    }, exports);
    return exports;
  }
  const Table = load("pages/home/_components/ActivityTable.tsx").default;
  return renderToStaticMarkup(createElement(Table, {
    startDate: "2026-10-01", endDate: "2026-10-08", statuses: [], selectedBusiness: "all", categoryStyleMap: {},
  }));
}

test("HTTP aparece em uma linha da tabela com todas as colunas e nova tentativa", () => {
  const html = renderTable({ error: { kind: "http", status: 503, message: "HTTP 503 — Serviço temporariamente indisponível." }, loading: false });
  assert.match(html, /<thead[\s\S]*Tipo de solicitação[\s\S]*<tbody[^>]*><tr><td colSpan="8"[\s\S]*HTTP 503/);
  assert.match(html, /Tentar novamente/);
  assert.doesNotMatch(html, /Nenhuma atividade encontrada/);
  assert.doesNotMatch(html, /0 solicitações/);
});

test("resposta vazia bem-sucedida mostra ausência de registros, sem erro", () => {
  const html = renderTable({ loading: false, data: { items: [], total: 0, page: 1, pageSize: 30 } });
  assert.match(html, /Nenhuma atividade encontrada/);
  assert.doesNotMatch(html, /Tentar novamente/);
});
