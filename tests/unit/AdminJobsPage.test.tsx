import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import AdminJobsPage from '@/app/(admin)/admin/jobs/page';
import { server } from '@/tests/mocks/server';
import { API, ok } from '@/tests/mocks/handlers';
import { renderWithProviders, setAuthRole } from '@/tests/utils';
import type { JobRun } from '@/types/api';

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

function accepted(label: string, jobTypes: string[]) {
  return HttpResponse.json(
    { data: { started: true, label, jobTypes }, error: null },
    { status: 202 },
  );
}

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

  it('surfaces a permission notice when the runs endpoint 403s', async () => {
    setAuthRole('ADMIN');
    // Default handler already 403s the runs endpoint.
    renderWithProviders(<AdminJobsPage />);

    await waitFor(() =>
      expect(screen.getByText('你的帳號目前無法使用此功能。')).toBeInTheDocument(),
    );
  });
});
