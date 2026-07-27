# OpsHub Facilities

Aplicação Next.js para visualização de indicadores de facilities, acompanhamento de requests e criação de solicitações de atividade.

## Como executar

```bash
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Conexão com banco de dados

A conexão PostgreSQL é centralizada em `src/server/db/postgres.ts`:

- `getDatabaseUrl()` lê `process.env.DATABASE_URL` e lança erro quando a variável não está configurada.
- `getPostgresPool()` cria um `Pool` do pacote `pg` por import dinâmico, guarda a instância em `globalThis.__opshubPgPool` e reutiliza o pool nas próximas consultas.
- O tamanho máximo do pool vem de `POSTGRES_POOL_MAX` ou usa `10` como padrão.
- SSL só é habilitado quando `POSTGRES_SSL=true`, com `rejectUnauthorized: false`.

Para conectar as páginas diretamente ao PostgreSQL, configure por exemplo:

```bash
DATA_SOURCE=postgres
DATABASE_URL=postgres://usuario:senha@localhost:5432/opshub
POSTGRES_POOL_MAX=10
POSTGRES_SSL=false
```

Na página principal não existe fallback para dados mockados: `DATA_SOURCE=postgres` consulta o banco diretamente e qualquer outro valor usa a FastAPI configurada em `FASTAPI_BASE_URL`.

## Backend FastAPI e entidades ORM

O diretório `backend/` contém um backend Python independente, pronto para acessar o mesmo PostgreSQL. Ele mapeia com SQLAlchemy 2 todas as tabelas povoadas usadas pelo domínio (`request`, `request_status`, `request_type`, `service_type`, `service_category`, `business`, `region`, `location` e `membership`), incluindo chaves estrangeiras e relacionamentos navegáveis.

Para iniciar a API:

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload
```

A API lê `DATABASE_URL` (com driver `postgresql+psycopg://`) e disponibiliza `/docs`, `/health` e endpoints de listagem paginada para cada entidade, por exemplo `/requests`, `/service-categories` e `/memberships`. O parâmetro `limit` é limitado a 500 registros por chamada.

## Fluxo de dados: banco -> entidades -> view models -> páginas

O projeto separa a interpretação dos registros do banco em camadas:

1. **Páginas em `app/`**: componentes assíncronos chamam serviços do servidor e renderizam os dados já preparados.
2. **Serviços em `src/server/services/`**: orquestram chamadas de repositórios e aplicam filtros de tela que não pertencem ao SQL.
3. **Repositórios em `src/server/repositories/`**: escolhem a fonte de dados (`postgres`, `fastapi` ou mock) e executam as consultas.
4. **Repositórios PostgreSQL em `src/server/repositories/postgres/`**: executam SQL parametrizado com `pool.query<T>(sql, params)` e mapeiam linhas do banco para entidades de domínio.
5. **Entidades em `src/domain/entities/`**: definem os formatos utilizáveis no aplicativo, como `ActivityRecord`, `EquipmentCard`, `RequestEntity` e `ActivityRequestField`.
6. **Mappers em `src/mappers/`**: convertem entidades de domínio em view models de apresentação quando a página precisa de um formato específico.

## Onde os registros do banco viram entidades utilizáveis

### Home (`/`)

A página `app/page.tsx` lê `startDate` e `endDate` de `searchParams`, aplica valores padrão por variável de ambiente e chama `getHomePageData(dateRange)`.

A interpretação dos registros PostgreSQL acontece em `src/server/repositories/postgres/home-postgres-repository.ts`:

- `findEquipmentCards(dateRange)` consulta agrupamentos por `service_category` e status, depois transforma cada linha em `EquipmentCard` por `mapCategoryCountRowToEquipmentCard()`.
- `findActivityRecords(dateRange)` consulta requests, tipo, categoria, local, business e coordenadas; cada linha é transformada em `ActivityRecord` por `mapActivityRecordRowToEntity()`.
- `findSlaSamplesInMinutes(dateRange)` calcula amostras de SLA em minutos e retorna `number[]`.
- `findMapImage()` não consulta o banco; monta um `MapImage` a partir de variáveis `FACILITIES_MAP_*` ou do arquivo público padrão.
- `findCategoryColorMap()` não consulta o banco; monta o mapa de cores a partir de `categoryStyleMap`.

