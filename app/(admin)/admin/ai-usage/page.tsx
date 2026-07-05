'use client';

import { useState } from 'react';
import { useAiUsage } from '@/features/admin/use-ai-usage';
import type { AiUsageQuery, AiUsageStats } from '@/types/api';
import { PageHeading } from '@/components/layout/PageHeading';
import { FilterBar } from '@/components/ui/FilterBar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { formatDate } from '@/lib/formatters';

export default function AdminAiUsagePage() {
  // Empty from/to → backend defaults to the last 7 days.
  const [filters, setFilters] = useState<AiUsageQuery>({ from: '', to: '' });
  const query = useAiUsage(filters);

  return (
    <div>
      <PageHeading title="AI 用量統計" description="AI 呼叫的用量、供應商分布與使用者排行（預設近 7 天）。" />

      <FilterBar>
        <Input
          type="date"
          label="起始日"
          value={filters.from ?? ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
        />
        <Input
          type="date"
          label="結束日"
          value={filters.to ?? ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
        />
        <div className="flex items-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ from: '', to: '' })}
            disabled={!filters.from && !filters.to}
          >
            重設為近 7 天
          </Button>
        </div>
      </FilterBar>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <EmptyState />
      ) : (
        <Dashboard stats={query.data} />
      )}
    </div>
  );
}

