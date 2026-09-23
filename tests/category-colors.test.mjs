import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function moduleUrl(file, imports = {}) {
  let source = readFileSync(new URL(`../app/entities/navigation_entities/${file}.ts`, import.meta.url), "utf8");
  for (const [name, url] of Object.entries(imports)) source = source.replaceAll(`"${name}"`, JSON.stringify(url));
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
  });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const imports = { "./service_category_styles": moduleUrl("service_category_styles") };
const home = await import(moduleUrl("home_viewModels", imports));
const dashboard = await import(moduleUrl("chamados_dashboard_viewModels", imports));

test("Home e Dashboard seguem os HEX da referência para cada ID do catálogo", () => {
  const expected = [
    [1, "#B97842", "#F6E7D9"], [2, "#1CA2C1", "#E6F7FB"],
    [3, "#D94E2B", "#FBE7E2"], [4, "#FFD21A", "#FFF8D9"],
    [5, "#2864C7", "#E6F0FB"], [6, "#31A354", "#E7F6EA"],
    [7, "#78899B", "#E8ECF1"], [9, "#E63286", "#FDE7F1"],
    [10, "#6540A4", "#EFE7F8"],
  ];
  for (const [categoryId, color, backgroundColor] of expected) {
    assert.deepEqual(home.getActivityCategoryStyle(categoryId), { color, backgroundColor });
    const item = { categoryId, label: "Categoria", value: 12 };
    assert.deepEqual(dashboard.mapCategoryChartItem(item), { ...item, color, backgroundColor });
  }
});

test("filtros, ordem, nome e quantidade não alteram a cor da categoria", () => {
  const items = [
    { categoryId: 10, label: "PMOC", value: 20 },
    { categoryId: 2, label: "Refrigeração", value: 8 },
  ];
  const before = structuredClone(items);
  const original = items.map(dashboard.mapCategoryChartItem);
  const reordered = [...items].reverse().map(dashboard.mapCategoryChartItem);
  assert.equal(original[0].color, reordered[1].color);
  const filtered = dashboard.mapCategoryChartItem({ ...items[0], label: "Novo nome", value: 1 });
  assert.equal(filtered.color, original[0].color);
  assert.equal(filtered.backgroundColor, original[0].backgroundColor);
  assert.deepEqual(items, before);
});

test("novos projetos e IDs desconhecidos usam fallback neutro", () => {
  for (const id of [8, 999, null, undefined]) {
    assert.deepEqual(home.getActivityCategoryStyle(id), { color: "#64748B", backgroundColor: "#F1F5F9" });
  }
  assert.equal(dashboard.mapCategoryChartItem({ categoryId: 999, label: "Outra", value: 1 }).color, "#64748B");
});
