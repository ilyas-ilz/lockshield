import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Resources only an ADMIN may open through the generic [resource] pages.
 * (users and settings have their own routes, listed anyway as a backstop.)
 */
const ADMIN_ONLY_RESOURCES = new Set(["redirects", "users", "settings"]);

/**
 * WHY a server-side check here: middleware gates these by a startsWith() on
 * the raw pathname, which an encoded path such as /admin/%72edirects may not
 * match, while Next still routes it to this page with params.resource
 * decoded. The API stays protected either way; this keeps the SSR'd list
 * from rendering for an EDITOR. Same pattern as admin/(protected)/users.
 */
export default async function ResourceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  if (ADMIN_ONLY_RESOURCES.has(resource)) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/admin");
  }
  return children;
}
