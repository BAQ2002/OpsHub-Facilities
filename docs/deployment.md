# Implantação do piloto corporativo

## Condições de liberação

O sistema não possui login, sessão ou autorização por registro/perfil. O solicitante de cada novo chamado é escolhido obrigatoriamente no formulário, sem seleção padrão; essa escolha não autentica o usuário. `CURRENT_MEMBER_ID` permanece apenas como filtro compartilhado de Minhas solicitações. Todos os participantes podem consultar e alterar os dados disponibilizados pela aplicação, inclusive mídia e relatórios. O proxy deve autenticar os participantes (SSO corporativo ou mecanismo aprovado pela TI) em **todas** as rotas, incluindo `/api`, mídias e Server Actions. Esse controle não implementa identidade individual dentro do OpsHub. Se forem necessárias permissões diferentes ou auditoria individual, a integração de identidade e autorização é uma pendência impeditiva.

Não publique diretamente as portas 3000 e 8000 na LAN. Use HTTPS com certificado confiável da corporação no proxy e firewall permitindo somente o acesso autorizado. O Next.js inicia em `127.0.0.1`; inicie o FastAPI também nesse endereço. Se os processos estiverem em hosts diferentes, a TI deve definir firewall, criptografia e autenticação entre serviços antes de alterar esse desenho.

## Preparação e execução

Requisitos: Node.js compatível com Next.js 16 (mínimo 20.9; use uma linha LTS ainda suportada), Python 3.10 ou superior e Oracle 19c previamente homologado. Execute os comandos na raiz do projeto, com conta de serviço sem privilégios administrativos.

1. Instale uma versão identificada pelo commit, usando `npm ci` e um ambiente Python exclusivo (`python -m venv .venv`, seguido de `python -m pip install -r backend/requirements.txt` dentro desse ambiente).
2. Configure `.env.local` a partir de `.env.example` ou injete as variáveis pelo gerenciador de serviços. Restrinja a leitura desse arquivo à conta de serviço e administradores. Não sobrescreva arquivos existentes. O backend lê `.env`/`.env.local` relativamente ao diretório de trabalho; fixe a raiz do projeto no serviço.
3. Configure Oracle com privilégios mínimos sobre as tabelas necessárias. Use credenciais administrativas separadas para DDL/cargas. Não execute scripts de carga inicial em base já povoada.
4. Mantenha `API_DOCS_ENABLED=false`. Defina o membro usado no filtro de Minhas solicitações. Configure `BACKEND_API_URL` antes do build: os rewrites de mídia são definidos no build; uma alteração exige novo build.
5. Execute `npm run lint`, `node --test tests/*.test.mjs`, `python -m unittest discover -s backend/tests -v` e `npm run build`. Use o Python do ambiente virtual.
6. Inicie a API com `python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --no-server-header` e o frontend com `npm start`. Não use `--reload` nem `npm run dev` no servidor do piloto.
7. Registre ambos em um gerenciador de serviços do sistema operacional, com inicialização automática, reinício em falha, diretório de trabalho, variáveis e logs com rotação. Homologue parada e reinício antes da liberação.

No Windows, o Python do ambiente é `.venv\Scripts\python.exe`; no Linux, `.venv/bin/python`. Dependências Python ainda usam faixas de versão: registre `python -m pip freeze` da versão homologada e arquive esse inventário junto ao release; reconstruções sem esse inventário podem resolver versões diferentes.

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

As cargas SQL e snapshots de importação preservados contêm dados pessoais/operacionais. Restringir acesso ao repositório, backups e histórico Git. As exclusões atuais não removem dados do histórico; se o repositório já foi exposto, investigar o alcance e tratar URLs/segredos comprometidos. Nunca distribuir `.env.local`, `.git`, `tmp`, `artifacts`, cargas ou ferramentas de importação como conteúdo público.

Auditoria npm de produção executada na preparação sem ocorrências. Repetir `npm audit --omit=dev` e a auditoria Python no release; esse resultado não substitui avaliação de acesso nem garante ausência de vulnerabilidades.
