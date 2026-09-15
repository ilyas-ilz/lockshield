import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { connectDB } from "./db";
import { User, type UserRole } from "@/models/User";
import { verifyPassword } from "./password";
import { isLocked, recordFailedAttempt, resetLockout } from "./lockout";
import { checkRateLimit, RATE_LIMITS } from "./rate-limit";
import { logger } from "./logger";

/**
 * Carries a machine-readable reason for a failed sign-in.
 *
 * WHY: Auth.js collapses every credential failure into one opaque
 * "CredentialsSignin" error, so a locked account, an unreachable database
 * and a mistyped password were indistinguishable at the login screen.
 * Subclassing CredentialsSignin lets the `code` reach the client, where
 * the login page maps it to a specific message.
 */
export type LoginErrorCode = "invalid" | "locked" | "rate_limited" | "inactive" | "db_unavailable";

class LoginError extends CredentialsSignin {
  constructor(public override code: LoginErrorCode) {
    super(code);
  }
}

// How often an existing session re-checks the user's role/active status
// against the DB, instead of trusting the 8h JWT for its whole lifetime -
// deactivating or demoting someone should take effect in minutes, not
// whenever they happen to sign out.
const ROLE_REVALIDATE_MS = 5 * 60 * 1000;

// WHY split from auth.config.ts: this is the Node-runtime half — the
// Credentials provider's authorize() below imports connectDB/Mongoose,
// which cannot run on the Edge runtime. middleware.ts must NEVER import
// this file (it imports auth.config.ts directly instead) or the Edge
// build breaks. Route handlers and Server Components (both Node runtime)
// import this file for the full `auth()`/`signIn`/`signOut`/`handlers`.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role;
        token.id = user.id as string;
        token.roleCheckedAt = Date.now();
        return token;
      }

      if (Date.now() - (token.roleCheckedAt ?? 0) < ROLE_REVALIDATE_MS) return token;

      // WHY not on the Edge-safe authConfig: this needs Mongoose, which
      // middleware.ts (Edge runtime) can never import - see the module
      // comment above. Node-runtime callers only (route handlers, Server
      // Components), so it's safe here.
      try {
        await connectDB();
        const dbUser = await User.findById(token.id).select("role active").lean();
        // Deactivated or deleted mid-session - returning null invalidates
        // the token, forcing a fresh sign-in on the next request.
        if (!dbUser || !dbUser.active) return null;
        token.role = dbUser.role;
        token.roleCheckedAt = Date.now();
      } catch (err) {
        // DB unreachable - don't sign someone out over a transient blip;
        // keep the existing token and retry the check next request.
        logger.error("jwt role revalidation skipped: database unreachable", err);
      }
      return token;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) throw new LoginError("invalid");

        // WHY rate-limit inside authorize(): this is the actual credential
        // check path regardless of which route triggers it. Keyed on
        // IP+email so one leaked/guessed email can't be hammered from one
        // IP, but also a botnet can't fan out unlimited attempts at a
        // single account without also being throttled per IP.
        const ip = request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const rl = checkRateLimit(`login:${ip}:${email}`, RATE_LIMITS.login.max, RATE_LIMITS.login.windowMs);
        if (!rl.allowed) throw new LoginError("rate_limited");

        // WHY the DB call is wrapped: if Mongo is unreachable, the raw
        // error would surface at the login screen as a generic "incorrect
        // password", sending you hunting for the wrong problem entirely.
        let user;
        try {
          await connectDB();
          user = await User.findOne({ email }).select("+passwordHash");
        } catch (err) {
          logger.error("login failed: database unreachable", err);
          throw new LoginError("db_unavailable");
        }

        // WHY a generic "invalid" for a missing user rather than "no such
        // account": telling an anonymous caller which emails exist is user
        // enumeration. A locked/inactive state is only reported to someone
        // who already got the password combination far enough to trip it.
        if (!user) throw new LoginError("invalid");
        if (!user.active) throw new LoginError("inactive");

        if (isLocked({ lockUntil: user.lockUntil })) throw new LoginError("locked");

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          const next = recordFailedAttempt({
            failedLoginAttempts: user.failedLoginAttempts,
            lockUntil: user.lockUntil,
          });
          user.failedLoginAttempts = next.failedLoginAttempts;
          user.lockUntil = next.lockUntil;
          await user.save();
          // Tell them immediately if that attempt was the one that locked
          // the account, rather than letting the next try look identical.
          throw new LoginError(next.lockUntil ? "locked" : "invalid");
        }

        const reset = resetLockout();
        user.failedLoginAttempts = reset.failedLoginAttempts;
        user.lockUntil = reset.lockUntil;
        user.lastLoginAt = new Date();
        await user.save();

        return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
});
