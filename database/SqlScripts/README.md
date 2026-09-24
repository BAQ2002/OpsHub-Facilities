# Scripts do banco

O destino atual é Oracle 19c. Todas as tabelas da aplicação usam `OHFC_`; os DDLs não qualificam schema proprietário. As consultas executadas pelo FastAPI ficam nos serviços Python, não nos arquivos de exemplo desta pasta.

Consulte o [guia Oracle](../../documents/database.md), a [arquitetura](../../README.md) e os [contratos das entidades](../../app/entities/concrete_entity/README.md).

## Inventário e compatibilidade

| Caminho | Dialeto / situação | Uso |
|---|---|---|
| [CreateTables/CREATE_ALL_TABLES.sql](CreateTables/CREATE_ALL_TABLES.sql) | Oracle 19c | Criação das 23 tabelas em ordem de dependências |
| [CreateTables](CreateTables) — arquivos individuais | Oracle 19c | Mesmas definições do consolidado, organizadas por domínio |
| [InsertTable](InsertTable) | PostgreSQL legado | Referência das cargas; conversão para Oracle pendente |
| [SqlQueries](SqlQueries) | PostgreSQL legado | Exemplos históricos; não executados pelo backend |
| [UpdateTables](UpdateTables) | PostgreSQL legado | Atualizações anteriores; não aplicáveis ao Oracle |
| [docker-compose.yml](../docker-compose.yml) | PostgreSQL legado | Não provisiona Oracle |

O prefixo `OHFC_` nos scripts históricos não os torna compatíveis com Oracle. Cargas e atualizações não são executadas automaticamente pela aplicação.

## Criação em Oracle

Use o consolidado **ou** os scripts individuais em uma base sem essas tabelas. O consolidado incorpora as quatro tabelas de checklist e reproduz as definições individuais. Os testes de schema conferem equivalência e ordem de dependências.

Os tipos atuais são `NUMBER(10)` com identity para IDs, `VARCHAR2(n CHAR)` para textos, `NUMBER(1)` com CHECK para booleanos, `CLOB` com `IS JSON` para JSON, `BLOB` para mídia e `TIMESTAMP` para datas. `OHFC_SLA.DEADLINE` usa `INTERVAL DAY(9) TO SECOND(6)`.

`OHFC_SECTOR.ACCESS_LEVELS` é obrigatório; `OHFC_REQUEST_TASK_MEDIA.FILE_SIZE` é `NUMBER(10)` anulável, em bytes. As datas das mídias usam `CREATED_DATE`. Não há `ON UPDATE CASCADE` nem `ON DELETE RESTRICT` explícito; `ON DELETE CASCADE` foi mantido onde previsto.

O JSON persistido deve usar o envelope `{"value": <valor original>}`. `IS JSON` não verifica sozinho esse envelope: o backend também valida o formato. O envelope não aparece nos contratos HTTP.

DDL Oracle produz commits implícitos. O consolidado não contém dados, não faz upgrade de uma base existente e não constitui uma migração transacional ou um sistema de migrations versionadas.

## Atualizações PostgreSQL anteriores

- [RENAME_TABLES_OHFC.sql](UpdateTables/RENAME_TABLES_OHFC.sql): renomeação das 23 tabelas originais para `OHFC_`, em uma base PostgreSQL completa.
- [ALIGN_SCHEMA_DEFINITIONS.sql](UpdateTables/ALIGN_SCHEMA_DEFINITIONS.sql): obrigatoriedade de `ACCESS_LEVELS` e conversão de `FILE_SIZE` para inteiro no PostgreSQL.
- [UPDATE_SERVICE_FIELD_TYPE_MEDIA.sql](UpdateTables/UPDATE_SERVICE_FIELD_TYPE_MEDIA.sql): ajuste de configuração de campos de mídia usando sintaxe PostgreSQL.

Esses arquivos não devem ser executados no Oracle nem misturados com os DDLs atuais de criação.

## Trabalho restante nos scripts

- Converter ou retirar de uso exemplos e atualizações legadas, definindo quais ainda são necessários.
- Converter as cargas para a sintaxe Oracle, incluindo envelopes JSON e booleanos 0/1.
- Preservar IDs e relações entre registros e preparar o ajuste das identities após a importação de IDs explícitos. A correlação visual das categorias também depende desses IDs.
- Estabelecer ordenação, versionamento e registro de aplicação das futuras migrations.

A execução da carga com dados reais e a validação em Oracle são etapas posteriores. Não há mecanismo automatizado de migração dos dados ou reversão de implantação neste diretório.
