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
      { path: "defaultSeo.title", message: "Must be 5 characters or fewer" },
    ]);
  });

  it("keeps the flattened fieldErrors that ResourceForm reads", async () => {
    const res = await handleApi(async () => {
      schema.parse({ defaultSeo: { title: "far too long" } });
      throw new Error("unreachable");
    });

    const body = await res.json();
    expect(body.details.fieldErrors.defaultSeo).toEqual(["Must be 5 characters or fewer"]);
  });

  it("explains an empty required value instead of 'at least 1 character(s)'", async () => {
    const res = await handleApi(async () => {
      z.object({ phones: z.array(z.string().trim().min(1)) }).parse({ phones: ["+971", "  "] });
      throw new Error("unreachable");
    });

    const body = await res.json();
    expect(body.details.issues).toEqual([
      { path: "phones.1", message: "Can't be empty: fill it in or remove the empty row" },
    ]);
  });

  it("keeps a custom message set on the schema", async () => {
    const res = await handleApi(async () => {
      z.object({ t: z.string().max(2, "Too long, custom") }).parse({ t: "abc" });
      throw new Error("unreachable");
    });

    const body = await res.json();
    expect(body.details.issues[0].message).toBe("Too long, custom");
  });
});
