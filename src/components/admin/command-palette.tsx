"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Building2,
  CornerDownLeft,
  ExternalLink,
  FileText,
  Files,
  FolderTree,
  Globe,
  Inbox,
  Loader2,
  Moon,
  Plus,
  Search,
  Tags,
  UserPlus,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { api, type PageResult } from "@/lib/admin/api-client";
import { cn } from "@/lib/utils";
import { flatNavGroups } from "./nav-config";
import { toggleAdminTheme } from "./use-admin-theme";

interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: LucideIcon;
  href?: string;
  external?: boolean;
  run?: () => void;
}

interface RecordSource {
  key: string;
  apiPath: string;
  field: string;
  noun: string;
  icon: LucideIcon;
  hrefFor: (row: Record<string, unknown>) => string;
}

const RECORD_SOURCES: RecordSource[] = [
  { key: "leads", apiPath: "/api/leads", field: "name", noun: "Lead", icon: Inbox, hrefFor: (r) => `/admin/leads?search=${encodeURIComponent(String(r.name ?? ""))}` },
  { key: "posts", apiPath: "/api/posts", field: "title", noun: "Blog post", icon: FileText, hrefFor: (r) => `/admin/posts/${r._id}` },
  { key: "projects", apiPath: "/api/projects", field: "title", noun: "Project", icon: Building2, hrefFor: (r) => `/admin/projects/${r._id}` },
  { key: "services", apiPath: "/api/services", field: "title", noun: "Service", icon: Wrench, hrefFor: (r) => `/admin/services/${r._id}` },
  { key: "pages", apiPath: "/api/pages", field: "title", noun: "Page", icon: Files, hrefFor: (r) => `/admin/pages/${r._id}` },
  { key: "jobs", apiPath: "/api/jobs", field: "title", noun: "Job opening", icon: Briefcase, hrefFor: (r) => `/admin/jobs/${r._id}` },
];

const PER_SOURCE = 3;

function staticItems(isAdmin: boolean): PaletteItem[] {
  const pages: PaletteItem[] = flatNavGroups(isAdmin).flatMap((group) =>
    group.items.map((item) => ({
      id: `nav:${item.href}`,
      label: item.label,
      hint: group.heading,
      group: "Go to",
      icon: item.icon,
      href: item.href,
    }))
  );

  const create: PaletteItem[] = [
    { id: "new:posts", label: "New blog post", group: "Create", icon: FileText, href: "/admin/posts/new" },
    { id: "new:projects", label: "New project", group: "Create", icon: Building2, href: "/admin/projects/new" },
    { id: "new:services", label: "New service", group: "Create", icon: Wrench, href: "/admin/services/new" },
    { id: "new:pages", label: "New page", group: "Create", icon: Files, href: "/admin/pages/new" },
    { id: "new:jobs", label: "New job opening", group: "Create", icon: Briefcase, href: "/admin/jobs/new" },
    { id: "new:categories", label: "New category", group: "Create", icon: FolderTree, href: "/admin/categories/new" },
    { id: "new:tags", label: "New tag", group: "Create", icon: Tags, href: "/admin/tags/new" },
    ...(isAdmin
      ? [{ id: "new:users", label: "New admin user", group: "Create", icon: UserPlus, href: "/admin/users/new" }]
      : []),
  ];

  const actions: PaletteItem[] = [
    { id: "act:site", label: "View website", group: "Actions", icon: Globe, href: "/", external: true },
    { id: "act:theme", label: "Toggle dark mode", group: "Actions", icon: Moon, run: toggleAdminTheme },
  ];

  return [...pages, ...create, ...actions];
}

function matches(item: PaletteItem, q: string): boolean {
  return `${item.label} ${item.hint ?? ""}`.toLowerCase().includes(q);
}

