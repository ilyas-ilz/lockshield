import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { ButtonLink } from "./Button";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Render `.wrap` inside automatically. Set false when the section needs full-bleed content (e.g. the marquee). */
  wrap?: boolean;
}

/**
 * Section rhythm, mobile-first. Legacy used `clamp(2.2rem,4.5vw,4rem)`
 * vertical padding (~35px-64px) - py-14/sm:py-20/lg:py-24 lands in the same
 * range without a fixed desktop-sized minimum forced onto small screens.
 */
export function Section({ children, className, wrap = true, ...rest }: SectionProps) {
  return (
    <section className={cn("py-14 sm:py-20 lg:py-24", className)} {...rest}>
      {wrap ? <div className="wrap">{children}</div> : children}
    </section>
  );
}

interface SectionHeadProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  action?: { label: string; href: string };
}

/**
 * Section heading row: eyebrow + H2, with an optional right-aligned CTA link
 * on desktop that drops below the heading on mobile instead of squeezing it.
 */
export function SectionHead({ eyebrow, title, description, action }: SectionHeadProps) {
  return (
    <Reveal
      as="div"
      className="mb-10 flex flex-col gap-5 sm:mb-14 md:flex-row md:items-end md:justify-between"
    >
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="font-tech mt-2 text-[clamp(1.6rem,5vw,2.75rem)] font-bold uppercase leading-tight tracking-tight text-navy-900">
          {title}
        </h2>
        {description && <p className="mt-3 max-w-md text-sm text-ink/60 sm:text-base">{description}</p>}
      </div>
      {action && (
        <ButtonLink href={action.href} variant="darkGhost" className="self-start bg-white md:self-auto">
          {action.label}
        </ButtonLink>
      )}
    </Reveal>
  );
}

/** Escape hatch for a plain "view all" text link where a full pill button is too heavy. */
export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:underline">
      {children}
    </Link>
  );
}
