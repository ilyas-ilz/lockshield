import { describe, it, expect } from "vitest";
import { buildLocalBusinessSchema, type OrgInput } from "../jsonld";

const ORG: OrgInput = {
  legalName: "LOCK SHIELD Firefighting and Safety Equipment Installation LLC",
  alternateNames: ["Lock Shield", "Lockshield"],
  siteUrl: "https://lockshield.ae",
  phones: ["+971 4 272 7333"],
  emails: ["info@lockshield.ae"],
  address: { street: "Hor Al Anz, Deira", locality: "Dubai", country: "AE" },
  socials: [{ url: "https://www.linkedin.com/company/lockshield" }, { url: "https://www.lockshieldcart.com" }],
  partnerLinks: [{ url: "https://www.lockshieldcart.com" }],
};

describe("buildLocalBusinessSchema", () => {
  it("emits the brand aliases as alternateName so brand searches can match the entity", () => {
    expect(buildLocalBusinessSchema(ORG).alternateName).toEqual(["Lock Shield", "Lockshield"]);
  });

  it("omits alternateName when none are given", () => {
    expect(buildLocalBusinessSchema({ ...ORG, alternateNames: undefined })).not.toHaveProperty("alternateName");
  });

  it("gives the entity a stable @id on the site origin", () => {
    expect(buildLocalBusinessSchema(ORG)["@id"]).toBe("https://lockshield.ae/#organization");
  });

  it("de-duplicates sameAs when a URL is both a social and a partner link", () => {
    expect(buildLocalBusinessSchema(ORG).sameAs).toEqual([
      "https://www.linkedin.com/company/lockshield",
      "https://www.lockshieldcart.com",
    ]);
  });
});

describe("serializeJsonLd", () => {
  it("cannot be broken out of with </script> in an admin-editable field", async () => {
    const { serializeJsonLd } = await import("../jsonld");
    const out = serializeJsonLd({ headline: '</script><script src="//evil.example/x.js"></script>' });
    expect(out).not.toMatch(/<\/?script/i);
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).toContain(String.fromCharCode(92) + "u003c/script");
  });

  it("round-trips to exactly the same data", async () => {
    const { serializeJsonLd } = await import("../jsonld");
    const data = { name: "A & B <Fire> " + String.fromCharCode(0x2028) + " Safety", list: [1, "x"] };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
