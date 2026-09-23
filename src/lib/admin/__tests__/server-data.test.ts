import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { startTestDB, stopTestDB, clearTestDB } from "@/tests/mongo-test-helper";

type ServerData = typeof import("../server-data");
let fetchLeadsSSR: ServerData["fetchLeadsSSR"];
let Lead: typeof import("@/models/Lead").Lead;

describe("fetchLeadsSSR source filter", () => {
  beforeAll(async () => {
    await startTestDB();
    ({ fetchLeadsSSR } = await import("../server-data"));
    ({ Lead } = await import("@/models/Lead"));
  });
  afterAll(stopTestDB);
  beforeEach(async () => {
    await clearTestDB();
    await Lead.create([
      { source: "contact", name: "Quote Person", phone: "0501111111" },
      { source: "career", name: "Job Applicant", email: "cv@example.com" },
    ]);
  });

  it("lists only job applications when ?source=career", async () => {
    const result = await fetchLeadsSSR<{ name: string }>({ source: "career" });
    expect(result?.items.map((l) => l.name)).toEqual(["Job Applicant"]);
  });

  it("ignores an unknown source instead of returning nothing", async () => {
    const result = await fetchLeadsSSR({ source: "bogus" });
    expect(result?.items).toHaveLength(2);
  });
});
