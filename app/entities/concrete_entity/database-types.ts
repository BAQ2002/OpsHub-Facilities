/** Valores JSON de colunas JSON em CLOB (sem o envelope de armazenamento), incluindo null SQL/JSON. */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** TIMESTAMP serializado em ISO 8601; não é Date nem texto formatado para a tela. */
export type TimestampString = string;

/** NUMBER decimal serializado como texto para preservar a precisão. */
export type DecimalString = string;

/** INTERVAL serializado como duração ISO 8601, preservando dias e a precisão dos segundos. */
export type IntervalString = string;

/** BLOB serializado em base64 no contrato JSON de uma entidade completa. */
export type Base64String = string;
