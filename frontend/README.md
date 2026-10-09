# OpsHub Facilities Frontend

Frontend Next.js 16.2.6, React 19.2.4, TypeScript e Tailwind CSS 4. Este diretorio e a raiz independente do repositorio frontend. Requer Node.js 20.9 ou superior; Docker usa Node.js 22.

## Estrutura e fluxo

- `app/pages/`: Home, dashboard, Kanban, minhas solicitacoes e catalogo/formulario de atividades.
- `app/componentes/`: interface compartilhada.
- `app/services/`: casos de uso, cliente HTTP server-only e mapeamento de respostas.
- `app/validation/`: validacoes compartilhadas pelas Server Actions.
- `app/entities/`: contratos HTTP e modelos das telas.
- `app/api/`: paginacao, PDF e healthcheck.
- `tests/`: testes Node.js e fixtures locais.
- `docs/`: implantacao e cores das categorias.

O navegador acessa somente Next.js. Server Components e Server Actions consultam FastAPI por `BACKEND_API_URL`. Os rewrites encaminham midias em `/api/v1/service-catalog/media/:id` e `/api/v1/request-tasks/media/:id`. O frontend nao acessa Oracle.

## Desenvolvimento local

Execute nesta raiz:

```powershell
npm ci
npm run dev
```

Use `.env.example` como modelo de `.env` na raiz do frontend, preservando arquivos existentes. Para uma API local, configure `BACKEND_API_URL=http://127.0.0.1:8000`, que tambem e o padrao sem configuracao. O Next.js carrega esse arquivo automaticamente; variaveis do processo tem precedencia.

Acesse http://localhost:3000; a raiz redireciona para `/pages/home`. O desenvolvimento usa Webpack; `npm run dev:turbopack` permite testar Turbopack. `ALLOWED_DEV_ORIGINS` recebe hosts de desenvolvimento sem protocolo, separados por virgulas.

## Docker

Prepare `.env` nesta raiz usando `.env.example`. O mesmo arquivo configura o Compose, que fornece `BACKEND_API_URL` ao build e ao container; nenhum arquivo `.env` entra na imagem.

```powershell
docker network create opshub-facilities
docker compose config --quiet
docker compose up -d --build
docker compose ps
```

Crie a rede somente se ainda nao existir. Backend no mesmo host deve participar dela com nome de servico `backend`. Para backend remoto, use o IP/DNS privado em `BACKEND_API_URL`. Cada host pode criar sua propria rede local.

Compose fornece a mesma URL no build e no runtime. Mudancas na URL exigem rebuild dos rewrites de midia. Nao inclua `/api/v1`, credenciais na URL ou prefixo `NEXT_PUBLIC_`.

A imagem usa build em estagios, output standalone, assets empacotados, `.next/static` e usuario sem privilegios. `FRONTEND_BIND_IP`, `FRONTEND_PORT` e `OPSHUB_NETWORK` controlam publicacao e rede. Padrao: http://localhost:3000.

## Verificacoes

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

`/api/health` verifica somente o processo. Para homologar integracao, teste listagens, midias, criacao e PDF com API e Oracle disponiveis.

Para producao fora do Docker, apos o build copie `.next/static` para `.next/standalone/.next/static` e execute `node .next/standalone/server.js` com `HOSTNAME=127.0.0.1`, `PORT=3000` e a mesma URL da API usada no build.

## Contratos e limites

`tests/fixtures/entity-data.json` e uma copia local do contrato HTTP, tambem mantida no backend. Mudancas de contrato exigem coordenacao. Banco, DDLs e importadores pertencem exclusivamente ao repositorio backend.

Uploads aceitam ate 10 MiB por arquivo; Server Actions aceitam corpos de ate 30 MB. O proxy precisa considerar a expansao base64. Login individual e autorizacao por registro ainda nao foram implementados. A pagina `/pages/solicitar-atividade/patio` permanece incompleta.

Consulte [arquitetura e fluxos](docs/architecture.md), [implantacao](docs/deployment.md), [entidades](app/entities/concrete_entity/README.md) e [cores](docs/category-colors.md).

## Indisponibilidade da API

As paginas mantem navegacao e estrutura quando o backend falha. Cada area afetada mostra o codigo HTTP recebido ou uma mensagem de conexao/timeout quando nao houve resposta. Na Home, o erro das atividades ocupa uma linha da tabela; metricas, marcadores e filtros possuem resultados independentes. O Kanban preserva consultas bem-sucedidas e limita visitas se executores ou checklists estiverem indisponiveis.

`BACKEND_READ_TIMEOUT_MS` configura o prazo das consultas (padrao 30000 ms). Escritas e relatorios usam 60000 ms. O cancelamento externo nao remove o timeout. Nenhuma escrita e repetida automaticamente. Formularios preservam os campos apos falhas; consulte as solicitacoes antes de reenviar uma operacao cuja confirmacao foi perdida.

O botao "Tentar novamente" repete a consulta ou atualiza a rota. Filtros e paginacao continuam associados a consulta. `/api/health` verifica somente o frontend, portanto permanece disponivel durante uma falha do backend. Nao ha cache persistente nem fila offline.
