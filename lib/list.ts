import { apiFetch, getPagination, type QueryParams } from '@/lib/api-client';
import type { PaginationMeta } from '@/types/api';

export type ListResult<T> = {
  items: T[];
  pagination?: PaginationMeta;
};

// Shared helper for paginated list endpoints that return T[] in `data`
// and pagination in `meta.pagination`.
export async function fetchList<T>(
  path: string,
  query: QueryParams,
  signal?: AbortSignal,
): Promise<ListResult<T>> {
  const { data, meta } = await apiFetch<T[]>(path, { query, signal });
  return { items: data, pagination: getPagination(meta) };
}

// Drops empty-string filters so they aren't sent as query params.
export function cleanParams<T extends Record<string, unknown>>(params: T): QueryParams {
  const out: QueryParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    out[key] = value as string | number | boolean;
  }
  return out;
}
