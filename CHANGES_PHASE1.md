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

## 後端契約對接修正（對照 `docs/READONLY_API_CONTRACT.md`，2026-06-30）

對照後端 Phase 1 實際契約後，修正下列對接問題（皆已驗證通過）：

**會在 runtime 出錯的（已修）**
1. **Profile 結構映射**：`GET/PATCH /users/me` 回傳 `MeDto`，profile 欄位**巢狀**於 `profile: {...} | null`，非頂層。前端原本讀 `user.nickname`/`user.bio`（永遠空）→ 改為 `user.profile?.nickname`，型別改 `MeDto`。
2. **register-admin 多送 `role`**：後端 `forbidNonWhitelisted: true`，`POST /admin/register-admin` 只收 `{email,password,displayName}`，多送 `role` 會 **400**。已新增 `AdminRegisterAdminRequest` 並在頁面送出前去除 `role`。
3. **Team/Player 詳情分析來源**：`GET /teams/:id`、`/players/:id` 只回 summary，AI 分析在獨立 `/analysis` 子資源。前端原本讀 `detail.analysis`（不存在）→ 新增 `useTeamAnalysis`/`usePlayerAnalysis`。
4. **Match 事件欄位命名**：`MatchEventDto` 為 `eventType`/`playerId`/`extraMinute`，前端原用 `type`/`playerName`（渲染空白）→ 已對齊。
5. **List filter enum**：`matches.stage`、`news.category` 為 enum，前端原為自由文字輸入（送無效值會 400）→ 改為 enum `Select`（`MATCH_STAGES`/`NEWS_CATEGORIES` + 中文 label）。

**型別漂移 / 邊界（已修）**
6. `MatchDetail` 移除不存在的 `keyPlayers`/`reports`（契約僅 `MatchSummary & { events }`）；移除 match 詳情的 Key Players 區塊。
7. `PlayerDetail` 移除不存在的 `relatedNews`/`analysis`；移除球員詳情相關新聞區塊。
8. `NewsDetail` 以契約為準（`contentSnippet/translatedContentZh/language/fetchedAt`），移除不存在的 `relatedEntities`。
9. `TeamSummary` 補 `worldRanking`；`MatchSummary.stage` 改 `MatchStage` enum；`NewsSummary.category` 改 `NewsCategory`；新增 `MatchStage/NewsCategory/NewsTagType/JobStatus/RiskLevel` enums。
10. `User` = `UserDto`（id/email/displayName/role/status）；新增 `MeDto`/`UserProfile`。`LoginResponse.redirectPath` 放寬為 `string`。
11. Cookie 名稱確認為 `access_token`（更新常數與 mock）。
12. `champion-predictions/latest` 型別放寬為 `ChampionPredictionResponse | null`（無 run 時 `{data:null}`，頁面空狀態已支援）。

**已正確、無需改（核對通過）**
- `favorites` add/remove 一律回 `{success:true}`，前端 mutation 已 invalidate 重抓 → 正確。
- `/teams/:id/players` 不含巢狀 `team`，`PlayerCard` 已 null-safe（顯示 `—`）。
- USER/PREMIUM/ADMIN 導向與受保護 API 邊界與契約一致；ADMIN 對 `/users/*` 得 403、前端不呼叫。
- Admin 清單 `UserDto` **無 `createdAt`**：保留「建立時間」欄位但 null-safe 顯示 `—`（不依賴非契約欄位）。

## 七方向逐項稽核補修（2026-06-30）

- **方向四（信封一致性）**：`POST /auth/register` 的 success data 實為 `{ user: UserDto }`，前端原以 `apiData<User>` 直接當 `User`（雖目前未用到回傳值，型別仍錯）→ 改為 `apiData<{ user: User }>` 並解包。
- **方向三（驗證界線）**：Zod schema 對齊後端 ValidationPipe：`password` 補 `max(100)`、`displayName` 由 `min(2)` 放寬為 `min(1).max(60)`、`nickname` `max(40)→60`、`bio` `max(300)→1000`（移除前端比後端更嚴格/缺上界的差異）。
- 其餘方向（一/二/五/六/七）核對為一致或屬 Phase 2/3 明確延後，詳見對話稽核報告。

### 稽核後追加調整
- **方向二補做**：新增 `usePlayerRating`（`GET /players/:id/rating`），球員詳情頁加上「AI 球員評級」報告卡（Phase 2 六邊形圖前置）。
- **方向五調整**：PREMIUM-only 區塊改用新的 `PremiumGate`（[RoleGate.tsx](components/auth/RoleGate.tsx)）。非 PREMIUM（USER）不再隱藏，而是顯示「你的帳號目前無法使用此功能。」的 `premium-locked` 提示（非升級導購）。套用於深層問答、新聞翻譯、雙模型交叉分析；冠軍重跑按鈕對 USER 顯示為 disabled「重新跑預測（高級會員）」。新增 USER E2E 斷言驗證。

## 與規格不一致 / 決策

1. **專案結構**：採 root-level Next.js（非 `apps/web` monorepo）— 經確認，docs 中 `apps/web/*` 對應 repo 根目錄。
2. **Next.js 固定 15.x**；若升 16，`middleware.ts` 須改名 `proxy.ts`。
3. **同源 proxy**（`next.config.ts rewrites`）：瀏覽器呼叫前端 `/api`，轉發至 `NEXT_PUBLIC_BACKEND_API_URL`。解決跨來源 cookie，使 server guard 能讀 cookie。需後端 cookie 為 first-party 即可（不需 CORS）。
4. **middleware/proxy 未啟用**：session cookie 名稱待後端確認；目前僅靠 layout server guard + 後端 401/403。
5. **HexagonRadar / FloatingChat**：prompt 列於 Phase 2，本階段僅 placeholder/stub（為讓 `AiReportCard`/可見性測試與詳情頁結構完整）。
