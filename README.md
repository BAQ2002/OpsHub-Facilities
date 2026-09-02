# OpsHub Facilities

Aplicação Next.js para indicadores de facilities, acompanhamento de chamados e criação de solicitações. O frontend utiliza o FastAPI como backend; somente o processo Python acessa o PostgreSQL.

## Arquitetura

```text
Next.js (`app`, `shared`, `src/server`)
  -> cliente HTTP server-side (`src/server/api-client.ts`)
  -> FastAPI (`backend/app/api/v1`)
  -> SQLAlchemy / PostgreSQL
```

A API é organizada por domínio em `checklist`, `membership`, `organization`, `request`, `request_task` e `service_catalog`. Cada domínio separa contratos (`schemas.py`), regras e persistência (`service.py`) e HTTP (`router.py`). Os módulos Python usam `_` onde hífens não são identificadores válidos; as URLs públicas preservam `/request-tasks` e `/service-catalog`.

## Configuração

Copie `.env.example` para `.env.local` e ajuste:

- `DATABASE_URL`: conexão PostgreSQL usada exclusivamente pelo FastAPI;
- `BACKEND_API_URL`: endereço interno da API usado pelo servidor Next.js;
- `CURRENT_MEMBER_ID`: identidade temporária enquanto a autenticação corporativa não estiver integrada.

## Execução

Inicie o banco descrito em `database/docker-compose.yml` e, em terminais separados, execute:

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload
```

```bash
npm install
npm run dev
```

O frontend fica em `http://localhost:3000`; a documentação OpenAPI fica em `http://localhost:8000/docs`.

## Fluxos atendidos pela API

- `checklist`: definições e checklists vinculados a visitas;
- `membership`: opções de executores;
- `organization`: hierarquia de business, region e location;
- `request`: home, dashboard, kanban, listagem e criação de solicitações;
- `request-task`: criação/edição de visitas e mídia;
- `service-catalog`: catálogo, formulário dinâmico e mídia de solicitações.

O Next.js não possui driver PostgreSQL e não aceita fallback local: falhas HTTP do backend são propagadas explicitamente pela camada server-side.
