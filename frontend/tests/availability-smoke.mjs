// Run after npm run build: node tests/availability-smoke.mjs
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
let mode = "http";
const backend = createServer((req, res) => {
  if (mode === "slow") return;
  if (mode === "http") { res.writeHead(503); res.end(); return; }
  const path = new URL(req.url, "http://localhost").pathname;
  res.setHeader("Content-Type", "application/json");
  if (path.endsWith("/home-metrics")) res.end(JSON.stringify({ equipment: [], handlingMinutes: [30] }));
  else if (path.endsWith("/activities/page")) res.end(JSON.stringify({ items: [], total: 0, page: 1, pageSize: 30 }));
  else res.end("[]");
});
await new Promise((resolve) => backend.listen(0, "127.0.0.1", resolve));
const backendPort = backend.address().port;
const reservation = createServer();
await new Promise((resolve) => reservation.listen(0, "127.0.0.1", resolve));
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: fileURLToPath(new URL("../", import.meta.url)), windowsHide: true,
  env: { ...process.env, BACKEND_API_URL: `http://127.0.0.1:${backendPort}`, BACKEND_READ_TIMEOUT_MS: "500" },
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
child.stdout.on("data", (data) => { output += data; });
child.stderr.on("data", (data) => { output += data; });
const base = `http://127.0.0.1:${port}`;
async function page(path, expected) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(15_000) });
  const html = await response.text();
  assert.equal(response.status, 200, `${path}: ${html.slice(0, 100)}`);
  assert.match(html, /data-ui="app-shell"/);
  assert.ok(expected.test(html), `${path}: conteúdo esperado ausente (${expected}).`);
  assert.doesNotMatch(html, /Ocorreu um erro inesperado/);
}
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error(output);
    try { ready = (await fetch(`${base}/api/health`)).ok; } catch { /* Starting. */ }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.ok(ready, output);
  const routes = ["/pages/home", "/pages/minhas-solicitacoes", "/pages/chamados/dashboard", "/pages/chamados/kanbanboard", "/pages/solicitar-atividade", "/pages/solicitar-atividade/chamado?service_type_id=1"];
  for (const path of routes) await page(path, /HTTP 503/);
  let response = await fetch(`${base}/api/home/activities`);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.status, 503);
  assert.equal((await fetch(`${base}/api/requests/report`)).status, 503);
  console.log("OK: seis páginas preservam a estrutura com HTTP 503; paginação e PDF preservam o status.");

  mode = "slow";
  await page("/pages/home", /Tempo limite excedido/);
  console.log("OK: timeout mantém a Home acessível.");

  mode = "healthy";
  await page("/pages/home", /0h 30min/);
  response = await fetch(`${base}/api/home/activities`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).total, 0);
  console.log("OK: recuperação retorna dados válidos na Home e na paginação.");

  backend.closeAllConnections();
  await new Promise((resolve) => backend.close(resolve));
  for (const path of routes) await page(path, /Não foi possível conectar ao servidor/);
  assert.equal((await fetch(`${base}/api/health`)).status, 200);
  console.log("OK: seis páginas acessíveis sem backend; health do frontend permanece 200.");
} finally {
  child.kill();
  backend.closeAllConnections();
  backend.close();
}
