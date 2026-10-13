/**
 * Website status checks for Settings > Website Status.
 *
 * WHY real probes and plain-language messages: the old tab showed hardcoded
 * badges ("Active", "Ready", "All systems operational") and a green "Online"
 * even when the database was down, and its wording (latency, runtime, CDN)
 * meant nothing to the non-technical owner reading it. Each check here runs
 * an actual probe and says what the result means for the business; the raw
 * numbers stay in `technical` for the developer.
 */

export type CheckStatus = "ok" | "warning" | "error";

export interface HealthCheck {
  status: CheckStatus;
  message: string;
}

export interface HealthReport {
  checkedAt: string;
  overall: CheckStatus;
  checks: { data: HealthCheck; media: HealthCheck; email: HealthCheck };
  technical: {
    database: { pingMs: number | null; error?: string };
    storage: { configured: boolean; error?: string };
    email: { configured: boolean; recipients: string[]; error?: string };
  };
}

/** Each probe resolves when the service answers and throws when it does not. */
export interface HealthProbes {
  database: () => Promise<void>;
  storage: () => Promise<void>;
  email: () => Promise<void>;
}

export interface HealthConfig {
  r2Configured: boolean;
  smtpConfigured: boolean;
  recipients: string[];
  production: boolean;
  timeoutMs: number;
}

interface ProbeResult {
  ok: boolean;
  ms: number;
  error?: string;
}

// WHY a timeout: a hung SMTP or R2 handshake would otherwise hold the whole
// status page on its skeleton until the serverless function is killed.
async function probe(fn: () => Promise<void>, timeoutMs: number): Promise<ProbeResult> {
  const start = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    await Promise.race([fn(), timeout]);
    return { ok: true, ms: Date.now() - start };
  } catch (err) {
    return { ok: false, ms: Date.now() - start, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

const SKIPPED: ProbeResult = { ok: true, ms: 0 };

export async function runHealthChecks(probes: HealthProbes, config: HealthConfig): Promise<HealthReport> {
  const emailReady = config.smtpConfigured && config.recipients.length > 0;
  const [db, storage, email] = await Promise.all([
    probe(probes.database, config.timeoutMs),
    config.r2Configured ? probe(probes.storage, config.timeoutMs) : Promise.resolve(SKIPPED),
    emailReady ? probe(probes.email, config.timeoutMs) : Promise.resolve(SKIPPED),
  ]);

  const data: HealthCheck = db.ok
    ? { status: "ok", message: "Pages, leads and settings are loading and saving normally." }
    : {
        status: "error",
        message: "The website can't reach its database. New enquiries and content changes may not be saved.",
      };

  let media: HealthCheck;
  if (!config.r2Configured) {
    media = config.production
      ? {
          status: "warning",
          message: "Image storage isn't set up. Pictures you upload may disappear after the next website update.",
        }
      : { status: "ok", message: "Test setup: uploaded pictures are saved on this computer." };
  } else if (storage.ok) {
    media = { status: "ok", message: "Picture uploads are working and images load quickly for visitors." };
  } else {
    media = {
      status: "error",
      message: "Image storage isn't responding. New uploads will fail; pictures already on the site may still show.",
    };
  }

  let emailCheck: HealthCheck;
  if (!config.smtpConfigured) {
    emailCheck = {
      status: "warning",
      message: "Email alerts are off. New enquiries still appear under Leads, but nobody is emailed.",
    };
  } else if (config.recipients.length === 0) {
    emailCheck = {
      status: "warning",
      message: "No inbox is set to receive alerts. New enquiries still appear under Leads.",
    };
  } else if (email.ok) {
    emailCheck = { status: "ok", message: `New enquiries are emailed to ${config.recipients.join(", ")}.` };
  } else {
    emailCheck = {
      status: "error",
      message: "The email account refused to connect. New enquiries are saved under Leads, but no emails are sent.",
    };
  }

  const statuses = [data.status, media.status, emailCheck.status];
  const overall: CheckStatus = statuses.includes("error") ? "error" : statuses.includes("warning") ? "warning" : "ok";

  return {
    checkedAt: new Date().toISOString(),
    overall,
    checks: { data, media, email: emailCheck },
    technical: {
      database: { pingMs: db.ok ? db.ms : null, error: db.error },
      storage: { configured: config.r2Configured, error: storage.error },
      email: { configured: config.smtpConfigured, recipients: config.recipients, error: email.error },
    },
  };
}
