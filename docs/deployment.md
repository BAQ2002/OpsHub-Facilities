# Implantação do piloto corporativo

## Condições de liberação

O sistema não possui login, sessão ou autorização por registro/perfil. O solicitante de cada novo chamado é escolhido obrigatoriamente no formulário, sem seleção padrão; essa escolha não autentica o usuário. `CURRENT_MEMBER_ID` permanece apenas como filtro compartilhado de Minhas solicitações. Todos os participantes podem consultar e alterar os dados disponibilizados pela aplicação, inclusive mídia e relatórios. O proxy deve autenticar os participantes (SSO corporativo ou mecanismo aprovado pela TI) em **todas** as rotas, incluindo `/api`, mídias e Server Actions. Esse controle não implementa identidade individual dentro do OpsHub. Se forem necessárias permissões diferentes ou auditoria individual, a integração de identidade e autorização é uma pendência impeditiva.

Não disponibilize diretamente as portas 3000 e 8000 aos usuários da LAN. Use HTTPS com certificado confiável da corporação no proxy e firewall permitindo somente o acesso autorizado. O Next.js inicia em `127.0.0.1`; quando ambos estão na mesma máquina, inicie o FastAPI também nesse endereço. Para hosts diferentes, siga a configuração abaixo e defina com a TI firewall, criptografia e autenticação entre serviços.

## Preparação e execução

Requisitos: Node.js compatível com Next.js 16 (mínimo 20.9; use uma linha LTS ainda suportada), Python 3.10 ou superior e Oracle 19c previamente homologado. Execute os comandos na raiz do projeto, com conta de serviço sem privilégios administrativos.

1. Instale uma versão identificada pelo commit, usando `npm ci` e um ambiente Python exclusivo (`python -m venv .venv`, seguido de `python -m pip install -r backend/requirements.txt` dentro desse ambiente).
2. Configure `app/.env` a partir de `app/.env.example` e `backend/.env` a partir de `backend/.env.example` ou injete as variáveis pelo gerenciador de serviços. Restrinja a leitura desse arquivo à conta de serviço e administradores. Não sobrescreva arquivos existentes. O backend resolve `backend/.env` a partir do código. O Next.js carrega os arquivos de ambiente de `app/` em `next.config.ts`; fixe a raiz do projeto como diretório de trabalho do serviço Next.js.
3. Configure Oracle com privilégios mínimos sobre as tabelas necessárias. Use credenciais administrativas separadas para DDL/cargas. Não execute scripts de carga inicial em base já povoada.
4. Mantenha `API_DOCS_ENABLED=false`. Defina o membro usado no filtro de Minhas solicitações. Configure `BACKEND_API_URL` antes do build: os rewrites de mídia são definidos no build; uma alteração exige novo build.
5. Execute `npm run lint`, `node --test tests/*.test.mjs`, `python -m unittest discover -s backend/tests -v` e `npm run build`. Use o Python do ambiente virtual.
6. Inicie a API com `python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --no-server-header` e o frontend com `npm start`. Não use `--reload` nem `npm run dev` no servidor do piloto.
7. Registre ambos em um gerenciador de serviços do sistema operacional, com inicialização automática, reinício em falha, diretório de trabalho, variáveis e logs com rotação. Homologue parada e reinício antes da liberação.

No Windows, o Python do ambiente é `.venv\Scripts\python.exe`; no Linux, `.venv/bin/python`. Dependências Python ainda usam faixas de versão: registre `python -m pip freeze` da versão homologada e arquive esse inventário junto ao release; reconstruções sem esse inventário podem resolver versões diferentes.

## Next.js e Python em máquinas diferentes

O cliente HTTP, o download de PDF e os encaminhamentos de mídia já utilizam `BACKEND_API_URL`. O navegador continua acessando somente o Next.js; as conexões ao Python partem do servidor Next.js. Não é necessário habilitar CORS para esse fluxo.

```text
Navegador -> Proxy HTTPS -> Servidor Next.js -> Servidor Python -> Oracle
```

### Servidor Next.js

Use `app/.env.example` como modelo de `app/.env`. Se `app/.env` já existir, edite apenas as variáveis necessárias. Substitua o hostname de exemplo pelo IP ou DNS real do backend:

```dotenv
BACKEND_API_URL=http://backend.exemplo.internal:8000
```

Use somente a URL base, sem `/api/v1`, query ou fragmento. Não utilize `localhost`/`127.0.0.1` para um backend em outra máquina. Não coloque credenciais Oracle nesse servidor e não use o prefixo `NEXT_PUBLIC_` na variável. Se houver proxy HTTPS interno na frente do Python, use sua URL HTTPS e certificado confiável pelo Node.js.

