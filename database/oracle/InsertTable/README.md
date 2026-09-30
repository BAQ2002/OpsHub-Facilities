# Carga Oracle dos relatórios de chamados

Scripts gerados das planilhas e regras aprovadas. Não foram executados em Oracle.

## Execução

1. Crie as 23 tabelas com `database/SqlScripts/CreateTables/CREATE_ALL_TABLES.sql`, em uma base vazia.
2. Execute **INSERT_ALL_TABLES.sql ou RUN_SQLPLUS.sql**, nunca ambos, como script (SQL Developer: F5). Ambos carregam somente as 23 tabelas originais.
3. Execute `INSTALL_IMPORT_TABLES.sql` uma vez, separadamente: DDL das duas tabelas de auditoria.
4. Execute `INSERT_IMPORT_TABLES.sql` para carregar OHFC_IMPORT_TICKET e OHFC_IMPORT_SNAPSHOT, após a carga principal.

A carga principal não depende das tabelas de auditoria. RUN_SQLPLUS.sql executa somente os arquivos do domínio principal.
Cada carga exige suas próprias tabelas de destino vazias e obtém locks de escrita NOWAIT. A auditoria referencia os chamados já carregados.
Cada consolidado tem seu próprio COMMIT, após conferir totais e avançar as identities. Em erro na auditoria, a carga principal já confirmada permanece.
O usuário da conexão deve ser proprietário das tabelas. Avanços de sequences podem deixar lacunas após rollback.
Use cliente/arquivo UTF-8 e preserve SET DEFINE OFF para não interpretar & dos dados como variáveis.

## Conteúdo e limites

- 1675 solicitações com IDs reservados; correspondências preservadas em IMPORT_TICKET.
- IDs de categorias de referência e os 46 locais originais preservados; novos cadastros acrescentados.
- Membros deduplicados por e-mail, incluindo papéis de auditoria. Setores do catálogo legado preservados, sem atribuir permissões aos membros.
- Campos correspondentes ao catálogo legado preservam TYPE, OPTIONS, REQUIRED, ACTIVE e DISPLAY_ORDER; respostas têm tipos JSON compatíveis. Campos novos são TEXT, ativos, opcionais e ordenados após os campos legados.
- IMPORT_TICKET e IMPORT_SNAPSHOT preservam correspondência, hashes, originais, URLs e descrições integrais.
- URLs de campos adicionais geram definições MEDIA. Com import_media_content=false, não são geradas respostas em SERVICE_FIELD_MEDIA nem SERVICE_FIELD_VALUE; URLs permanecem nos snapshots. Quando a importação de binários está habilitada, o cache completo é obrigatório. Placeholders not-found-deskbee.jpg são ignorados.
- Tabelas sem fonte suficiente têm arquivos explicativos sem INSERT. Não foram inventados SLAs, tarefas ou checklists.
- Estes arquivos servem para a carga inicial. Para cargas incrementais, use o importador Python e mantenha request_numbers.json.

## Validação local

Conferidos tipos, tamanhos, chaves primárias/únicas, FKs e envelopes JSON contra os DDLs locais.
Teste de execução no Oracle continua necessário. O manifest informa contagens e hashes dos arquivos por domínio.

| Tabela | Registros |
| --- | ---: |
| OHFC_SLA | 0 |
| OHFC_SERVICE_CATEGORY | 9 |
| OHFC_SECTOR | 12 |
| OHFC_MEMBERSHIP | 99 |
| OHFC_BUSINESS | 2 |
| OHFC_REQUEST_TYPE | 2 |
| OHFC_REQUEST_STATUS | 5 |
| OHFC_REQUEST_TRANSACTION_STATUS | 4 |
| OHFC_SERVICE_TYPE | 51 |
| OHFC_SERVICE_FIELD_TYPE | 165 |
| OHFC_REGION | 9 |
| OHFC_LOCATION | 67 |
| OHFC_REQUEST | 1675 |
| OHFC_SERVICE_FIELD_VALUE | 1208 |
| OHFC_SERVICE_FIELD_MEDIA | 0 |
| OHFC_REQUEST_TASK | 0 |
| OHFC_TASK_MEMBER_OCCURRENCE | 0 |
| OHFC_REQUEST_TASK_MEDIA | 0 |
| OHFC_REQUEST_TRANSACTION | 0 |
| OHFC_CHECKLIST_TYPE | 0 |
| OHFC_CHECKLIST_FIELD_TYPE | 0 |
| OHFC_REQUEST_TASK_CHECKLIST | 0 |
| OHFC_CHECKLIST_FIELD_VALUE | 0 |
| OHFC_IMPORT_TICKET | 1675 |
| OHFC_IMPORT_SNAPSHOT | 1675 |
