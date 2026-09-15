"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

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
    <div className="space-y-10">
      {/* Filter Tabs */}
      {sectors.length > 2 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {sectors.map((sector) => (
            <button
              key={sector}
              type="button"
              onClick={() => setSelectedSector(sector)}
              className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedSector === sector
                  ? "bg-[#e01b24] text-white shadow-md shadow-[#e01b24]/20"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400"
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((project, idx) => (
          <Link
            key={project.slug || idx}
            href={`/projects/${project.slug}`}
            className="group rounded-3xl overflow-hidden border border-gray-200 bg-white hover:border-[#e01b24] hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.coverImage?.url || project.image?.url || "/assets/images/commercial.webp"}
                alt={project.title}
                className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {project.sector && (
                <div className="absolute top-4 left-4 rounded-full bg-white/95 backdrop-blur-xs px-3 py-1 text-[11px] font-bold text-gray-900 shadow-xs">
                  {project.sector}
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                {project.emirate && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3 text-[#e01b24]" />
                    {project.emirate}
                  </span>
                )}
                {project.client && <span>· {project.client}</span>}
              </div>
              <h3 className="font-tech text-lg font-bold uppercase tracking-wide text-gray-900 mt-1.5 group-hover:text-[#e01b24] transition-colors">
                {project.title}
              </h3>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500 group-hover:text-[#e01b24]">
                <span>View Case Study</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
