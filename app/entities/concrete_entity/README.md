# Entidades concretas

Os tipos desta pasta representam os contratos de registros persistidos nas 23 tabelas `OHFC_`, com base nos [scripts de criação Oracle 19c](../../../database/SqlScripts/CreateTables). Não são um ORM, não executam SQL e não validam JSON em tempo de execução.

Consulte o [guia Oracle](../../../documents/database.md), o [inventário SQL](../../../database/SqlScripts/README.md) e a [arquitetura da aplicação](../../../README.md).

## Convenções

- Os tipos mantêm os nomes de domínio sem o prefixo `OHFC_`; os arquivos usam kebab-case. Os nomes históricos `ChecklistTypeEntity` e `ServiceLevelAgreementEntity` correspondem às tabelas `OHFC_CHECKLIST_TYPE` e `OHFC_SLA`.
- As propriedades normalmente usam camelCase. As exceções do contrato HTTP estão documentadas abaixo.
- Chaves primárias são obrigatórias; FKs guardam o ID da entidade relacionada, sem incluir objetos de relacionamento dentro do registro.
- Colunas anuláveis usam `null`, não propriedades opcionais. Defaults SQL não tornam opcionais as propriedades de um registro lido.
- `NUMBER(1)` é exposto como booleano quando representa `ACTIVE`, `REQUIRED` ou `RENTED_EQUIPMENT`; nulabilidade segue o DDL.
- JSON persistido em CLOB é exposto como `JsonValue`, sem o envelope de armazenamento. SQL NULL e JSON null têm a mesma representação pública.
- `TIMESTAMP` é texto ISO 8601; não se acrescenta fuso automaticamente. Coordenadas decimais usam texto para preservar precisão. IDs, contagens e tamanhos de arquivo usam números.
- Durações de SLA seguem a convenção de texto ISO 8601. Conteúdo BLOB usa base64 nos tipos completos; os endpoints atuais de mídia devolvem bytes.
- Metadados de mídia, agregações e relacionamentos possuem contratos próprios em [entity-responses.ts](../api/entity-responses.ts). Não devem ser tratados como registros completos de tabela.

As convenções de serialização estão em [database-types.ts](database-types.ts). Classes CSS e dados formatados para a interface pertencem a `navigation_entities`.

## Estrutura SQL e contratos HTTP

Os scripts individuais são a referência; o consolidado possui as mesmas 23 definições. Todos usam nomes de tabela `OHFC_`, sem schema proprietário explícito. `OHFC_SECTOR.ACCESS_LEVELS` é `NUMBER(10) NOT NULL`; `OHFC_REQUEST_TASK_MEDIA.FILE_SIZE` é `NUMBER(10)` anulável em bytes; a data de mídia é `CREATED_DATE`.

Os serviços usam os nomes físicos abaixo. Os aliases de validação dos [modelos Pydantic](../../../backend/app/api/entities.py) preservam os nomes públicos:

| Tabela | Coluna SQL | Campo JSON / TypeScript |
|---|---|---|
| `OHFC_REQUEST` | `ID_MEMBERSHIP_REQUESTER` | `idMemberRequester` |
| `OHFC_REQUEST` | `ID_MEMBERSHIP_RESPONDER` | `idMemberResponder` |
| `OHFC_REQUEST_TASK` | `STARTED_DATE` | `startDatetime` |
| `OHFC_REQUEST_TASK` | `FINISHED_DATE` | `stopDatetime` |
| `OHFC_TASK_MEMBER_OCCURRENCE` | `ID_REQUEST_TASK` | `idTask` |

`OHFC_REQUEST_TRANSACTION` também usa `ID_MEMBERSHIP_REQUESTER` e `ID_MEMBERSHIP_RESPONDER`. O tipo TypeScript mantém `idMemberRequester` e `idMemberResponder`, mas ainda não existe endpoint de transações. Sua futura persistência deverá aplicar o mesmo mapeamento explícito.

### JSON: armazenamento e resposta

