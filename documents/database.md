# Oracle 19c

Este guia descreve a implementação do repositório para Oracle 19c (19.0.0.0.0). O FastAPI acessa o banco com `python-oracledb` em modo Thin; o Next.js usa HTTP/JSON. O guia não representa uma migração já executada ou homologada em Oracle.

Consulte também a [arquitetura da aplicação](../README.md), o [inventário dos scripts](../database/SqlScripts/README.md) e o [mapeamento das entidades](../app/entities/concrete_entity/README.md).

## Configuração da conexão

As configurações estão em [backend/app/database.py](../backend/app/database.py). Os arquivos `.env` e `.env.local` são lidos a partir do diretório de execução; inicie a aplicação na raiz do projeto. `.env.local` sobrepõe `.env`, e as variáveis do ambiente do processo têm precedência sobre ambos. Use [`.env.example`](../.env.example) como referência sem sobrescrever configurações locais existentes.

| Variável | Padrão no código | Finalidade |
|---|---|---|
| `ORACLE_USER` | Vazio; obrigatório na inicialização | Usuário da conexão |
| `ORACLE_PASSWORD` | Vazio; obrigatório na inicialização | Senha, mantida apenas no backend |
| `ORACLE_DSN` | Vazio; obrigatório na inicialização | Endereço e serviço, por exemplo `host:1521/service_name` |
| `ORACLE_POOL_MIN` | `1` | Quantidade mínima de conexões por processo |
| `ORACLE_POOL_MAX` | `5` | Quantidade máxima; deve ser maior ou igual ao mínimo |
| `ORACLE_CALL_TIMEOUT_MS` | `30000` | Timeout de chamada do driver, em milissegundos; não é um limite total da requisição HTTP |
| `CURRENT_MEMBER_ID` | `1` | Membro usado enquanto a autenticação não estiver integrada; deve ser positivo |

A DSN de exemplo não é uma conexão já disponível. `DATABASE_URL` e as antigas variáveis `POSTGRES_*` não configuram o backend atual. Não use prefixo `NEXT_PUBLIC_` para credenciais.

Instale [backend/requirements.txt](../backend/requirements.txt). O código não inicializa o modo Thick nem exige Oracle Instant Client. Nenhum schema proprietário é qualificado nas tabelas ou selecionado pela aplicação; a resolução dos objetos usa o contexto da conexão.

## Pool e ciclo de vida

[main.py](../backend/app/main.py) abre o pool na inicialização do FastAPI e o fecha no encerramento. Cada worker possui seu próprio pool. A espera por uma conexão está limitada a 10 segundos no código, com incremento de uma conexão por vez.

Cada requisição que usa `get_connection()` adquire uma conexão, recebe o timeout configurado e a devolve ao terminar. Antes da devolução, um rollback descarta qualquer trabalho não confirmado, inclusive quando há exceção. A sessão inicializa `NLS_NUMERIC_CHARACTERS='.,'` para estabilizar a conversão decimal. O código não define o fuso da sessão.

Os cursores são fechados após materializar os resultados. BLOBs/CLOBs são lidos enquanto a conexão está aberta; consultas grandes e mídias consomem memória proporcional aos resultados. As coordenadas são convertidas para `Decimal` sem passar por `float`.

## Estrutura e tipos

[CREATE_ALL_TABLES.sql](../database/SqlScripts/CreateTables/CREATE_ALL_TABLES.sql) contém 23 tabelas `OHFC_`, na ordem das dependências, com definições equivalentes às individuais. Ele cria uma base nova; não converte uma base existente. Execute o consolidado **ou** os scripts individuais, não ambos sobre as mesmas tabelas. DDL Oracle efetua commits implícitos.

| Informação | Armazenamento Oracle | Contrato da aplicação |
|---|---|---|
| Identificadores | `NUMBER(10)` com identity | Inteiros; inserções recuperam o ID por `RETURNING ID INTO :new_id` |
| Textos | `VARCHAR2(n CHAR)` | Strings ou `null`, conforme a coluna |
| Booleanos | `NUMBER(1)` com `CHECK (... IN (0, 1))` | `true`/`false`, preservando nulabilidade |
| Coordenadas | `NUMBER` com precisão e escala dos scripts | Texto decimal na resposta da entidade |
| Campos JSON (`OPTIONS`, `VALUE`) | `CLOB` com `IS JSON` | Valor JSON original, sem envelope de armazenamento |
| Mídias | `BLOB` | Bytes nos endpoints de mídia; base64 nos contratos que transportam conteúdo |
| Datas e horários | `TIMESTAMP` sem timezone | ISO 8601, sem acrescentar fuso automaticamente |
| Prazo de SLA | `INTERVAL DAY(9) TO SECOND(6)` | Convenção de duração ISO 8601; ainda sem endpoint específico de SLA |

`OHFC_SECTOR.ACCESS_LEVELS` é obrigatório. `OHFC_REQUEST_TASK_MEDIA.FILE_SIZE` é numérico, em bytes, e anulável. As datas das mídias usam `CREATED_DATE`. Os nomes físicos das colunas seguem os scripts; o backend mantém os nomes públicos por mapeamento explícito.

As FKs não usam `ON UPDATE CASCADE`; IDs referenciados devem permanecer estáveis. Exclusões restritas usam o comportamento padrão Oracle. `ON DELETE CASCADE` permanece onde definido nos scripts.

