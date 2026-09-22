"use client";

import * as React from "react";
import { useInView } from "@/lib/hooks/useInView";
import { cn } from "@/lib/utils";

export type RevealVariant = "fade-up" | "fade-left" | "fade-right" | "scale" | "clip";

interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Optional stagger, in ms - mirrors the legacy site's 80ms sibling stagger. */
  delayMs?: number;
  as?: "div" | "li";
  /**
   * Motion variant. Defaults to "fade-up" (legacy behaviour) so every
   * existing <Reveal delayMs> call site keeps working unchanged.
   * Use sparingly — not every block on the page should animate.
   */
  variant?: RevealVariant;
}

/**
 * Scroll-reveal wrapper — React equivalent of the legacy `.reveal` class.
 * IntersectionObserver toggles `.in`; the actual motion lives in
 * globals.css per-variant. Respects prefers-reduced-motion via CSS.
 */
export function Reveal({ children, className, delayMs, as = "div", variant = "fade-up", style, ...rest }: RevealProps) {
  const [ref, inView] = useInView<HTMLElement>();

  return React.createElement(
    as,
    {
      ref,
      className: cn("reveal", `reveal-${variant}`, inView && "in", className),
      style: delayMs ? { ...style, transitionDelay: `${delayMs}ms` } : style,
      ...rest,
    },
    children
  );
}
