// WHY: brute-force account lockout, kept as pure functions so it's unit
// testable without touching Mongoose or the DB. The User model stores
// failedLoginAttempts/lockUntil; these functions decide what those values
// should become on each login attempt.

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export interface LockoutState {
  failedLoginAttempts: number;
  lockUntil: Date | null;
}

export function isLocked(state: Pick<LockoutState, "lockUntil">, now: Date = new Date()): boolean {
  return !!state.lockUntil && state.lockUntil.getTime() > now.getTime();
}

/** Call after a failed password check. Locks the account once MAX_ATTEMPTS is hit. */
export function recordFailedAttempt(state: LockoutState, now: Date = new Date()): LockoutState {
  const attempts = state.failedLoginAttempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    return { failedLoginAttempts: attempts, lockUntil: new Date(now.getTime() + LOCK_DURATION_MS) };
  }
  return { failedLoginAttempts: attempts, lockUntil: null };
}

/** Call after a successful login. Always fully resets lockout state. */
export function resetLockout(): LockoutState {
  return { failedLoginAttempts: 0, lockUntil: null };
}

export { MAX_ATTEMPTS, LOCK_DURATION_MS };