Depois, `src/server/services/home-service.ts` converte esses dados para apresentação:

- `mapEquipmentCardsToTotals()` soma os totais dos cards.
- `mapActivityRecordToMarker()` converte cada `ActivityRecord` em marcador do mapa.
- `mapActivitiesToBusinessUnitFilters()` cria opções de filtro de business unit com base nas atividades retornadas.
- `mapSlaSamplesToClock()` formata a média de SLA para exibição.

### Minhas solicitações (`/minhas-solicitacoes`)

A página `app/minhas-solicitacoes/page.tsx` chama `getMyRequestsPageData()`.

A interpretação PostgreSQL acontece em `src/server/repositories/postgres/request-postgres-repository.ts`:

- `findRequestsByCurrentUser()` consulta a tabela `request` com joins em `request_status`, `request_type` e `service_type`.
- O SQL gera `title`, normaliza `status` para `Aberto` ou `Fechado`, define `has_unread_message` como `FALSE` e traz `created_date` como `created_at`.
- `mapRequestRowToEntity()` converte cada linha em `RequestEntity`, transformando `id` em número e formatando `createdAt` em `pt-BR`.

Em seguida, `src/server/services/request-service.ts` aplica `mapRequestEntityToViewModel()` e separa os registros em `openRequests` e `closedRequests` conforme `request.status`.

Quando `DATA_SOURCE=fastapi`, `src/server/repositories/fastapi/request-fastapi-repository.ts` interpreta a resposta JSON da API em `RequestEntity` com `mapFastApiRequestToEntity()`, aceitando aliases como `title`, `titulo`, `request_title`, `created_at`, `createdAt`, `has_unread_message` e `hasUnreadMessage`.

### Formulário de chamado (`/solicitar-atividade/chamado`)

A página `app/solicitar-atividade/chamado/page.tsx` lê `service_category` e `service_type` de `searchParams` e chama `getChamadoRequestFormPageData()`.

A interpretação PostgreSQL acontece em `src/server/repositories/postgres/activity-request-form-postgres-repository.ts`:

- `getActivityRequestFormData({ serviceCategory, serviceType })` consulta os tipos de serviço disponíveis para a categoria recebida.
- Se a URL não trouxer `serviceType`, o primeiro tipo retornado vira `effectiveServiceType`.
- Uma segunda consulta busca os `service_field_type` ativos do tipo efetivo.
- `mapServiceFieldTypeRowToField()` transforma cada linha em `ActivityRequestField`, usando nomes de campo no padrão `service_field_<id>`.
- `mapDatabaseFieldType()` traduz tipos do banco (`SINGLE_SELECT`, `MULTI_SELECT`, `NUMBER`, `DATE`, `BOOL`) para tipos de componente (`select`, `multi-select`, `number`, `date`, `checkbox`), com fallback para `text`.
- `mapOptions()` interpreta `options` como JSON ou array e converte em `{ label, value }[]`.

Depois, `src/server/services/activity-request-form-service.ts` combina os campos dinâmicos do banco com campos fixos do formulário (`business_id`, `service_category`, `service_type`, `location_id`, `agreed_date`, `description`, `request_attachment`).

O envio do formulário usa a Server Action `app/solicitar-atividade/actions.ts`, que chama `createActivityRequest()` em `src/server/services/request-service.ts`. Hoje, a criação só é enviada para backend externo quando `DATA_SOURCE=fastapi`; nos demais casos, a função retorna `{ ok: true, payload }` sem inserir no PostgreSQL.

## Onde e como são feitos os filtros/consultas do banco por página

### `/` — Dashboard/Home

Arquivo principal de consulta: `src/server/repositories/postgres/home-postgres-repository.ts`.

Consultas e filtros:

