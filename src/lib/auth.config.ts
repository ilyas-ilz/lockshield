import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/models/User";

/**
 * Edge-safe half of the Auth.js config — split out from auth.ts (WHY:
 * middleware.ts runs on the Edge runtime by default, and Mongoose uses
 * Node APIs/dynamic eval that the Edge bundler rejects outright. If
 * middleware imports auth.ts directly, webpack bundles the whole module
 * graph — including the Credentials provider's authorize(), which imports
 * connectDB/Mongoose — into the Edge build and the build fails.
 *
 * This file has zero DB imports: only session/callback config, which is
 * pure token manipulation (no I/O) and genuinely Edge-safe. auth.ts (Node
 * runtime — route handlers, Server Components) spreads this and adds the
 * Credentials provider on top; middleware.ts uses ONLY this file.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role;
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    /** Epoch ms of the last DB re-validation - see auth.ts's jwt callback. */
    roleCheckedAt?: number;
  }
}
