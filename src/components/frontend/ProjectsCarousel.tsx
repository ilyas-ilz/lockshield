"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useProjectMotion } from "@/lib/hooks/useProjectMotion";

export interface CarouselProject {
  title: string;
  slug: string;
  client?: string;
  sector?: string;
  emirate?: string;
  coverImage?: { url: string; alt?: string };
  image?: { url: string; alt?: string };
}

/**
 * Restores the legacy horizontal snap-scroll project gallery - the port had
 * flattened this into a static 3-card grid. Content is always visible (the
 * legacy version revealed the client line on hover only, which is
 * unreachable on a touch device - shown unconditionally here instead).
 */
export function ProjectsCarousel({ projects }: { projects: CarouselProject[] }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  // GSAP entrance + parallax replaces the generic Reveal wrapper here (which
  // would double-animate the same opacity/transform the tween owns).
  useProjectMotion(trackRef, [projects]);

  return (
    <div
      ref={trackRef}
      className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-5 sm:px-0"
    >
      {projects.map((project, idx) => (
        <div
          key={project.slug || idx}
          data-project-card
          className="w-[80%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-2*1.25rem)/3)]"
        >
          <Link
            href={`/projects/${project.slug}`}
            className="group relative block aspect-[3/3.4] overflow-hidden rounded-2xl bg-navy shadow-sm transition-all duration-500 [transition-timing-function:var(--ease-brand)] hover:-translate-y-2 hover:shadow-[0_16px_30px_-14px_rgba(13,18,32,0.34)]"
          >
            <div data-project-media className="absolute inset-0 scale-[1.12] will-change-transform">
              <Image
                src={project.coverImage?.url || project.image?.url || "/assets/images/commercial.webp"}
                alt={project.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 46vw, 80vw"
                className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-brand)] group-hover:scale-[1.08]"
              />
            </div>
            <div
              className="absolute inset-0 flex flex-col justify-end p-5 text-white"
              style={{ background: "linear-gradient(180deg, transparent 30%, rgba(13,18,32,0.78) 62%, rgba(13,18,32,0.95) 100%)" }}
            >
              <small className="font-tech inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/85 backdrop-blur-sm">
                {project.sector || "Commercial"} · {project.emirate || "Dubai"}
              </small>
              <b className="mt-2 text-base leading-snug sm:text-lg">{project.title}</b>
              {project.client && <span className="mt-0.5 text-xs text-white/75">Client: {project.client}</span>}
              <span className="mt-3 inline-flex items-center gap-1.5 border-t border-white/15 pt-3 text-xs font-semibold uppercase tracking-wider text-white/90 transition-colors group-hover:text-brand-400">
                View Project
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
