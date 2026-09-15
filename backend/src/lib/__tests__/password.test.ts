import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, isPasswordStrong } from "../password";

describe("password", () => {
  it("hashes and verifies a matching password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(hash).not.toBe("Sup3rSecret!");
    await expect(verifyPassword("Sup3rSecret!", hash)).resolves.toBe(true);
  });

  it("rejects a non-matching password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    await expect(verifyPassword("WrongPassword1", hash)).resolves.toBe(false);
  });

  it("produces a different hash each time (unique salt)", async () => {
    const [a, b] = await Promise.all([hashPassword("Sup3rSecret!"), hashPassword("Sup3rSecret!")]);
    expect(a).not.toBe(b);
  });

  it("rejects passwords under the minimum length", () => {
    const result = isPasswordStrong("Sh0rt");
    expect(result.ok).toBe(false);
  });

  it("rejects passwords missing a required character class", () => {
    expect(isPasswordStrong("alllowercase123").ok).toBe(false);
    expect(isPasswordStrong("ALLUPPERCASE123").ok).toBe(false);
    expect(isPasswordStrong("NoDigitsHereAtAll").ok).toBe(false);
  });

  it("accepts a strong password", () => {
    expect(isPasswordStrong("GoodPassword123").ok).toBe(true);
  });
});
