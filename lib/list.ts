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

// Page size used when fetching a full list. The backend caps product-list
// pageSize (admin lists cap at 100), so `fetchAll` walks every page instead of
// requesting one huge page.
const FETCH_ALL_PAGE_SIZE = 100;

// Fetches every page of a paginated list endpoint and concatenates the items.
// Used by list pages that show all results at once (no pagination UI).
export async function fetchAll<T>(
  path: string,
  query: QueryParams,
  signal?: AbortSignal,
): Promise<ListResult<T>> {
  const first = await apiFetch<T[]>(path, {
    query: { ...query, page: 1, pageSize: FETCH_ALL_PAGE_SIZE },
    signal,
  });
  const items = [...first.data];
  const totalPages = getPagination(first.meta)?.totalPages ?? 1;

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        apiFetch<T[]>(path, {
          query: { ...query, page: i + 2, pageSize: FETCH_ALL_PAGE_SIZE },
          signal,
        }),
      ),
    );
    for (const page of rest) items.push(...page.data);
  }

  // Deduplicate by `id` to guard against backend pagination instability
  // (the same record appearing on multiple pages when sort order is unstable).
  const seen = new Set<unknown>();
  const unique = items.filter((item) => {
    const id = (item as Record<string, unknown>).id;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return { items: unique };
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
