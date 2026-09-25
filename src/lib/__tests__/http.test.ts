import { describe, it, expect } from "vitest";
import { z } from "zod";
import { handleApi } from "../http";

describe("handleApi validation errors", () => {
  const schema = z.object({
    defaultSeo: z.object({ title: z.string().max(5) }),
  });

  it("reports the full nested path of each failing field", async () => {
    const res = await handleApi(async () => {
      schema.parse({ defaultSeo: { title: "far too long" } });
      throw new Error("unreachable");
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details.issues).toEqual([
      { path: "defaultSeo.title", message: "String must contain at most 5 character(s)" },
    ]);
  });

  it("keeps the flattened fieldErrors that ResourceForm reads", async () => {
    const res = await handleApi(async () => {
      schema.parse({ defaultSeo: { title: "far too long" } });
      throw new Error("unreachable");
    });

    const body = await res.json();
    expect(body.details.fieldErrors.defaultSeo).toEqual(["String must contain at most 5 character(s)"]);
  });
});
