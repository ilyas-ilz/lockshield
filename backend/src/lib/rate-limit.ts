/**
 * In-memory sliding-window rate limiter.
 *
 * WHY in-memory: zero extra infra for the current traffic level (one admin
 * login form, one public lead form). Sufficient on a single long-running
 * Node process (VPS/Docker) or Vercel dev.
 *
 * KNOWN LIMITATION: on Vercel's serverless deployment each function
 * invocation can land on a different instance with its own memory, so this
 * limiter is *per-instance*, not global — a determined attacker distributed
 * across instances could exceed the nominal limit. Acceptable for launch
 * given current traffic; if abuse shows up in Lead volume or auth logs,
 * swap this module's internals for Upstash Redis (`@upstash/ratelimit`)
 * without touching call sites — same `checkRateLimit()` signature.
 */

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

// WHY: without this, `buckets` grows forever on Node processes that stay
// warm a long time (VPS/Docker). Sweep old entries every 10 minutes.
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;
let lastSweep = Date.now();

function sweep(now: number, maxWindowMs: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < maxWindowMs);
    if (bucket.timestamps.length === 0) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= maxRequests) {
    buckets.set(key, bucket);
    return { allowed: false, remaining: 0, resetAt: bucket.timestamps[0]! + windowMs };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return { allowed: true, remaining: maxRequests - bucket.timestamps.length, resetAt: now + windowMs };
}

// Named presets so call sites read as intent, not magic numbers.
export const RATE_LIMITS = {
  login: { max: 10, windowMs: 15 * 60 * 1000 }, // 10 attempts / 15 min / IP+email
  leadSubmit: { max: 5, windowMs: 10 * 60 * 1000 }, // 5 submissions / 10 min / IP
  apiWrite: { max: 60, windowMs: 60 * 1000 }, // 60 writes / min / user, generic abuse ceiling
} as const;

export function getClientIp(headers: Headers): string {
  // WHY: Vercel/most proxies set x-forwarded-for as "client, proxy1, proxy2"
  // — the first entry is the original client.
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
