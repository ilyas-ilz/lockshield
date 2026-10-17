"use client";

import * as React from "react";
import { useInView } from "@/lib/hooks/useInView";
import { cn } from "@/lib/utils";

interface CounterProps {
  target: number;
  suffix?: string;
  className?: string;
}

/**
 * Count-up number, ported from the legacy site's stat counter: eases from 0
 * to `target` over 1600ms (cubic ease-out) once scrolled into view, then
 * pulses briefly on finish. Counts once - re-scrolling past it doesn't
 * restart the animation.
 *
 * WHY it starts at `target`, not 0: the server HTML is what Google and link
 * previews read, and "0+ Employees, 0+ Projects Completed" looked like an
 * unfinished template. It drops to 0 only after hydration, while still
 * off-screen, so visitors see the same count-up as before.
 */
export function Counter({ target, suffix = "+", className }: CounterProps) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const [value, setValue] = React.useState(target);
  const [pulsing, setPulsing] = React.useState(false);

  React.useEffect(() => {
    if (!inView) {
      setValue(0);
      return;
    }
    const duration = 1600;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setPulsing(true);
        setTimeout(() => setPulsing(false), 550);
      }
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return (
    <span ref={ref} className={cn(pulsing && "animate-stat-pulse", className)}>
      {value}
      {suffix}
    </span>
  );
}
