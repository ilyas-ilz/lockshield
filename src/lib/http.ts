import { NextResponse } from "next/server";
import { ZodError, type ZodIssue } from "zod";
import { logger } from "./logger";

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ success: true, data }, { status: init ?? 200 });
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

/**
 * Wraps a route handler body: catches ApiError (known, expected failures),
 * ZodError (validation failures -> 400 with field-level detail), Mongoose
 * duplicate-key errors (-> 409), and anything else (-> 500, logged, message
 * hidden from the client so internals never leak in a response body).
 */
export async function handleApi(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    if (err instanceof ZodError) {
      // WHY `issues` next to flatten(): flatten() keys errors by top-level
      // field only, so a too-long "defaultSeo.title" reported as "defaultSeo"
      // and the Settings screen could not say which field (on which tab) to fix.
      const issues = err.issues.map((issue) => ({ path: issue.path.join("."), message: friendlyMessage(issue) }));
      return NextResponse.json(
        { success: false, error: "Validation failed", details: { ...err.flatten(friendlyMessage), issues } },
        { status: 400 }
      );
    }
    if (isMongoDuplicateKeyError(err)) {
      return NextResponse.json(
        { success: false, error: "A record with that value already exists (duplicate slug/email/etc.)" },
        { status: 409 }
      );
    }
    logger.error("unhandled API error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * WHY: zod's default string-length wording ("String must contain at least 1
 * character(s)") is what admins see in the toast, and it reads like a
 * character limit. An empty phone/social row looks like a "0 character" error.
 * Rewrite only zod's defaults; messages set on a schema are kept as written.
 */
function friendlyMessage(issue: ZodIssue): string {
  const isDefault = issue.message.startsWith("String must contain");
  if (isDefault && issue.code === "too_small" && issue.type === "string") {
    return Number(issue.minimum) <= 1
      ? "Can't be empty: fill it in or remove the empty row"
      : `Must be at least ${issue.minimum} characters`;
  }
  if (isDefault && issue.code === "too_big" && issue.type === "string") {
    return `Must be ${issue.maximum} characters or fewer`;
  }
  return issue.message;
}

function isMongoDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000;
}
