import type { ApiErrorBody } from '@/types/api';

const TOKEN_STORAGE_KEY = 'charity.accessToken';

/**
 * Base URL of the REST API.
 *
 * Defaults to `/api`, which `vite.config.ts` proxies to the backend during
 * development. Override it with `VITE_API_BASE_URL` when the API is hosted
 * on a different origin.
 */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '');

/**
 * An error carrying the HTTP status and the per-field messages the backend
 * returns from its validation pipe, so forms can highlight the exact inputs.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: string[];

  constructor(status: number, message: string, errors: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  /** True when the session is missing or expired and the user must sign in. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

/** Notified whenever a request fails with 401, so the app can sign out. */
type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

export const tokenStorage = {
  get(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      // Private browsing modes can throw on access; treat it as "no token".
      return null;
    }
  },

  set(token: string): void {
    try {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // Persisting is best-effort; the in-memory session still works.
    }
  },

  clear(): void {
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Nothing to do.
    }
  },
};

export type QueryValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, QueryValue>;

function buildUrl(path: string, params?: QueryParams): string {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  if (!params) return url;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    // Blank filters are dropped so an empty search box does not narrow results.
    if (value === undefined || value === null || value === '') continue;
    search.append(key, String(value));
  }

  const queryString = search.toString();
  return queryString ? `${url}?${queryString}` : url;
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: Partial<ApiErrorBody> | null = null;

  try {
    body = (await response.json()) as Partial<ApiErrorBody>;
  } catch {
    // A non-JSON error body (proxy error page, gateway timeout, ...).
  }

  return new ApiError(
    response.status,
    body?.message ?? `The request failed with status ${response.status}.`,
    body?.errors ?? [],
  );
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  params?: QueryParams;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, signal } = options;
  const token = tokenStorage.get();

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    // An aborted request is a normal part of React Query's cancellation flow.
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  if (response.status === 204) return undefined as T;

  if (!response.ok) {
    const apiError = await toApiError(response);
    if (apiError.isUnauthorized) onUnauthorized?.();
    throw apiError;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get<T>(path: string, params?: QueryParams, signal?: AbortSignal): Promise<T> {
    return request<T>(path, { method: 'GET', params, signal });
  },

  post<T>(path: string, body: unknown, params?: QueryParams): Promise<T> {
    return request<T>(path, { method: 'POST', body, params });
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' });
  },

  buildUrl,
};

/**
 * Triggers a browser download for an authenticated endpoint.
 *
 * `fetch` is used instead of a plain link because the request needs the
 * `Authorization` header; the response is then handed to a temporary object
 * URL so the browser saves it rather than navigating to it.
 */
export async function downloadFile(path: string, params?: QueryParams): Promise<void> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(buildUrl(path, params), { headers });

  if (!response.ok) {
    const apiError = await toApiError(response);
    if (apiError.isUnauthorized) onUnauthorized?.();
    throw apiError;
  }

  const blob = await response.blob();
  const fileName = readFileName(response.headers.get('Content-Disposition')) ?? 'download.csv';

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function readFileName(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;

  const match = /filename="([^"]+)"/.exec(contentDisposition);
  return match?.[1] ?? null;
}
