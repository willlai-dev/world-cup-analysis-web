# AI World Cup Analyst — Frontend (Phase 1)

Next.js (App Router) 前端，對應 `worldcup_ai_frontend_agent_docs/` 規格的 **Phase 1：基礎網站與資料瀏覽 MVP**。

## 技術選型

- Next.js **15.x**（App Router）+ React 19 + TypeScript strict
- Tailwind CSS v4
- TanStack Query v5（server state）+ Zustand（auth state）
- React Hook Form + Zod
- Vitest + Testing Library + MSW（單元）、Playwright（E2E）

## Local Setup

```bash
pnpm install

# 開發（前端固定跑在 3001；後端需在 NEXT_PUBLIC_BACKEND_API_URL 指向的位置）
pnpm dev          # http://localhost:3001
```

環境變數（`.env` / `.env.example`，**不可放任何 secret**）：

```env
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3000/api
```

> **同源 proxy**：瀏覽器只呼叫前端自身的 `/api/*`，由 Next `rewrites()` 轉發到
> `NEXT_PUBLIC_BACKEND_API_URL`。這讓 auth cookie 維持 first-party，client fetch 與
> server-side layout guard（`getServerUser`）都能讀到，並免除 CORS。

## 指令

```bash
pnpm dev          # 開發伺服器 (port 3001)
pnpm build        # production build
pnpm start        # 啟動 production build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm test         # Vitest 單元/元件測試 (MSW)
pnpm test:e2e     # Playwright E2E（自動啟動 mock backend + dev server）
```

E2E 透過 `tests/mock-server/server.mjs`（:3000）提供合約假資料，登入 email 決定角色：
`admin@example.com` → ADMIN、`premium@example.com` → PREMIUM、其餘 → USER。

## 架構

- `app/(public|app|admin)/` — 三組 route group，各自 layout。`(app)`/`(admin)` 的
  `layout.tsx` 用 `getServerUser()` 做**權威** server-side 角色守衛。
- `lib/` — `api-client`（typed fetch + `ApiError`）、`auth`（server `getServerUser`）、
  `routes`（含 `canAccess` RBAC）、`constants`、`formatters`。
- `features/<domain>/` — 每個領域的 API 函式 + TanStack Query hooks。
- `components/{ui,layout,auth,cards,charts,ai,forms}/` — UI 與展示元件。

## 權限模型

- **權威**：layout server guard + 後端 401/403。前端 `RoleGate` 只控制 UI 顯隱。
- middleware/proxy 目前**未啟用**（session cookie 名稱待後端確認）。

## Phase 1 範圍

完整：Auth/RBAC、route protection、首頁、登入/註冊、Admin 帳號管理、賽事/國家隊/球員/
新聞/冠軍預測（list + detail base）、基本資料、收藏、loading/error/empty states、單元 + E2E。

不在 Phase 1（Phase 2/3，目前為 placeholder/stub）：真實 AI 呼叫、一般懸浮問答、
深層問答、新聞翻譯、冠軍重跑、模型分歧、HexagonRadar、quota。

詳見 `CHANGES_PHASE1.md`。
