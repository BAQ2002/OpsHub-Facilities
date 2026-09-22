# Entidades concretas

Um tipo por tabela, baseado nos scripts individuais de database/SqlScripts/CreateTables. Estes tipos descrevem registros completos; não são um ORM executável e não criam tabelas ou endpoints.

## Convenções

- Nome do tipo: nome da tabela em PascalCase + Entity. Arquivo em kebab-case.
- Colunas em camelCase, preservando o nome original: ID_REQUEST_TYPE → idRequestType.
- Chaves primárias obrigatórias; chaves estrangeiras referenciam o tipo do ID da entidade relacionada. Não são adicionados objetos de relacionamento ou listas que não sejam colunas.
- Colunas anuláveis usam null, não propriedades opcionais. Defaults do banco não tornam opcionais os campos de um registro já persistido.
- JSONB usa JsonValue. Null SQL e null JSON têm a mesma representação aqui.
- TIMESTAMP usa texto ISO 8601, sem acrescentar fuso a colunas sem timezone.
- DECIMAL usa texto decimal para preservar precisão; INTERVAL usa duração ISO 8601; BYTEA usa base64.
- Essas serializações são a convenção dos novos contratos completos. Os endpoints de entidades validam os registros no backend. Métricas agregadas e referências de mídia continuam usando contratos específicos; não devem ser tipadas como entidades completas.
- Classes CSS, títulos calculados, filtros e entradas de formulário permanecem em navigation_entities.

## Divergências entre os scripts

Os scripts individuais foram adotados como referência, sem consultar uma instância do banco:

- SECTOR.ACCESS_LEVELS é NOT NULL no individual e anulável em CREATE_ALL_TABLES.sql.
- REQUEST_TASK_MEDIA usa FILE_SIZE VARCHAR(100) e CREATED_DATE no individual; o consolidado usa FILE_SIZE INTEGER e CREATED_AT.
- Os quatro tipos de tabelas de checklist estão nos scripts individuais e não no consolidado.

Antes de expor novas entidades pelo backend, confira essas diferenças no schema efetivamente implantado. Nenhuma migração foi feita nesta alteração.

## Tabelas cobertas

- BUSINESS → business.ts
- CHECKLIST_FIELD_TYPE → checklist-field-type.ts
- CHECKLIST_FIELD_VALUE → checklist-field-value.ts
- CHECKLIST_TYPE → checklist.ts
- LOCATION → location.ts
- MEMBERSHIP → membership.ts
- REGION → region.ts
- REQUEST → request.ts
- REQUEST_STATUS → request-status.ts
- REQUEST_TASK → request-task.ts
- REQUEST_TASK_CHECKLIST → request-task-checklist.ts
- REQUEST_TASK_MEDIA → request-task-media.ts
- REQUEST_TRANSACTION → request-transaction.ts
- REQUEST_TRANSACTION_STATUS → request-transaction-status.ts
- REQUEST_TYPE → request-type.ts
- SECTOR → sector.ts
- SERVICE_CATEGORY → service-category.ts
- SERVICE_FIELD_MEDIA → service-field-media.ts
- SERVICE_FIELD_TYPE → service-field-type.ts
- SERVICE_FIELD_VALUE → service-field-value.ts
- SERVICE_LEVEL_AGREEMENT → service-level-agreement.ts
- SERVICE_TYPE → service-type.ts
- TASK_MEMBER_OCCURRENCE → task-member-occurrence.ts

## Integração com o backend

O fluxo implementado é banco → modelos Pydantic em backend/app/api/entities.py → backendJson → envelopes em app/entities/api/entity-responses.ts → conversores em app/services/mappers/entity-view-models.ts → navigation_entities.

Os contratos de leitura de /requests/mine, /requests/activities, /requests/board, /service-catalog, /service-catalog/request-form, /organization/locations e /checklists passaram a transportar entidades e relacionamentos. Backend e Next.js precisam ser publicados juntos para esses contratos. As URLs foram mantidas.

Membership é consultada como projeção explícita de id/name (MemberSummary), sem carregar e-mail ou permissões para seletores. Mídias retornam metadados e URLs; o conteúdo binário permanece nos endpoints de download. Criação/edição mantém os contratos de entrada existentes. Home e dashboard mantêm consultas agregadas no banco.

As tabelas de transações, SLA e setor continuam disponíveis como tipos, mas não ganharam fluxos novos de tela.

## Verificação

- node node_modules/typescript/bin/tsc --noEmit --incremental false
- node --test tests/entity-view-models.test.mjs
- .venv/Scripts/python.exe -m unittest discover -s backend/tests -v

Os testes de backend e dos conversores compartilham tests/fixtures/entity-data.json para conferir nomes, nulabilidade e serialização. Os testes de consultas usam conexões simuladas; não substituem uma verificação do schema implantado.
