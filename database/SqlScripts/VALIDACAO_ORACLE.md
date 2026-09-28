# Validação dos scripts para Oracle 19c

Data: 28/09/2026. Resultado: **adaptação parcial; o conjunto não está pronto para execução integral no Oracle**.

A revisão considerou os 50 arquivos SQL de `database/SqlScripts`, o schema atual, os contratos de persistência e a documentação Oracle 19c. Não foram alterados scripts SQL nem executados DDL/DML no banco. Esta é uma avaliação estática, não uma homologação de execução ou de todos os registros da carga.

## Resultado por grupo

| Grupo | Arquivos | Resultado |
|---|---:|---|
| `CreateTables` | 24 | Consolidado e 23 definições individuais coerentes com Oracle 19c na revisão estática; execução real pendente. |
| `InsertTable` | 18 | Conjunto incompatível e com divergências de schema/fluxo de importação. Alguns inserts simples já têm sintaxe utilizável. |
| `SqlQueries` | 5 | Exemplos ainda contêm sintaxe PostgreSQL e referências a colunas inexistentes. |
| `UpdateTables` | 3 | Migrações legadas PostgreSQL; não utilizáveis como estão no Oracle. |

## Bloqueios encontrados

1. **Cargas com dialeto PostgreSQL.** `InsertTable/INSERT_ALL_TABLES.sql:10` usa `BEGIN;` como abertura de transação; a linha 33 inicia `VALUES` com várias linhas. Outros blocos usam `E'...'`, `ON CONFLICT`, `TRUE/FALSE`, `::JSONB`, `setval` e `pg_get_serial_sequence`. Oracle 19c exige reescrita desses recursos. Para cargas, usar inserts individuais ou outra estratégia compatível com identities; para repetição idempotente, definir uma chave e considerar `MERGE`. A sintaxe Oracle de inserção está na [referência de INSERT](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/INSERT.html).

2. **Coluna incorreta na carga individual de status.** `InsertTable/RequestsTables/INSERT_REQUEST_TRANSACTION_STATUS.sql:1` insere em `NAME`, mas `CreateTables/RequestsTables/CREATE_REQUEST_TRANSACTION_STATUS.sql` define `DESCRIPTION`. O consolidado já usa `DESCRIPTION` na linha 174, comprovando divergência entre as versões.

3. **Literais de texto com aspas incorretas.** `InsertTable/MembersTables/INSERT_SECTOR.sql:1` e as demais linhas usam aspas duplas, como `"TI"`, em lugar de aspas simples. O mesmo ocorre no consolidado, a partir da linha 129. Aspas duplas identificam objetos/colunas; não delimitam valores textuais.

4. **Importação de valores adicionais incompleta.** O consolidado cria e preenche `OHFC_TMP_SERVICE_FIELD_VALUE_IMPORT` a partir da linha 2405, mas não contém `INSERT INTO OHFC_SERVICE_FIELD_VALUE`. O individual `InsertTable/ServicesTables/INSERT_SERVICE_FIELD_VALUE.sql` contém a transferência, porém depende de `OHFC_TMP_REQUEST_IMPORT` a partir da linha 4237. Nenhum script atual desta pasta cria essa tabela; `INSERT_REQUEST.sql` insere diretamente em `OHFC_REQUEST`. É necessário reconstruir a correspondência dos IDs antes de converter a carga. O consolidado também não incorpora as cargas individuais de checklist.

