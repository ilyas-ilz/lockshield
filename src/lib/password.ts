import bcrypt from "bcryptjs";

// WHY: 12 rounds = mern-security "STANDARD" tier (10 is prototype-only,
// 12+ is the production floor as hashing hardware gets cheaper).
const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

const MIN_LENGTH = 10;

/** Server-side password strength check — never trust client-side-only validation. */
export function isPasswordStrong(plain: string): { ok: true } | { ok: false; reason: string } {
  if (plain.length < MIN_LENGTH) {
    return { ok: false, reason: `Password must be at least ${MIN_LENGTH} characters` };
  }
  if (!/[a-z]/.test(plain) || !/[A-Z]/.test(plain) || !/[0-9]/.test(plain)) {
    return { ok: false, reason: "Password must include upper, lower case letters and a number" };
  }
  return { ok: true };
}
