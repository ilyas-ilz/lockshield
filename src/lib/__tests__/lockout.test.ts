import { describe, it, expect } from "vitest";
import { isLocked, recordFailedAttempt, resetLockout, MAX_ATTEMPTS, LOCK_DURATION_MS } from "../lockout";

describe("lockout", () => {
  it("is not locked with no lockUntil", () => {
    expect(isLocked({ lockUntil: null })).toBe(false);
  });

  it("is locked when lockUntil is in the future", () => {
    const future = new Date(Date.now() + 60_000);
    expect(isLocked({ lockUntil: future })).toBe(true);
  });

  it("is not locked when lockUntil is in the past", () => {
    const past = new Date(Date.now() - 60_000);
    expect(isLocked({ lockUntil: past })).toBe(false);
  });

  it("increments attempts without locking below the threshold", () => {
    const state = { failedLoginAttempts: 0, lockUntil: null };
    const next = recordFailedAttempt(state);
    expect(next.failedLoginAttempts).toBe(1);
    expect(next.lockUntil).toBeNull();
  });

  it("locks the account exactly at MAX_ATTEMPTS", () => {
    const state = { failedLoginAttempts: MAX_ATTEMPTS - 1, lockUntil: null };
    const now = new Date();
    const next = recordFailedAttempt(state, now);
    expect(next.failedLoginAttempts).toBe(MAX_ATTEMPTS);
    expect(next.lockUntil).not.toBeNull();
    expect(next.lockUntil!.getTime()).toBe(now.getTime() + LOCK_DURATION_MS);
  });

  it("keeps locking (extends) on further failed attempts past the threshold", () => {
    const state = { failedLoginAttempts: MAX_ATTEMPTS, lockUntil: new Date() };
    const next = recordFailedAttempt(state);
    expect(next.failedLoginAttempts).toBe(MAX_ATTEMPTS + 1);
    expect(next.lockUntil).not.toBeNull();
  });

  it("fully resets on success", () => {
    expect(resetLockout()).toEqual({ failedLoginAttempts: 0, lockUntil: null });
  });
});
