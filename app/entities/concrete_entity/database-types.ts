/** Valores JSON de colunas JSONB, incluindo null SQL/JSON. */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** TIMESTAMP serializado em ISO 8601; não é Date nem texto formatado para a tela. */
export type TimestampString = string;

/** DECIMAL serializado como texto para preservar a precisão. */
export type DecimalString = string;

/** INTERVAL serializado como duração ISO 8601, preservando meses e dias. */
export type IntervalString = string;

/** BYTEA serializado em base64 no contrato JSON de uma entidade completa. */
export type Base64String = string;
