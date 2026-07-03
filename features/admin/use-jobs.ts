'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchJobRuns, runPipeline } from '@/features/admin/jobs-api';
import type { JobRunsQuery, RunPipelineRequest } from '@/types/api';

const jobRunsKey = (params: JobRunsQuery) => ['admin', 'job-runs', params] as const;
const runPipelineKey = ['admin', 'run-pipeline'] as const;

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
