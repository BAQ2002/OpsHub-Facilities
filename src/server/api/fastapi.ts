import "server-only";

export function getFastApiBaseUrl() {
  const baseUrl = process.env.FASTAPI_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "FASTAPI_BASE_URL não configurada. Copie .env.example para .env.local e informe a URL da API FastAPI.",
    );
  }

  return baseUrl.replace(/\/$/, "");
}

export function getFastApiPath(envName: string, fallbackPath: string) {
  const path = process.env[envName] ?? fallbackPath;

  return path.startsWith("/") ? path : `/${path}`;
}

export async function requestFastApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getFastApiBaseUrl()}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `FastAPI respondeu ${response.status} em ${path}${errorBody ? `: ${errorBody}` : ""}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
