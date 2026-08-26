# Banco de dados Postgres local

Este projeto está preparado para iniciar com dados mockados e trocar para Postgres por variável de ambiente.

## Subir o container

1. Copie `.env.example` para `.env.local`.
2. Ajuste `POSTGRES_PASSWORD` e `DATABASE_URL`, se necessário.
3. Execute:

```bash
docker compose up -d postgres
```

O container publica o Postgres na porta `5432` do host e executa os scripts de `database/init` no primeiro boot do volume.

## Connection string

Use esta connection string em desenvolvimento local:

```bash
DATABASE_URL=postgresql://opshub:opshub_dev_password@localhost:5432/opshub_facilities
```

Mantenha `DATABASE_URL` sem o prefixo `NEXT_PUBLIC_`: a string deve existir apenas no servidor. As páginas do App Router devem buscar dados em Server Components, Server Actions, Route Handlers ou services com `server-only`.

## Como as páginas chegam ao banco

Fluxo recomendado:

```text
app/*/page.tsx -> src/server/services/* -> src/server/repositories/* -> src/server/db/postgres.ts -> Postgres
```

Para ativar o banco real, defina:

```bash
DATA_SOURCE=postgres
```

`DATA_SOURCE` é obrigatório, aceita exclusivamente o valor case-sensitive `postgres` e não possui fallback para FastAPI ou dados mockados.

## Dependência do driver

O projeto usa o pacote `pg` como driver Postgres. Se a instalação de dependências estiver bloqueada no ambiente atual, rode `npm install` em uma rede com acesso permitido antes de iniciar o Next.js com `DATA_SOURCE=postgres`.
