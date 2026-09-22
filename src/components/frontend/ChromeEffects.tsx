"use client";

import * as React from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Subtle chrome only — navbar intentionally untouched (already strong).
 * - 2px top scroll progress (brand red)
 * - One fixed bottom-right stack: back-to-top (after 800px) above the
 *   always-visible WhatsApp FAB. Single flex-col container with a fixed
 *   gap, so the two can never collide on any viewport.
 * - Magnetic nudge on [data-magnetic] (hero primary only) — 6px max,
 *   disabled on touch + reduced-motion so it never feels gimmicky.
 */
export function ChromeEffects({ whatsapp = "+971501234567" }: { whatsapp?: string }) {
  const [progress, setProgress] = React.useState(0);
  const [showTop, setShowTop] = React.useState(false);
  const whatsappNumber = (whatsapp || "").replace(/[^0-9]/g, "");

  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        setShowTop(window.scrollY > 800);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Magnetic — hero primary CTA only.
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const cleanups: Array<() => void> = [];
    for (const el of els) {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${(dx / r.width) * 6}px, ${(dy / r.height) * 6}px)`;
      };
      const leave = () => {
        el.style.transition = "transform 0.35s cubic-bezier(0.2,0.8,0.2,1)";
        el.style.transform = "";
        setTimeout(() => (el.style.transition = ""), 350);
      };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    }
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent" aria-hidden>
        <div className="h-full origin-left bg-brand-500" style={{ transform: `scaleX(${progress})` }} />
      </div>

      {/* Bottom-right floating stack — one container, fixed 12px gap.
          Back-to-top sits above WhatsApp; when hidden it collapses
          (size-0, no gap contribution) so WhatsApp drops to the corner. */}
      <div className="fixed right-4 z-50 flex flex-col items-center gap-3 [bottom:max(1rem,env(safe-area-inset-bottom))] sm:right-6 sm:[bottom:max(1.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          aria-label="Back to top"
          aria-hidden={!showTop}
          tabIndex={showTop ? 0 : -1}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={cn(
            "flex items-center justify-center overflow-hidden rounded-full border border-[var(--marketing-line)] bg-white text-navy-900 shadow-lg transition-all duration-300 hover:border-brand-500 hover:text-brand-500",
            showTop ? "size-11 opacity-100" : "pointer-events-none size-0 border-transparent opacity-0"
          )}
        >
          <ArrowUp className="size-5" />
        </button>

        <a
          href={`https://wa.me/${whatsappNumber}?text=Hello%20Lock%20Shield,%20I%20would%20like%20to%20enquire%20about%20fire%20protection%20services.`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex size-13 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl transition-all hover:scale-110 hover:bg-emerald-600 active:scale-95 sm:size-14"
        >
          <MessageCircle className="size-6 sm:size-7" />
        </a>
      </div>
    </>
  );
}
