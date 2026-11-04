import { describe, it, expect } from "vitest";
import { firstName, QUOTE_NEXT_STEPS } from "../success-copy";

describe("firstName", () => {
  it("takes the first word of a full name", () => {
    expect(firstName("muhammed ilyas mk")).toBe("muhammed");
  });

  it("ignores leading and repeated whitespace", () => {
    expect(firstName("   Sara   Al Hashimi ")).toBe("Sara");
  });

  it("returns an empty string for a blank name so callers can drop the greeting", () => {
    expect(firstName("   ")).toBe("");
    expect(firstName("")).toBe("");
  });
});

describe("QUOTE_NEXT_STEPS", () => {
  it("lists the follow-up steps in order, starting with the call-back", () => {
    expect(QUOTE_NEXT_STEPS.length).toBeGreaterThan(0);
    expect(QUOTE_NEXT_STEPS[0]).toMatch(/call/i);
  });
});
