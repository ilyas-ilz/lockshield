import nodemailer from "nodemailer";
import { logger } from "./logger";
import { getEnv, hasSmtp } from "./env";
import { buildLeadEmail, type LeadNotification } from "./lead-email";

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

// WHY lazy singleton, not module-top-level: getEnv()/createTransport() would
// throw at import time in any environment missing SMTP vars (i.e. every
// environment until the user configures one), and this module is imported
// by the public, unauthenticated leads route.
function getTransporter() {
  if (transporter) return transporter;
  const env = getEnv();
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
  return transporter;
}

/** Logs in to the SMTP server without sending anything; throws if it refuses (health check). */
export async function verifySmtp(): Promise<void> {
  await getTransporter().verify();
}

/**
 * Who receives new-lead alerts: LEAD_NOTIFY_TO (comma-separated) if set,
 * otherwise the SMTP account itself.
 *
 * WHY not Settings > Email Addresses (what this used to read): those are the
 * *public* contact addresses shown in the footer, contact page and JSON-LD,
 * and info@/support@lockshield.ae have no mailbox (the domain has no MX
 * records), so every alert bounced. The SMTP account is a real inbox we can
 * already send from, so defaulting to it means alerts arrive with no extra
 * setup; LEAD_NOTIFY_TO redirects them without touching the public site.
 */
export function leadRecipients(env: { LEAD_NOTIFY_TO?: string; SMTP_USER?: string }): string[] {
  const configured = (env.LEAD_NOTIFY_TO ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  if (configured.length > 0) return configured;
  return env.SMTP_USER ? [env.SMTP_USER] : [];
}

/**
 * Emails the lead-alert recipients (see leadRecipients) about a new lead.
 * Never throws - a lead submission must never fail because email delivery
 * failed or SMTP isn't configured yet. Without SMTP env vars, this stays a
 * log-only no-op.
 */
export async function notifyNewLead(lead: LeadNotification): Promise<void> {
  // WHY no name/email/phone: Vercel logs are retained and visible to anyone
  // with project access; the lead itself is in the DB and the admin.
  logger.info("new lead received", { source: lead.source, hasEmail: Boolean(lead.email), hasPhone: Boolean(lead.phone) });

  // WHY warn on every skip and log every send: "the email never arrived" had
  // no log line to read either way, so a missing Vercel env var, an empty
  // recipient list and a message sitting in the wrong inbox all looked alike.
  if (!hasSmtp()) {
    logger.warn("lead email skipped: SMTP_HOST/PORT/USER/PASSWORD not all set");
    return;
  }

  try {
    const env = getEnv();
    const recipients = leadRecipients(env);
    if (recipients.length === 0) {
      logger.warn("lead email skipped: no LEAD_NOTIFY_TO and no SMTP_USER");
      return;
    }

    const info = await getTransporter().sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to: recipients.join(", "),
      ...buildLeadEmail(lead),
    });
    logger.info("lead email sent", { accepted: info.accepted, rejected: info.rejected });
  } catch (err) {
    logger.error("failed to email new lead notification", err);
  }
}
