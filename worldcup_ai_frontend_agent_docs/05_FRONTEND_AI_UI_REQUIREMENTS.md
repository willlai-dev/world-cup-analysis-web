# 05 FRONTEND AI UI REQUIREMENTS

## AI Display States

Every AI section must support these states:

```ts
type AiDisplayState = 'idle' | 'loading' | 'pending' | 'done' | 'failed' | 'insufficient_data';
```

Render guidance:

- `loading`: skeleton or spinner.
- `pending`: show "AI 分析產生中".
- `done`: show content, model/provider if available, updatedAt/source snapshot if available.
- `failed`: show retry-safe message; do not expose stack traces.
- `insufficient_data`: show "目前資料不足".

## Required AI Components

- `AiReportCard`
- `AiConfidenceBadge`
- `AiSourceMeta`
- `GeneralFloatingChat`
- `DeepChatPanel`
- `ChampionModelComparison`
- `NewsTranslationPanel`
- `NewsImpactPanel`
- `PlayerHexagonChart`

## Player Hexagon Chart

Use SVG or CSS. Do not require a third-party chart package.

Axes:

1. 進攻
2. 創造
3. 技術
4. 防守
5. 身體
6. 狀態

## Floating Chat

Visible only to USER/PREMIUM.

Basic examples:

- 目前有哪些未開始的重點賽事？
- 法國有哪些高評級球員？
- 目前冠軍預測前三名是誰？
- 最近有哪些關於阿根廷的新聞？

## Deep Chat

Visible only to PREMIUM and only inside detail pages:

- `/matches/[matchId]`
- `/teams/[teamId]`
- `/players/[playerId]`
- `/champion-predictions`
- `/news/[newsId]`

## Safety UI Copy

For predictions, avoid deterministic wording. Use:

- 勝負傾向
- 風險因素
- 可能影響
- 依目前資料推估

Do not use:

- 保證獲勝
- 必贏
- 穩賺
- 投注建議
