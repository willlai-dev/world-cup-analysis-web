# AI World Cup Analyst — Frontend

Next.js（App Router）前端，對應 `worldcup_ai_frontend_agent_docs/` 規格。目前已完成
**Phase 1–4**：基礎網站與資料瀏覽、真實 AI 問答／翻譯／視覺化、quota 與模型分歧、
以及 Admin 資料管線手動觸發介面。

後端為獨立的 NestJS 服務，前端透過 `NEXT_PUBLIC_BACKEND_API_URL` 連線（本機預設
`http://localhost:3000/api`）。前端不直接呼叫任何第三方 AI／資料 provider，也不持有任何 secret。

## 技術選型

- Next.js **15.x**（App Router）+ React 19 + TypeScript strict
- Tailwind CSS v4
- TanStack Query v5（server state）+ Zustand（auth state）
- React Hook Form + Zod
- Vitest + Testing Library + MSW（單元）、Playwright（E2E）
- `app/api/` Route Handlers 作為長時間 AI 請求（chat／translate／deep-chat）的 same-origin 代理

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

## 同源 proxy 與 AI Route Handlers

瀏覽器只呼叫前端自身的 `/api/*`，維持 auth cookie（`access_token`）為 first-party，讓
client fetch 與 server-side layout guard（`getServerUser`）都能讀到，並免除 CORS。轉發分兩層：

- **一般讀取 API**：由 Next `rewrites()` 的 `fallback` 規則轉發到 `NEXT_PUBLIC_BACKEND_API_URL`。
- **AI 請求**：`app/api/**/route.ts` 的 Route Handler（chat、`*/deep-chat`、`translate`、
  champion `recalculate`）優先接手。使用 `fallback`（而非 `afterFiles`）正是為了讓這些 Handler
  蓋過 catch-all proxy——它們需要較長的 120 秒 timeout，避開 dev-server rewrite 預設約 30 秒的
  socket timeout。代理邏輯集中在 `lib/ai-proxy.ts`。

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

## 測試

- **單元／元件**：`tests/unit/`（MSW 攔截 `/api`）。涵蓋 RBAC、排序、Markdown、AI 卡片與面板、
  HexagonChart、深層問答、admin jobs／ai-usage 等。
- **E2E**：`tests/e2e/`，依角色分檔（`guest`／`user`／`premium`／`admin`）加上背景聊天流程
  （`chat-background`）。透過 `tests/mock-server/server.mjs`（:3000）提供合約假資料，登入 email
  決定角色：`admin@example.com` → ADMIN、`premium@example.com` → PREMIUM、其餘 → USER。

## 架構

- `app/(public|app|admin)/` — 三組 route group，各自 layout。`(app)`/`(admin)` 的
  `layout.tsx` 用 `getServerUser()` 做**權威** server-side 角色守衛。
- `app/api/**/route.ts` — AI 相關的 same-origin Route Handler（見上「AI Route Handlers」）。
- `features/<domain>/` — 各領域的 API 函式 + TanStack Query hooks：`auth`、`users`、`home`、
  `matches`、`teams`、`players`、`news`、`champion-predictions`、`favorites`、`ai`、`admin`。
- `lib/` — `api-client`（typed fetch + `ApiError`）、`auth`（server `getServerUser`）、
  `routes`（含 `canAccess` RBAC）、`ai` / `ai-proxy`（AI 型別與代理）、`flags`（feature flags）、
  `constants`、`formatters`、`list`（排序/篩選）、`query-client`。
- `components/{ui,layout,auth,cards,charts,ai,forms}/` — UI 與展示元件。

## 權限模型

- **權威**：layout server guard + 後端 401/403。前端 `RoleGate` 只控制 UI 顯隱。
- 後端 auth 為 HttpOnly cookie `access_token`（`sameSite: lax`）。
- 專用 `middleware.ts` 目前**未啟用**（守衛由 layout guard + 後端狀態碼負責，已足夠）。

## 功能範圍

- **Phase 1**：Auth/RBAC、route protection、首頁、登入/註冊、Admin 帳號管理、賽事/國家隊/球員/
  新聞/冠軍預測（list + detail base）、基本資料、收藏、loading/error/empty states、單元 + E2E。
- **Phase 2**：真實 AI 呼叫、一般懸浮問答（GeneralFloatingChat）、新聞翻譯、球員 HexagonRadar、
  AI 徽章（傷病風險等）。
- **Phase 3**：quota 429 處理、模型分歧面板（ChampionDivergence）與細節打磨、新聞／球員分析、
  Admin AI 用量統計、各領域深層問答（deep-chat）與冠軍重跑（recalculate）。
- **Phase 4**：`/admin/jobs` 資料管線手動觸發 UI——FULL / SYNC / GENERATE 觸發 + 進度輪詢。

## 參考文件

- `docs/READONLY_API_CONTRACT.md` — 後端實作的唯讀 API 合約（前端呼叫規則以此為準）。
- `docs/FRONTEND_INTEGRATION_PHASE2.md`、`docs/FRONTEND_PHASE3_INTEGRATION_NOTES.md` — 各階段整合說明。
- `docs/AI_DATA_FLOW.md`、`docs/FRONTEND_GENERAL_CHAT_HANDOFF.md`、
  `docs/FRONTEND_MATCH_REFRESH_HANDOFF.md`、`docs/ADMIN_MANUAL_JOBS_FRONTEND.md` — AI／聊天／
  比賽刷新／管線觸發的細節交接。
- `CHANGES_PHASE1.md` — Phase 1 變更明細。
