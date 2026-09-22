"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { Reveal } from "@/components/frontend/Reveal";
import { serviceIcon, serviceImage } from "@/components/frontend/serviceMeta";
import { cn } from "@/lib/utils";

export interface ExpandingService {
  title: string;
  slug: string;
  summary: string;
}

const EXPAND_FLEX = 3.1;
const DURATION = 0.9;

/**
 * True horizontal expanding-card accordion (desktop lg+).
 * GSAP animates real flex-grow (layout width changes, neighbours compress).
 * Smoothness notes:
 * - Tween fires imperatively on hover (no useEffect-after-paint lag).
 * - expo.out over 0.9s: fast take-off, long buttery settle (power3 felt abrupt).
 * - Inner image/text use transform+opacity only (GPU), never layout.
 * - Cards memoized so hover re-render doesn't remount <Image>.
 */
const DesktopCard = React.memo(function DesktopCard({
  service,
  isActive,
  dimmed,
  registerRef,
  onActivate,
  onTap,
}: {
  service: ExpandingService;
  isActive: boolean;
  dimmed: boolean;
  registerRef: (el: HTMLAnchorElement | null) => void;
  onActivate: () => void;
  onTap: (e: React.MouseEvent) => void;
}) {
  const Icon = serviceIcon(service.slug);
  return (
    <Link
      href={`/services/${service.slug}`}
      role="listitem"
      ref={registerRef}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onTap}
      aria-label={`${service.title} — view service`}
      className={cn(
        "group relative block h-[520px] min-w-0 translate-z-0 overflow-hidden rounded-2xl border bg-navy will-change-[flex-grow]",
        isActive
          ? "border-brand-500 shadow-[0_28px_70px_rgba(224,27,36,0.30)]"
          : "border-[var(--marketing-line)]"
      )}
      style={{
        flexGrow: 1,
        flexBasis: 0,
        flexShrink: 1,
        opacity: dimmed ? 0.9 : 1,
        transition: "opacity 0.4s ease, border-color 0.4s ease, box-shadow 0.5s ease",
      }}
    >
      {/* Image — transform-only settle, GPU promoted */}
      <span className="absolute inset-0 block overflow-hidden" aria-hidden>
        <Image
          src={serviceImage(service.slug)}
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1280px) 30vw, 25vw"
          className={cn(
            "object-cover object-center will-change-transform [transform:translateZ(0)] transition-transform duration-[1200ms] ease-out",
            isActive ? "scale-100" : "scale-[1.12]"
          )}
        />
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-[#0b1020] via-[#0b1020]/45 to-transparent transition-opacity duration-500",
          isActive ? "opacity-100" : "opacity-100"
        )}
      />
      {/* Extra dim for collapsed cards so vertical label pops like reference */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 bg-[#0b1020]/45 transition-opacity duration-500",
          isActive ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Collapsed strip content — vertical title only (no description).
          Exit instantly when card starts opening.
          Re-enter only near the end of shrink so it doesn't
          pop in while width is still animating. */}
      <span
        aria-hidden={isActive}
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 will-change-[opacity,transform] [transform:translateZ(0)]",
          isActive
            ? "pointer-events-none -translate-y-2 opacity-0 transition-[opacity,transform] duration-150 ease-in"
            : "translate-y-0 opacity-100 transition-[opacity,transform] delay-[550ms] duration-[450ms] ease-out"
        )}
      >
        <span className="font-tech block rotate-180 text-[13px] font-bold uppercase tracking-[0.22em] text-white/90 [writing-mode:vertical-rl]">
          {service.title}
        </span>
      </span>

      {/* Expanded content — fixed width so text never reflows/squishes.
          OPEN: card widens first, text fades/slides up after (380ms delay).
          CLOSE: text fades/drops first (160ms, no delay) BEFORE the
          flex shrink starts (JS delays shrink by 140ms) — so the
          description is already gone while collapsing, no linger/squish. */}
      <span
        aria-hidden={!isActive}
        className={cn(
          "absolute bottom-0 left-0 block w-[340px] max-w-[88%] p-7 will-change-[opacity,transform] [transform:translateZ(0)]",
          isActive
            ? "translate-y-0 opacity-100 transition-[opacity,transform] delay-[380ms] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            : "pointer-events-none translate-y-2 opacity-0 transition-[opacity,transform] duration-150 ease-in"
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/40">
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="font-tech mt-4 block text-[13px] font-semibold uppercase tracking-[0.22em] text-brand-400">
          Specialized solutions
        </span>
        <span className="font-tech mt-1 block text-2xl font-bold uppercase leading-[1.05] tracking-tight text-white">
          {service.title}
        </span>
        <span className="mt-3 block text-sm leading-relaxed text-white/75">{service.summary}</span>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-400">
          Learn More
          <span className="flex size-7 items-center justify-center rounded-full bg-brand-500 text-white">
            <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </span>
      </span>

      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl ring-1 transition-opacity duration-500",
          isActive ? "opacity-100 ring-brand-500" : "opacity-0 ring-transparent"
        )}
      />
    </Link>
  );
});

