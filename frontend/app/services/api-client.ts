import "server-only";
import { BackendError, InputError, connectionFailure, httpFailure } from "@/app/entities/api/api-result";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";

export function getBackendUrl(): string {
  return (process.env.BACKEND_API_URL ?? DEFAULT_BACKEND_URL).replace(/\/$/, "");
}

export async function backendFetch(path: string, init?: RequestInit, timeoutMs?: number): Promise<Response> {
  const configuredTimeout = Number(process.env.BACKEND_READ_TIMEOUT_MS ?? 30_000);
  const readTimeout = Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 30_000;
  const timeout = AbortSignal.timeout(timeoutMs ?? (init?.method && init.method !== "GET" ? 60_000 : readTimeout));
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  let response: Response;
  try {
    response = await fetch(`${getBackendUrl()}/api/v1${path}`, {
      cache: "no-store",
      ...init,
      signal,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (error) {
    if (init?.signal?.aborted) throw error;
    throw new BackendError(timeout.aborted
      ? { kind: "timeout", message: "Tempo limite excedido ao aguardar o servidor." }
      : connectionFailure);
  }
  if (!response.ok) {
    throw new BackendError(httpFailure(response.status));
  }
  return response;
}

export async function backendJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await backendFetch(path, init);
  if (response.status === 204) return undefined as T;
  try {
    return await response.json() as T;
  } catch (error) {
    if (init?.signal?.aborted) throw error;
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new BackendError({ kind: "timeout", message: "Tempo limite excedido ao receber os dados." });
    }
    throw new BackendError({ kind: "invalid-response", message: "O servidor retornou uma resposta inválida ou incompleta." });
  }
}

export function jsonRequest(body: unknown, method: RequestInit["method"] = "POST"): RequestInit {
  return { method, body: JSON.stringify(body) };
}

export async function serializeFile(file: File) {
  if (file.size > 10 * 1024 * 1024) {
    throw new InputError("Arquivo excede o limite de 10 MiB.");
  }
  return { fileName: file.name, mimeType: file.type || "application/octet-stream", contentBase64: Buffer.from(await file.arrayBuffer()).toString("base64") };
}
