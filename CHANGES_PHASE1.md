# Phase 1 Frontend — 交付報告

## 已完成項目

- **專案骨架**：Next.js 15.x + React 19 + TS strict + Tailwind v4 + ESLint/Prettier。
- **Typed API client**（`lib/api-client.ts`）：envelope 解析、typed `ApiError`（含 401/403 判斷）、query 序列化、`credentials: include`、同源 proxy 解析。
- **Auth**：server `getServerUser()`、Zustand store、`AuthProvider`、`useAuth`、`useLogout`。
- **Route protection**：`(app)`/`(admin)` layout server guard（權威）；`RoleGate`/`PremiumOnly`（UI-only）；`lib/routes.ts` 的 `canAccess`。
- **Layout/Nav**：role-aware `Header`、`AdminHeader`、`UserDropdown`、`Footer`、`FloatingChatButton`（USER/PREMIUM 限定 stub）。
- **UI primitives**：Button/Card/Input/Select/Badge/Table/Tabs/Modal/Pagination/FilterBar + Loading/Error/Empty/Permission states。
- **Cards/Charts/AI**：Match/Team/Player/News/ChampionEntry cards、FavoriteButton、AbilityMeter/ScoreBar/ChampionRankBar、`AiReportCard`（idle/loading/pending/done/failed/insufficient_data）。
- **Forms**：Login/Register/AdminCreateUser/Profile（RHF + Zod）。
- **頁面**：首頁、登入、註冊、Admin（accounts / accounts/create / register-admin）、賽事/國家隊/球員/新聞（list + detail）、冠軍預測、基本資料、收藏。每個列表頁皆有 loading/error/empty。
- **測試**：24 個 Vitest 單元/元件測試、15 個 Playwright E2E（Guest/USER/PREMIUM/ADMIN 流程），含 MSW handlers 與獨立 mock backend。

驗證結果：`pnpm typecheck` ✅、`pnpm lint` ✅、`pnpm test` ✅ (24)、`pnpm build` ✅ (18 routes)、`pnpm test:e2e` ✅ (15)。

## 未完成項目（Phase 2/3，目前為 placeholder/stub）

- 真實 AI 呼叫、一般懸浮問答（`POST /ai/chat`）— FloatingChat 目前僅 stub。
- 深層問答（detail 頁 `DeepChatPlaceholder`，PREMIUM 可見，Phase 3 接線）。
- 新聞翻譯（`/news/[id]` 翻譯面板，PREMIUM 可見，Phase 2 接線）。
- 冠軍重跑 / 模型分歧（按鈕與 A/B 區塊為 disabled/placeholder）。
- HexagonRadar（球員詳情先以 AbilityMeter 數值呈現）。
- quota / rate-limit UI。

## 主要變更檔案

```
package.json, tsconfig.json, next.config.ts (同源 proxy), postcss.config.mjs,
vitest.config.ts, playwright.config.ts, .env.example
app/(public|app|admin)/**  app/layout.tsx  app/providers.tsx  app/globals.css
lib/{api-client,auth,constants,routes,formatters,query-client,list,utils}.ts
features/{auth,users,favorites,admin,home,matches,teams,players,news,champion-predictions}/**
components/{ui,layout,auth,cards,charts,ai,forms}/**
types/api.ts
tests/{unit,e2e,mocks,mock-server}/**
```

## Local Setup / Test 指令

見 `README.md`。摘要：`pnpm install` → `pnpm dev` (3001)；測試 `pnpm test` / `pnpm test:e2e`。

## 需後端提供但目前 mock 的 endpoint

全部 `03_FRONTEND_READONLY_API_CONTRACT.md` 端點（dev 連真實後端，測試用 mock）：
`/auth/{login,register,logout,me}`、`/home/highlights`、`/admin/users*`、`/admin/register-admin`、
`/users/me(+/favorites)`、`/favorites/{teams,players}/:id`、`/matches*`、`/teams*`、`/players*`、
`/news*`、`/champion-predictions/latest`。

## 與規格不一致 / 決策

1. **專案結構**：採 root-level Next.js（非 `apps/web` monorepo）— 經確認，docs 中 `apps/web/*` 對應 repo 根目錄。
2. **Next.js 固定 15.x**；若升 16，`middleware.ts` 須改名 `proxy.ts`。
3. **同源 proxy**（`next.config.ts rewrites`）：瀏覽器呼叫前端 `/api`，轉發至 `NEXT_PUBLIC_BACKEND_API_URL`。解決跨來源 cookie，使 server guard 能讀 cookie。需後端 cookie 為 first-party 即可（不需 CORS）。
4. **middleware/proxy 未啟用**：session cookie 名稱待後端確認；目前僅靠 layout server guard + 後端 401/403。
5. **HexagonRadar / FloatingChat**：prompt 列於 Phase 2，本階段僅 placeholder/stub（為讓 `AiReportCard`/可見性測試與詳情頁結構完整）。
