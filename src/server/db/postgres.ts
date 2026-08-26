import "server-only";

import { assertPostgresDataSource } from "@/src/server/config/data-source";

type QueryResult<T> = {
  rows: T[];
};

type PgPool = {
  query<T = unknown>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
  connect(): Promise<PgClient>;
};

export type PgClient = {
  query<T = unknown>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
  release(): void;
};

type PgModule = {
  Pool: new (config: { connectionString: string; max: number; ssl?: { rejectUnauthorized: boolean } }) => PgPool;
};

declare global {
  var __opshubPgPool: PgPool | undefined;
}

export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL não configurada. Copie .env.example para .env.local e ajuste a connection string.");
  }

  return databaseUrl;
}

export async function getPostgresPool() {
  assertPostgresDataSource();

  if (globalThis.__opshubPgPool) {
    return globalThis.__opshubPgPool;
  }

  const { Pool } = (await Function("return import('pg')")()) as PgModule;
  const databaseUrl = getDatabaseUrl();

  globalThis.__opshubPgPool = new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.POSTGRES_POOL_MAX ?? 10),
    ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  return globalThis.__opshubPgPool;
}
