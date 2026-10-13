import { describe, it, expect } from "vitest";
import { buildLeadEmail } from "../lead-email";

describe("buildLeadEmail", () => {
  it("includes the requested service so staff know what the quote is for", () => {
    const mail = buildLeadEmail({ source: "contact", name: "Ahmed", phone: "0501234567", serviceInterest: "Kitchen Fire Suppression System" });
    expect(mail.html).toContain("Service");
    expect(mail.html).toContain("Kitchen Fire Suppression System");
  });

  it("sets replyTo to the visitor so staff can answer straight from the alert", () => {
    expect(buildLeadEmail({ source: "contact", name: "Ahmed", email: "ahmed@example.ae" }).replyTo).toBe("ahmed@example.ae");
  });

  it("omits replyTo for a phone-only lead", () => {
    expect(buildLeadEmail({ source: "contact", name: "Ahmed", phone: "0501234567" }).replyTo).toBeUndefined();
  });

  it("escapes visitor input and strips newlines from the subject", () => {
    const mail = buildLeadEmail({ source: "career", name: "Evil\r\nBcc: x@y.z", email: "a@b.ae", message: "<script>alert(1)</script>" });
    expect(mail.subject).toBe("New career lead: Evil Bcc: x@y.z");
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).toContain("&lt;script&gt;");
  });

  it("says which form and page the lead came from", () => {
    const mail = buildLeadEmail({ source: "contact", name: "Ahmed", phone: "0501234567", form: "quote_form", page: "/services/fm-200-special-systems" });
    expect(mail.html).toContain("Quote form");
    expect(mail.html).toContain("/services/fm-200-special-systems");
  });
});
