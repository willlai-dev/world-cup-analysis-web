import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import AdminJobsPage from '@/app/(admin)/admin/jobs/page';
import { server } from '@/tests/mocks/server';
import { API, ok } from '@/tests/mocks/handlers';
import { renderWithProviders, setAuthRole } from '@/tests/utils';
import type { JobRun, JobType } from '@/types/api';

const recentRuns: JobRun[] = [
  {
    jobRunId: 'r2',
    jobType: 'GENERATE_TEAM_RATINGS',
    status: 'DONE',
    startedAt: '2026-07-03T04:01:00.000Z',
    completedAt: '2026-07-03T04:01:30.000Z',
    metadata: { scope: 'team', scanned: 32, generated: 10, skipped: 22, failed: 0 },
  },
  {
    jobRunId: 'r1',
    jobType: 'SYNC_TEAMS',
    status: 'DONE',
    startedAt: '2026-07-03T04:00:00.000Z',
    completedAt: '2026-07-03T04:00:03.000Z',
    metadata: { source: 'football-data', fetched: 48, created: 48, updated: 0 },
  },
];

function accepted(label: string, jobTypes: JobType[]) {
  return HttpResponse.json(
    { data: { started: true, label, jobTypes }, error: null },
    { status: 202 },
  );
}

function acceptedTeam(teamId: string, teamName: string, jobTypes: JobType[]) {
  return HttpResponse.json(
    { data: { started: true, teamId, teamName, jobTypes }, error: null },
    { status: 202 },
  );
}

// Options served by GET /admin/jobs/teams (the admin-readable picker source).
const teamOptions = [
  { id: 'team-fra', nameEn: 'France', nameZh: '法國', fifaCode: 'FRA' },
  { id: 'team-arg', nameEn: 'Argentina', nameZh: '阿根廷', fifaCode: 'ARG' },
];

