# Implantacao do backend

Execute os comandos na raiz do repositorio backend. Requer Oracle 19c preparado e acessivel, Docker Engine, Compose v2 e containers Linux.

## Preparacao

Configure `.env` a partir de `.env.example`, preservando valores existentes. Defina credenciais Oracle de privilegios minimos, DSN, pool e membro compartilhado de Minhas solicitacoes. Mantenha `API_DOCS_ENABLED=false` em producao.

Use credenciais administrativas separadas para DDL/cargas. A imagem executa somente a API; nao inclui database/, arquivos de ambiente ou testes. Nenhuma carga e executada automaticamente.

Compose monta `.env` em `/app/.env` somente para leitura. No Linux, permita leitura ao UID/GID 10001, por exemplo por grupo e permissao 640. Credenciais nao entram na imagem. DSN precisa ser acessivel pelo container; localhost representa o container.

## Subida

```powershell
docker network create opshub-facilities
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail 100 backend
```

Crie a rede apenas se ainda nao existir. `OPSHUB_NETWORK` altera o nome. Frontend no mesmo host usa essa rede e `http://backend:8000`.

Para hosts distintos, configure `BACKEND_BIND_IP` com interface privada, `BACKEND_PORT` se necessario e essa URL no frontend. A publicacao padrao e `127.0.0.1:8000`. Restrinja acesso ao servidor Next.js por firewall; use VPN ou proxy HTTPS interno. Nao exponha a API diretamente aos usuarios.

A API nao possui autenticacao propria. O proxy do frontend precisa autenticar todas as rotas. Identidade individual, autorizacao e auditoria permanecem pendencias.

Startup exige pool Oracle valido. `/health` verifica somente resposta HTTP, sem consulta ao banco. O estado unhealthy nao reinicia o container. Ha reinicio em caso de saida e logs limitados a tres arquivos de 10 MB.

## Validacao

```powershell
python -m unittest discover -s tests -t . -v
python -m unittest discover -s database/import_tickets/tests -v
```

Use ambiente com dependencias instaladas; importador exige dependencias adicionais. Os testes Oracle sao opt-in conforme [o guia Oracle](../documents/database.md). Homologue consulta real, criacao, upload, status, visitas/checklists e PDF com dados controlados.

As dependencias Python usam faixas. Registre `python -m pip freeze` do release e audite dependencias. Homologue carga e memoria dos relatorios PDF, gerados em memoria.

## Atualizacao e reversao

Apos alterar `.env`, execute `docker compose up -d --force-recreate backend` para reler configuracao e renovar o bind mount. Apos codigo ou dependencias: `docker compose up -d --build backend`.

`docker compose down` preserva rede externa, configuracao e Oracle externo. Preserve commit, imagem, configuracao protegida e inventario de dependencias.

Faca backup Oracle consistente e teste restauracao antes de alterar schema/dados. DDL tem commits implicitos; reversao de codigo nao reverte banco. Nao aplique carga inicial em base povoada.

Cargas e snapshots contem dados operacionais e pessoais. Restrinja repositorio e backups; separar arquivos nao remove dados do historico Git. Importadores sao administrativos e nao devem ser expostos pelo servidor web.
