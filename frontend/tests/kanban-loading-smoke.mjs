// Run after npm run build. Uses an isolated backend and production frontend.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const paths = [];
let filtersSent = false;
const backend = createServer((req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  paths.push(path);
  res.setHeader("Content-Type", "application/json");
  if (path === "/api/v1/requests/board") {
    res.end(JSON.stringify({ statuses: [{ id: 1, description: "Em aberto" }], requests: [
      { id: 42, statusId: 1, serviceTypeName: "Bomba de teste", requesterName: "Solicitante", locationName: "Local" },
    ] }));
  } else if (path === "/api/v1/requests/filter-options") {
    setTimeout(() => { filtersSent = true; res.end(JSON.stringify({ businesses: [], serviceCategories: [] })); }, 2000);
  } else { res.writeHead(500); res.end(JSON.stringify({ unexpected: path })); }
});
await new Promise((resolve) => backend.listen(0, "127.0.0.1", resolve));
const reservation = createServer();
await new Promise((resolve) => reservation.listen(0, "127.0.0.1", resolve));
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: fileURLToPath(new URL("../", import.meta.url)), windowsHide: true,
  env: { ...process.env, BACKEND_API_URL: `http://127.0.0.1:${backend.address().port}`, BACKEND_READ_TIMEOUT_MS: "10000" },
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
child.stdout.on("data", (data) => { output += data; });
child.stderr.on("data", (data) => { output += data; });
const base = `http://127.0.0.1:${port}`;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error(output);
    try { ready = (await fetch(`${base}/api/health`)).ok; } catch { /* Starting. */ }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.ok(ready, output);
  const response = await fetch(`${base}/pages/chamados/kanbanboard`, { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200);
  const decoder = new TextDecoder();
  let html = "";
  let boardBeforeFilters = false;
  for await (const chunk of response.body) {
    html += decoder.decode(chunk, { stream: true });
    if (html.includes('data-ui="request-board-card"') && !filtersSent) boardBeforeFilters = true;
  }
  assert.ok(boardBeforeFilters, "O cartão deve chegar antes da resposta dos filtros.");
  assert.match(html, /Bomba de teste/);
  assert.match(html, /requests-workspace-filters/);
  assert.deepEqual(paths.sort(), ["/api/v1/requests/board", "/api/v1/requests/filter-options"]);
  console.log("OK: quadro recebido antes dos filtros; acesso inicial não consulta visitas, executores ou checklists.");
} finally {
  child.kill();
  backend.closeAllConnections();
  await new Promise((resolve) => backend.close(resolve));
}
