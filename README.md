This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Conectar as páginas com FastAPI

As páginas do Next.js leem dados no servidor, na camada `src/server`. Para usar uma API FastAPI como backend, configure o datasource e a URL da API no `.env.local`:

```bash
DATA_SOURCE=fastapi
FASTAPI_BASE_URL=http://localhost:8000
FASTAPI_REQUESTS_PATH=/activity-requests
FASTAPI_CREATE_REQUEST_PATH=/activity-requests
```

Com essa configuração:

- `/minhas-solicitacoes` chama `GET /activity-requests` na FastAPI e renderiza as requests retornadas.
- Os formulários de `/solicitar-atividade/chamado` e `/solicitar-atividade/patio` enviam o `FormData` para `POST /activity-requests`.

O endpoint `GET` deve retornar uma lista JSON com campos compatíveis com este formato:

```json
[
  {
    "id": 212,
    "title": "Reparos em móveis",
    "status": "Aberto",
    "has_unread_message": false,
    "created_at": "2026-04-29T11:35:00-03:00"
  }
]
```

Também são aceitos os aliases `titulo`, `request_title`, `createdAt` e `hasUnreadMessage`. Status desconhecidos são exibidos como `Aberto`; `Fechado`, `closed` e `CLOSED` são exibidos como `Fechado`.
