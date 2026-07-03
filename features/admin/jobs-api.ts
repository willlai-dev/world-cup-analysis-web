import { apiData } from '@/lib/api-client';
import type {
  JobRun,
  JobRunsQuery,
  RunPipelineRequest,
  RunPipelineResponse,
} from '@/types/api';

// POST /admin/jobs/run — ADMIN only (docs/ADMIN_MANUAL_JOBS_FRONTEND.md §2).
// Returns 202 immediately; the pipeline runs in the background. A 409
// PIPELINE_RUNNING (already running — not queued) surfaces as an ApiError with
// code 'PIPELINE_RUNNING' for the caller to branch on. An empty body === FULL.
export function runPipeline(body: RunPipelineRequest = {}): Promise<RunPipelineResponse> {
  return apiData<RunPipelineResponse>('/admin/jobs/run', { method: 'POST', body });
}

// GET /admin/jobs/runs — recent JobRun records, newest first (§3). Poll this while
// a pipeline is in flight to render per-job progress.
export function fetchJobRuns(
  params: JobRunsQuery = {},
  signal?: AbortSignal,
): Promise<JobRun[]> {
  return apiData<JobRun[]>('/admin/jobs/runs', {
    query: { limit: params.limit, jobType: params.jobType },
    signal,
  });
}
