import { describe, it, expect } from "vitest";
import { leadRecipients } from "../notify";

describe("leadRecipients", () => {
  it("defaults to the SMTP account itself (the inbox we already send from)", () => {
    expect(leadRecipients({ SMTP_USER: "lockshield.ae@gmail.com" })).toEqual(["lockshield.ae@gmail.com"]);
  });

  it("uses LEAD_NOTIFY_TO when set, trimming a comma-separated list", () => {
    expect(
      leadRecipients({ LEAD_NOTIFY_TO: " info@lockshield.ae, sales@lockshield.ae ,", SMTP_USER: "lockshield.ae@gmail.com" })
    ).toEqual(["info@lockshield.ae", "sales@lockshield.ae"]);
  });

  it("returns nothing when neither is configured", () => {
    expect(leadRecipients({})).toEqual([]);
    expect(leadRecipients({ LEAD_NOTIFY_TO: " , " })).toEqual([]);
  });
});