- Cards por categoria: filtra status em `trackedStatusDescriptions` (`Concluída`, `Programada`, `Em andamento`, `Em aberto`) com `rs.description = ANY($1)` e filtra período por `r.agreed_date >= $2::date` e `r.agreed_date < ($3::date + INTERVAL '1 day')`.
- Lista de atividades e marcadores: usa o mesmo filtro de status e período, com joins para `request_type`, `service_type`, `service_category`, `location`, `region` e `business`.
- SLA: usa o mesmo filtro de status/período e exige `r.created_date IS NOT NULL`; calcula minutos por `EXTRACT(EPOCH FROM (COALESCE(r.finished_date, NOW()) - r.created_date)) / 60`.
- As datas chegam de `app/page.tsx` por `searchParams.startDate` e `searchParams.endDate`; se ausentes, usam `HOME_REQUEST_START_DATE`, `HOME_REQUEST_END_DATE` ou `2026-06-05`.

### `/minhas-solicitacoes` — Minhas requests

Arquivo principal de consulta PostgreSQL: `src/server/repositories/postgres/request-postgres-repository.ts`.

Consultas e filtros:

- O filtro de usuário é `WHERE ($1::integer IS NULL OR r.id_member_requester = $1)`.
- O parâmetro `$1` vem de `CURRENT_MEMBER_ID`; se a variável não existir, o valor é `null` e o SQL retorna todas as requests.
- A ordenação é `ORDER BY r.created_date DESC NULLS LAST, r.id DESC`.
- A separação entre abertas e fechadas não é SQL; ela acontece em `src/server/services/request-service.ts`, filtrando o view model por `status === "Aberto"` ou `status === "Fechado"`.

### `/solicitar-atividade/chamado` — Formulário dinâmico de chamado

Arquivo principal de consulta: `src/server/repositories/postgres/activity-request-form-postgres-repository.ts`.

Consultas e filtros:

- Primeira consulta: lista `service_type` com join em `service_category`; filtra categoria por `WHERE ($1::text IS NULL OR sc.name = $1)` e ordena por categoria e tipo.
- Segunda consulta: lista campos dinâmicos (`service_field_type`) ativos; filtra `sft.active IS TRUE`, `st.name = $1` e categoria opcional por `($2::text IS NULL OR sc.name = $2)`.
- Os parâmetros vêm da URL: `service_category` e `service_type` em `app/solicitar-atividade/chamado/page.tsx`.

### `/solicitar-atividade/chamado` e `/solicitar-atividade/patio` — Envio do formulário

Arquivo de envio: `app/solicitar-atividade/actions.ts`, que chama `src/server/services/request-service.ts`.

Comportamento atual:

- `DATA_SOURCE=fastapi`: envia `FormData` para `POST` no caminho `FASTAPI_CREATE_REQUEST_PATH` ou `/activity-requests`.
- Outros valores de `DATA_SOURCE`: não grava no PostgreSQL; retorna o payload recebido.

### `/acompanhamento-atividades`

A página chama `getActivityTrackingPageData()`, mas esse serviço usa apenas `src/server/repositories/mock/activity-tracking-mock-repository.ts`. Não há consulta PostgreSQL nesta tela atualmente.

### `/solicitar-atividade`

A tela de seleção de categorias e tipos de serviço usa o array local `serviceCategories` em `app/solicitar-atividade/page.tsx`. Não há consulta ao banco nesta tela atualmente.

### `/solicitar-atividade/patio`

A tela usa o array local `patioFields` em `app/solicitar-atividade/patio/page.tsx`. Não consulta o banco para montar o formulário. Ela apenas pode acionar a Server Action no submit, seguindo o comportamento descrito acima.

## Páginas que conectam com o banco atualmente

Considerando conexão direta PostgreSQL (`DATA_SOURCE=postgres`):

