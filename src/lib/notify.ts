import nodemailer from "nodemailer";
import { logger } from "./logger";
import { getEnv, hasSmtp } from "./env";
import { getSettings } from "./settings";

interface LeadNotification {
  source: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

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

// WHY escape: every value here is public, unauthenticated visitor input
// (the leads form has no auth) rendered as HTML in a real email client -
// without this, a lead's name or message becomes a stored-XSS/HTML
// injection vector against whoever reads the notification inbox.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderLeadEmail(lead: LeadNotification): string {
  const rows: [string, string | undefined][] = [
    ["Source", lead.source],
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Message", lead.message],
  ];
  const rowsHtml = rows
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#333">${escapeHtml(label)}</td><td style="padding:6px 12px;color:#333">${escapeHtml(value!)}</td></tr>`
    )
    .join("");
  return `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rowsHtml}</table>`;
}

/**
 * Emails the site's configured notification addresses about a new lead.
 * Never throws - a lead submission must never fail because email delivery
 * failed or SMTP isn't configured yet. Without SMTP env vars, this stays a
 * log-only no-op (today's behavior).
 */
export async function notifyNewLead(lead: LeadNotification): Promise<void> {
  logger.info("new lead received", { source: lead.source, name: lead.name, email: lead.email, phone: lead.phone });

  if (!hasSmtp()) return;

  try {
    const settings = await getSettings();
    const recipients = settings.emails;
    if (recipients.length === 0) return;

    const env = getEnv();
    await getTransporter().sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to: recipients.join(", "),
      subject: `New ${lead.source} lead: ${lead.name.replace(/[\r\n]+/g, " ")}`,
      html: renderLeadEmail(lead),
    });
  } catch (err) {
    logger.error("failed to email new lead notification", err);
  }
}
