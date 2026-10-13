import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  Files,
  Wrench,
  Building2,
  Briefcase,
  Signpost,
  Inbox,
  Settings as SettingsIcon,
  Users,
  Image as ImageIcon,
  Newspaper,
  BriefcaseBusiness,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

/** A collapsible sidebar entry: a parent row whose children sit under small section pills. */
export interface NavFolder {
  id: string;
  label: string;
  icon: LucideIcon;
  sections: { heading: string; items: NavItem[] }[];
}

export type NavEntry = NavItem | NavFolder;

export interface NavGroup {
  heading: string;
  entries: NavEntry[];
}

export function isNavFolder(entry: NavEntry): entry is NavFolder {
  return "sections" in entry;
}

/** Full admin navigation - the desktop sidebar renders all of it. */
export const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Main",
    entries: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/leads", label: "Leads", icon: Inbox },
    ],
  },
  {
    heading: "Workspace",
    entries: [
      {
        id: "content",
        label: "Content",
        icon: Newspaper,
        sections: [
          {
            heading: "Blog",
            items: [
              { href: "/admin/posts", label: "Blog Posts", icon: FileText },
              { href: "/admin/categories", label: "Categories", icon: FolderTree },
              { href: "/admin/tags", label: "Tags", icon: Tags },
            ],
          },
          {
            heading: "Website",
            items: [
              { href: "/admin/pages", label: "Pages", icon: Files },
              { href: "/admin/media", label: "Media Library", icon: ImageIcon },
            ],
          },
        ],
      },
      {
        id: "business",
        label: "Business",
        icon: BriefcaseBusiness,
        sections: [
          {
            heading: "Portfolio",
            items: [
              { href: "/admin/services", label: "Services", icon: Wrench },
              { href: "/admin/projects", label: "Projects", icon: Building2 },
            ],
          },
          {
            heading: "Hiring",
            items: [{ href: "/admin/jobs", label: "Careers", icon: Briefcase }],
          },
        ],
      },
    ],
  },
  {
    heading: "System",
    entries: [
      { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
      { href: "/admin/redirects", label: "Redirects", icon: Signpost, adminOnly: true },
    ],
  },
];

/** Pinned under the nav, above the user card (same spot as the reference design). */
export const NAV_FOOTER_ITEM: NavItem = {
  href: "/admin/settings",
  label: "Settings",
  icon: SettingsIcon,
  adminOnly: true,
};

/**
 * Mobile bottom bar, in the owner's priority order: enquiries first, then
 * the portfolio, then the blog. The mobile "More" sheet hides these so
 * nothing appears twice on a phone.
 */
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Home", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/projects", label: "Projects", icon: Building2 },
  { href: "/admin/posts", label: "Blog", icon: FileText },
];

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

export function canSee(item: NavItem, isAdmin: boolean): boolean {
  return !item.adminOnly || isAdmin;
}

/**
 * The nav as plain labelled lists - folders become their own group - for
 * surfaces that don't nest (mobile sheet, command palette).
 */
export function flatNavGroups(isAdmin: boolean): { heading: string; items: NavItem[] }[] {
  const groups: { heading: string; items: NavItem[] }[] = [];
  for (const group of NAV_GROUPS) {
    const loose: NavItem[] = [];
    for (const entry of group.entries) {
      if (isNavFolder(entry)) {
        const items = entry.sections.flatMap((s) => s.items).filter((i) => canSee(i, isAdmin));
        if (items.length) groups.push({ heading: entry.label, items });
      } else if (canSee(entry, isAdmin)) {
        loose.push(entry);
      }
    }
    if (group.heading === "System" && canSee(NAV_FOOTER_ITEM, isAdmin)) loose.push(NAV_FOOTER_ITEM);
    if (loose.length) groups.push({ heading: group.heading, items: loose });
  }
  return groups;
}

/** Every reachable item, used for page icons and the command palette. */
export function allNavItems(): NavItem[] {
  return [
    ...NAV_GROUPS.flatMap((g) =>
      g.entries.flatMap((e) => (isNavFolder(e) ? e.sections.flatMap((s) => s.items) : [e]))
    ),
    NAV_FOOTER_ITEM,
  ];
}

/** Icon for the page at `href`, so page headers match their sidebar entry. */
export function navIconFor(href: string): LucideIcon | undefined {
  return allNavItems().find((item) => item.href === href)?.icon;
}
