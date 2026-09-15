import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { auth, signOut } from "@/lib/auth";
import { AdminShell, SignOutButton } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // WHY here as well as middleware: middleware (Edge) handles the redirect
  // for a missing cookie, but this is the server-side guarantee that
  // `session` exists before any page in this group renders — including the
  // role-gated nav items the shell decides on.
  if (!session?.user) redirect("/admin/login");

  return (
    <AdminShell
      user={session.user}
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
      <Toaster position="top-right" richColors closeButton />
    </AdminShell>
  );
}
