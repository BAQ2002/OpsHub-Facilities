# Carga Oracle dos relatórios de chamados

Scripts gerados das planilhas e regras aprovadas. Não foram executados em Oracle.

## Execução

1. Crie as 23 tabelas com `database/SqlScripts/CreateTables/CREATE_ALL_TABLES.sql`, em uma base vazia.
2. Execute `INSTALL_IMPORT_TABLES.sql` uma vez, separadamente: DDL das duas tabelas de auditoria.
3. Execute **INSERT_ALL_TABLES.sql ou RUN_SQLPLUS.sql**, nunca ambos, como script (SQL Developer: F5).

O consolidado contém todos os INSERTs. RUN_SQLPLUS.sql executa os arquivos por domínio na mesma ordem.
As verificações iniciais exigem todas as tabelas vazias e obtêm locks de escrita NOWAIT.
Em erro, o cliente encerra com rollback; há um único COMMIT, após conferir totais e avançar as identities.
O usuário da conexão deve ser proprietário das tabelas. Avanços de sequences podem deixar lacunas após rollback.
Use cliente/arquivo UTF-8 e preserve SET DEFINE OFF para não interpretar & dos dados como variáveis.

## Conteúdo e limites

- 1680 solicitações com IDs reservados; correspondências preservadas em IMPORT_TICKET.
- IDs de categorias de referência e os 46 locais originais preservados; novos cadastros acrescentados.
- Membros deduplicados por e-mail, incluindo papéis de auditoria. Setores do catálogo legado preservados, sem atribuir permissões aos membros.
- Campos adicionais TEXT, inativos e não obrigatórios, como na importação em uma base sem definições anteriores.
- IMPORT_TICKET e IMPORT_SNAPSHOT preservam correspondência, hashes, originais, URLs e descrições integrais.
- Tabelas sem fonte suficiente têm arquivos explicativos sem INSERT. Não foram inventados SLAs, tarefas, checklists ou BLOBs.
- Estes arquivos servem para a carga inicial. Para cargas incrementais, use o importador Python e mantenha request_numbers.json.

## Validação local

Conferidos tipos, tamanhos, chaves primárias/únicas, FKs e envelopes JSON contra os DDLs locais.
Teste de execução no Oracle continua necessário. O manifest informa contagens e hashes dos arquivos por domínio.

| Tabela | Registros |
| --- | ---: |
| OHFC_SLA | 0 |
| OHFC_SERVICE_CATEGORY | 11 |
| OHFC_SECTOR | 12 |
| OHFC_MEMBERSHIP | 99 |
| OHFC_BUSINESS | 2 |
| OHFC_REQUEST_TYPE | 2 |
| OHFC_REQUEST_STATUS | 5 |
| OHFC_REQUEST_TRANSACTION_STATUS | 4 |
| OHFC_SERVICE_TYPE | 54 |
| OHFC_SERVICE_FIELD_TYPE | 65 |
| OHFC_REGION | 9 |
| OHFC_LOCATION | 67 |
| OHFC_REQUEST | 1680 |
| OHFC_SERVICE_FIELD_VALUE | 1224 |
| OHFC_SERVICE_FIELD_MEDIA | 0 |
| OHFC_REQUEST_TASK | 0 |
| OHFC_TASK_MEMBER_OCCURRENCE | 0 |
| OHFC_REQUEST_TASK_MEDIA | 0 |
| OHFC_REQUEST_TRANSACTION | 0 |
| OHFC_CHECKLIST_TYPE | 0 |
| OHFC_CHECKLIST_FIELD_TYPE | 0 |
| OHFC_REQUEST_TASK_CHECKLIST | 0 |
| OHFC_CHECKLIST_FIELD_VALUE | 0 |
| OHFC_IMPORT_TICKET | 1680 |
| OHFC_IMPORT_SNAPSHOT | 1680 |
