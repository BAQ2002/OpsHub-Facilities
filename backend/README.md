# OpsHub Facilities Backend

API FastAPI com Oracle 19c via python-oracledb Thin. Este diretorio e a raiz independente do repositorio backend; nao requer Node.js ou checkout do frontend.

## Estrutura

- `app/main.py`: API, ciclo de vida do pool e healthcheck.
- `app/api/`: checklist, membership, organization, request, request_task e service_catalog.
- `app/api/entities.py`: contratos HTTP, publicados sob `/api/v1`.
- `app/database.py`: configuracao, conexao, binds, transacoes e tipos Oracle.
- `tests/`: testes Python, DDL e fixtures locais do contrato.
- `database/`: DDL, cargas Oracle, scripts historicos e importador XLSX.
- `documents/`: guia Oracle e validacao dos servicos.
- `docs/`: implantacao.

## Desenvolvimento local

Requer Python 3.10 ou superior e Oracle acessivel. Execute nesta raiz:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Em Linux/macOS, use `.venv/bin/python`. Prepare `.env` a partir de `.env.example`, sem sobrescrever arquivos existentes. Preencha `ORACLE_USER`, `ORACLE_PASSWORD` e `ORACLE_DSN`. Pydantic resolve o arquivo a partir do codigo; variaveis do processo tem precedencia.

`ORACLE_POOL_MIN`, `ORACLE_POOL_MAX` e `ORACLE_CALL_TIMEOUT_MS` controlam pool e timeout. `CURRENT_MEMBER_ID` e o filtro compartilhado de Minhas solicitacoes, nao identidade autenticada. `API_DOCS_ENABLED=true` habilita OpenAPI e `/docs`; o padrao e false.

## Docker

Configure `.env` antes de subir, com Docker Linux e Compose v2:

```powershell
docker network create opshub-facilities
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail 100 backend
```

Crie a rede somente se ainda nao existir. Frontend no mesmo host usa `http://backend:8000` na rede `opshub-facilities`. `OPSHUB_NETWORK` permite mudar o nome em ambos. A rede externa permanece quando um projeto e parado.

A publicacao padrao e `127.0.0.1:8000`. Para hosts distintos, configure `BACKEND_BIND_IP` com IP privado e restrinja o firewall ao Next.js. `BACKEND_PORT` altera a porta publicada. Defina esses valores no ambiente do Compose.

A imagem usa Python 3.12 e UID/GID 10001, sem reload. Compose monta `.env` em `/app/.env` somente para leitura; no Linux, garanta leitura ao UID/GID 10001. O arquivo nao entra na imagem.

Oracle permanece externo; `ORACLE_DSN` precisa ser acessivel pelo container. localhost aponta para o container. No Docker Desktop, Oracle no host pode usar `host.docker.internal:1521/SERVICO`. O modo Thin dispensa Instant Client.

## Banco e importador

DDL e cargas pertencem a este repositorio, mas nao entram na imagem da API nem executam no startup.

- [Guia Oracle](documents/database.md)
- [Inventario SQL](database/SqlScripts/README.md)
- [Carga Oracle](database/oracle/InsertTable/README.md)
- [Importador](database/import_tickets/README.md)
- [Validacao dos servicos](documents/validacao-services-oracle.md)

O consolidado cria 23 tabelas `OHFC_` em base vazia. Execute o consolidado ou os scripts individuais, nunca ambos. Scripts PostgreSQL historicos nao sao aplicaveis ao Oracle. Nao reaplique cargas iniciais sobre base povoada. A homologacao Oracle e separada da validacao do codigo.

O importador e uma ferramenta administrativa opcional:

```powershell
.\.venv\Scripts\python.exe -m pip install -r database/import_tickets/requirements.txt
.\.venv\Scripts\python.exe -m database.import_tickets --help
```

## Testes

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -t . -v
.\.venv\Scripts\python.exe -m unittest discover -s database/import_tickets/tests -v
```

O segundo comando requer dependencias do importador. Testes locais nao precisam de frontend ou Oracle. Integracao Oracle e opt-in via `ORACLE_TEST_USER`, `ORACLE_TEST_PASSWORD` e `ORACLE_TEST_DSN`.

`tests/fixtures/entity-data.json` e uma copia local do contrato HTTP, que deve evoluir junto com contratos e fixtures do frontend. `/health` verifica somente o processo; startup exige inicializacao do pool e uma consulta funcional homologa o banco.

Consulte [arquitetura e migracao](docs/architecture.md) e [implantacao](docs/deployment.md). As dependencias Python usam faixas de versao; registre `pip freeze` do release homologado.
