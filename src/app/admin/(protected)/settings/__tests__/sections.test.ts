import { describe, it, expect } from "vitest";
import { findSettingsField } from "../sections";

describe("findSettingsField", () => {
  it("maps a nested validation path to its tab and field label", () => {
    expect(findSettingsField("defaultSeo.title")).toEqual({
      sectionId: "seo",
      fieldName: "defaultSeo.title",
      label: "Default SEO Title",
    });
  });

  it("maps an array item path to the array field", () => {
    expect(findSettingsField("emails.1")).toMatchObject({ sectionId: "contact", fieldName: "emails" });
    expect(findSettingsField("partnerLinks.0.url")).toMatchObject({ sectionId: "backlinks", fieldName: "partnerLinks" });
  });

  it("does not match a field that only shares a name prefix", () => {
    expect(findSettingsField("address.streetNumber")).toBeNull();
  });

  it("returns null for paths with no field on the form", () => {
    expect(findSettingsField("address.geo.lat")).toBeNull();
  });
});
