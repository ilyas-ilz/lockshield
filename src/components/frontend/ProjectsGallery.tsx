"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { Reveal } from "@/components/frontend/Reveal";

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

export function ProjectsGallery({ projects }: { projects: ProjectItem[] }) {
  const [selectedSector, setSelectedSector] = React.useState<string>("All");

  const sectors = React.useMemo(() => {
    const s = new Set<string>();
    projects.forEach((p) => {
      if (p.sector) s.add(p.sector);
    });
    return ["All", ...Array.from(s)];
  }, [projects]);

  const filtered = React.useMemo(() => {
    if (selectedSector === "All") return projects;
    return projects.filter((p) => p.sector === selectedSector);
  }, [projects, selectedSector]);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Filter Tabs */}
      {sectors.length > 2 && (
        <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
          {sectors.map((sector) => (
            <button
              key={sector}
              type="button"
              onClick={() => setSelectedSector(sector)}
              className={`flex min-h-11 shrink-0 snap-start cursor-pointer items-center rounded-full px-5 text-xs font-semibold transition-all sm:text-sm ${
                selectedSector === sector
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                  : "border border-[var(--marketing-line)] bg-white text-ink/70 hover:border-ink/30"
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {filtered.map((project, idx) => (
          <Reveal key={project.slug || idx} delayMs={(idx % 3) * 80}>
            <Link
              href={`/projects/${project.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--marketing-line)] bg-white transition-all duration-300 hover:border-brand-500 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-paper-soft">
                <Image
                  src={project.coverImage?.url || project.image?.url || "/assets/images/commercial.webp"}
                  alt={project.coverImage?.alt || project.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={idx < 3}
                />
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
          </Reveal>
        ))}
      </div>
    </div>
  );
}
