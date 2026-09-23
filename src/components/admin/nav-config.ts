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
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

/** Full admin navigation - the desktop sidebar renders all of it. */
export const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Content",
    items: [
      { href: "/admin/posts", label: "Blog Posts", icon: FileText },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/tags", label: "Tags", icon: Tags },
      { href: "/admin/pages", label: "Pages", icon: Files },
      { href: "/admin/media", label: "Media Library", icon: ImageIcon },
    ],
  },
  {
    heading: "Business",
    items: [
      { href: "/admin/services", label: "Services", icon: Wrench },
      { href: "/admin/projects", label: "Projects", icon: Building2 },
      { href: "/admin/jobs", label: "Careers", icon: Briefcase },
      { href: "/admin/leads", label: "Leads", icon: Inbox },
    ],
  },
  {
    heading: "System",
    items: [
      { href: "/admin/redirects", label: "Redirects", icon: Signpost, adminOnly: true },
      { href: "/admin/settings", label: "Settings", icon: SettingsIcon, adminOnly: true },
      { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
    ],
  },
];

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
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}
