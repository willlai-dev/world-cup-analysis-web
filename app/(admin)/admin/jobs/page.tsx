'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useJobRuns,
  useJobTeams,
  useRunPipeline,
  useRunTeamPipeline,
} from '@/features/admin/use-jobs';
import { ApiError } from '@/lib/api-client';
import { COPY } from '@/lib/constants';
import { formatDateTime, teamName } from '@/lib/formatters';
import type { JobRun, JobStatus, JobType, PipelinePreset } from '@/types/api';
import { PageHeading } from '@/components/layout/PageHeading';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';

// Poll every 4s while tracking a run — inside the 3–5s window the backend suggests.
const POLL_MS = 4000;
// Fetch a generous recent slice so a whole FULL batch (12 jobs) fits.
const RUNS_PARAMS = { limit: 30 } as const;

type Batch = {
  label: string;
  // Ordered jobs this run will execute (from the 202). Empty === we only know a
  // pipeline is running (arrived here via 409), so we track by global activity.
  jobTypes: JobType[];
};

type PresetVariant = 'primary' | 'secondary' | 'outline';
type PresetDef = { preset: PipelinePreset; title: string; cta: string; desc: string; variant: PresetVariant };

// Whole-DB presets (docs §2 「全量」). Long-running; touch everything.
const FULL_PRESETS: PresetDef[] = [
  {
    preset: 'FULL',
    title: '全量更新',
    cta: '啟動全量更新',
    desc: '抓取所有外部資料並重算全部 AI 評級／分析。空庫首灌或一鍵補齊時使用（耗時數分鐘，會花 AI 額度）。',
    variant: 'primary',
  },
  {
    preset: 'SYNC',
    title: '只抓資料',
    cta: '啟動只抓資料',
    desc: '只刷新球隊／球員／賽程／賽果／新聞等外部資料，不花任何 AI 額度。',
    variant: 'secondary',
  },
  {
    preset: 'GENERATE',
    title: '只重算 AI',
    cta: '啟動只重算 AI',
    desc: '資料已在庫，只重跑 AI 生成（新聞摘要／影響、球員／球隊評分、近況、賽事分析、冠軍預測）。',
    variant: 'outline',
  },
];

// Per-domain presets (docs §2 「分領域」): each syncs its own area + runs that
// domain's AI analysis, so a single area can be refreshed without a full run.
// Backend runs one pipeline at a time, so every trigger disables the others.
const DOMAIN_PRESETS: PresetDef[] = [
  {
    preset: 'TEAMS',
    title: '國家／球隊',
    cta: '更新國家／球隊',
    desc: '同步球隊 → 球隊評分。',
    variant: 'outline',
  },
  {
    preset: 'PLAYERS',
    title: '球員',
    cta: '更新球員',
    desc: '同步球員 → 球員評分 → 球員近況。',
    variant: 'outline',
  },
  {
    preset: 'MATCHES',
    title: '賽事',
    cta: '更新賽事',
    desc: '同步賽程 → 賽果 → 賽事分析。',
    variant: 'outline',
  },
  {
    preset: 'NEWS',
    title: '新聞',
    cta: '更新新聞',
    desc: '抓取新聞 → 新聞摘要 → 影響分析。',
    variant: 'outline',
  },
  {
    preset: 'CHAMPION',
    title: '冠軍預測',
    cta: '更新冠軍預測',
    desc: '重算冠軍預測（吃現有球隊評分，建議先更新國家／球隊）。',
    variant: 'outline',
  },
];

