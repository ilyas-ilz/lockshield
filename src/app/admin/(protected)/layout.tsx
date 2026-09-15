import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { AdminShell, SignOutButton } from "@/components/admin/admin-shell";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Edge middleware handles the redirect for missing cookies,
  // but this is the server-side guarantee that session exists.
  if (!session?.user) redirect("/admin/login");

  let newLeadsCount = 0;
  try {
    await connectDB();
    newLeadsCount = await Lead.countDocuments({ status: "new" });
  } catch {
    // If DB is temporarily unreachable, fallback gracefully to 0
  }

  return (
    <AdminShell
      user={session.user}
      newLeadsCount={newLeadsCount}
      onSignOut={
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <SignOutButton />
        </form>
      }
    >
      {children}
    </AdminShell>
  );
}