O valor original `{"multiple": true}` é armazenado como `{"value": {"multiple": true}}`, mas a API continua devolvendo `{"multiple": true}`. Um objeto que já contenha `value` também é envolvido, evitando ambiguidade. Esse envelope pertence exclusivamente à persistência e não deve ser acrescentado pelo frontend.

## Tabelas cobertas

- OHFC_BUSINESS → business.ts
- OHFC_CHECKLIST_FIELD_TYPE → checklist-field-type.ts
- OHFC_CHECKLIST_FIELD_VALUE → checklist-field-value.ts
- OHFC_CHECKLIST_TYPE → checklist.ts
- OHFC_LOCATION → location.ts
- OHFC_MEMBERSHIP → membership.ts
- OHFC_REGION → region.ts
- OHFC_REQUEST → request.ts
- OHFC_REQUEST_STATUS → request-status.ts
- OHFC_REQUEST_TASK → request-task.ts
- OHFC_REQUEST_TASK_CHECKLIST → request-task-checklist.ts
- OHFC_REQUEST_TASK_MEDIA → request-task-media.ts
- OHFC_REQUEST_TRANSACTION → request-transaction.ts
- OHFC_REQUEST_TRANSACTION_STATUS → request-transaction-status.ts
- OHFC_REQUEST_TYPE → request-type.ts
- OHFC_SECTOR → sector.ts
- OHFC_SERVICE_CATEGORY → service-category.ts
- OHFC_SERVICE_FIELD_MEDIA → service-field-media.ts
- OHFC_SERVICE_FIELD_TYPE → service-field-type.ts
- OHFC_SERVICE_FIELD_VALUE → service-field-value.ts
- OHFC_SLA → service-level-agreement.ts
- OHFC_SERVICE_TYPE → service-type.ts
- OHFC_TASK_MEMBER_OCCURRENCE → task-member-occurrence.ts

## Integração com o backend

O fluxo de leitura é:

```text
Oracle → cursor python-oracledb → decode_row → modelos Pydantic
       → HTTP/JSON → backendJson → mapeadores → modelos de tela
```

[projections.py](../../../backend/app/api/projections.py) define as colunas das consultas com entidades relacionadas. Aliases como `request__id` e `request__id_membership_requester` são agrupados por `decode_row()` em objetos. Quando o ID do lado opcional de um JOIN é nulo, o relacionamento inteiro se torna `None`. CLOBs e BLOBs são lidos antes de fechar o cursor; JSON é desembrulhado nessa etapa.

Os contratos `/api/v1/requests/mine`, `/api/v1/requests/activities`, `/api/v1/requests/board`, `/api/v1/service-catalog`, `/api/v1/service-catalog/request-form`, `/api/v1/organization/locations` e `/api/v1/checklists` mantêm os nomes consumidos pelo frontend. A migração Oracle não exige renomear URLs ou propriedades públicas.

Membros usados como opções são projeções de `id`/`name`, sem e-mail ou permissões. Mídias nas listagens contêm metadados e URL; o conteúdo é servido nos endpoints de download. Home e Dashboard usam contratos de agregação. Transações, SLA e setor possuem tipos, mas não ganharam novos fluxos de tela.

## Manutenção e verificação

Ao alterar uma coluna, confira o DDL individual e consolidado, a projeção SQL quando utilizada, o modelo Pydantic, o tipo TypeScript e os testes de contrato. Um cast TypeScript não transforma nem valida o JSON recebido.

Na raiz do projeto:

```powershell
node node_modules/typescript/bin/tsc --noEmit --incremental false
node --test tests/entity-view-models.test.mjs tests/category-colors.test.mjs
.\.venv\Scripts\python.exe -m unittest discover -s backend/tests -v
```

Os testes compartilham [entity-data.json](../../../tests/fixtures/entity-data.json) para conferir nomes, nulabilidade e serialização. Testes locais usam resultados simulados e não comprovam compatibilidade com a base implantada. A configuração do teste de integração opcional está no [guia Oracle](../../../documents/database.md#teste-de-integração-opcional).

Os scripts históricos de carga e atualização permanecem PostgreSQL. Sua conversão é uma pendência separada; nenhuma alteração de entidade executa migrations ou modifica dados automaticamente.