Configure o mesmo endereço no ambiente de build e no ambiente de execução:

```powershell
npm ci
npm run build
npm start
```

Ao alterar o endereço, gere um novo build e reinicie o Next.js: os rewrites de mídia são definidos no build. Durante desenvolvimento, reinicie `npm run dev` após editar a configuração. Variáveis injetadas pelo gerenciador de serviços têm precedência sobre `app/.env`; confira também essa configuração.

### Servidor Python

Use `backend/.env.example` como modelo de `backend/.env` nesse servidor e preencha as credenciais Oracle. Execute a partir dessa raiz, com as dependências de `backend/requirements.txt` instaladas. Para acesso direto pela rede privada, vincule o Uvicorn ao IP privado da máquina (substitua o IP abaixo):

```powershell
python -m uvicorn backend.app.main:app --host 192.168.1.50 --port 8000 --no-server-header
```

Se houver proxy interno na mesma máquina do Python, o Uvicorn pode continuar em `127.0.0.1` e o Next.js deve apontar para o proxy. Dentro de um container Docker, o Uvicorn deve escutar em `0.0.0.0`, com a porta publicada no servidor Docker; `BACKEND_API_URL` usa o IP/DNS desse servidor, não o IP interno do container.

Restrinja o acesso à API ao servidor Next.js por firewall. A API não possui autenticação própria. Use rede privada/VPN ou proxy HTTPS com controle de acesso conforme a infraestrutura aprovada; não exponha diretamente a porta 8000 à internet. Mantenha a porta 3000 atrás do proxy autenticado do frontend.

### Verificação entre servidores

No servidor Next.js, substitua o endereço abaixo pelo configurado:

```powershell
Invoke-RestMethod http://backend.exemplo.internal:8000/health
```

A resposta esperada é `{"status":"ok"}`. Esse endpoint confirma que o processo responde, mas não executa uma consulta Oracle. Em seguida, valide no navegador a listagem de solicitações, uma mídia e o relatório PDF: esses fluxos cobrem cliente JSON, rewrites e download. Se houver timeout de conexão, confira DNS, rota/VPN, bind do Uvicorn e firewall a partir do servidor Next.js. Se somente as mídias falharem após trocar o endereço, confira o endereço usado no build e gere-o novamente.

## Backend Python em Docker

O `compose.yaml` na raiz executa somente o FastAPI. O Next.js e o Oracle continuam separados. É necessário Docker Engine com Compose v2; no Windows, inicie o Docker Desktop em modo de containers Linux. Não é necessário instalar Python no servidor Docker.

1. Prepare `backend/.env` a partir de `backend/.env.example`, somente se ainda não existir, e configure Oracle. O arquivo existente não deve ser sobrescrito.
2. Configure `ORACLE_DSN` com o IP/DNS e serviço Oracle acessíveis de dentro do container. `localhost` nesse campo significa o próprio container. No Docker Desktop, se o Oracle estiver no host Windows, use `host.docker.internal:1521/NOME_DO_SERVICO`. Para Oracle em outra máquina, use o endereço real dessa máquina.
3. Libere o acesso à porta 8000 somente para o servidor Next.js no firewall do servidor Docker. O Compose publica essa porta nas interfaces do host para permitir a conexão remota. Se houver proxy na mesma máquina do Docker, altere o mapeamento para `127.0.0.1:8000:8000` e use o endereço do proxy no Next.js.
4. Execute na raiz do repositório:

```powershell
docker compose config --quiet
docker compose up -d --build backend
docker compose ps
docker compose logs --tail 100 -f backend
```

O Dockerfile usa Python 3.12, instala `backend/requirements.txt` e executa Uvicorn como usuário sem privilégios (UID/GID 10001), sem `--reload`. O contexto de build é somente `backend/`; `.dockerignore` exclui arquivos de ambiente, testes e caches. O modo Thin do driver Oracle dispensa Instant Client.

O Compose monta `backend/.env` em `/app/backend/.env`, somente para leitura, preservando o carregamento pelo Pydantic. As credenciais não são incorporadas à imagem nem interpretadas pelo Compose como variáveis. O arquivo precisa existir antes de subir o serviço. Em Linux, garanta leitura pelo UID/GID 10001, por exemplo com proprietário/grupo adequados e permissão `640`, sem liberar leitura para todos.

Há um healthcheck de `/health`, reinício em caso de saída do processo e rotação de logs (três arquivos de até 10 MB). O estado `unhealthy` por si só não reinicia o container. A inicialização exige um pool Oracle válido; o healthcheck posterior verifica somente a resposta HTTP, sem consultar o banco. Nenhum script SQL ou carga é executado na subida.

No servidor Next.js, configure `app/.env`:

