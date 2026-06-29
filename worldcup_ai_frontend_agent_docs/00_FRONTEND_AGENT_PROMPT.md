# 00 FRONTEND AGENT PROMPT — Next.js / Tailwind Only

你是 Frontend Claude Code / AI coding agent。你的任務是實作 **AI World Cup Analyst 前端**。

## 絕對邊界

你只負責前端：`apps/web`、Next.js App Router、Tailwind UI、頁面、元件、前端狀態、API client、前端測試與 Vercel 部署設定。

若後端尚未存在，請以 `03_FRONTEND_READONLY_API_CONTRACT.md` 建立 typed API client、mock handlers 或 MSW 測試資料。不要改寫後端合約。
(目前後端完成第一階段可以嘗試連結)

## 你要閱讀的文件

請只閱讀本資料夾內文件，按照順序：

1. `00_FRONTEND_AGENT_PROMPT.md`
2. `01_FRONTEND_SCOPE_RBAC_AND_PHASES.md`
3. `02_FRONTEND_NEXTJS_STRUCTURE_SPEC.md`
4. `03_FRONTEND_READONLY_API_CONTRACT.md`
5. `04_FRONTEND_AUTH_RBAC_SPEC.md`
6. `05_FRONTEND_AI_UI_REQUIREMENTS.md`
7. `06_FRONTEND_TESTING_ACCEPTANCE.md`
8. `07_FRONTEND_ENV_DEPLOYMENT.md`
9. `08_FRONTEND_PAGES_COMPONENTS_SPEC.md`

## 技術選型

- Next.js App Router
- React
- TypeScript strict
- Tailwind CSS
- React Hook Form + Zod
- TanStack Query 或 typed fetch wrapper
- Zustand 或 React Context for auth state
- Vitest + Testing Library
- Playwright

## 必須遵守的前端原則

1. 前端只呼叫 `NEXT_PUBLIC_BACKEND_API_URL` 指向的後端 API。
2. 前端不可呼叫 NVIDIA、Qwen、football-data、FIFA、GDELT、Guardian、NewsAPI。
3. 前端不可保存任何 secret：不要使用 `NVIDIA_API_KEY`、`DASHSCOPE_API_KEY`、`DATABASE_URL`、`JWT_SECRET`、`COOKIE_SECRET`、`CRON_SECRET`。
4. 前端可以做 UI 顯示控制，但最終權限由後端決定。
5. Admin UI 必須與一般使用者 UI 隔離。
6. Admin 登入後導向 `/admin/accounts`，且不顯示一般 nav、收藏、floating chat。
7. USER/PREMIUM 登入後導向 `/matches`。
8. Guest 只能看首頁、登入、註冊。
9. USER 看不到新聞翻譯、深層問答、重新跑冠軍預測入口；若誤觸 API 403，要顯示權限不足。
10. PREMIUM 可看到新聞翻譯、深層問答、重新跑冠軍預測入口。
11. 所有列表頁要有 loading / error / empty states。
12. 所有 AI 區塊要能顯示 pending / done / failed / insufficient data。

## 實作順序

### Phase 1 Frontend

先完成：

- Next.js + Tailwind setup
- layout / header / navigation
- typed API client
- auth store/provider
- route protection
- homepage
- login/register pages
- admin accounts page
- matches/teams/players/news/champion predictions base pages
- profile/favorites pages
- basic cards/tables/filters
- frontend unit/e2e tests

### Phase 2 Frontend

再完成：

- AI report components
- floating general chat
- news translation UI for PREMIUM
- match/team/player/champion AI display blocks
- hexagon player chart using SVG/CSS
- loading/pending AI states

### Phase 3 Frontend

最後完成：

- detailed page deep chat panels
- champion recalculation UI
- model disagreement UI
- news impact UI
- quota/error UI
- source/update-time credibility labels
- full Playwright flows

## 交付要求

完成後輸出：

- 已完成項目
- 未完成項目
- 主要變更檔案
- local setup 指令
- test 指令
- 需要後端提供但目前 mock 的 endpoint
- 與規格不一致處
