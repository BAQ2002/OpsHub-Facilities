# Consultas planejadas para as pages Facilities

Estes scripts complementam o schema criado em `SqlScripts/Create_Tables.sql` e documentam as consultas que as camadas de `repository` devem executar quando os mocks forem substituídos por banco de dados PostgreSQL.


## Convenção de parâmetros

Os scripts usam placeholders nomeados (`:period_start`, `:requester_sector_id`, etc.) para facilitar a adaptação em ORMs/query builders. Ao implementar no código, substitua pelo mecanismo da biblioteca escolhida.

## Arquivos

- `01_home_page_queries.sql`: dashboard inicial, mapa, cards de equipe/categoria, filtros por unidade e SLA médio.
- `02_my_requests_page_queries.sql`: listagem de solicitações do solicitante atual e contadores por status.
- `03_activity_tracking_page_queries.sql`: acompanhamento administrativo com cards, distribuições e série mensal.
- `04_activity_request_form_queries.sql`: consultas auxiliares dos formulários e inserts para novas solicitações.
