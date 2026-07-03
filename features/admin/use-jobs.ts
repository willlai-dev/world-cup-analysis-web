'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchJobRuns,
  fetchJobTeams,
  runPipeline,
  runTeamPipeline,
} from '@/features/admin/jobs-api';
import type { JobRunsQuery, RunPipelineRequest } from '@/types/api';

const jobRunsKey = (params: JobRunsQuery) => ['admin', 'job-runs', params] as const;
const runPipelineKey = ['admin', 'run-pipeline'] as const;
const runTeamKey = ['admin', 'run-team'] as const;

// Recent job-run records. `refetchInterval` is owned by the caller: pass a number
// (ms) while a pipeline is being tracked, or `false` to poll only on mount /
// manual refetch. There is no "pipeline complete" event — the page decides when
// to stop polling from the per-job statuses (see docs §4).
export function useJobRuns(params: JobRunsQuery, refetchInterval: number | false) {
  return useQuery({
    queryKey: jobRunsKey(params),
    queryFn: ({ signal }) => fetchJobRuns(params, signal),
    refetchInterval,
    refetchOnWindowFocus: false,
  });
}

// Triggers a pipeline. Kept keyed so onSettled can refresh the runs list. A 409
// PIPELINE_RUNNING is an expected outcome (something else is already running),
// so the caller handles it in onError rather than treating it as a hard failure.
export function useRunPipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: runPipelineKey,
    mutationFn: (body: RunPipelineRequest) => runPipeline(body),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin', 'job-runs'] }),
  });
}

// Team list for the single-country picker (docs §2.1). Sourced from the
// admin-guarded /admin/jobs/teams because /teams is USER/PREMIUM-only. On error
// (older backend without this route, or a 403) the page falls back to id entry.
export function useJobTeams() {
  return useQuery({
    queryKey: ['admin', 'job-teams'],
    queryFn: ({ signal }) => fetchJobTeams(signal),
    staleTime: 5 * 60_000,
    // Don't retry: if the list can't load (older backend / error), surface the
    // manual-id fallback promptly instead of stalling the picker on retries.
    retry: false,
  });
}

// Re-analyze a single country/team (docs §2.1). Shares the same one-pipeline lock
// as useRunPipeline, so a 409 PIPELINE_RUNNING is likewise an expected outcome;
// 404 NOT_FOUND (unknown teamId) is handled by the caller too.
export function useRunTeamPipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: runTeamKey,
    mutationFn: ({ teamId, sync }: { teamId: string; sync?: boolean }) =>
      runTeamPipeline(teamId, { sync }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin', 'job-runs'] }),
  });
}
