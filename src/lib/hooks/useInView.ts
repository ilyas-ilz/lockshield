"use client";

import * as React from "react";

interface UseInViewOptions {
  /** Fraction of the element that must be visible before it counts. */
  threshold?: number;
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
  const { threshold = 0.15, keepObserving = false } = options;
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
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, keepObserving]);

  return [ref, inView];
}
