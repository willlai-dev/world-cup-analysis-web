import { BACKEND_API_URL } from '@/lib/constants';
import type { ApiResponse, PaginationMeta } from '@/types/api';

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: QueryParams;
  body?: unknown;
  // Forwarded by server components (e.g. cookie header). Browser ignores these.
  headers?: Record<string, string>;
  signal?: AbortSignal;
  cache?: RequestCache;
};

export type ApiResult<T> = { data: T; meta?: Record<string, unknown> };

function resolveBase(): string {
  // Browser → same-origin proxy (cookies stay first-party, no CORS).
  // Server (SSR/guards) → call the real backend directly with a forwarded cookie.
  if (typeof window !== 'undefined') return `${window.location.origin}/api`;
  return BACKEND_API_URL;
}

function buildUrl(path: string, query?: QueryParams): string {
  const base = path.startsWith('http') ? path : `${resolveBase()}${path}`;
  if (!query) return base;
  const url = new URL(base);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const { method = 'GET', query, body, headers, signal, cache } = options;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      credentials: 'include',
      cache: cache ?? 'no-store',
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    throw new ApiError(0, 'NETWORK_ERROR', '無法連線到伺服器，請稍後再試。', cause);
  }

  // 204 No Content.
  if (response.status === 204) {
    return { data: undefined as T };
  }

  let payload: ApiResponse<T> | null = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text) as ApiResponse<T>;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const err = payload && 'error' in payload ? payload.error : null;
    throw new ApiError(
      response.status,
      err?.code ?? `HTTP_${response.status}`,
      err?.message ?? `請求失敗 (${response.status})`,
      err?.details,
    );
  }

  if (!payload) {
    throw new ApiError(response.status, 'EMPTY_RESPONSE', '伺服器回傳空白內容。');
  }

  if (payload.error) {
    throw new ApiError(
      response.status,
      payload.error.code,
      payload.error.message,
      payload.error.details,
    );
  }

  return { data: payload.data, meta: payload.meta };
}

// Convenience that drops meta when the caller only needs the data payload.
export async function apiData<T>(path: string, options?: RequestOptions): Promise<T> {
  const { data } = await apiFetch<T>(path, options);
  return data;
}

export function getPagination(meta?: Record<string, unknown>): PaginationMeta | undefined {
  if (!meta || typeof meta !== 'object') return undefined;
  const pagination = (meta as { pagination?: PaginationMeta }).pagination;
  return pagination;
}
