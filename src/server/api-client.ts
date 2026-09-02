import "server-only";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";

export function getBackendUrl(): string {
  return (process.env.BACKEND_API_URL ?? DEFAULT_BACKEND_URL).replace(/\/$/, "");
}

export async function backendJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getBackendUrl()}/api/v1${path}`, {
    cache: "no-store",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Backend Facilities respondeu ${response.status}: ${detail}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function backendResponse(path: string): Promise<Response> {
  const response = await fetch(`${getBackendUrl()}/api/v1${path}`, { cache: "no-store" });
  if (!response.ok) return new Response(null, { status: response.status });
  return response;
}

export async function serializeFile(file: File) {
  return { fileName: file.name, mimeType: file.type || "application/octet-stream", contentBase64: Buffer.from(await file.arrayBuffer()).toString("base64") };
}