5. **JSON e booleanos ainda seguem o armazenamento antigo.** As cargas de campos de serviço/checklist e `UpdateTables/UPDATE_SERVICE_FIELD_TYPE_MEDIA.sql` usam JSONB e booleanos SQL. O schema atual exige CLOB e números 0/1. O backend exige ainda o envelope `{"value": ...}` para JSON; remover apenas o cast `::JSONB` não resolve essa diferença. A restrição `IS JSON` valida o documento, mas não impõe esse envelope. Ver [condições JSON do Oracle](https://docs.oracle.com/en/database/oracle/oracle-database/19/adjsn/conditions-is-json-and-is-not-json.html).

6. **Datas e identities precisam de conversão explícita.** `InsertTable/RequestsTables/INSERT_REQUEST.sql:1` usa strings de data sem conversão, dependentes de `NLS_TIMESTAMP_FORMAT` no Oracle. Utilizar literais `TIMESTAMP '...'`, `TO_TIMESTAMP` com máscara ou binds tipados. O final desse script e o consolidado usam funções PostgreSQL para ajustar sequências. Após importar IDs explícitos, ajustar as identities Oracle para evitar colisões nas próximas inserções. Oracle oferece `ALTER TABLE ... MODIFY ... START WITH LIMIT VALUE`; esse DDL deve ser planejado considerando os commits implícitos. Ver [ALTER TABLE — identity options](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-TABLE.html).

7. **Consultas ainda não convertidas.** Exemplos: `SqlQueries/01_home_page_queries.sql:16` usa `COUNT(*) FILTER`; `02_my_requests_page_queries.sql:46` usa `CAST(... AS TEXT) ILIKE`; `03_activity_tracking_page_queries.sql:20` usa `EXTRACT(EPOCH ...)` e cast `::INTEGER`; `04_activity_request_form_queries.sql:89` usa `NOW()` e a linha 94 usa `RETURNING id` sem bind de saída. `SqlQueries/Home_page/DataGrid_view.sql:13` usa `AS` para alias de tabela, não aceito no Oracle 19c. Reescrever agregações condicionais com `CASE`, buscas com a semântica de caixa desejada, intervalos e recuperação de IDs conforme Oracle; o caso `INSERT ... SELECT ... RETURNING` exige reformulação, não apenas adicionar `INTO`.

8. **Consulta de transações diverge do DDL.** `SqlQueries/04_activity_request_form_queries.sql:137–139` tenta inserir `ID_TRANSACTION_STATUS`, `REQUESTED_DATE` e `PROPOSED_DATE`. O schema define `ID_REQUEST_TRANSACTION_STATUS` e não possui as duas datas. A conversão de dialeto sozinha não corrige esse bloco; o destino dessas datas requer definição funcional.

9. **Atualizações não são migrações Oracle.** `UpdateTables/ALIGN_SCHEMA_DEFINITIONS.sql:9–13` usa `ALTER COLUMN ... SET NOT NULL` e `TYPE ... USING`; o ajuste de mídia usa `ILIKE`, `IS DISTINCT FROM`, JSONB e `TRUE`. A renomeação usa `BEGIN;` e pressupõe tabelas antigas sem prefixo. Não aplicar esses arquivos sobre uma instalação Oracle criada pelos DDLs atuais.

## Criação das tabelas

Os três testes de `backend.tests.test_schema_definitions` passaram. Eles verificam equivalência entre consolidado e individuais, ordem das FKs, prefixos, ausência de owner explícito, tipos e correspondência das colunas com as projeções do backend. A revisão adicional encontrou 53 constraints nomeadas, sem duplicação de nomes no consolidado.

Os tipos usados — `NUMBER`, identity, `VARCHAR2(n CHAR)`, `CLOB CHECK (... IS JSON)`, `BLOB`, `TIMESTAMP` e `INTERVAL DAY(9) TO SECOND(6)` — são coerentes com o destino declarado. Não foram encontrados bloqueios estáticos nos DDLs de criação.

Há nomes de constraints com até 43 bytes. Isso requer `COMPATIBLE >= 12.2`, mesmo em uma instalação Oracle 19c; abaixo disso o limite geral é 30 bytes. Confirmar a configuração em homologação. Ver [regras de nomes Oracle](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Database-Object-Names-and-Qualifiers.html).

## Validação executada e limites

```powershell
.\.venv\Scripts\python.exe -m unittest backend.tests.test_schema_definitions -v
# 3 testes: OK

.\.venv\Scripts\python.exe -m unittest backend.tests.test_oracle_integration -v
# 1 teste: ignorado por ausência da configuração ORACLE_TEST_*
```

O teste de integração exige `ORACLE_TEST_USER`, `ORACLE_TEST_PASSWORD` e `ORACLE_TEST_DSN`. Ele executa leituras sobre um schema existente; mesmo quando passar, não comprovará criação, carga, retorno de IDs ou rollback de gravações.

Para concluir a adaptação: corrigir os bloqueios de carga e schema, converter ou retirar os exemplos/migrações legados, criar as 23 tabelas em schema descartável Oracle 19c e validar a carga convertida com contagens, FKs, JSON, datas e geração de novos IDs. A execução em banco continua pendente.