| Rota | Conecta ao PostgreSQL? | Local da conexão/consulta | Observações |
| --- | --- | --- | --- |
| `/` | Sim | `app/page.tsx` -> `src/server/services/home-service.ts` -> `src/server/repositories/home-repository.ts` -> `src/server/repositories/postgres/home-postgres-repository.ts` | Lê cards, atividades/marcadores e SLA por período. |
| `/minhas-solicitacoes` | Sim | `app/minhas-solicitacoes/page.tsx` -> `src/server/services/request-service.ts` -> `src/server/repositories/request-repository.ts` -> `src/server/repositories/postgres/request-postgres-repository.ts` | Lê requests; também pode usar FastAPI se `DATA_SOURCE=fastapi`. |
| `/solicitar-atividade/chamado` | Sim, para montar campos | `app/solicitar-atividade/chamado/page.tsx` -> `src/server/services/activity-request-form-service.ts` -> `src/server/repositories/activity-request-form-repository.ts` -> `src/server/repositories/postgres/activity-request-form-postgres-repository.ts` | Lê tipos de serviço e campos dinâmicos; o submit não insere no PostgreSQL atualmente. |
| `/solicitar-atividade/chamado` submit | Não no PostgreSQL | `app/solicitar-atividade/actions.ts` -> `src/server/services/request-service.ts` | Só envia para FastAPI quando `DATA_SOURCE=fastapi`; caso contrário retorna payload. |
| `/solicitar-atividade/patio` submit | Não no PostgreSQL | `app/solicitar-atividade/actions.ts` -> `src/server/services/request-service.ts` | Mesmo comportamento de submit do chamado. |

## Páginas que não conectam com o banco atualmente

| Rota | Fonte de dados atual | Local |
| --- | --- | --- |
| `/acompanhamento-atividades` | Mock | `src/server/services/activity-tracking-service.ts` usa `src/server/repositories/mock/activity-tracking-mock-repository.ts`. |
| `/solicitar-atividade` | Array local estático | `serviceCategories` em `app/solicitar-atividade/page.tsx`. |
| `/solicitar-atividade/patio` | Array local estático para campos | `patioFields` em `app/solicitar-atividade/patio/page.tsx`. |

## Seleção de fonte de dados

Os arquivos seletoras em `src/server/repositories/` definem qual implementação será usada:

- `home-repository.ts`: usa PostgreSQL quando `DATA_SOURCE=postgres` e FastAPI nos demais casos; nenhum dado mock abastece a home.
- `request-repository.ts`: usa PostgreSQL com `DATA_SOURCE=postgres`, FastAPI com `DATA_SOURCE=fastapi` e mock nos demais casos.
- `activity-request-form-repository.ts`: usa PostgreSQL com `DATA_SOURCE=postgres`; caso contrário usa mock.

## FastAPI opcional para requests

Para usar uma API FastAPI como backend de requests, configure:

```bash
DATA_SOURCE=fastapi
FASTAPI_BASE_URL=http://localhost:8000
FASTAPI_REQUESTS_PATH=/activity-requests
FASTAPI_CREATE_REQUEST_PATH=/activity-requests
FASTAPI_ACTIVITIES_PATH=/activities
```

Com essa configuração:

- `/minhas-solicitacoes` chama `GET /activity-requests` e renderiza as requests retornadas.
- O datagrid da home chama `GET /activities` com `start_date`, `end_date`, parâmetros repetidos `status` e parâmetros repetidos `business_unit`. A data exibida é selecionada conforme o status (`agreed_date`, `started_date`, `finished_date` ou `canceled_date`).
- Os formulários de `/solicitar-atividade/chamado` e `/solicitar-atividade/patio` enviam o `FormData` para `POST /activity-requests`.

O endpoint `GET` deve retornar uma lista JSON compatível com:

```json
[
  {
    "id": 212,
    "title": "Reparos em móveis",
    "status": "Aberto",
    "has_unread_message": false,
    "created_at": "2026-04-29T11:35:00-03:00"
  }
]
```

Também são aceitos os aliases `titulo`, `request_title`, `createdAt` e `hasUnreadMessage`. Status desconhecidos são exibidos como `Aberto`; `Fechado`, `closed` e `CLOSED` são exibidos como `Fechado`.

## Scripts de banco

Os scripts SQL ficam em `database/SqlScritps/`:

- `CreateTables/`: criação de tabelas.
- `InsertTable/`: inserts de dados base.
- `SqlQueries/`: consultas documentadas por página (`01_home_page_queries.sql`, `02_my_requests_page_queries.sql`, `03_activity_tracking_page_queries.sql`, `04_activity_request_form_queries.sql`).

Também existe documentação complementar em `documents/database.md`.
