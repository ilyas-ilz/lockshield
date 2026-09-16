"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Modern scroll motion for project cards: staggered rise-in entrance plus a
 * subtle per-card image parallax scrubbed to vertical scroll. Scoped with
 * gsap.context and fully reverted on cleanup, so filter changes (projects
 * page) replay cleanly. Skips entirely under prefers-reduced-motion - the
 * cards simply render in their final state.
 *
 * Markup contract: cards carry `data-project-card`, their media wrapper
 * carries `data-project-media`.
 */
export function useProjectMotion<T>(rootRef: React.RefObject<HTMLElement | null>, deps: readonly T[]) {
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-project-card]", {
        y: 56,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: root, start: "top 85%", once: true },
      });

      gsap.utils.toArray<HTMLElement>("[data-project-media]").forEach((media) => {
        gsap.fromTo(
          media,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: media.closest("[data-project-card]") || media,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
