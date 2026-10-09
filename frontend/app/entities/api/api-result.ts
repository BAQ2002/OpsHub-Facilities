export type ApiFailure = {
  kind: "http" | "connection" | "timeout" | "invalid-response" | "validation";
  status?: number;
  message: string;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiFailure };

export function httpFailure(status: number): ApiFailure {
  const descriptions: Record<number, string> = {
    400: "Requisição inválida.", 401: "Autenticação necessária.",
    403: "Acesso negado.", 404: "Recurso não encontrado.",
    409: "Conflito ao executar a operação.", 422: "Verifique os dados informados.",
    429: "Muitas requisições. Aguarde e tente novamente.",
    500: "Erro interno no servidor.", 502: "Falha na comunicação com o serviço.",
    503: "Serviço temporariamente indisponível.", 504: "Tempo limite do serviço excedido.",
  };
  return { kind: "http", status, message: `HTTP ${status} — ${descriptions[status] ?? "Não foi possível concluir a operação."}` };
}

export const connectionFailure: ApiFailure = {
  kind: "connection", message: "Não foi possível conectar ao servidor.",
};

export class InputError extends Error {}

export class BackendError extends Error {
  constructor(public readonly failure: ApiFailure) {
    super(failure.message);
    this.name = "BackendError";
  }
}

// Only expected API failures become data. Programming errors still reach the error boundary.
export async function apiResult<T>(operation: () => Promise<T>): Promise<ApiResult<T>> {
  try {
    return { ok: true, data: await operation() };
  } catch (error) {
    if (error instanceof InputError) return { ok: false, error: { kind: "validation", message: error.message } };
    if (error instanceof BackendError) return { ok: false, error: error.failure };
    throw error;
  }
}
