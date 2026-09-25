import { describe, it, expect } from "vitest";
import { formatAddressLine } from "../format";

describe("formatAddressLine", () => {
  it("joins street, city and country, showing the AE code as UAE", () => {
    expect(formatAddressLine({ street: "Hor Al Anz, Deira", locality: "Dubai", country: "AE" })).toBe(
      "Hor Al Anz, Deira, Dubai, UAE"
    );
  });

  it("keeps a country that is not a known code exactly as entered", () => {
    expect(formatAddressLine({ street: "Main St", locality: "Muscat", country: "Oman" })).toBe("Main St, Muscat, Oman");
  });

  it("falls back to the head office when Settings could not be read", () => {
    expect(formatAddressLine(undefined)).toBe("Hor Al Anz, Deira, Dubai, UAE");
    expect(formatAddressLine({ street: "", locality: "", country: "" })).toBe("Hor Al Anz, Deira, Dubai, UAE");
  });
});
