import {
  ShieldCheck,
  FileCheck2,
  Server,
  ChefHat,
  FireExtinguisher,
  Package,
  Bell,
  Droplets,
  Flame,
  type LucideIcon,
} from "lucide-react";

/**
 * Service-specific icon so cards don't all share one flame glyph.
 * Matched by slug substring; unknown slugs fall back to Flame.
 */
export function serviceIcon(slug: string): LucideIcon {
  const s = slug.toLowerCase();
  if (s.includes("maintenance") || s.includes("amc")) return ShieldCheck;
  if (s.includes("design") || s.includes("drawing") || s.includes("approval") || s.includes("dcd"))
    return FileCheck2;
  if (s.includes("fm-200") || s.includes("fm200") || s.includes("clean-agent") || s.includes("special"))
    return Server;
  if (s.includes("kitchen") || s.includes("hood") || s.includes("restaurant")) return ChefHat;
  if (s.includes("extinguisher") || s.includes("refill")) return FireExtinguisher;
  if (s.includes("alarm") || s.includes("detection")) return Bell;
  if (s.includes("sprinkler") || s.includes("pump") || s.includes("fighting") || s.includes("hydrant"))
    return Droplets;
  if (s.includes("supply") || s.includes("trading") || s.includes("product")) return Package;
  return Flame;
}

/**
 * Teaser thumbnail per service. Matched by slug substring; falls back to a
 * generic commercial-protection shot.
 */
export function serviceImage(slug: string): string {
  const s = slug.toLowerCase();
  if (s.includes("maintenance") || s.includes("amc")) return "/assets/images/installation.webp";
  if (s.includes("design") || s.includes("drawing") || s.includes("approval") || s.includes("dcd"))
    return "/assets/images/designing-1.webp";
  if (s.includes("kitchen") || s.includes("hood") || s.includes("restaurant"))
    return "/assets/images/restaurants.webp";
  if (s.includes("extinguisher") || s.includes("refill"))
    return "/assets/images/about-team-fire-extinguisher.webp";
  if (s.includes("supply") || s.includes("trading") || s.includes("product"))
    return "/assets/images/warehouses.webp";
  return "/assets/images/commercial.webp";
}
