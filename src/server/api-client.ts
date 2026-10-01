import "server-only";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";

export function getBackendUrl(): string {
  return (process.env.BACKEND_API_URL ?? DEFAULT_BACKEND_URL).replace(/\/$/, "");
}

export async function backendJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getBackendUrl()}/api/v1${path}`, {
    cache: "no-store",
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(60_000),
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    throw new Error(`Não foi possível concluir a operação (HTTP ${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function jsonRequest(body: unknown, method: RequestInit["method"] = "POST"): RequestInit {
  return { method, body: JSON.stringify(body) };
}

export async function serializeFile(file: File) {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Arquivo excede o limite de 10 MiB.");
  }
  return { fileName: file.name, mimeType: file.type || "application/octet-stream", contentBase64: Buffer.from(await file.arrayBuffer()).toString("base64") };
}
