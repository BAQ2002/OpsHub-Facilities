import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { posix } from "node:path";
import ts from "typescript";

// Execute the real TypeScript modules, replacing only Next's server-only marker and assets.
const require = createRequire(import.meta.url);
const cache = new Map();
function load(relative) {
  if (cache.has(relative)) return cache.get(relative);
  const path = fileURLToPath(new URL(`../${relative}`, import.meta.url));
  const source = readFileSync(path, "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
  } });
  const exports = {};
  cache.set(relative, exports);
  new Function("require", "exports", outputText)((name) => {
    if (name === "server-only") return {};
    if (name.endsWith(".png")) return { src: "/map.png", width: 100, height: 100 };
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`);
    if (name.startsWith(".")) return load(`${posix.join(posix.dirname(relative), name)}.ts`);
    return require(name);
  }, exports);
  return exports;
}

const { backendJson } = load("app/services/api-client.ts");
const { apiResult, BackendError, InputError } = load("app/entities/api/api-result.ts");

test("contrato preserva falhas esperadas e não oculta erros de programação", async () => {
  assert.deepEqual(await apiResult(async () => []), { ok: true, data: [] });
  const invalid = await apiResult(async () => { throw new InputError("Data inválida"); });
  assert.equal(invalid.error.kind, "validation");
  await assert.rejects(apiResult(async () => { throw new TypeError("bug"); }), /bug/);
});

test("HTTP, timeout, cancelamento, corpo inválido, falha parcial e recuperação", async () => {
  let unavailable = true;
  const server = createServer((req, res) => {
    const path = new URL(req.url, "http://localhost").pathname;
    if (path.endsWith("/slow")) return;
    if (path.endsWith("/slow-body")) { res.writeHead(200); res.write('{"items":'); return; }
    if (path.endsWith("/invalid")) { res.end("not json"); return; }
    if (path.endsWith("/home-metrics")) {
      res.end(JSON.stringify({ equipment: [], handlingMinutes: [30] })); return;
    }
    if (path.endsWith("/business-counts")) { res.end("[]"); return; }
    if (unavailable) { res.writeHead(503); res.end("internal confidential details"); return; }
    res.end("[]");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const previousUrl = process.env.BACKEND_API_URL;
  const previousTimeout = process.env.BACKEND_READ_TIMEOUT_MS;
  process.env.BACKEND_API_URL = `http://127.0.0.1:${server.address().port}`;
  process.env.BACKEND_READ_TIMEOUT_MS = "2000";
  try {
    const failed = await apiResult(() => backendJson("/requests"));
    assert.equal(failed.error.status, 503);
    assert.match(failed.error.message, /HTTP 503/);
    assert.doesNotMatch(failed.error.message, /confidential/);

    const externalSignal = new AbortController();
    process.env.BACKEND_READ_TIMEOUT_MS = "100";
    const slow = await apiResult(() => backendJson("/slow", { signal: externalSignal.signal }));
    assert.equal(slow.error.kind, "timeout");
    assert.equal(slow.error.status, undefined);
    assert.equal((await apiResult(() => backendJson("/slow-body"))).error.kind, "timeout");
    process.env.BACKEND_READ_TIMEOUT_MS = "2000";
    assert.equal((await apiResult(() => backendJson("/invalid"))).error.kind, "invalid-response");

    const cancelled = new AbortController();
    cancelled.abort();
    await assert.rejects(backendJson("/slow", { signal: cancelled.signal }), (error) => !(error instanceof BackendError));

    const { getHomePageData } = load("app/services/home-service.ts");
    const home = await getHomePageData({ startDate: "2026-10-01", endDate: "2026-10-08" });
    assert.equal(home.metrics.ok, true);
    assert.equal(home.metrics.data.averageHandlingTimeClock.display, "00:30");
    assert.equal(home.activityMarkers.error.status, 503);
    assert.equal(home.plannedRequestFilterOptions.ok, true);
    assert.equal(home.mapImage.src, "/map.png");

    unavailable = false;
    assert.deepEqual(await apiResult(() => backendJson("/requests")), { ok: true, data: [] });
    assert.equal((await getHomePageData({ startDate: "2026-10-01", endDate: "2026-10-08" })).activityMarkers.ok, true);
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    const offline = await apiResult(() => backendJson("/requests"));
    assert.equal(offline.error.kind, "connection");
    assert.equal(offline.error.status, undefined);
  } finally {
    server.closeAllConnections();
    server.close();
    if (previousUrl === undefined) delete process.env.BACKEND_API_URL; else process.env.BACKEND_API_URL = previousUrl;
    if (previousTimeout === undefined) delete process.env.BACKEND_READ_TIMEOUT_MS; else process.env.BACKEND_READ_TIMEOUT_MS = previousTimeout;
  }
});
