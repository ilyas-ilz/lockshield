const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "just now", "5 minutes ago", "yesterday", "2 weeks ago", then a plain date past four weeks. */
export function formatRelative(input: Date | string, now: Date = new Date()): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const seconds = (date.getTime() - now.getTime()) / 1000;
  if (Math.abs(seconds) < 45) return "just now";

  const minutes = seconds / 60;
  if (Math.abs(minutes) < 60) return rtf.format(Math.round(minutes), "minute");
  const hours = minutes / 60;
  if (Math.abs(hours) < 24) return rtf.format(Math.round(hours), "hour");
  const days = hours / 24;
  if (Math.abs(days) < 7) return rtf.format(Math.round(days), "day");
  const weeks = days / 7;
  if (Math.abs(weeks) < 4) return rtf.format(Math.round(weeks), "week");

  return date.toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" });
}