### Envelope JSON

Todas as gravações JSON devem usar exatamente um objeto com a chave `value`, inclusive quando o valor original já é um objeto:

| Valor original | Conteúdo do CLOB |
|---|---|
| `"texto"` | `{"value":"texto"}` |
| `false` | `{"value":false}` |
| `[1,2]` | `{"value":[1,2]}` |
| `{"value":9}` | `{"value":{"value":9}}` |
| `null` JSON | `{"value":null}` |

`encode_json()` aplica o envelope; `decode_row()` o remove ao ler `OPTIONS` e `VALUE`. A restrição `IS JSON` valida JSON, mas não exige esse formato específico: o formato é verificado pelo backend. Cargas externas também precisam respeitá-lo. SQL NULL e JSON null tornam-se `None` no backend e `null` na API. Strings vazias dentro de JSON são preservadas; em colunas textuais Oracle, strings vazias têm semântica de NULL.

### Datas e indicadores

Os filtros de período usam início inclusivo e fim exclusivo, calculados em Python como meia-noite do dia seguinte ao fim solicitado. A sessão Oracle deve usar o fuso civil da operação para os valores gerados com `CURRENT_TIMESTAMP`/`LOCALTIMESTAMP`. Não há migração automática de fuso dos dados históricos.

As durações dos indicadores são calculadas pelos componentes do intervalo entre timestamps. Os nomes dos meses usam explicitamente português. Durações de SLA que contenham meses precisam de decisão própria na migração dos dados, pois o tipo atual armazena dias e segundos.

## Consultas e contratos

O SQL executado está em `backend/app/api/*/service.py`. Os serviços usam binds nativos `:nome`, `RETURNING INTO`, `CASE` nas agregações, `TRUNC` para meses, `UPPER(...) LIKE UPPER(...)` nas buscas e `FETCH FIRST` para limitar resultados. Filtros de lista usam valores vinculados em grupos de até 1000 itens; listas vazias omitem o filtro correspondente.

[projections.py](../backend/app/api/projections.py) lista colunas físicas para consultas com entidades relacionadas. Aliases no formato `grupo__coluna` são agrupados no Python; relacionamentos sem ID tornam-se `None`. Os modelos Pydantic preservam os contratos HTTP existentes. Não há montagem de entidades com `to_jsonb` nas consultas da API.

## Transações

Solicitações e visitas fazem commit ao concluir a operação. Um checklist criado dentro de uma visita não faz commit isolado, permitindo rollback do conjunto se uma etapa posterior falhar. O endpoint independente de adição de checklist efetiva seu próprio commit; a exclusão confirma a remoção do checklist e de seus valores.

O rollback na saída da dependência trata o trabalho pendente; não desfaz commits já concluídos nem DDL. A recuperação real de IDs e o comportamento de falhas ainda exigem homologação.

## Scripts legados e pendências

`InsertTable`, `SqlQueries`, `UpdateTables` e `database/docker-compose.yml` ainda são referências PostgreSQL. O backend não carrega esses arquivos para executar suas consultas. Não os utilize como scripts Oracle.

Sem considerar validação e povoamento real, restam:

- Converter as cargas: JSON com envelope, booleanos 0/1, comandos de inserção e ajuste das identities após IDs explícitos.
- Converter ou retirar de uso as consultas e atualizações históricas incompatíveis.
- Estabelecer migrations versionadas; os DDLs atuais não têm controle de aplicação por versão.
- Revisar o Compose legado e preparar o procedimento de implantação e reversão. Nenhum rollback de implantação foi automatizado.

## Verificações locais

Na raiz do projeto, em PowerShell:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s backend/tests -v
node --test tests/entity-view-models.test.mjs tests/category-colors.test.mjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
```

Os testes de unidade verificam resultados, binds, mapeamentos, tipos, filtros, transações simuladas e equivalência dos DDLs. Eles não comprovam execução em Oracle. `/health` responde pelo processo, sem executar consulta ao banco.

## Teste de integração opcional

[O teste de integração](../backend/tests/test_oracle_integration.py) lê as variáveis abaixo diretamente do ambiente do processo. Apenas colocá-las em `.env.local` não habilita esse teste.

| Variável | Finalidade / padrão |
|---|---|
| `ORACLE_TEST_USER`, `ORACLE_TEST_PASSWORD`, `ORACLE_TEST_DSN` | Conexão de homologação; as três são necessárias |
| `ORACLE_TEST_START` | Data inicial AAAA-MM-DD; padrão: dia atual |
| `ORACLE_TEST_END` | Data final; padrão: igual ao início |
| `ORACLE_TEST_MEMBER_ID` | Solicitante; padrão: `1` |

```powershell
.\.venv\Scripts\python.exe -m unittest backend.tests.test_oracle_integration -v
```

Sem as três variáveis de conexão, o teste é ignorado. Ele pressupõe as tabelas existentes e executa leituras e binds de JSON/BLOB; não cria tabelas nem grava registros. O alcance das leituras relacionadas depende dos dados encontrados no período: uma execução sem visitas ou serviços não cobre esses caminhos. Gravações, retorno real de IDs, rollback, integridade da carga e desempenho permanecem verificações de homologação antes da publicação.
