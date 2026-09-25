import { describe, it, expect } from "vitest";
import { ApiClientError, validationIssues } from "../api-client";

describe("validationIssues", () => {
  it("returns the field-level issues of a 400 validation error", () => {
    const err = new ApiClientError("Validation failed", 400, {
      fieldErrors: {},
      issues: [{ path: "defaultSeo.title", message: "too long" }],
    });
    expect(validationIssues(err)).toEqual([{ path: "defaultSeo.title", message: "too long" }]);
  });

  it("returns an empty list for anything else", () => {
    expect(validationIssues(new ApiClientError("Forbidden", 403))).toEqual([]);
    expect(validationIssues(new ApiClientError("Validation failed", 400, { fieldErrors: {} }))).toEqual([]);
    expect(validationIssues(new Error("network"))).toEqual([]);
    expect(validationIssues(undefined)).toEqual([]);
  });
});
