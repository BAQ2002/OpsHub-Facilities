# Validação dos serviços para Oracle 19c

Data: 28/09/2026.

Conclusão: os seis `service.py` ativos já usam SQL e acesso a dados voltados ao Oracle 19c. Não foram encontrados os bloqueios de dialeto PostgreSQL identificados nos scripts legados. Ainda assim, não é possível considerar a adaptação inteiramente concluída: existe uma lacuna de precisão no bind da data final de visitas e falta homologação real das operações.

## Escopo e resultado

Foram lidos os seis serviços em `backend/app/api`, a camada `backend/app/database.py`, as projeções, schemas e rotas relevantes, os testes existentes e o DDL atual.

| Serviço | Resultado da revisão estática |
|---|---|
| `request/service.py` | Binds nomeados, `FETCH FIRST`, `RETURNING ID INTO`, agregações com `CASE`, extração de intervalos e filtros Oracle. Listas `IN` são divididas em grupos de até 1.000 expressões. Datas geradas dependem do fuso da sessão. |
| `request_task/service.py` | INSERT/UPDATE/DELETE, BLOBs e retorno de IDs compatíveis; bind `stop` precisa ser tipado como TIMESTAMP. |
| `checklist/service.py` | Booleanos filtrados como 0/1, JSON envelopado, binds e retorno de IDs compatíveis. A inclusão participa da transação da visita ou é confirmada pela rota específica. |
| `service_catalog/service.py` | Consultas, filtros numéricos de booleanos e leitura de mídia compatíveis; JSON existente deve respeitar o envelope. |
| `membership/service.py` | SELECT simples compatível. |
| `organization/service.py` | SELECTs compatíveis; coordenadas passam pelo conversor Decimal da conexão. |

## Achado: precisão da data final da visita

`backend/app/api/request_task/service.py:16–17` transforma início e fim em `datetime`, preservando microssegundos na entrada. Entretanto, `backend/app/database.py:144–145` declara `DB_TYPE_TIMESTAMP` apenas para `range_start` e `range_end`. O parâmetro `stop`, usado em `FINISHED_DATE` tanto na inclusão quanto na atualização, fica sob inferência do driver.

O mapeamento padrão de `datetime.datetime` é `DB_TYPE_DATE`, que não preserva frações de segundo. Assim, uma entrada final como `2026-09-28T10:00:00.654321` perde a fração ao passar por DATE, embora a coluna de destino seja TIMESTAMP. O início possui tratamento diferente e mantém sua precisão. Ver [mapeamento de tipos do python-oracledb](https://python-oracledb.readthedocs.io/en/v3.4.0/api_manual/cursor.html#Cursor.var).

Uma execução local com cursor simulado confirmou que `save_visit()` entrega ambos os valores com microssegundos, mas chama `setinputsizes` somente com `range_start=DB_TYPE_TIMESTAMP`. Essa verificação comprova a omissão do tipo; não executa nem mede a persistência no Oracle.

Correção indicada: incluir `stop` no tratamento de TIMESTAMP, ou adotar uma tipagem consistente para todos os binds de datetime. Depois, verificar inclusão e atualização com frações de segundo em banco real.

## Condições de implantação e dados

- **Fuso horário:** `request/service.py:83` usa `CURRENT_TIMESTAMP`, que depende do fuso da sessão. `_initialize_session()` configura apenas caracteres numéricos. A documentação local exige o fuso civil da operação, mas o código não o impõe. Se a sessão estiver em outro fuso, as datas geradas podem divergir das datas locais usadas nos filtros e visitas. Confirmar/configurar o fuso da sessão; definir também se entradas ISO com offset serão normalizadas ou rejeitadas, pois `datetime.fromisoformat()` as aceita e as colunas atuais não armazenam timezone. Isso é uma condição de configuração/contrato, não uma sintaxe SQL inválida. Ver [datas e fusos Oracle](https://docs.oracle.com/en/database/oracle/oracle-database/19/nlspg/datetime-data-types-and-time-zone-support.html).
- **JSON legado:** gravações atuais usam `encode_json()` e CLOB corretamente. `decode_row()` exige exatamente o envelope `{"value": ...}` para OPTIONS/VALUE. Dados antigos sem esse formato causam erro na leitura; as cargas ainda não convertidas precisam ser corrigidas antes da homologação dos serviços.
- **IDs da carga:** o serviço de solicitações ainda depende de IDs convencionados, como tipo 1 e status 2/3/4 nas métricas. A carga Oracle deve preservar essas relações e ajustar identities após IDs explícitos. Isso não é incompatibilidade de sintaxe dos serviços, mas é requisito para seu funcionamento correto.

## O que já está adaptado na conexão

Uso de `python-oracledb` Thin e pool; binds nomeados; conversão de bool para inteiro; tipos explícitos CLOB/BLOB; leitura dos LOBs antes de encerrar o cursor; aliases convertidos para os contratos da API; retorno de IDs via variável de saída; rollback do trabalho pendente ao devolver a conexão. Não foi encontrada divergência de nomes físicos nas instruções dos seis serviços em relação ao DDL revisado.

## Arquivo de referência fora da API ativa

O exemplo `backend/modeloexistente/service.py` foi removido na preparação de produção. Registro histórico da inspeção: Ele contém SQL Oracle de outro domínio, usa `app.db.fetch_all_dicts` e tabelas externas ADMSCOL/ADMN4, e não é registrado pelo router ativo. Não deve ser confundido com os seis serviços Facilities. Seu uso exigiria validar dependências externas; contém também listas IN montadas por interpolação e filtros BETWEEN cujo limite final à meia-noite não cobre o último dia inteiro quando a coluna possui hora. Não foi homologado.

## Testes e limites

Comando executado: `.\.venv\Scripts\python.exe -m unittest discover -s backend/tests -v`.

Resultado: **33 testes descobertos; 32 passaram e 1 foi ignorado** por falta de `ORACLE_TEST_USER`, `ORACLE_TEST_PASSWORD` e `ORACLE_TEST_DSN`. Driver instalado: `python-oracledb 3.4.2`.

Os testes aprovados usam verificações estáticas e doubles de conexão; não demonstram que o Oracle aceitou todas as consultas. O teste de integração existente cobre leituras, depende dos dados encontrados e não valida INSERT/UPDATE/DELETE reais, retorno de identity, rollback de gravações ou a precisão dos timestamps persistidos.

Para encerrar a validação: corrigir o bind da data final, confirmar o contrato de fuso, preparar dados no formato atual e homologar consultas e gravações em um schema de teste Oracle 19c. Nenhum arquivo de implementação foi alterado nesta análise.