describe('AdminJobsPage', () => {
  it('renders the three preset triggers and the recent-runs table', async () => {
    setAuthRole('ADMIN');
    server.use(http.get(`${API}/admin/jobs/runs`, () => ok(recentRuns)));

    renderWithProviders(<AdminJobsPage />);

    expect(await screen.findByRole('button', { name: '啟動全量更新' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '啟動只抓資料' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '啟動只重算 AI' })).toBeInTheDocument();

    // Recent runs surface with localized job labels and a status badge.
    await waitFor(() => expect(screen.getByText('同步球隊')).toBeInTheDocument());
    expect(screen.getByText('球隊評分')).toBeInTheDocument();
    expect(screen.getAllByText('完成').length).toBeGreaterThan(0);
  });

  it('triggers a FULL pipeline and shows per-job batch progress', async () => {
    setAuthRole('ADMIN');
    server.use(
      http.get(`${API}/admin/jobs/runs`, () => ok(recentRuns)),
      http.post(`${API}/admin/jobs/run`, () =>
        accepted('manual-full', ['SYNC_TEAMS', 'SYNC_PLAYERS', 'GENERATE_TEAM_RATINGS']),
      ),
    );

    renderWithProviders(<AdminJobsPage />);

    await userEvent.click(await screen.findByRole('button', { name: '啟動全量更新' }));

    await waitFor(() =>
      expect(screen.getByText(/已啟動「manual-full」/)).toBeInTheDocument(),
    );
    // The ordered job list from the 202 renders as a tracked progress table.
    expect(screen.getByText(/本次更新進度/)).toBeInTheDocument();
    expect(screen.getByText('同步球員')).toBeInTheDocument();
  });

  it('triggers a per-domain (PLAYERS) preset', async () => {
    setAuthRole('ADMIN');
    let sentPreset: string | undefined;
    server.use(
      http.get(`${API}/admin/jobs/runs`, () => ok(recentRuns)),
      http.post(`${API}/admin/jobs/run`, async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { pipeline?: string };
        sentPreset = body.pipeline;
        return accepted('manual-players', [
          'SYNC_PLAYERS',
          'GENERATE_PLAYER_RATINGS',
          'GENERATE_PLAYER_STATUS',
        ]);
      }),
    );

    renderWithProviders(<AdminJobsPage />);

    await userEvent.click(await screen.findByRole('button', { name: '更新球員' }));

    await waitFor(() => expect(sentPreset).toBe('PLAYERS'));
    await waitFor(() =>
      expect(screen.getByText(/已啟動「manual-players」/)).toBeInTheDocument(),
    );
    expect(screen.getByText('球員近況')).toBeInTheDocument();
  });

  it('shows a tracking notice when a pipeline is already running (409)', async () => {
    setAuthRole('ADMIN');
    server.use(
      http.get(`${API}/admin/jobs/runs`, () => ok(recentRuns)),
      http.post(`${API}/admin/jobs/run`, () =>
        HttpResponse.json(
          { data: null, error: { code: 'PIPELINE_RUNNING', message: '流程進行中' } },
          { status: 409 },
        ),
      ),
    );

    renderWithProviders(<AdminJobsPage />);

    await userEvent.click(await screen.findByRole('button', { name: '啟動只抓資料' }));

    await waitFor(() =>
      expect(screen.getByText('已有更新流程進行中，改為追蹤其進度。')).toBeInTheDocument(),
    );
  });

  it('shows batch jobs as queued, not stale DONE from a previous run', async () => {
    setAuthRole('ADMIN');
    // recentRuns already has DONE rows for SYNC_TEAMS and GENERATE_TEAM_RATINGS.
    // A freshly-triggered FULL batch must not borrow those as its own progress.
    server.use(
      http.get(`${API}/admin/jobs/runs`, () => ok(recentRuns)),
      http.post(`${API}/admin/jobs/run`, () =>
        accepted('manual-full', ['SYNC_TEAMS', 'SYNC_PLAYERS', 'GENERATE_TEAM_RATINGS']),
      ),
    );

    renderWithProviders(<AdminJobsPage />);

    await userEvent.click(await screen.findByRole('button', { name: '啟動全量更新' }));

    await waitFor(() => expect(screen.getByText(/本次更新進度/)).toBeInTheDocument());
    // All three rows queue: none inherits the previous run's DONE badge/metadata.
    // "排隊中" appears only in the batch table, never in the recent-runs table.
    expect(screen.getAllByText('排隊中')).toHaveLength(3);
  });

  it('adopts a pipeline already running on load: disables triggers and tracks it', async () => {
    setAuthRole('ADMIN');
    const running: JobRun[] = [
      {
        jobRunId: 'live1',
        jobType: 'SYNC_TEAMS',
        status: 'RUNNING',
        // Must be genuinely recent so it counts as live, not a stale zombie.
        startedAt: new Date().toISOString(),
        completedAt: null,
        metadata: {},
      },
    ];
    server.use(http.get(`${API}/admin/jobs/runs`, () => ok(running)));

    renderWithProviders(<AdminJobsPage />);

    await waitFor(() =>
      expect(
        screen.getByText('偵測到進行中的更新流程，正在追蹤其進度。'),
      ).toBeInTheDocument(),
    );
    // Every trigger reads as busy and is disabled while the adopted run is active.
    const triggers = screen.getAllByRole('button', { name: '流程進行中…' });
    expect(triggers.length).toBeGreaterThan(0);
    triggers.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('ignores a stale (zombie) RUNNING run: triggers stay usable, shown as 逾時', async () => {
    setAuthRole('ADMIN');
    // A GENERATE_NEWS_SUMMARY orphaned in RUNNING days ago (backend crashed mid-job).
    // It must not lock the console the way a live pipeline would.
    const zombie: JobRun[] = [
      {
        jobRunId: 'zombie1',
        jobType: 'GENERATE_NEWS_SUMMARY',
        status: 'RUNNING',
        startedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        metadata: {},
      },
    ];
    server.use(http.get(`${API}/admin/jobs/runs`, () => ok(zombie)));

    renderWithProviders(<AdminJobsPage />);

    // Trigger stays enabled — a day-old orphan can't brick the page.
    expect(await screen.findByRole('button', { name: '啟動全量更新' })).toBeEnabled();
    // …and no adoption/tracking kicks in for a dead run.
    expect(
      screen.queryByText('偵測到進行中的更新流程，正在追蹤其進度。'),
    ).not.toBeInTheDocument();
    // Surfaced honestly as 逾時, never 執行中.
    expect(await screen.findByText('逾時')).toBeInTheDocument();
    expect(screen.queryByText('執行中')).not.toBeInTheDocument();
  });

  it('re-analyzes a single country picked from the team dropdown', async () => {
    setAuthRole('ADMIN');
    let calledTeamId: string | undefined;
    let sentBody: { sync?: boolean } | undefined;
    server.use(
      http.get(`${API}/admin/jobs/runs`, () => ok(recentRuns)),
      http.get(`${API}/admin/jobs/teams`, () => ok(teamOptions)),
      http.post(`${API}/admin/jobs/run-team/:teamId`, async ({ params, request }) => {
        calledTeamId = params.teamId as string;
        sentBody = (await request.json().catch(() => ({}))) as { sync?: boolean };
        return acceptedTeam('team-arg', '阿根廷', [
          'GENERATE_PLAYER_RATINGS',
          'GENERATE_TEAM_RATINGS',
          'GENERATE_PLAYER_STATUS',
        ]);
      }),
    );

    renderWithProviders(<AdminJobsPage />);

    // Trigger is disabled until a country is chosen from the list.
    const runBtn = await screen.findByRole('button', { name: '重新分析這一隊' });
    expect(runBtn).toBeDisabled();

    const select = await screen.findByLabelText('國家／球隊');
    // Options come from GET /teams (default handler → France / Argentina).
    await screen.findByRole('option', { name: /阿根廷/ });
    await userEvent.selectOptions(select, 'team-arg');
    await userEvent.click(screen.getByRole('button', { name: '重新分析這一隊' }));

    await waitFor(() => expect(calledTeamId).toBe('team-arg'));
    expect(sentBody).toEqual({ sync: true }); // checkbox defaults to on
    await waitFor(() =>
      expect(screen.getByText(/已啟動單獨分析：阿根廷/)).toBeInTheDocument(),
    );
    // The scoped job list renders as tracked progress. Assert on a label unique
    // to the batch (球員近況), not one also present in the recent-runs table.
    expect(screen.getByText(/本次更新進度（單獨分析：阿根廷）/)).toBeInTheDocument();
    expect(screen.getByText('球員近況')).toBeInTheDocument();
  });

  it('sends sync=false when the "先抓最新名單" box is unchecked', async () => {
    setAuthRole('ADMIN');
    let sentBody: { sync?: boolean } | undefined;
    server.use(
      http.get(`${API}/admin/jobs/runs`, () => ok(recentRuns)),
      http.get(`${API}/admin/jobs/teams`, () => ok(teamOptions)),
      http.post(`${API}/admin/jobs/run-team/:teamId`, async ({ request }) => {
        sentBody = (await request.json().catch(() => ({}))) as { sync?: boolean };
        return acceptedTeam('team-arg', '阿根廷', ['GENERATE_TEAM_RATINGS']);
      }),
    );

    renderWithProviders(<AdminJobsPage />);

    const select = await screen.findByLabelText('國家／球隊');
    await screen.findByRole('option', { name: /阿根廷/ });
    await userEvent.selectOptions(select, 'team-arg');
    await userEvent.click(screen.getByRole('checkbox', { name: /先抓最新名單/ }));
    await userEvent.click(screen.getByRole('button', { name: '重新分析這一隊' }));

    await waitFor(() => expect(sentBody).toEqual({ sync: false }));
  });

  it('shows a not-found notice when the team is unknown (404)', async () => {
    setAuthRole('ADMIN');
    server.use(
      http.get(`${API}/admin/jobs/runs`, () => ok(recentRuns)),
      http.get(`${API}/admin/jobs/teams`, () => ok(teamOptions)),
      http.post(`${API}/admin/jobs/run-team/:teamId`, () =>
        HttpResponse.json(
          { data: null, error: { code: 'NOT_FOUND', message: 'team not found' } },
          { status: 404 },
        ),
      ),
    );

    renderWithProviders(<AdminJobsPage />);

    const select = await screen.findByLabelText('國家／球隊');
    await screen.findByRole('option', { name: /法國/ });
    await userEvent.selectOptions(select, 'team-fra');
    await userEvent.click(screen.getByRole('button', { name: '重新分析這一隊' }));

    await waitFor(() =>
      expect(screen.getByText(/找不到球隊 ID「team-fra」/)).toBeInTheDocument(),
    );
  });

  it('falls back to a manual id input when the team list is unavailable', async () => {
    setAuthRole('ADMIN');
    // Simulate an older backend without /admin/jobs/teams (or any load failure).
    server.use(
      http.get(`${API}/admin/jobs/runs`, () => ok(recentRuns)),
      http.get(`${API}/admin/jobs/teams`, () =>
        HttpResponse.json(
          { data: null, error: { code: 'NOT_FOUND', message: 'not found' } },
          { status: 404 },
        ),
      ),
      http.post(`${API}/admin/jobs/run-team/:teamId`, () =>
        acceptedTeam('seed-team-BRA', '巴西', ['GENERATE_TEAM_RATINGS']),
      ),
    );

    renderWithProviders(<AdminJobsPage />);

    // No dropdown — a manual id field replaces it when the list can't load.
    const input = await screen.findByLabelText('球隊 ID');
    expect(screen.queryByLabelText('國家／球隊')).not.toBeInTheDocument();

    await userEvent.type(input, 'seed-team-BRA');
    await userEvent.click(screen.getByRole('button', { name: '重新分析這一隊' }));

    await waitFor(() =>
      expect(screen.getByText(/已啟動單獨分析：巴西/)).toBeInTheDocument(),
    );
  });

  it('surfaces a permission notice when the runs endpoint 403s', async () => {
    setAuthRole('ADMIN');
    // Default handler already 403s the runs endpoint.
    renderWithProviders(<AdminJobsPage />);

    await waitFor(() =>
      expect(screen.getByText('你的帳號目前無法使用此功能。')).toBeInTheDocument(),
    );
  });
});
