import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { AccountClient } from "./account-client";

/**
 * Self-service password change.
 *
 * WHY this page exists and why it is NOT under Settings: POST /api/users/me/
 * password shipped with no UI at all, so a colleague handed a temporary
 * password had no way to change it — the only route was an ADMIN running
 * `npm run admin:password` from a terminal, and the New user form promised
 * otherwise. Settings/Users/Redirects are adminOnly in the sidebar, and
 * editors are precisely the people who receive temp passwords, so this sits
 * on its own route that every signed-in role can open.
 *
 * Server component so the signed-in identity comes from the session rather
 * than another round trip — there is no SessionProvider in this app, the
 * layout reads auth() on the server and passes it down.
 */
export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { name, email, role } = session.user;

  return (
    <div className="mx-auto w-full max-w-lg">
      <PageHeader title="My account" description="Change the password you use to sign in." />
      <AccountClient name={name ?? ""} email={email ?? ""} role={role ?? "EDITOR"} />
    </div>
  );
}
