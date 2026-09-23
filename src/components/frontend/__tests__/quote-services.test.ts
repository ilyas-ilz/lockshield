import { describe, it, expect } from "vitest";
import { QUOTE_SERVICES, quoteServiceOptions } from "../quote-services";

describe("quoteServiceOptions", () => {
  it("returns the shared list when no service is preselected", () => {
    expect(quoteServiceOptions()).toEqual(QUOTE_SERVICES);
  });

  it("keeps the list unchanged when the preselected service is already in it", () => {
    expect(quoteServiceOptions(QUOTE_SERVICES[2])).toEqual(QUOTE_SERVICES);
  });

  it("adds the current service page's title first so the dropdown can show it", () => {
    const options = quoteServiceOptions("FM-200 Special Fire Suppression Systems");
    expect(options[0]).toBe("FM-200 Special Fire Suppression Systems");
    expect(options.slice(1)).toEqual(QUOTE_SERVICES);
  });

  it("does not preselect AMC by default (that mislabelled every quote as AMC)", () => {
    expect(QUOTE_SERVICES).toContain("Annual Maintenance Contract (AMC)");
    expect(quoteServiceOptions("")).toEqual(QUOTE_SERVICES);
  });
});
