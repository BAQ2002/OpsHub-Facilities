# OpsHub Facilities

Aplicação Next.js para indicadores de facilities, acompanhamento de chamados e criação de solicitações. O frontend utiliza o FastAPI como backend; somente o processo Python acessa o PostgreSQL.

## Arquitetura

```text
Next.js (`app`, `shared`, `src/server`)
  -> cliente HTTP server-side (`src/server/api-client.ts`)
  -> FastAPI (`backend/app/api`, com rotas versionadas em `api/v1`)
  -> psycopg / PostgreSQL
```

As mídias são servidas diretamente pelo FastAPI em URLs de mesma origem sob `/api/v1`. Em desenvolvimento, o Next.js encaminha somente essas rotas ao endereço interno configurado em `BACKEND_API_URL`; em produção, o proxy de borda pode aplicar o mesmo roteamento.

A API mantém os módulos de domínio diretamente em `backend/app/api` e é organizada em `checklist`, `membership`, `organization`, `request`, `request_task` e `service_catalog`. Cada domínio separa contratos (`schemas.py`), regras e persistência (`service.py`) e HTTP (`router.py`). Os módulos Python usam `_` onde hífens não são identificadores válidos; as URLs públicas preservam `/request-tasks` e `/service-catalog`.

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

O comando de desenvolvimento usa o Webpack para evitar falhas internas do
Turbopack durante HMR, especialmente depois de renomear ou mover rotas do App
Router. Para testar o Turbopack explicitamente, execute `npm run dev:turbopack`.
Se o compilador ainda estiver usando artefatos de uma árvore de rotas anterior,
execute `npm run clean` antes de reiniciar o servidor.

## Fluxos atendidos pela API

- `checklist`: definições e checklists vinculados a visitas;
- `membership`: opções de executores;
- `organization`: hierarquia de business, region e location;
- `request`: home, dashboard, kanban, listagem e criação de solicitações;
- `request-task`: criação/edição de visitas e mídia;
- `service-catalog`: catálogo, formulário dinâmico e mídia de solicitações.

O Next.js não possui driver PostgreSQL e não aceita fallback local: falhas HTTP do backend são propagadas explicitamente pela camada server-side.
