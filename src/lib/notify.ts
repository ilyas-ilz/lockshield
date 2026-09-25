import nodemailer from "nodemailer";
import { logger } from "./logger";
import { getEnv, hasSmtp } from "./env";
import { getSettings } from "./settings";
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

/**
 * Emails the site's configured notification addresses about a new lead.
 * Never throws - a lead submission must never fail because email delivery
 * failed or SMTP isn't configured yet. Without SMTP env vars, this stays a
 * log-only no-op (today's behavior).
 */
export async function notifyNewLead(lead: LeadNotification): Promise<void> {
  logger.info("new lead received", { source: lead.source, name: lead.name, email: lead.email, phone: lead.phone });

  // WHY warn on every skip and log every send: "the email never arrived" had
  // no log line to read either way, so a missing Vercel env var, an empty
  // recipient list and a message sitting in the wrong inbox all looked alike.
  if (!hasSmtp()) {
    logger.warn("lead email skipped: SMTP_HOST/PORT/USER/PASSWORD not all set");
    return;
  }

  try {
    const settings = await getSettings();
    const recipients = settings.emails;
    if (recipients.length === 0) {
      logger.warn("lead email skipped: Settings > Email Addresses is empty");
      return;
    }

    const env = getEnv();
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
