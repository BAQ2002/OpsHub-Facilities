# Arquitetura e migracao Oracle

Todos os caminhos deste documento se referem ao repositorio backend. O frontend e integrado por HTTP e possui contratos e testes proprios.

## Elementos do backend (`app/`)

A API em execução está em `app/`. Os arquivos abaixo pertencem aos módulos de domínio em `app/api/`; o nome usado para schemas é `schemas.py`, no plural.

### `schemas.py` — contratos e validação de dados

Define modelos Pydantic para estruturar os dados de entrada e, quando declarado, de saída de uma operação.
Permite ao FastAPI validar tipos e restrições antes de executar a operação, como o tamanho da descrição em `request/schemas.py`.
Existe nos domínios `request`, `request_task` e `checklist`; os modelos compartilhados de entidades e respostas de leitura ficam em `api/entities.py`.

### `router.py` — endpoints HTTP

Define as URLs, os métodos HTTP, os parâmetros e os códigos de resposta de cada domínio usando `APIRouter`.
Recebe dados validados, obtém a conexão por `Depends(get_connection)` e chama o serviço correspondente, convertendo os erros tratados em respostas HTTP.
O arquivo `api/v1/router.py` reúne os routers, e `app/main.py` registra esse conjunto sob `/api/v1`, formando rotas como `POST /api/v1/requests`.

### `service.py` — regras de negócio e persistência

Implementa as operações do domínio, como validar a localização de uma solicitação, calcular indicadores e salvar visitas ou checklists.
Executa consultas e gravações SQL pela conexão recebida do router, usando a infraestrutura de `app/database.py` e o driver `python-oracledb`.
Retorna dados para a camada HTTP e efetiva as gravações conforme a operação; o acesso ao Oracle 19c permanece exclusivamente no backend Python.

### Estado dos seis pontos da migração

| Ponto | Implementado no repositório | Trabalho restante |
|---|---|---|
| 1. Estrutura e nomes | Colunas alinhadas, 23 definições equivalentes e ausência de schema proprietário explícito | Conferência da estrutura implantada |
| 2. Conexão | `python-oracledb` Thin, pool, binds, leitura de LOBs e IDs com `RETURNING INTO` | Configuração e validação na instância Oracle |
| 3. Consultas | SQL executado pela API adaptado para Oracle 19c | Validação no Oracle; converter ou retirar de uso os exemplos históricos de `SqlQueries` |
| 4. Tipos e cargas | DDLs com NUMBER, VARCHAR2, CLOB, BLOB e regras Oracle de integridade | Homologar a carga Oracle e as identities; manter atualizações PostgreSQL fora da implantação |
| 5. Transações e contratos | Contratos HTTP preservados; visita e checklists sem commit intermediário | Validação real de gravações, rollback, tipos e datas |
| 6. Ambiente e documentação | Variáveis Oracle, guias, testes locais e teste de integração opcional | Migrations versionadas, homologação do procedimento de implantação/reversão |

A adaptação do código não significa que uma base foi migrada. Nenhum script de criação, carga ou atualização é executado automaticamente. A validação em Oracle real e o povoamento dos dados permanecem etapas separadas. Mesmo sem essas duas etapas, ainda faltam a conversão ou retirada dos scripts legados e a preparação operacional indicada acima.

### Cargas e importação

Os DDLs principais definem 23 tabelas. A carga inicial em `database/oracle/InsertTable` foi gerada para tabelas vazias; as duas tabelas auxiliares de auditoria da importação têm instalação e carga separadas. Siga a ordem do guia dessa pasta e não reaplique a carga inicial sobre uma base povoada.

O importador `database.import_tickets` interpreta relatórios XLSX. Por padrão, gera apenas uma prévia, sem conexão com o banco; a exportação SQL e a aplicação no Oracle são operações explícitas descritas no seu guia. Suas dependências adicionais estão em `database/import_tickets/requirements.txt`.
