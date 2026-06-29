# 07 FRONTEND ENV AND DEPLOYMENT

本文件只包含前端需要的環境與部署。不要設定後端 secrets。

## Local Development

```bash
pnpm install
cd apps/web
pnpm dev
```

## Frontend `.env.example`

```env
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3000/api
```

## Production on Vercel

Set only public frontend variables:

```env
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend.vercel.app
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend.onrender.com/api
```

## Forbidden in Frontend

Do not add these to frontend env:

```env
DATABASE_URL=
JWT_SECRET=
COOKIE_SECRET=
CRON_SECRET=
NVIDIA_API_KEY=
DASHSCOPE_API_KEY=
FOOTBALL_DATA_API_KEY=
GUARDIAN_API_KEY=
NEWS_API_KEY=
```

## Frontend Build Requirements

- `pnpm lint` should pass.
- `pnpm test` should pass.
- `pnpm build` should pass.
- Playwright tests should be able to run against mocked API or local backend.
