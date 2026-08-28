import "server-only";

const POSTGRES_DATA_SOURCE = "postgres";

/**
 * Acionada pelos módulos que importam esta função ou pelo fluxo interno deste arquivo.
 *
 * Executa a operação de assert postgres data source e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link stringify}.
 *
 * @returns Não retorna valor.
 */
export function assertPostgresDataSource(): void {
  const dataSource = process.env.DATA_SOURCE;

  if (dataSource !== POSTGRES_DATA_SOURCE) {
    const received = dataSource === undefined ? "não configurado" : JSON.stringify(dataSource);
    throw new Error(
      `DATA_SOURCE inválido: ${received}. Esta aplicação aceita apenas DATA_SOURCE=${POSTGRES_DATA_SOURCE} (case-sensitive).`,
    );
  }
}