function Dashboard({ stats }: { stats: AiUsageStats }) {
  const { totals } = stats;
  const successRate = totals.calls > 0 ? Math.round((totals.done / totals.calls) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-slate-500">
        統計區間：{formatDate(stats.from)} ~ {formatDate(stats.to)}
      </p>

      {/* Totals — headline numbers (stat tiles). */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatTile label="總呼叫次數" value={totals.calls} />
        <StatTile label="成功" value={totals.done} tone="success" />
        <StatTile label="失敗" value={totals.failed} tone="danger" />
        <StatTile label="輸入 tokens" value={totals.inputTokens} />
        <StatTile label="輸出 tokens" value={totals.outputTokens} />
      </div>

      {/* Call outcome — success-rate hero + a segmented proportion bar (uses byStatus). */}
      <Card>
        <CardHeader>
          <CardTitle>呼叫結果分布</CardTitle>
        </CardHeader>
        <CardBody>
          {totals.calls === 0 ? (
            <EmptyState message="此區間沒有呼叫紀錄。" />
          ) : (
            <StatusBreakdown stats={stats} successRate={successRate} />
          )}
        </CardBody>
      </Card>

      {/* Calls over time. */}
      <Card>
        <CardHeader className="flex items-center justify-between gap-3">
          <CardTitle>每日呼叫次數</CardTitle>
          <span className="text-xs text-slate-400">每格為當日 AI 呼叫總數（滑鼠移入看細節）</span>
        </CardHeader>
        <CardBody>
          {stats.byDay.length === 0 ? (
            <EmptyState message="此區間沒有呼叫紀錄。" />
          ) : (
            <DayColumns data={stats.byDay} />
          )}
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>依任務類型</CardTitle>
          </CardHeader>
          <CardBody>
            <BarList
              rows={stats.byTaskType.map((x) => ({ label: taskTypeLabel(x.taskType), value: x.calls }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>依供應商</CardTitle>
          </CardHeader>
          <CardBody>
            <BarList
              rows={stats.byProvider.map((x) => ({ label: providerLabel(x.provider), value: x.calls }))}
            />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>使用者排行（前 10）</CardTitle>
        </CardHeader>
        <CardBody>
          {stats.topUsers.length === 0 ? (
            <EmptyState message="此區間沒有使用者呼叫紀錄。" />
          ) : (
            <TopUsers users={stats.topUsers} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

const TILE_TONES = {
  default: 'text-slate-900',
  success: 'text-green-700',
  danger: 'text-red-700',
} as const;

function StatTile({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: keyof typeof TILE_TONES;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${TILE_TONES[tone]}`}>
        {value.toLocaleString('en-US')}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ── Call-outcome breakdown ────────────────────────────────────────────────────
// Status is state, not identity → the reserved status palette (green/red/amber),
// each segment paired with a legend label so meaning never rides on color alone.
const STATUS_META: Record<string, { label: string; bar: string; dot: string; text: string }> = {
  DONE: { label: '成功', bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  FAILED: { label: '失敗', bar: 'bg-red-500', dot: 'bg-red-500', text: 'text-red-600' },
  RUNNING: { label: '執行中', bar: 'bg-amber-400', dot: 'bg-amber-400', text: 'text-amber-600' },
  PENDING: { label: '等待中', bar: 'bg-slate-300', dot: 'bg-slate-300', text: 'text-slate-500' },
};
const STATUS_FALLBACK = { bar: 'bg-slate-400', dot: 'bg-slate-400', text: 'text-slate-500' };

function statusMeta(status: string) {
  const m = STATUS_META[status];
  if (m) return m;
  return { label: status, ...STATUS_FALLBACK };
}

function StatusBreakdown({ stats, successRate }: { stats: AiUsageStats; successRate: number }) {
  const { totals } = stats;
  // Prefer the authoritative byStatus breakdown; fall back to done/failed totals.
  const raw =
    stats.byStatus.length > 0
      ? stats.byStatus
      : [
          { status: 'DONE', calls: totals.done },
          { status: 'FAILED', calls: totals.failed },
        ].filter((s) => s.calls > 0);
  const total = raw.reduce((sum, s) => sum + s.calls, 0) || 1;
  const segments = [...raw].sort((a, b) => b.calls - a.calls);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
      {/* Success-rate hero — the one number the view leads with. */}
      <div className="shrink-0">
        <p className="text-xs font-medium text-slate-500">成功率</p>
        <p className="mt-1 text-5xl font-bold leading-none text-emerald-600">{successRate}%</p>
        <p className="mt-2 text-xs text-slate-400 tabular-nums">
          成功 {totals.done.toLocaleString('en-US')}・失敗 {totals.failed.toLocaleString('en-US')}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        {/* Segmented proportion bar — 2px surface gaps do the separating. */}
        <div className="flex h-3.5 w-full gap-0.5 overflow-hidden rounded-full">
          {segments.map((s) => {
            const meta = statusMeta(s.status);
            return (
              <div
                key={s.status}
                className={`h-full first:rounded-l-full last:rounded-r-full ${meta.bar}`}
                style={{ width: `${(s.calls / total) * 100}%` }}
                title={`${meta.label}：${s.calls.toLocaleString('en-US')} 次`}
              />
            );
          })}
        </div>

        {/* Legend — identity via label + count + share, not color alone. */}
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {segments.map((s) => {
            const meta = statusMeta(s.status);
            const pct = Math.round((s.calls / total) * 100);
            return (
              <li key={s.status} className="flex items-center gap-2 text-sm">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
                <span className="text-slate-600">{meta.label}</span>
                <span className={`font-semibold tabular-nums ${meta.text}`}>
                  {s.calls.toLocaleString('en-US')}
                </span>
                <span className="text-xs text-slate-400 tabular-nums">({pct}%)</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ── Category magnitude → single-hue horizontal bars with count + share ────────
// One hue (never a rainbow / value-ramp); the value and its % of total ride the
// row, the bar spans full width beneath so magnitude reads at a glance.
function BarList({ rows }: { rows: { label: string; value: number }[] }) {
  if (rows.length === 0) return <EmptyState message="此區間沒有資料。" />;
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const max = Math.max(...sorted.map((r) => r.value), 1);
  const total = sorted.reduce((sum, r) => sum + r.value, 0) || 1;

  return (
    <ul className="flex flex-col gap-4">
      {sorted.map((row) => {
        const pct = Math.round((row.value / total) * 100);
        return (
          <li key={row.label} title={`${row.label}：${row.value.toLocaleString('en-US')} 次（${pct}%）`}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm text-slate-700" title={row.label}>
                {row.label}
              </span>
              <span className="shrink-0 tabular-nums">
                <span className="text-sm font-semibold text-slate-800">
                  {row.value.toLocaleString('en-US')}
                </span>
                <span className="ml-1.5 text-xs text-slate-400">{pct}%</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${Math.max((row.value / max) * 100, row.value > 0 ? 3 : 0)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ── Time series → vertical columns with a gridded scale ───────────────────────
// Clean integer y-ticks + hairline gridlines give the shape a reference; the
// peak column is emphasized and directly labeled, the rest read off the grid /
// hover. Scrolls horizontally when wide so the page body never scrolls sideways.
const PLOT_H = 184;

function DayColumns({ data }: { data: { day: string; calls: number }[] }) {
  const peak = Math.max(...data.map((d) => d.calls));
  const ticks = axisTicks(peak);
  const top = ticks[ticks.length - 1];
  // Few days → label every column; many → only the peak stays legible.
  const labelAll = data.length <= 10;
  const innerWidth = Math.max(data.length * 40, 360);

  return (
    <div className="flex gap-2">
      {/* Y-axis gutter — tick labels aligned to the gridlines. */}
      <div className="relative w-9 shrink-0" style={{ height: PLOT_H }}>
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute right-0 -translate-y-1/2 text-[10px] tabular-nums text-slate-400"
            style={{ bottom: `${(t / top) * 100}%` }}
          >
            {t.toLocaleString('en-US')}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto pb-1">
        <div style={{ minWidth: innerWidth }}>
          {/* Plot: gridlines behind, columns in front. */}
          <div className="relative" style={{ height: PLOT_H }}>
            {ticks.map((t) => (
              <div
                key={t}
                className={t === 0 ? 'absolute inset-x-0 bg-slate-300' : 'absolute inset-x-0 bg-slate-100'}
                style={{ bottom: `${(t / top) * 100}%`, height: 1 }}
              />
            ))}
            <div className="absolute inset-0 flex items-end gap-1">
              {data.map((d) => {
                const heightPct = (d.calls / top) * 100;
                const isPeak = d.calls === peak && peak > 0;
                return (
                  <div
                    key={d.day}
                    className="group relative flex-1"
                    style={{ height: '100%' }}
                    title={`${formatDate(d.day)}：${d.calls.toLocaleString('en-US')} 次`}
                  >
                    <div
                      className={`absolute bottom-0 left-1/2 w-3/5 max-w-[34px] -translate-x-1/2 rounded-t transition-colors ${
                        isPeak ? 'bg-brand-600' : 'bg-brand-400 group-hover:bg-brand-500'
                      }`}
                      style={{ height: `${heightPct}%`, minHeight: d.calls > 0 ? 3 : 0 }}
                    />
                    {(labelAll || isPeak) && d.calls > 0 && (
                      <span
                        className={`absolute left-1/2 -translate-x-1/2 text-[11px] tabular-nums ${
                          isPeak ? 'font-semibold text-brand-700' : 'text-slate-500'
                        }`}
                        style={{ bottom: `calc(${heightPct}% + 4px)` }}
                      >
                        {d.calls.toLocaleString('en-US')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis: weekday + date under each column. */}
          <div className="mt-2 flex gap-1">
            {data.map((d) => (
              <div key={d.day} className="flex min-w-0 flex-1 flex-col items-center">
                <span className="text-[10px] leading-tight text-slate-400">{weekdayShort(d.day)}</span>
                <span className="text-[11px] leading-tight tabular-nums text-slate-500">{shortDay(d.day)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Top users — rank badges + inline magnitude bars ───────────────────────────
function TopUsers({ users }: { users: AiUsageStats['topUsers'] }) {
  const max = Math.max(...users.map((u) => u.calls), 1);
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <Table>
        <THead>
          <TR>
            <TH className="w-12 text-center">#</TH>
            <TH>使用者</TH>
            <TH className="text-right">呼叫次數</TH>
          </TR>
        </THead>
        <TBody>
          {users.map((user, i) => (
            <TR key={user.userId}>
              <TD className="text-center">
                <RankBadge rank={i + 1} />
              </TD>
              <TD>
                <div className="font-medium text-slate-900">
                  {user.displayName || user.email || user.userId}
                </div>
                {user.displayName && user.email && (
                  <div className="text-xs text-slate-500">{user.email}</div>
                )}
              </TD>
              <TD>
                <div className="flex items-center justify-end gap-3">
                  <div className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-slate-100 sm:block">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(user.calls / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-semibold tabular-nums text-slate-800">
                    {user.calls.toLocaleString('en-US')}
                  </span>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

const RANK_TONES = ['bg-amber-100 text-amber-700', 'bg-slate-200 text-slate-600', 'bg-orange-100 text-orange-700'];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold tabular-nums ${RANK_TONES[rank - 1]}`}
      >
        {rank}
      </span>
    );
  }
  return <span className="text-sm tabular-nums text-slate-400">{rank}</span>;
}

// ── Label maps ────────────────────────────────────────────────────────────────
const TASK_TYPE_LABELS: Record<string, string> = {
  GENERAL_CHAT: '一般問答',
  DEEP_CHAT: '深度問答',
  NEWS_TRANSLATION: '新聞翻譯',
  CHAMPION_RECALCULATE: '冠軍重算',
  CHAMPION_PREDICTION: '冠軍預測',
  FINAL_REPORT_POLISH: '報告彙整',
};

function taskTypeLabel(taskType: string): string {
  return TASK_TYPE_LABELS[taskType] ?? taskType;
}

const PROVIDER_LABELS: Record<string, string> = {
  NVIDIA: 'NVIDIA',
  QWEN: 'Qwen',
  PROGRAM_RULE: '規則引擎',
};

function providerLabel(provider: string): string {
  return PROVIDER_LABELS[provider] ?? provider;
}

// ── Chart helpers ─────────────────────────────────────────────────────────────

// Clean integer axis ticks (0, step, 2·step, … ≥ max) with a "nice" 1/2/5·10ⁿ
// step, giving the columns headroom above the peak and labels that read cleanly.
function axisTicks(maxValue: number, targetCount = 4): number[] {
  const max = Math.max(maxValue, 1);
  const rough = max / targetCount;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * pow;
  // floor()+step (not ceil) guarantees the top tick sits strictly above the peak,
  // so the tallest column never touches the ceiling and its floating value label
  // always has room above the bar.
  const topTick = Math.floor(max / step) * step + step;
  const ticks: number[] = [];
  for (let t = 0; t <= topTick + step / 2; t += step) ticks.push(Math.round(t));
  return ticks;
}

// "2026-07-01T00:00:00Z" / "2026-07-01" → "7/1".
function shortDay(day: string): string {
  const date = new Date(day);
  if (Number.isNaN(date.getTime())) return day;
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
}

// 00:00-UTC day → "週一" … "週日".
function weekdayShort(day: string): string {
  const date = new Date(day);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('zh-TW', { weekday: 'short', timeZone: 'UTC' }).format(date);
}
