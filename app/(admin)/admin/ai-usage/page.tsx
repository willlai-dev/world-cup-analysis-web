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
        <StatTile label="成功" value={totals.done} sub={`${successRate}% 成功率`} tone="success" />
        <StatTile label="失敗" value={totals.failed} tone="danger" />
        <StatTile label="輸入 tokens" value={totals.inputTokens} />
        <StatTile label="輸出 tokens" value={totals.outputTokens} />
      </div>

      {/* Calls over time. */}
      <Card>
        <CardHeader>
          <CardTitle>每日呼叫次數</CardTitle>
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
            <BarList rows={stats.byTaskType.map((x) => ({ label: x.taskType, value: x.calls }))} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>依供應商</CardTitle>
          </CardHeader>
          <CardBody>
            <BarList rows={stats.byProvider.map((x) => ({ label: x.provider, value: x.calls }))} />
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
            <div className="rounded-lg border border-slate-200">
              <Table>
                <THead>
                  <TR>
                    <TH className="w-12 text-center">#</TH>
                    <TH>使用者</TH>
                    <TH className="text-right">呼叫次數</TH>
                  </TR>
                </THead>
                <TBody>
                  {stats.topUsers.map((user, i) => (
                    <TR key={user.userId}>
                      <TD className="text-center text-slate-400">{i + 1}</TD>
                      <TD>
                        <div className="font-medium text-slate-900">
                          {user.displayName || user.email || user.userId}
                        </div>
                        {user.displayName && user.email && (
                          <div className="text-xs text-slate-500">{user.email}</div>
                        )}
                      </TD>
                      <TD className="text-right font-semibold text-slate-800">{user.calls}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
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

// Category magnitude → single-hue horizontal bars with direct value labels
// (sorted desc). One hue avoids the rainbow anti-pattern; text stays in ink.
function BarList({ rows }: { rows: { label: string; value: number }[] }) {
  if (rows.length === 0) return <EmptyState message="此區間沒有資料。" />;
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const max = Math.max(...sorted.map((r) => r.value), 1);

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((row) => (
        <li key={row.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-sm text-slate-700 sm:w-40" title={row.label}>
            {row.label}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${Math.max((row.value / max) * 100, row.value > 0 ? 4 : 0)}%` }}
            />
          </div>
          <span className="w-12 text-right text-sm font-semibold tabular-nums text-slate-800">
            {row.value.toLocaleString('en-US')}
          </span>
        </li>
      ))}
    </ul>
  );
}

// Time series → vertical columns (left→right). Scrolls horizontally when the
// range is wide so the page body never scrolls sideways.
function DayColumns({ data }: { data: { day: string; calls: number }[] }) {
  const max = Math.max(...data.map((d) => d.calls), 1);
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-full items-end gap-2" style={{ height: 160 }}>
        {data.map((d) => (
          <div key={d.day} className="flex min-w-9 flex-1 flex-col items-center gap-1">
            <span className="text-xs font-medium tabular-nums text-slate-500">{d.calls}</span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t bg-brand-500"
                style={{ height: `${(d.calls / max) * 100}%`, minHeight: d.calls > 0 ? 4 : 0 }}
                title={`${d.day}: ${d.calls}`}
              />
            </div>
            <span className="text-[10px] text-slate-400">{shortDay(d.day)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// "2026-07-01T00:00:00Z" / "2026-07-01" → "7/1".
function shortDay(day: string): string {
  const date = new Date(day);
  if (Number.isNaN(date.getTime())) return day;
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
}