```dotenv
BACKEND_API_URL=http://IP_OU_DNS_DO_SERVIDOR_DOCKER:8000
```

Em seguida, execute `npm run build` e reinicie o Next.js. Valide a partir desse servidor:

```powershell
Invoke-RestMethod http://IP_OU_DNS_DO_SERVIDOR_DOCKER:8000/health
```

Complete a validação com uma listagem, mídia e PDF no navegador. O endereço real do backend e o acesso ao Oracle precisam ser homologados na rede de destino.

Após alterar `backend/.env`, recrie o container para reler a configuração e atualizar o bind mount, inclusive quando o editor substitui o arquivo:

```powershell
docker compose up -d --force-recreate backend
```

Após alterar código ou dependências, use novamente `docker compose up -d --build backend`. Para parar e remover o container e a rede do Compose, use `docker compose down`; o Oracle externo e o arquivo `backend/.env` permanecem no lugar. As faixas de dependências devem ser homologadas e registradas conforme o procedimento de release acima.

Referência: [configuração de serviços Docker Compose](https://docs.docker.com/reference/compose-file/services/).

## Contrato do proxy

- Encaminhar todas as rotas para `http://127.0.0.1:3000`, preservando `Host` e definindo `X-Forwarded-Host`/`X-Forwarded-Proto` a partir de valores confiáveis. Descartar os valores enviados pelo cliente. O hostname público e o Origin precisam coincidir para Server Actions; não liberar curingas para contornar erros.
- Autenticar também downloads e POSTs. Não criar um caminho alternativo público diretamente para o FastAPI. A API não autentica chamadas por conta própria.
- Limitar o corpo a 30 MiB, conexões, taxa de requisições e tempo de leitura conforme a capacidade medida. Cada arquivo aceita no máximo 10 MiB; a serialização base64 expande o corpo entre Next.js e API. Limites por arquivo não substituem o limite agregado no proxy.
- Desabilitar cache compartilhado de páginas, relatórios e mídias. Preservar os cabeçalhos de segurança da aplicação. Não servir a raiz do repositório como diretório estático.
- Ajustar timeout para relatórios após medir carga e memória. O endpoint gera PDFs em memória e ainda não possui fila ou cotas por usuário.

## Verificação no ambiente real

Confirmar que clientes da LAN não acessam 3000/8000 e que usuários não autenticados não acessam páginas, downloads nem ações. Testar consulta, criação de chamado, upload, atualização de status, visita/checklist e PDF com dados controlados. Verificar cabeçalhos, rejeição de upload inválido e comportamento das Server Actions pelo domínio HTTPS. `/health` verifica apenas o processo, não a conectividade Oracle; uma consulta funcional é necessária para validar o banco. O teste Oracle opcional pode gravar dados: usar somente uma base dedicada conforme o guia Oracle.

## Backup e reversão

Antes de cada release, guardar commit, build, inventário de dependências e configuração protegida. Fazer backup Oracle consistente e testar restauração. Parar os serviços, substituir pela versão homologada e reiniciar; para reverter código, restaurar o release anterior. Alterações de schema/dados exigem plano próprio de restauração: DDL Oracle tem commits implícitos. Não executar cargas como parte automática do startup.

## Revisão de segurança e pendências

Foram removidos previews, relatórios temporários/exportados, exemplo de backend não utilizado e Compose PostgreSQL com senha de desenvolvimento. Foram adicionados cabeçalhos de segurança, bind local por padrão, desativação padrão de OpenAPI, limite/validação de uploads e timeout nas consultas JSON. As origens de desenvolvimento não ampliam mais as origens de Server Actions. Consultas da API usam binds; mídia já utiliza `nosniff` e CSP com sandbox.

Pendências: identidade individual, autorização e trilha de auditoria; homologação Oracle e de infraestrutura; análise antimalware dos anexos; testes de carga de relatórios; política de retenção e revisão de dependências Python. A validação base64/MIME não comprova o formato real nem a ausência de malware. Não foi implementada uma CSP global estrita para HTML, que exige integração e validação de nonces no Next.js.

As cargas SQL e snapshots de importação preservados contêm dados pessoais/operacionais. Restringir acesso ao repositório, backups e histórico Git. As exclusões atuais não removem dados do histórico; se o repositório já foi exposto, investigar o alcance e tratar URLs/segredos comprometidos. Nunca distribuir `app/.env`, `backend/.env` ou outros arquivos `.env*` reais, `.git`, `tmp`, `artifacts`, cargas ou ferramentas de importação como conteúdo público.

Auditoria npm de produção executada na preparação sem ocorrências. Repetir `npm audit --omit=dev` e a auditoria Python no release; esse resultado não substitui avaliação de acesso nem garante ausência de vulnerabilidades.
