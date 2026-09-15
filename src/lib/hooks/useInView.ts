"use client";

import * as React from "react";

interface UseInViewOptions {
  /**
   * Fraction of the *target element* that must be visible before it counts.
   * Ratio-based, so it's unsatisfiable for any target taller than
   * `viewportHeight / threshold` (e.g. a long blog article body easily
   * exceeds that) - such targets would stay permanently hidden. Defaults to
   * 0 (any pixel overlap counts) precisely because content height varies
   * wildly across call sites (small cards vs. full article bodies); pass a
   * higher value only for elements you know are viewport-sized or smaller.
   */
  threshold?: number;
  /** Shrinks/grows the root's bounding box before intersection is computed - percentages here are relative to the viewport, not the target, so they stay correct regardless of target size. */
  rootMargin?: string;
  /** Once true, keep observing forever instead of disconnecting after the first hit. */
  keepObserving?: boolean;
}

/**
 * Mirrors the legacy site's scroll-reveal IntersectionObserver: fires once
 * the element crosses `threshold`, then (by default) stops observing - the
 * same "observe once" behaviour used for every .reveal, the FAQ/testimonial
 * sections, the stat counters and the timeline fill on the old static site.
 */
export function useInView<T extends HTMLElement>(
  options: UseInViewOptions = {}
): [React.RefObject<T | null>, boolean] {
  const { threshold = 0, rootMargin = "0px 0px -10% 0px", keepObserving = false } = options;
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No IntersectionObserver (very old browser, or a test/SSR environment
    // that forgot to polyfill it) - fail open rather than leaving content
    // permanently hidden.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (!keepObserving) observer.unobserve(entry.target);
          } else if (keepObserving) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, keepObserving]);

  return [ref, inView];
}
