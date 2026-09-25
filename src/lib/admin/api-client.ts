"use client";

// WHY a thin wrapper, not axios: same-origin fetch already sends the
// Auth.js session cookie, and every API route returns the same
// { success, data } / { success: false, error } envelope (lib/http.ts) —
// this just unwraps that consistently and throws a readable Error on
// failure so callers can try/catch once instead of checking `.success`
// everywhere.
export class ApiClientError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new ApiClientError(body.error ?? `Request failed (${res.status})`, res.status, body.details);
  }
  return body.data as T;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

/** The per-field problems behind a 400 "Validation failed" (full dotted paths, see lib/http.ts). */
export function validationIssues(err: unknown): ValidationIssue[] {
  if (!(err instanceof ApiClientError)) return [];
  const issues = (err.details as { issues?: unknown } | undefined)?.issues;
  return Array.isArray(issues) ? (issues as ValidationIssue[]) : [];
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(data) }),
  patch: <T>(path: string, data: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