/** Ctrl/Cmd+K palette: jump to any admin page, start a new record, or find an existing one. */
export function CommandPalette({
  open,
  onOpenChange,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [records, setRecords] = React.useState<PaletteItem[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  const base = React.useMemo(() => staticItems(isAdmin), [isAdmin]);
  const q = query.trim().toLowerCase();

  // Record search: debounced, cancelled when the query changes, and each
  // source fails on its own so one 403 doesn't blank the whole list.
  React.useEffect(() => {
    if (q.length < 2) {
      setRecords([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    const timer = setTimeout(async () => {
      const settled = await Promise.allSettled(
        RECORD_SOURCES.map(async (source) => {
          const params = new URLSearchParams({ search: q, pageSize: "10" });
          const res = await api.get<PageResult<Record<string, unknown>>>(`${source.apiPath}?${params}`);
          return res.items
            .filter((row) => String(row[source.field] ?? "").toLowerCase().includes(q))
            .slice(0, PER_SOURCE)
            .map<PaletteItem>((row) => ({
              id: `rec:${source.key}:${String(row._id)}`,
              label: String(row[source.field]),
              hint: source.noun,
              group: "Records",
              icon: source.icon,
              href: source.hrefFor(row),
            }));
        })
      );
      if (controller.signal.aborted) return;
      setRecords(settled.flatMap((r) => (r.status === "fulfilled" ? r.value : [])));
      setSearching(false);
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [q]);

  const items = React.useMemo(() => {
    const local = q ? base.filter((item) => matches(item, q)) : base;
    return [...local, ...records];
  }, [base, q, records]);

  React.useEffect(() => setActiveIndex(0), [q, records.length]);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  React.useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function select(item: PaletteItem) {
    onOpenChange(false);
    if (item.run) return item.run();
    if (!item.href) return;
    if (item.external) window.open(item.href, "_blank", "noopener,noreferrer");
    else router.push(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (items.length ? (i + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
    } else if (e.key === "Enter") {
      const item = items[activeIndex];
      if (item) {
        e.preventDefault();
        select(item);
      }
    }
  }

  const grouped = React.useMemo(() => {
    const out: { group: string; entries: { item: PaletteItem; index: number }[] }[] = [];
    items.forEach((item, index) => {
      const last = out[out.length - 1];
      if (last && last.group === item.group) last.entries.push({ item, index });
      else out.push({ group: item.group, entries: [{ item, index }] });
    });
    return out;
  }, [items]);

  const activeId = items[activeIndex]?.id;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fade-in fixed inset-0 z-50 bg-[var(--color-navy-900)]/40 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fade-in fixed inset-x-4 top-[10vh] z-50 mx-auto flex max-h-[70vh] max-w-xl flex-col overflow-hidden rounded-2xl border border-app bg-surface shadow-[0_24px_64px_-16px_rgba(13,18,32,0.35)] font-admin"
        >
          <DialogPrimitive.Title className="sr-only">Search the admin</DialogPrimitive.Title>
          <div className="flex items-center gap-3 border-b border-app px-4">
            {searching ? (
              <Loader2 className="size-5 shrink-0 animate-spin text-muted" aria-hidden />
            ) : (
              <Search className="size-5 shrink-0 text-muted" aria-hidden />
            )}
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search pages, posts, projects, leads…"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-palette-list"
              aria-activedescendant={activeId ? `cmd-${activeId}` : undefined}
              aria-label="Search the admin"
              className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-app placeholder:text-muted focus:outline-none"
            />
            <kbd className="hidden rounded-md border border-app bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-muted sm:block">
              Esc
            </kbd>
          </div>

          <div ref={listRef} id="command-palette-list" role="listbox" className="admin-scroll flex-1 overflow-y-auto p-2">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-semibold text-app">{searching ? "Searching…" : "No matches"}</p>
                {!searching && (
                  <p className="mt-1 text-xs text-muted">Try a page name, a post title, or a customer&apos;s name.</p>
                )}
              </div>
            ) : (
              grouped.map(({ group, entries }) => (
                <div key={group} role="group" aria-label={group} className="pb-1">
                  <p className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{group}</p>
                  {entries.map(({ item, index }) => {
                    const active = index === activeIndex;
                    const Icon = item.group === "Create" ? Plus : item.icon;
                    return (
                      <div
                        key={item.id}
                        id={`cmd-${item.id}`}
                        data-index={index}
                        role="option"
                        aria-selected={active}
                        onMouseMove={() => setActiveIndex(index)}
                        onClick={() => select(item)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm",
                          active ? "bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-500)]/12" : ""
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg",
                            active ? "bg-[var(--color-brand-500)] text-white" : "bg-surface-2 text-muted"
                          )}
                        >
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium text-app">{item.label}</span>
                        {item.hint && <span className="shrink-0 text-xs text-muted">{item.hint}</span>}
                        {item.external && <ExternalLink className="size-3.5 shrink-0 text-muted" aria-hidden />}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          <div className="hidden items-center gap-4 border-t border-app bg-surface-2/60 px-4 py-2.5 text-[11px] text-muted sm:flex">
            <span className="flex items-center gap-1.5">
              <ArrowUp className="size-3" aria-hidden />
              <ArrowDown className="size-3" aria-hidden />
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <CornerDownLeft className="size-3" aria-hidden />
              Open
            </span>
            <span className="ml-auto">Type 2+ letters to search records</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
