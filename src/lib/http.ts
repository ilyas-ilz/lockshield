import { NextResponse } from "next/server";
import { ZodError } from "zod";
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
      return NextResponse.json(
        { success: false, error: "Validation failed", details: err.flatten() },
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

function isMongoDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000;
}