export function ServicesExpandingGrid({ services }: { services: ExpandingService[] }) {
  const [active, setActive] = React.useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState<number | null>(0);
  const cardRefs = React.useRef<Array<HTMLAnchorElement | null>>([]);
  const activeRef = React.useRef<number | null>(null);
  const reduced = React.useRef(false);

  React.useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Imperative tween — runs the same frame as hover, no render-then-effect lag.
  // Close choreography: outgoing card's description fades in 150ms (CSS, no delay),
  // its flex shrink is delayed 140ms so text is gone BEFORE width collapses.
  // Open choreography: incoming card widens immediately, its text appears
  // after 380ms delay (CSS) once width is mostly open.
  const tweenTo = React.useCallback((next: number | null) => {
    const prev = activeRef.current;
    if (prev === next) return;
    activeRef.current = next;
    setActive(next);
    const cards = cardRefs.current.filter(Boolean) as HTMLAnchorElement[];
    if (cards.length === 0) return;
    if (reduced.current) {
      cards.forEach((el, i) => {
        gsap.set(el, { flexGrow: next === null ? 1 : next === i ? EXPAND_FLEX : 1 });
      });
      return;
    }
    cards.forEach((el, i) => {
      const isExpanding = next !== null && next === i;
      const isShrinkingOutgoing = i === prev && prev !== null && next !== prev;
      gsap.to(el, {
        flexGrow: next === null ? 1 : next === i ? EXPAND_FLEX : 1,
        duration: DURATION,
        ease: "expo.out",
        delay: isExpanding ? 0 : isShrinkingOutgoing ? 0.14 : 0,
        overwrite: "auto",
      });
    });
  }, []);

  const isTouchDevice = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

  return (
    <>
      {/* Mobile / tablet: stacked tap accordion */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:hidden">
        {services.map((service, idx) => {
          const Icon = serviceIcon(service.slug);
          const open = mobileOpen === idx;
          return (
            <Reveal key={service.slug || idx} delayMs={(idx % 4) * 60}>
              <div
                className={cn(
                  "overflow-hidden rounded-3xl border bg-navy transition-colors duration-300",
                  open ? "border-brand-500/60 shadow-[0_20px_50px_rgba(224,27,36,0.22)]" : "border-[var(--marketing-line)]"
                )}
              >
                <button
                  type="button"
                  onClick={() => setMobileOpen(open ? null : idx)}
                  aria-expanded={open}
                  className="relative block h-52 w-full cursor-pointer overflow-hidden text-left sm:h-60"
                >
                  <Image
                    src={serviceImage(service.slug)}
                    alt=""
                    aria-hidden
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                  <span className="absolute bottom-0 inset-x-0 flex items-end gap-3 p-5">
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                        open ? "bg-brand-500 text-white" : "bg-white/15 text-white backdrop-blur-sm"
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="font-tech text-sm font-bold uppercase leading-snug tracking-wide text-white">
                      {service.title}
                    </span>
                  </span>
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-500 [transition-timing-function:var(--ease-brand)]",
                    open ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-3 bg-white p-5">
                      <p className="text-sm leading-relaxed text-ink/65">{service.summary}</p>
                      <Link
                        href={`/services/${service.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-500"
                      >
                        Learn More <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Desktop: GSAP flex-grow accordion — fixed total width, cards compress */}
      <div
        className="hidden lg:flex lg:items-stretch lg:gap-3"
        onMouseLeave={() => tweenTo(null)}
        role="list"
      >
        {services.map((service, idx) => (
          <DesktopCard
            key={service.slug || idx}
            service={service}
            isActive={active === idx}
            dimmed={active !== null && active !== idx}
            registerRef={(el) => {
              cardRefs.current[idx] = el;
            }}
            onActivate={() => tweenTo(idx)}
            onTap={(e) => {
              if (isTouchDevice() && activeRef.current !== idx) {
                e.preventDefault();
                tweenTo(idx);
              }
            }}
          />
        ))}
      </div>
    </>
  );
}
