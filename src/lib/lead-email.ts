export interface LeadNotification {
  source: string;
  name: string;
  email?: string;
  phone?: string;
  serviceInterest?: string;
  message?: string;
}

export interface LeadEmail {
  subject: string;
  html: string;
  replyTo?: string;
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

function renderLeadHtml(lead: LeadNotification): string {
  const rows: [string, string | undefined][] = [
    ["Source", lead.source],
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Service", lead.serviceInterest],
    ["Message", lead.message],
  ];
  const rowsHtml = rows
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#333;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 12px;color:#333;white-space:pre-wrap">${escapeHtml(value!)}</td></tr>`
    )
    .join("");
  return `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rowsHtml}</table>`;
}

/**
 * Pure builder for the new-lead notification (no SMTP, no settings lookup) so
 * the content can be unit-tested. WHY replyTo: staff hitting "Reply" on the
 * alert should reach the visitor, not the website's sending mailbox.
 */
export function buildLeadEmail(lead: LeadNotification): LeadEmail {
  return {
    // WHY strip CR/LF: the name is visitor input and a header value.
    subject: `New ${lead.source} lead: ${lead.name.replace(/[\r\n]+/g, " ")}`,
    html: renderLeadHtml(lead),
    replyTo: lead.email || undefined,
  };
}
