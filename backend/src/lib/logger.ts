// WHY a small structured logger over raw console.* calls: coding-style
// hard rule ("no console.log in production code — use proper logging
// libraries") plus mern-security's checklist ("Structured logging"). Kept
// deliberately lightweight rather than pulling in Winston/Pino: this is a
// serverless Next.js app where stdout/stderr is already captured and
// shipped by the host (Vercel) — the value add here is just consistent
// JSON shape (level/message/context/timestamp), not log transport.
interface LogContext {
  [key: string]: unknown;
}

function log(level: "info" | "warn" | "error", message: string, context?: LogContext): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, error: unknown, context?: LogContext) =>
    log("error", message, { ...context, error: error instanceof Error ? error.message : String(error) }),
};
