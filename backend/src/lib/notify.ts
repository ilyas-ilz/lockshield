import { logger } from "./logger";

/**
 * Lead notification hook — fires when a new Lead is created.
 *
 * WHY a stub: which email provider to use (Resend/SendGrid/SMTP via the
 * existing cPanel mailbox) is a "later we can wire properly" decision, not
 * a backend-architecture one — swapping the provider must never touch the
 * Lead route. Until wired, this just logs, so nothing throws and no lead
 * submission ever fails because of a missing API key.
 */
export async function notifyNewLead(lead: { source: string; name: string; email: string; phone?: string }): Promise<void> {
  try {
    // TODO(wiring): replace with real provider call, e.g.
    //   await resend.emails.send({ to: settings.emails, subject: `New ${lead.source} lead: ${lead.name}`, ... })
    logger.info("new lead received", { source: lead.source, name: lead.name, email: lead.email, phone: lead.phone });
  } catch (err) {
    logger.error("failed to notify new lead", err);
  }
}
