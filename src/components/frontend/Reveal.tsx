"use client";

import * as React from "react";
import { useInView } from "@/lib/hooks/useInView";
import { cn } from "@/lib/utils";

interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Optional stagger, in ms - mirrors the legacy site's 80ms sibling stagger. */
  delayMs?: number;
  as?: "div" | "li";
}

/**
 * Scroll-reveal wrapper - the React equivalent of the legacy `.reveal`
 * class + its IntersectionObserver. Renders a plain wrapper element that
 * starts translated/faded and animates to its resting state once it enters
 * the viewport. Respects prefers-reduced-motion via the CSS in globals.css,
 * not JS - this component keeps working with reduced motion, it just
 * animates instantly.
 */
export function Reveal({ children, className, delayMs, as = "div", style, ...rest }: RevealProps) {
  const [ref, inView] = useInView<HTMLElement>();

  return React.createElement(
    as,
    {
      ref,
      className: cn("reveal", inView && "in", className),
      style: delayMs ? { ...style, transitionDelay: `${delayMs}ms` } : style,
      ...rest,
    },
    children
  );
}
