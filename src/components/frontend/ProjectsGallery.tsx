"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { useProjectMotion } from "@/lib/hooks/useProjectMotion";
import { CardGrid } from "./CardGrid";

export interface ProjectItem {
  _id?: string;
  title: string;
  slug: string;
  client?: string;
  sector?: string;
  emirate?: string;
  year?: number;
  coverImage?: { url: string; alt?: string };
  image?: { url: string; alt?: string };
}

/**
 * WHY the sector filter is server-driven links rather than local state: once
 * the listing is paginated, filtering in the browser would only ever filter
 * the nine projects already on screen, so "Retail" on page 1 silently hid
 * every retail project on pages 2+. The page now queries Mongo by sector and
 * these tabs are just links that set `?sector=`, which also makes each filtered
 * view a real, shareable, crawlable URL.
 */
export function ProjectsGallery({
  projects,
  sectors,
  activeSector,
  basePath = "/projects",
}: {
  projects: ProjectItem[];
  /** Every sector across the whole collection, not just the current page. */
  sectors?: string[];
  activeSector?: string;
  basePath?: string;
}) {
  const tabs = React.useMemo(() => ["All", ...(sectors ?? [])], [sectors]);
  const current = activeSector ?? "All";

  const gridRef = React.useRef<HTMLDivElement>(null);
  useProjectMotion(gridRef, [projects]);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Filter Tabs — centred wrapping row on every viewport (never a
          full-bleed scroll strip, so the first pill can never clip at the
          screen edge). Compact on phones, roomier from sm up. */}
      {tabs.length > 2 && (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
          {tabs.map((sector) => {
            const isActive = current === sector;
            // Changing the filter always returns to page 1 — landing on
            // "?sector=Retail&page=4" of a one-page result is an empty grid.
            const href = sector === "All" ? basePath : `${basePath}?sector=${encodeURIComponent(sector)}`;
            return (
              <Link
                key={sector}
                href={href}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-10 cursor-pointer items-center rounded-full px-4 text-[11px] font-semibold transition-all sm:min-h-11 sm:px-5 sm:text-sm ${
                  isActive
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "border border-[var(--marketing-line)] bg-white text-ink/70 hover:border-ink/30"
                }`}
              >
                {sector}
              </Link>
            );
          })}
        </div>
      )}

      {/* Grid */}
      <div ref={gridRef}>
        <CardGrid>
        {projects.map((project, idx) => (
          <div key={project.slug || idx} data-project-card>
            <Link
              href={`/projects/${project.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--marketing-line)] bg-white transition-all duration-300 hover:border-brand-500 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-paper-soft">
                <div data-project-media className="absolute inset-0 scale-[1.12] will-change-transform">
                  <Image
                    src={project.coverImage?.url || project.image?.url || "/assets/images/commercial.webp"}
                    alt={project.coverImage?.alt || project.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={idx < 3}
                  />
                </div>
                {project.sector && (
                  <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-navy-900 shadow-xs backdrop-blur-xs">
                    {project.sector}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-ink/50">
                  {project.emirate && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-brand-500" />
                      {project.emirate}
                    </span>
                  )}
                  {project.client && <span>· {project.client}</span>}
                </div>
                <h3 className="font-tech mt-1.5 text-lg font-bold uppercase tracking-wide text-navy-900 transition-colors group-hover:text-brand-500">
                  {project.title}
                </h3>
                <div className="mt-auto flex items-center justify-between border-t border-[var(--marketing-line)] pt-4 text-xs font-semibold text-ink/50 group-hover:text-brand-500">
                  <span>View Case Study</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>
        ))}
        </CardGrid>
      </div>
    </div>
  );
}
