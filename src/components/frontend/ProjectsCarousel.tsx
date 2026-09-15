import Link from "next/link";
import Image from "next/image";
import { Reveal } from "./Reveal";

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
  return (
    <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-5 sm:px-0">
      {projects.map((project, idx) => (
        <Reveal
          key={project.slug || idx}
          delayMs={(idx % 3) * 80}
          className="w-[80%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-2*1.25rem)/3)]"
        >
          <Link
            href={`/projects/${project.slug}`}
            className="group relative block aspect-[3/3.4] overflow-hidden rounded-2xl bg-navy shadow-sm transition-all duration-500 [transition-timing-function:var(--ease-brand)] hover:-translate-y-2 hover:shadow-[0_16px_30px_-14px_rgba(13,18,32,0.34)]"
          >
            <Image
              src={project.coverImage?.url || project.image?.url || "/assets/images/commercial.webp"}
              alt={project.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 46vw, 80vw"
              className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-brand)] group-hover:scale-[1.08]"
            />
            <div
              className="absolute inset-0 flex flex-col justify-end p-5 text-white"
              style={{ background: "linear-gradient(180deg, transparent 40%, rgba(13,18,32,0.92) 100%)" }}
            >
              <small className="font-tech text-[11px] uppercase tracking-[0.15em] text-white/70">
                {project.sector || "Commercial"} · {project.emirate || "Dubai"}
              </small>
              <b className="mt-1 text-base leading-snug sm:text-lg">{project.title}</b>
              {project.client && <span className="mt-1 text-xs text-white/80">{project.client}</span>}
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
