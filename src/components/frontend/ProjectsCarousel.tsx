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
 * Premium hover card — layout-identical to before (same aspect, radius,
 * content, CTA). Only interaction is layered on:
 * - card lift 4px + deeper shadow (transform/opacity only, neighbours never move)
 * - image zoom 1 → 1.055, clipped, GPU transform
 * - cursor parallax on the image only (±7px max, rAF-throttled, fine pointers)
 * - cursor spotlight (soft white + faint brand tint, hover-capable devices only)
 * - one-shot diagonal sheen on enter (no loop)
 * - content rises 4px; CTA turns brand red, arrow slides 6px
 * - hairline brand ring trace on hover
 * Reduced-motion + touch: motion layers stay off, card keeps its normal look.
 */
const ProjectCard = React.memo(function ProjectCard({ project }: { project: CarouselProject }) {
  const cardRef = React.useRef<HTMLAnchorElement>(null);
  const rafRef = React.useRef(0);
  const pendingRef = React.useRef<{ x: number; y: number } | null>(null);

  const clearRaf = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    pendingRef.current = null;
  };

  React.useEffect(() => clearRaf, []);

  const motionOK = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const applyPending = () => {
    rafRef.current = 0;
    const el = cardRef.current;
    const p = pendingRef.current;
    pendingRef.current = null;
    if (!el || !p) return;
    const r = el.getBoundingClientRect();
    const nx = (p.x - r.left) / r.width - 0.5; // -0.5 … 0.5
    const ny = (p.y - r.top) / r.height - 0.5;
    el.style.setProperty("--px", `${(-nx * 14).toFixed(1)}px`);
    el.style.setProperty("--py", `${(-ny * 14).toFixed(1)}px`);
    el.style.setProperty("--mx", `${(p.x - r.left).toFixed(0)}px`);
    el.style.setProperty("--my", `${(p.y - r.top).toFixed(0)}px`);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 0 || !motionOK()) return; // never fight track-dragging
    pendingRef.current = { x: e.clientX, y: e.clientY };
    if (!rafRef.current) rafRef.current = requestAnimationFrame(applyPending);
  };

  const onMouseLeave = () => {
    clearRaf();
    const el = cardRef.current;
    if (!el) return;
    el.style.removeProperty("--px");
    el.style.removeProperty("--py");
    el.style.removeProperty("--mx");
    el.style.removeProperty("--my");
  };

  return (
    <Link
      ref={cardRef}
      href={`/projects/${project.slug}`}
      draggable={false}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative block aspect-[3/3.4] overflow-hidden rounded-2xl bg-navy shadow-sm transition-[transform,box-shadow] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(13,18,32,0.42)]"
    >
      {/* Media — outer keeps the GSAP scroll-parallax contract (data-project-media);
          inner layers are hover-only so the two never fight over one transform. */}
      <div data-project-media className="absolute inset-0 scale-[1.12] will-change-transform">
        <span className="block h-full w-full transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.055] will-change-transform">
          <span
            className="block h-full w-full will-change-transform"
            style={{ transform: "translate3d(var(--px, 0px), var(--py, 0px), 0)", transition: "transform 0.2s ease-out" }}
          >
            <Image
              src={project.coverImage?.url || project.image?.url || "/assets/images/commercial.webp"}
              alt={project.title}
              fill
              draggable={false}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 46vw, 80vw"
              className="object-cover"
            />
          </span>
        </span>

        {/* Cinematic deepen on hover */}
        <span aria-hidden className="absolute inset-0 bg-ink/0 transition-colors duration-[650ms] group-hover:bg-ink/15" />

        {/* Cursor spotlight — hover-capable pointers only, never neon */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.14), rgba(224,27,36,0.05) 46%, transparent 70%)",
          }}
        />

        {/* One-shot diagonal sheen on enter — hover pointers only, no loop */}
        <span aria-hidden className="absolute inset-0 overflow-hidden">
          <span
            className="absolute inset-y-[-20%] left-0 w-1/3 -translate-x-[320%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/[0.09] to-transparent [@media(hover:hover)]:group-hover:translate-x-[420%] [@media(hover:hover)]:group-hover:transition-transform [@media(hover:hover)]:group-hover:duration-900 [@media(hover:hover)]:group-hover:ease-[cubic-bezier(0.22,1,0.36,1)]"
          />
        </span>
      </div>

      {/* Hairline brand trace — extremely subtle, skipped under reduced motion by the global rule */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent transition-colors duration-[650ms] group-hover:border-brand-500/50"
      />

      {/* Content — rises 4px as one GPU layer; type/spacing untouched */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-5 text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1"
        style={{ background: "linear-gradient(180deg, transparent 30%, rgba(13,18,32,0.78) 62%, rgba(13,18,32,0.95) 100%)" }}
      >
        <small className="font-tech inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/85 backdrop-blur-sm">
          {project.sector || "Commercial"} · {project.emirate || "Dubai"}
        </small>
        <b className="mt-2 text-base leading-snug sm:text-lg">{project.title}</b>
        {project.client && <span className="mt-0.5 text-xs text-white/75">Client: {project.client}</span>}
        <span className="mt-3 inline-flex items-center gap-1.5 border-t border-white/15 pt-3 text-xs font-semibold uppercase tracking-wider text-white/90 transition-colors duration-300 group-hover:text-brand-400">
          View Project
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:opacity-100" aria-hidden />
        </span>
      </div>
    </Link>
  );
});

/**
 * Horizontal snap-scroll project gallery — kept clean on purpose.
 * Adds: image parallax (GSAP), pointer drag-to-scroll, thin progress
 * rail. No autoplay, no arrows — links + content unchanged.
 */
export function ProjectsCarousel({ projects }: { projects: CarouselProject[] }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  // GSAP entrance + parallax replaces the generic Reveal wrapper here (which
  // would double-animate the same opacity/transform the tween owns).
  useProjectMotion(trackRef, [projects]);

  const drag = React.useRef({ down: false, startX: 0, startLeft: 0, moved: false });

  // Pointer drag — works with mouse + touch without breaking snap or links.
  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 6) {
      drag.current.moved = true;
      el.scrollLeft = drag.current.startLeft - dx;
    }
  };
  const endDrag = () => {
    drag.current.down = false;
  };

  return (
    <div>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(e) => {
          // A drag that ends on a card must not follow the link.
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.moved = false;
          }
        }}
        className="scrollbar-none -mx-4 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 active:cursor-grabbing sm:mx-0 sm:gap-5 sm:px-0"
      >
        {projects.map((project, idx) => (
          <div
            key={project.slug || idx}
            data-project-card
            className="w-[80%] shrink-0 snap-start select-none sm:w-[46%] lg:w-[calc((100%-2*1.25rem)/3)]"
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </div>
  );
}
