# 06 FRONTEND TESTING AND ACCEPTANCE

只實作前端測試，不實作後端測試。後端 API 可用 mock handlers 模擬。

## Frontend Unit Tests



- Header by role。
- UserDropdown by role。
- LoginForm validation。
- RegisterForm password confirmation。
- AdminCreateUserForm role select。
- AiReportCard pending/done/failed/null。
- FloatingChat hidden for Admin。
- HexagonRadar renders 6 axes。

## Frontend E2E Tests

### Guest

- Open `/` success。
- `/matches` redirects to `/login`。
- No floating chat。

### USER

- Login -> `/matches`。
- Can open `/teams` and `/players`。
- Can favorite team/player。
- Can open `/favorites`。
- Cannot see translation button。
- Cannot see deep chat。
- Can use general chat。

### PREMIUM

- Login -> `/matches`。
- Can see news translation。
- Can see deep chat panels。
- Can see champion recalculate button。

### ADMIN

- Login -> `/admin/accounts`。
- Can list users。
- Can create premium user。
- Can change role。
- Cannot see normal nav。
- Cannot see floating chat。
- Cannot access `/matches`.

## Phase Acceptance

### Phase 1

- Auth/RBAC 完成。
- Admin 完成。
- 主要頁面可讀 seed data。
- 收藏完成。
- 權限測試通過。

### Phase 2

- AI Router 完成。
- NVIDIA/Qwen adapter 可 mock/real。
- AI reports 保存 DB。
- 新聞摘要分類與翻譯完成。
- 一般問答完成。
- 冠軍雙模型預測完成。

### Phase 3

- 深層問答完成。
- 冠軍重跑完成。
- 模型分歧完成。
- quota 完成。
- 新聞影響分析完成。

## Manual QA

Security：

- 前端 bundle 無 API key。
- Cookie HttpOnly。
- Admin 不能一般頁。
- USER 不能 admin API。
- USER 不能 premium API。
- Jobs 必須 cron secret。

AI：

- AI 資料不足時不胡編。
- AI 不捏造傷病/比分/陣容。
- AI 預測不保證結果。
- 新聞影響使用「可能」「推論」。
- 顯示 provider/model/time。

UX：

- loading states。
- error states。
- empty states。
- mobile layout。
- filter/pagination。
- form validation。


## Frontend Agent Additional Acceptance

- Guest can see home page only.
- Guest visiting `/matches` redirects to `/login` or shows auth gate.
- USER login redirects to `/matches`.
- PREMIUM login redirects to `/matches`.
- ADMIN login redirects to `/admin/accounts`.
- ADMIN layout does not show main nav or floating chat.
- USER does not see news translation button.
- PREMIUM sees news translation button.
- USER does not see deep chat panels.
- PREMIUM sees deep chat panels.
- List pages render loading/error/empty states.
- API 403 renders permission error.
- API 401 clears auth state or redirects to login.
