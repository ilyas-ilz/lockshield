import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  /** Breadcrumb trail, e.g. [{ label: "Home", href: "/" }, { label: "About" }]. */
  crumbs: Crumb[];
  /** Plain heading text before the accent span. */
  title: string;
  /** Accent (red) portion of the heading, rendered on its own line. */
  accent: string;
  description?: string;
}

/**
 * Shared inner-page hero band - replaces the `pt-36 pb-16 bg-[#0d1220] ...`
 * block that was copy-pasted into 8 separate page files. Matches the legacy
 * `.page-hero`: dark ink background, faint white grid, a red radial glow in
 * the top-right, and an uppercase two-line heading.
 *
 * Mobile-first: padding-top shrinks on small screens (the floating navbar is
 * shorter there), and the heading uses the same clamp() the legacy CSS used
 * so it never overflows a 375px viewport.
 */
export function PageHero({ crumbs, title, accent, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-ink pb-12 pt-28 text-white sm:pb-16 sm:pt-32 lg:pt-36">
      <div className="blueprint-grid-dark pointer-events-none absolute inset-0 opacity-10" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 180% at 90% 0%, rgba(224,27,36,.4), transparent 55%)" }}
      />
      <div className="wrap relative z-10 text-center sm:text-left">
        <Reveal className="font-tech flex flex-wrap items-center justify-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-white/55 sm:justify-start sm:text-xs sm:tracking-[0.25em]">
          {crumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3 text-brand-500" aria-hidden />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-brand-400 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </Reveal>

        <Reveal delayMs={80} as="div" className="mt-4">
          <h1 className="font-tech text-[clamp(2.1rem,7vw,3.6rem)] font-black uppercase leading-[1.05] tracking-tight text-white">
            {title} <span className="text-brand-500">{accent}</span>
          </h1>
        </Reveal>

        {description && (
          <Reveal delayMs={140} as="div" className="mx-auto mt-4 max-w-xl sm:mx-0">
            <p className="text-sm leading-relaxed text-white/75 sm:text-base">{description}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
