# OpsHub Facilities API

Backend FastAPI responsável por todo acesso da página principal ao PostgreSQL.

## Responsabilidades

- `app/models.py`: mapeamento ORM SQLAlchemy das tabelas `REQUEST`, `REQUEST_STATUS`, `REQUEST_TYPE`, `SERVICE_TYPE`, `SERVICE_CATEGORY`, `BUSINESS`, `REGION`, `LOCATION` e `MEMBERSHIP`, incluindo chaves estrangeiras e relacionamentos.
- `app/schemas.py`: contratos Pydantic de saída; os schemas `*Read` permitem serializar cada entidade ORM sem expor a sessão do banco.
- `app/repositories/`: única camada autorizada a construir e executar consultas SQLAlchemy.
- `app/services/`: valida regras de negócio e coordena repositórios.
- `app/api/`: traduz HTTP/query parameters para chamadas de serviço.
- `app/main.py`: composição da aplicação e dos routers.

## Execução

Na raiz do repositório:

```bash
docker compose -f database/docker-compose.yml up
```

O datagrid usa `GET /activities`:

```text
/activities?start_date=2026-06-01&end_date=2026-06-30&status=Programada&status=Em+andamento&business_unit=1&business_unit=2
```

A consulta escolhe a coluna de período conforme o status: `AGREED_DATE`, `STARTED_DATE`, `FINISHED_DATE` ou `CANCELED_DATE`.
