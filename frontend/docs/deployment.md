# Implantacao do frontend

Execute os comandos na raiz do repositorio frontend. O contexto Docker e somente este repositorio.

## Configuracao e execucao

1. Configure `.env` usando `.env.example`, preservando arquivos existentes.
2. Use `BACKEND_API_URL=http://backend:8000` no mesmo host Docker, ou IP/DNS privado da API em hosts distintos. Nao inclua `/api/v1`.
3. Crie a rede externa uma vez: `docker network create opshub-facilities`.
4. Execute `docker compose config --quiet` e `docker compose up -d --build`.
5. Verifique `docker compose ps`, `docker compose logs --tail 100 frontend` e `http://localhost:3000/api/health`.

A mesma URL e fornecida ao build e runtime. Mudancas exigem rebuild por causa dos rewrites de midia. Arquivos de ambiente nao entram na imagem. `app/.env` e usado na execucao local fora do Docker.

O build nao exige API ou Oracle disponiveis. Paginas com dados exigem API ativa. O healthcheck confirma somente o processo; homologue uma listagem, midia, PDF e Server Actions para verificar a integracao.

## Rede e proxy

Compose publica `127.0.0.1:3000` por padrao. Use proxy HTTPS autenticado no host. Para proxy remoto, configure `FRONTEND_BIND_IP` com interface privada e restrinja firewall. `FRONTEND_PORT` altera a porta.

A aplicacao nao possui login individual, autorizacao por registro ou auditoria de identidade. O proxy deve autenticar todas as rotas, downloads e POSTs. Escolher solicitante no formulario nao autentica o usuario.

Preserve `Host` e defina `X-Forwarded-Host` e `X-Forwarded-Proto` a partir de valores confiaveis, descartando os enviados pelo cliente. Host publico e Origin devem coincidir para Server Actions; nao libere curingas para contornar erros.

Limite corpos a 30 MiB, conexoes, taxa e timeouts conforme capacidade medida. Cada arquivo aceita ate 10 MiB; base64 aumenta o corpo entre servicos. Desabilite cache compartilhado de paginas, relatorios e midias. Nao sirva a raiz do repositorio como conteudo estatico.

## Release e reversao

Execute `npm ci`, `npm test`, `npm run typecheck`, `npm run lint` e `npm run build`. Registre commit, imagem e configuracao protegida; revise dependencias com `npm audit --omit=dev`.

A imagem standalone usa usuario sem privilegios, healthcheck, logs limitados e reinicio do processo. O estado unhealthy nao reinicia automaticamente o container. Atualize codigo ou URL com `docker compose up -d --build`; pare com `docker compose down`. A rede externa permanece.

Para reverter, restaure imagem e configuracao homologadas. Coordenar contratos HTTP com o backend. Validar consulta, upload, status, visitas/checklists e PDF pelo dominio HTTPS real.

Persistem pendencias de identidade individual, autorizacao, auditoria, antimalware e testes de carga. A validacao MIME/base64 nao comprova o formato real do arquivo.