const JOB_TYPE_LABELS: Record<JobType, string> = {
  SYNC_TEAMS: '同步球隊',
  SYNC_PLAYERS: '同步球員',
  SYNC_FIXTURES: '同步賽程',
  SYNC_RESULTS: '同步賽果',
  FETCH_NEWS: '抓取新聞',
  GENERATE_NEWS_SUMMARY: '新聞摘要',
  GENERATE_NEWS_IMPACT: '新聞影響分析',
  GENERATE_PLAYER_RATINGS: '球員評分',
  GENERATE_TEAM_RATINGS: '球隊評分',
  GENERATE_PLAYER_STATUS: '球員近況',
  GENERATE_MATCH_ANALYSIS: '賽事分析',
  GENERATE_RETRO_ANALYSIS: '回補賽前分析',
  GENERATE_CHAMPION_PREDICTIONS: '冠軍預測',
  SCORE_PREDICTIONS: '預測結算',
};

const STATUS_META: Record<JobStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: '等待中', tone: 'neutral' },
  RUNNING: { label: '執行中', tone: 'brand' },
  DONE: { label: '完成', tone: 'success' },
  FAILED: { label: '失敗', tone: 'danger' },
};

function jobTypeLabel(type: JobType): string {
  return JOB_TYPE_LABELS[type] ?? type;
}

// A PENDING/RUNNING row older than this never terminated — the backend almost
// certainly crashed mid-job. We stop treating such a zombie as a live pipeline so
// one orphaned row can't lock the console (or make it poll) forever. Comfortably
// above the slowest real job (~1–2h) and below the ~8h cron spacing.
const ACTIVE_RUN_MAX_AGE_MS = 6 * 60 * 60 * 1000;

function isActive(run: JobRun): boolean {
  return run.status === 'PENDING' || run.status === 'RUNNING';
}

function runAgeMs(run: JobRun, now: number): number {
  const started = run.startedAt ? Date.parse(run.startedAt) : NaN;
  // No / invalid start time (freshly queued) → age 0, i.e. treat as live.
  return Number.isNaN(started) ? 0 : now - started;
}

// "Live" = genuinely running right now (active + started recently). Drives the
// trigger lock, adoption, and stop-polling — all of which must ignore zombies.
function isLiveRun(run: JobRun, now: number = Date.now()): boolean {
  return isActive(run) && runAgeMs(run, now) < ACTIVE_RUN_MAX_AGE_MS;
}

// Active on paper but too old to be real — rendered as 逾時 so the table never
// claims a day-old orphan is still 執行中.
function isStaleActive(run: JobRun, now: number = Date.now()): boolean {
  return isActive(run) && runAgeMs(run, now) >= ACTIVE_RUN_MAX_AGE_MS;
}

// Newest-first list → most-recent run per job type.
function latestByType(runs: JobRun[]): Map<JobType, JobRun> {
  const map = new Map<JobType, JobRun>();
  for (const run of runs) {
    if (!map.has(run.jobType)) map.set(run.jobType, run);
  }
  return map;
}

// metadata is `unknown` and its shape varies by job (docs §3). Render a short,
// human line and never throw on an unexpected shape.
function summarizeMetadata(meta: unknown): string {
  if (!meta || typeof meta !== 'object') return '—';
  const m = meta as Record<string, unknown>;
  if (typeof m.error === 'string' && m.error) return `錯誤：${m.error}`;
  if (m.skipped === true) {
    const reason = typeof m.reason === 'string' && m.reason ? m.reason : '未設定來源';
    return `略過（${reason}）`;
  }

  const parts: string[] = [];
  const num = (key: string) => (typeof m[key] === 'number' ? (m[key] as number) : undefined);
  const push = (key: string, label: string) => {
    const v = num(key);
    if (v !== undefined) parts.push(`${label} ${v}`);
  };

  // Sync / fetch jobs.
  push('fetched', '抓取');
  push('created', '新增');
  push('updated', '更新');
  push('eliminated', '淘汰');
  // AI-generate jobs.
  push('scanned', '掃描');
  push('generated', '產出');
  push('skipped', '略過'); // numeric skipped here (boolean handled above)
  push('failed', '失敗');

  if (typeof m.source === 'string' && m.source && parts.length) {
    parts.unshift(`來源 ${m.source}`);
  }
  return parts.length ? parts.join('、') : '—';
}

