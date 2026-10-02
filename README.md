# OpsHub Facilities

O projeto agora tem duas raizes independentes, prontas para repositorios Git separados:

| Diretorio | Conteudo |
|---|---|
| [frontend/](frontend/README.md) | Next.js, interface, Server Actions, cliente HTTP, testes Node.js e Docker |
| [backend/](backend/README.md) | FastAPI, testes Python, database/, documentacao Oracle e Docker |

Cada diretorio possui contexto de build, Compose, dependencias e configuracao proprios. Nenhum build ou teste depende de arquivos do outro diretorio. A integracao ocorre por HTTP em `/api/v1`; Oracle permanece externo aos containers.

## Executar em Docker

Requer Docker com containers Linux e Compose v2. Crie uma vez a rede:

```powershell
docker network create opshub-facilities
```

Configure `backend/.env` a partir de `backend/.env.example`, preservando o arquivo existente, com acesso valido ao Oracle. Configure `frontend/.env` usando `frontend/.env.example`; a URL padrao no Docker e `http://backend:8000`.

```powershell
docker compose --project-directory backend up -d --build
docker compose --project-directory frontend up -d --build
```

Acesse http://localhost:3000. As portas sao publicadas em loopback por padrao. Para hosts distintos, configure o IP/DNS privado da API em `BACKEND_API_URL` e a interface privada em `BACKEND_BIND_IP`. Mudancas na URL exigem rebuild do frontend por causa dos rewrites de midia.

## Repositorios separados

O conteudo de `frontend/` deve ser a raiz do repositorio Next.js; o conteudo de `backend/`, a raiz do repositorio Python. Inclua os arquivos ocultos versionaveis, como `.gitignore`, `.dockerignore` e `.env.example`. Nao inclua arquivos de ambiente reais, dependencias, caches ou ambientes virtuais.

O Git atual foi preservado para revisao. Nao foram criados repositorios remotos nem alterado o historico. Para preservar historico nos novos repositorios, extraia cada subdiretorio depois de registrar a reorganizacao em um commit.

Cada projeto tem uma copia local de `tests/fixtures/entity-data.json`. Mudancas no contrato HTTP precisam ser coordenadas entre contratos e fixtures dos dois repositorios.

Consulte os guias de [implantacao do frontend](frontend/docs/deployment.md) e [implantacao do backend](backend/docs/deployment.md).
