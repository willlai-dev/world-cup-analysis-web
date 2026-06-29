# 02 Frontend Next.js Structure Spec

## 技術要求

- Next.js App Router。
- TypeScript。
- Tailwind CSS。
- React Hook Form + Zod。
- TanStack Query 或自製 fetch wrapper。
- Zustand 或 Context 管理 auth。
- Vitest + Testing Library。
- Playwright。

## 目錄建議

```txt
apps/web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   ├── register/
│   ├── matches/
│   ├── teams/
│   ├── players/
│   ├── champion-predictions/
│   ├── news/
│   ├── profile/
│   ├── favorites/
│   └── admin/
├── components/
│   ├── layout/
│   ├── ui/
│   ├── auth/
│   ├── cards/
│   ├── charts/
│   ├── ai/
│   └── forms/
├── features/
│   ├── auth/
│   ├── matches/
│   ├── teams/
│   ├── players/
│   ├── favorites/
│   ├── champion-predictions/
│   ├── news/
│   ├── admin/
│   └── ai-chat/
├── lib/
│   ├── api-client.ts
│   ├── auth.ts
│   ├── routes.ts
│   ├── formatters.ts
│   └── constants.ts
├── hooks/
├── types/
└── tests/
```

## Routes

Public：

```txt
/
/login
/register
```

USER/PREMIUM：

```txt
/matches
/matches/[matchId]
/teams
/teams/[teamId]
/players
/players/[playerId]
/champion-predictions
/news
/news/[newsId]
/profile
/favorites
```

ADMIN：

```txt
/admin/accounts
/admin/accounts/create
/admin/register-admin
```

## API Client

建立 `lib/api-client.ts`：

- base URL：`NEXT_PUBLIC_BACKEND_API_URL`。
- credentials: include。
- 統一 parse response envelope。
- 錯誤時 throw typed ApiError。
- 支援 query params。

不可在前端放 secret。

## Auth State

```ts
type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'PREMIUM' | 'ADMIN';
  status: 'ACTIVE' | 'DISABLED';
};
```

AuthProvider 啟動時呼叫 `/auth/me`。

## Route Guard

Guest：只可進 `/`, `/login`, `/register`。

USER/PREMIUM：可進一般 route，不可進 admin route。

ADMIN：只可進 `/admin/*`，不可進一般 route。

## Layouts

### Public/User Layout

- Header。
- Main nav。
- User dropdown。
- Floating AI chat only for USER/PREMIUM。
- Footer。

### Admin Layout

- Admin header。
- Admin nav。
- Admin dropdown。
- 不顯示一般 nav。
- 不顯示 floating chat。

## UI Components

```txt
Button
Card
Input
Select
Badge
Table
Tabs
Modal
LoadingState
ErrorState
EmptyState
Pagination
```

## Cards

```txt
MatchCard
TeamCard
PlayerCard
NewsCard
ChampionEntryCard
```

## Charts

使用 CSS/SVG，不需大型圖表套件：

```txt
HexagonRadar
ScoreBar
AbilityMeter
ChampionRankBar
```

HexagonRadar props：

```ts
type HexagonRadarProps = {
  values: {
    attack: number;
    creativity: number;
    technique: number;
    defense: number;
    physical: number;
    form: number;
  };
};
```

## AI Components

```txt
AiReportCard
AiProviderBadge
AiUpdatedAt
AiDataLimitations
FloatingChatButton
AiChatModal
DeepChatPanel
TranslationPanel
ModelDisagreementPanel
```

AiReportCard states：

- PENDING：生成中。
- DONE：顯示內容。
- FAILED：顯示失敗。
- null：尚無分析。

## Role-based UI

| Role | Header |
|---|---|
| Guest | Logo、首頁、登入、註冊 |
| USER | Logo、賽事、國家、球員、冠軍預測、新聞、下拉 |
| PREMIUM | 同 USER，但顯示高級功能入口 |
| ADMIN | Admin header，只顯示帳號管理、註冊 Admin、登出 |

前端 RoleGate 只控制 UI，後端仍需檢查權限。

## Floating Chat

- 右下角。
- USER/PREMIUM 顯示。
- Admin 不顯示。
- 未登入不顯示。
- API：`POST /ai/chat`。
- 顯示 loading/error。
- 保留當前 session message history。

## Frontend 測試

Component tests：

- UserDropdown by role。
- Header by role。
- LoginForm validation。
- RegisterForm validation。
- AiReportCard states。
- FloatingChat hidden for Admin。
- HexagonRadar renders。

E2E：

- Guest only home。
- USER login -> `/matches`。
- Admin login -> `/admin/accounts`。
- USER cannot admin。
- Admin cannot normal pages。
- PREMIUM sees translation/deep chat。