export default function AdminJobsPage() {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [tracking, setTracking] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'info' | 'error' | 'success'; text: string } | null>(
    null,
  );
  // Single-country re-analysis inputs (docs §2.1).
  const [teamId, setTeamId] = useState('');
  const [teamSync, setTeamSync] = useState(true);

  // Guards against the race where the runs list has not yet reflected a just-
  // triggered pipeline: don't declare "done" until we've either seen activity or
  // given it a couple of idle polls (handles the fast all-skipped case).
  const sawActiveRef = useRef(false);
  const idlePollsRef = useRef(0);
  // jobRunIds already present when tracking started. A run in this set predates
  // the current batch, so BatchProgress must not mistake it for a finished job of
  // this run (see runForType) — it would show stale DONE/metadata. 
  const baselineRunIdsRef = useRef<Set<string>>(new Set());

  const runsQuery = useJobRuns(RUNS_PARAMS, tracking ? POLL_MS : false);
  const runMutation = useRunPipeline();
  const runTeamMutation = useRunTeamPipeline();

  // Country picker for the single-team re-analysis. Sourced from the admin-only
  // /admin/jobs/teams (since /teams is USER/PREMIUM-only). If that errors — e.g.
  // an older backend without the route — we fall back to entering the id by hand
  // (teamsQuery.isError) rather than showing an empty dropdown.
  const teamsQuery = useJobTeams();
  const teamOptions = useMemo(
    () =>
      (teamsQuery.data ?? []).map((t) => ({
        value: t.id,
        label: t.fifaCode ? `${teamName(t)}（${t.fifaCode}）` : teamName(t),
      })),
    [teamsQuery.data],
  );

  const runs = runsQuery.data ?? [];
  const byType = latestByType(runs);

  // Stop-polling decision. Only one pipeline runs at a time (shared re-entrancy
  // lock), so "nothing active anywhere" is a reliable finished signal.
  useEffect(() => {
    if (!tracking) return;
    const data = runsQuery.data;
    if (!data) return;
    const anyActive = data.some((r) => isLiveRun(r));
    if (anyActive) {
      sawActiveRef.current = true;
      idlePollsRef.current = 0;
      return;
    }
    idlePollsRef.current += 1;
    if (sawActiveRef.current || idlePollsRef.current >= 2) {
      setTracking(false);
      setNotice({ tone: 'success', text: '更新流程已結束，以下為各工作的最終狀態。' });
    }
    // runsQuery.dataUpdatedAt changes on every successful poll even when the data
    // is structurally identical, so idle polls are counted reliably.
  }, [tracking, runsQuery.data, runsQuery.dataUpdatedAt]);

  const startTracking = (b: Batch) => {
    sawActiveRef.current = false;
    idlePollsRef.current = 0;
    baselineRunIdsRef.current = new Set(runs.map((r) => r.jobRunId));
    setBatch(b);
    setTracking(true);
    void runsQuery.refetch();
  };

  // Adopt a pipeline that was already running when we arrived (e.g. started by
  // cron or another admin). Otherwise `busy` would keep the buttons disabled with
  // nothing polling for completion; picking up tracking makes progress update and
  // re-enables the buttons once it finishes.
  useEffect(() => {
    if (tracking || runMutation.isPending) return;
    if (runsQuery.data?.some((r) => isLiveRun(r))) {
      setNotice({ tone: 'info', text: '偵測到進行中的更新流程，正在追蹤其進度。' });
      startTracking({ label: '進行中的流程', jobTypes: [] });
    }
    // One-shot adoption: the tracking guard above stops it re-firing on each poll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking, runMutation.isPending, runsQuery.data]);

  // Shared failure path for both triggers: a 409 means something is already
  // running (not queued) → adopt its progress; anything else is a plain error.
  const handleRunError = (err: unknown): void => {
    if (err instanceof ApiError && err.code === 'PIPELINE_RUNNING') {
      setNotice({ tone: 'info', text: '已有更新流程進行中，改為追蹤其進度。' });
      startTracking({ label: '進行中的流程', jobTypes: [] });
      return;
    }
    const text = err instanceof ApiError ? err.message : COPY.genericError;
    setNotice({ tone: 'error', text });
  };

  const trigger = (preset: PipelinePreset) => {
    setNotice(null);
    runMutation.mutate(
      { pipeline: preset },
      {
        onSuccess: (res) => {
          setNotice({
            tone: 'info',
            text: `已啟動「${res.label}」，共 ${res.jobTypes.length} 個工作，開始輪詢進度。`,
          });
          startTracking({ label: res.label, jobTypes: res.jobTypes });
        },
        onError: handleRunError,
      },
    );
  };

  const triggerTeam = () => {
    const id = teamId.trim();
    if (!id) return;
    setNotice(null);
    runTeamMutation.mutate(
      { teamId: id, sync: teamSync },
      {
        onSuccess: (res) => {
          setNotice({
            tone: 'info',
            text: `已啟動單獨分析：${res.teamName}（共 ${res.jobTypes.length} 個工作），開始輪詢進度。`,
          });
          startTracking({ label: `單獨分析：${res.teamName}`, jobTypes: res.jobTypes });
        },
        onError: (err) => {
          if (err instanceof ApiError && err.code === 'NOT_FOUND') {
            setNotice({ tone: 'error', text: `找不到球隊 ID「${id}」，請確認後再試。` });
            return;
          }
          handleRunError(err);
        },
      },
    );
  };

  // Disable triggers while *any* pipeline is active — including one already
  // running when we arrived (the backend runs a single pipeline at a time). The
  // adoption effect above turns that active state into live tracking. Note: this
  // deliberately does NOT depend on the runs list loading — a slow or failing
  // history fetch must not lock the triggers or read as "pipeline running".
  const anyRunLive = runs.some((r) => isLiveRun(r));
  const busy = tracking || runMutation.isPending || runTeamMutation.isPending || anyRunLive;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="資料更新"
        description="手動啟動賽事／球隊／球員／新聞的抓取與 AI 評級，並即時輪詢執行進度。"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void runsQuery.refetch()}
            isLoading={runsQuery.isFetching && !tracking}
          >
            重新整理
          </Button>
        }
      />

      {/* Whole-DB triggers. */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-700">全量</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {FULL_PRESETS.map((p) => (
            <PresetCard
              key={p.preset}
              def={p}
              busy={busy}
              pending={runMutation.isPending && runMutation.variables?.pipeline === p.preset}
              onRun={() => trigger(p.preset)}
            />
          ))}
        </div>
      </section>

      {/* Per-domain triggers — one grouped list instead of a card per button.
          Backend runs one pipeline at a time, so any active run disables every row. */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-700">分領域更新</h2>
        <Card className="overflow-hidden">
          <p className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
            建議順序：球員 → 國家／球隊 → 冠軍預測（評分互相參考）；新聞、賽事可隨時單獨跑。
          </p>
          <ul className="divide-y divide-slate-100">
            {DOMAIN_PRESETS.map((p) => (
              <DomainRow
                key={p.preset}
                def={p}
                busy={busy}
                pending={runMutation.isPending && runMutation.variables?.pipeline === p.preset}
                onRun={() => trigger(p.preset)}
              />
            ))}
          </ul>
        </Card>
      </section>

      {/* Single-country re-analysis (docs §2.1). Pick the country from the list;
          the 202 echoes teamName as confirmation. `/teams` is USER/PREMIUM-only,
          so on a 403 we fall back to entering the id by hand. */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-700">單獨分析一個國家</h2>
        <Card>
          <CardBody className="flex flex-col gap-4">
            <p className="text-sm text-slate-500">
              只重算單一國家與其球員（球員評分 → 球隊評分 → 球員近況），比「國家／球隊」更省時。
              從清單選擇要重新分析的國家。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              {teamsQuery.isError || (teamsQuery.isSuccess && teamOptions.length === 0) ? (
                <Input
                  label="球隊 ID"
                  placeholder="seed-team-BRA"
                  className="sm:w-72"
                  value={teamId}
                  disabled={busy}
                  onChange={(e) => setTeamId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') triggerTeam();
                  }}
                />
              ) : (
                <Select
                  label="國家／球隊"
                  className="sm:w-72"
                  placeholder={teamsQuery.isLoading ? '載入球隊清單…' : '選擇球隊…'}
                  options={teamOptions}
                  value={teamId}
                  disabled={busy || teamsQuery.isLoading}
                  onChange={(e) => setTeamId(e.target.value)}
                />
              )}
              <label className="flex h-10 items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={teamSync}
                  disabled={busy}
                  onChange={(e) => setTeamSync(e.target.checked)}
                />
                先抓最新名單
              </label>
              <Button
                variant="outline"
                size="sm"
                disabled={busy || !teamId.trim()}
                isLoading={runTeamMutation.isPending}
                onClick={triggerTeam}
              >
                {busy && !runTeamMutation.isPending ? '流程進行中…' : '重新分析這一隊'}
              </Button>
            </div>
            {teamsQuery.isError && (
              <p className="text-xs text-amber-600">
                無法載入球隊清單，請直接輸入球隊 ID（例如 seed-team-BRA）。
              </p>
            )}
            <p className="text-xs text-slate-400">
              未勾「先抓最新名單」則只用現有資料重算，不呼叫外部來源、更快也不受流量限制。
            </p>
          </CardBody>
        </Card>
      </section>

      {notice && <NoticeBanner tone={notice.tone} text={notice.text} polling={tracking} />}

      {/* This-batch progress: only when we know the ordered job list (from a 202). */}
      {batch && batch.jobTypes.length > 0 && (
        <BatchProgress
          batch={batch}
          byType={byType}
          tracking={tracking}
          baselineRunIds={baselineRunIdsRef.current}
        />
      )}

      {/* Recent runs — always shown; the source of truth for what actually ran. */}
      <Card>
        <CardHeader className="flex items-center justify-between gap-3">
          <CardTitle>最近執行紀錄</CardTitle>
          {tracking && <PollingDot />}
        </CardHeader>
        <CardBody>
          {runsQuery.isLoading ? (
            <LoadingState />
          ) : runsQuery.isError ? (
            <ErrorState error={runsQuery.error} onRetry={() => void runsQuery.refetch()} />
          ) : runs.length === 0 ? (
            <EmptyState message="尚無執行紀錄。點上方按鈕啟動一次更新。" />
          ) : (
            <RunsTable runs={runs} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function PresetCard({
  def,
  busy,
  pending,
  onRun,
}: {
  def: PresetDef;
  busy: boolean;
  pending: boolean;
  onRun: () => void;
}) {
  return (
    <Card className="flex flex-col">
      <CardBody className="flex flex-1 flex-col gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{def.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{def.desc}</p>
        </div>
        <div className="mt-auto pt-2">
          <Button
            variant={def.variant}
            size="sm"
            disabled={busy}
            isLoading={pending}
            onClick={onRun}
          >
            {busy && !pending ? '流程進行中…' : def.cta}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

// Compact row for a per-domain preset: title + flow on the left, trigger on the
// right. Grouped in a single card so the five domains read as one list.
function DomainRow({
  def,
  busy,
  pending,
  onRun,
}: {
  def: PresetDef;
  busy: boolean;
  pending: boolean;
  onRun: () => void;
}) {
  return (
    <li className="flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{def.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{def.desc}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="min-w-32 self-start sm:shrink-0 sm:self-auto"
        disabled={busy}
        isLoading={pending}
        onClick={onRun}
      >
        {busy && !pending ? '流程進行中…' : def.cta}
      </Button>
    </li>
  );
}

function BatchProgress({
  batch,
  byType,
  tracking,
  baselineRunIds,
}: {
  batch: Batch;
  byType: Map<JobType, JobRun>;
  tracking: boolean;
  baselineRunIds: Set<string>;
}) {
  // Only surface a run once a *new* JobRun row exists for this batch. A run whose
  // id was already present when tracking started belongs to a previous pipeline;
  // showing it would report stale DONE/metadata for a job this run hasn't started.
  const runForType = (type: JobType): JobRun | undefined => {
    const run = byType.get(type);
    return run && !baselineRunIds.has(run.jobRunId) ? run : undefined;
  };

  const done = batch.jobTypes.filter((t) => {
    const s = runForType(t)?.status;
    return s === 'DONE' || s === 'FAILED';
  }).length;

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>本次更新進度（{batch.label}）</CardTitle>
        <span className="text-sm tabular-nums text-slate-500">
          {done}/{batch.jobTypes.length} 完成{tracking && <PollingDot className="ml-2 inline-flex" />}
        </span>
      </CardHeader>
      <CardBody>
        <div className="rounded-lg border border-slate-200">
          <Table>
            <THead>
              <TR>
                <TH className="w-12 text-center">#</TH>
                <TH>工作</TH>
                <TH>狀態</TH>
                <TH>摘要</TH>
                <TH>完成時間</TH>
              </TR>
            </THead>
            <TBody>
              {batch.jobTypes.map((type, i) => {
                const run = runForType(type);
                return (
                  <TR key={`${type}-${i}`}>
                    <TD className="text-center text-slate-400">{i + 1}</TD>
                    <TD className="font-medium text-slate-900">{jobTypeLabel(type)}</TD>
                    <TD>
                      {run ? (
                        <StatusBadge run={run} />
                      ) : (
                        <Badge tone="neutral">排隊中</Badge>
                      )}
                    </TD>
                    <TD className="text-slate-600">
                      {run ? summarizeMetadata(run.metadata) : '—'}
                    </TD>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDateTime(run?.completedAt)}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
}

function RunsTable({ runs }: { runs: JobRun[] }) {
  return (
    <div className="rounded-lg border border-slate-200">
      <Table>
        <THead>
          <TR>
            <TH>工作</TH>
            <TH>狀態</TH>
            <TH>摘要</TH>
            <TH>開始時間</TH>
            <TH>完成時間</TH>
          </TR>
        </THead>
        <TBody>
          {runs.map((run) => (
            <TR key={run.jobRunId}>
              <TD className="font-medium text-slate-900">{jobTypeLabel(run.jobType)}</TD>
              <TD>
                <StatusBadge run={run} />
              </TD>
              <TD className="text-slate-600">{summarizeMetadata(run.metadata)}</TD>
              <TD className="whitespace-nowrap text-slate-500">{formatDateTime(run.startedAt)}</TD>
              <TD className="whitespace-nowrap text-slate-500">{formatDateTime(run.completedAt)}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

function StatusBadge({ run }: { run: JobRun }) {
  const meta = isStaleActive(run)
    ? ({ label: '逾時', tone: 'warning' } as const)
    : STATUS_META[run.status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

const NOTICE_STYLES: Record<'info' | 'error' | 'success', string> = {
  info: 'border-brand-200 bg-brand-50 text-brand-800',
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-800',
};

function NoticeBanner({
  tone,
  text,
  polling,
}: {
  tone: 'info' | 'error' | 'success';
  text: string;
  polling: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${NOTICE_STYLES[tone]}`}>
      {polling && <PollingDot />}
      <span>{text}</span>
    </div>
  );
}

function PollingDot({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-slate-500 ${className}`}>
      <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
      輪詢中
    </span>
  );
}
