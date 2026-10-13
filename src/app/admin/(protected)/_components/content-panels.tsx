import Link from "next/link";
import { ArrowRight, Briefcase, Building2, ImageIcon, PenLine, Wrench, Zap, type LucideIcon } from "lucide-react";
import { Panel } from "@/components/shared/panel";
import type { DashboardData } from "./dashboard-data";

interface QuickAction {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
}

/** Same icon treatment and row shape for every action - no per-action colours. */
export function QuickActionsPanel({ content }: { content: DashboardData["content"] }) {
  const actions: QuickAction[] = [
    { href: "/admin/posts/new", label: "Write blog post", hint: "Create a new article", icon: PenLine },
    { href: "/admin/projects/new", label: "Add project", hint: "Showcase a completed job", icon: Building2 },
    { href: "/admin/services/new", label: "Add service", hint: "Create a service offering", icon: Wrench },
    {
      href: "/admin/jobs",
      label: "Manage careers",
      hint: `${content.openJobs} open position${content.openJobs === 1 ? "" : "s"}`,
      icon: Briefcase,
    },
    { href: "/admin/media", label: "Media library", hint: "Photos, logos and uploads", icon: ImageIcon },
  ];
  return (
    <Panel title="Quick actions" subtitle="Common tasks, one click away" icon={Zap} bodyClassName="p-0 sm:p-0">
      <ul className="divide-y divide-line">
        {actions.map((a) => (
          <li key={a.href}>
            <Link
              href={a.href}
              className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-surface-2/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--ring)] sm:px-6"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-app bg-surface text-muted transition-colors group-hover:border-[var(--color-brand-500)]/30 group-hover:text-[var(--color-brand-500)]">
                <a.icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-app">{a.label}</span>
                <span className="block truncate text-[13px] text-muted">{a.hint}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
