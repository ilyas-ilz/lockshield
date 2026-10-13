import { describe, it, expect } from "vitest";
import { leadCreateSchema } from "../lead";

const base = { source: "contact", name: "Ahmed" } as const;

describe("leadCreateSchema", () => {
  it("accepts a phone-only quote request (email is optional on the quote forms)", () => {
    const lead = leadCreateSchema.parse({ ...base, phone: "+971 50 123 4567", serviceInterest: "FM-200 / Clean Agent System" });
    expect(lead.email).toBeUndefined();
    expect(lead.phone).toBe("+971 50 123 4567");
  });

  it("treats a blank email as not provided rather than invalid", () => {
    const lead = leadCreateSchema.parse({ ...base, phone: "0501234567", email: "   " });
    expect(lead.email).toBeUndefined();
  });

  it("accepts an email-only lead", () => {
    expect(leadCreateSchema.parse({ ...base, email: "a@b.ae" }).email).toBe("a@b.ae");
  });

  it("rejects a lead with no way to contact the visitor", () => {
    expect(() => leadCreateSchema.parse({ ...base })).toThrow();
    expect(() => leadCreateSchema.parse({ ...base, phone: "  ", email: "" })).toThrow();
  });

  it("accepts a filled honeypot so the route can drop it silently instead of telling the bot", () => {
    const lead = leadCreateSchema.parse({ ...base, phone: "0501234567", honeypot: "Acme Ltd" });
    expect(lead.honeypot).toBe("Acme Ltd");
  });

  it("still rejects a malformed email", () => {
    expect(() => leadCreateSchema.parse({ ...base, phone: "0501234567", email: "not-an-email" })).toThrow();
  });

  it("records which form and page a lead came from", () => {
    const lead = leadCreateSchema.parse({ ...base, phone: "0501234567", form: "quote_popup", page: "/services/fm-200-special-systems" });
    expect(lead.form).toBe("quote_popup");
    expect(lead.page).toBe("/services/fm-200-special-systems");
  });

  it("only accepts a same-site path as the page (shown in admin + email)", () => {
    for (const page of ["https://evil.example/x", "//evil.example", "/a b", '/x"><script>', "javascript:alert(1)"]) {
      expect(() => leadCreateSchema.parse({ ...base, phone: "0501234567", page })).toThrow();
    }
  });

  it("rejects an unknown form name", () => {
    expect(() => leadCreateSchema.parse({ ...base, phone: "0501234567", form: "admin" })).toThrow();
  });
});
