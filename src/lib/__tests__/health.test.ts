import { describe, it, expect } from "vitest";
import { runHealthChecks, type HealthConfig, type HealthProbes } from "../health";

const config: HealthConfig = {
  r2Configured: true,
  smtpConfigured: true,
  recipients: ["owner@example.com"],
  production: true,
  timeoutMs: 50,
};

const passing: HealthProbes = {
  database: async () => undefined,
  storage: async () => undefined,
  email: async () => undefined,
};

describe("runHealthChecks", () => {
  it("reports every check ok when all probes pass", async () => {
    const report = await runHealthChecks(passing, config);
    expect(report.overall).toBe("ok");
    expect(report.checks.data.status).toBe("ok");
    expect(report.checks.media.status).toBe("ok");
    expect(report.checks.email.status).toBe("ok");
    expect(report.checks.email.message).toContain("owner@example.com");
    expect(report.technical.database.pingMs).toBeTypeOf("number");
  });

  it("marks the database an error when the ping fails, and overall error", async () => {
    const report = await runHealthChecks(
      { ...passing, database: async () => { throw new Error("ECONNREFUSED"); } },
      config
    );
    expect(report.checks.data.status).toBe("error");
    expect(report.overall).toBe("error");
    expect(report.technical.database.pingMs).toBeNull();
    expect(report.technical.database.error).toBe("ECONNREFUSED");
  });

  it("treats a probe that hangs past the timeout as an error", async () => {
    const report = await runHealthChecks(
      { ...passing, storage: () => new Promise<void>(() => undefined) },
      config
    );
    expect(report.checks.media.status).toBe("error");
    expect(report.technical.storage.error).toMatch(/timed out/i);
  });

  it("warns, without probing, when image storage is not set up in production", async () => {
    let probed = false;
    const report = await runHealthChecks(
      { ...passing, storage: async () => { probed = true; } },
      { ...config, r2Configured: false }
    );
    expect(probed).toBe(false);
    expect(report.checks.media.status).toBe("warning");
    expect(report.overall).toBe("warning");
  });

  it("does not warn about local image storage outside production", async () => {
    const report = await runHealthChecks(passing, { ...config, r2Configured: false, production: false });
    expect(report.checks.media.status).toBe("ok");
  });

  it("warns when email alerts are not set up or have no recipient", async () => {
    const off = await runHealthChecks(passing, { ...config, smtpConfigured: false });
    expect(off.checks.email.status).toBe("warning");
    const nobody = await runHealthChecks(passing, { ...config, recipients: [] });
    expect(nobody.checks.email.status).toBe("warning");
  });

  it("marks email an error when the mail server rejects the login", async () => {
    const report = await runHealthChecks(
      { ...passing, email: async () => { throw new Error("Invalid login"); } },
      config
    );
    expect(report.checks.email.status).toBe("error");
    expect(report.overall).toBe("error");
  });
});
