"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { QuoteModal } from "./QuoteModal";

gsap.registerPlugin(ScrollTrigger);

const SLIDES = [
  "/assets/images/bg-banner-01.webp",
  "/assets/images/banner-1.webp",
  "/assets/images/banner-3.webp",
  "/assets/images/banner-4.webp",
];

const HEADLINE_LINES = ["Complete", "Fire Protection", "Solutions", "You Can Trust"];

const DURATION_MS = 5500;

export function HeroSlider() {
  const [current, setCurrent] = React.useState(0);
  const [quoteOpen, setQuoteOpen] = React.useState(false);
  const sectionRef = React.useRef<HTMLElement>(null);
  const bgRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  // Subtle scroll parallax: bg drifts down, content rises + fades.
  // Scrubbed to scroll so it feels glued to the finger, not timed.
  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: 14,
        scale: 1.06,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(contentRef.current, {
        y: -70,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "70% top", scrub: true },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="hero-pin relative flex items-center justify-center bg-ink pb-28 pt-24 sm:pb-32 sm:pt-28">
      {/* Background layer — animated slide image only */}
      <div ref={bgRef} className="absolute inset-0 z-0 will-change-transform">
        {SLIDES.map((src, i) => {
          const active = i === current;
          return (
            <div
              key={src}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${
                active ? "opacity-40" : "pointer-events-none opacity-0"
              }`}
            >
              <div className={`absolute inset-0 ${active ? "[animation:heroKenBurns_7s_ease-out_forwards]" : ""}`}>
                {/* All four are always in the DOM (crossfade toggles opacity, not
                    mount) and each occupies the full hero, so any one of them
                    can be the LCP candidate depending on load timing - not just
                    index 0. All four get `priority`. */}
                <Image src={src} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
              </div>
            </div>
          );
        })}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
      </div>

      {/* Content layer — static headline, never remounted per slide */}
      <div ref={contentRef} className="wrap relative z-10 w-full pt-6 will-change-transform sm:pt-8">
        <div className="grid grid-cols-1 items-center gap-10">
          <div className="space-y-5 sm:space-y-6">
            {/* Main Headline - legacy line-mask reveal, plays once on load */}
            <h1 className="font-tech text-[clamp(2.1rem,9vw,4.6rem)] font-bold uppercase leading-[0.98] tracking-tight text-white xl:text-7xl">
              {HEADLINE_LINES.map((line, i) => (
                <span key={line} className="hero-line">
                  <span
                    className={i === 3 ? "text-brand-500" : "text-white"}
                    style={{ animationDelay: `${i * 0.12}s` }}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            {/* Description */}
            <p className="rise d2 max-w-2xl text-sm font-light leading-relaxed text-gray-300 sm:text-lg">
              We design, install, test, and maintain world-class firefighting and suppression
              systems across Dubai &amp; the UAE.
            </p>

            {/* CTA Buttons — magnetic kept to primary only (see useMagnetic), secondary stays static */}
            <div className="rise d3 flex flex-wrap items-center gap-3 pt-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                data-magnetic
                className="btn-pill inline-flex min-h-11 items-center gap-2 bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-xl shadow-brand-500/30 transition-all hover:bg-brand-600 active:scale-95 cursor-pointer"
              >
                <span>Request a Free Quote</span>
                <ArrowRight className="size-4" />
              </button>

              <Link
                href="/services"
                className="btn-pill inline-flex min-h-11 items-center gap-2 border border-white/20 bg-white/10 py-3.5 text-sm font-semibold text-white backdrop-blur-xs transition-colors hover:bg-white/20"
              >
                <span>Explore Services</span>
                <ChevronRight className="size-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination — fixed absolute layer, OUTSIDE bg + content wrappers.
          Never remounts; only the inner active pill animates. */}
      <div className="hero-pagination absolute bottom-10 left-1/2 z-20 -translate-x-1/2 sm:bottom-12 lg:bottom-[76px]">
        <div className="flex items-center justify-center">
          {SLIDES.map((_, i) => {
            const isActive = i === current;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
                className="group flex h-11 cursor-pointer items-center justify-center px-2"
              >
                <span
                  className={`relative block h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-300 ease-out ${
                    isActive ? "w-10 bg-white/25" : "w-2 bg-white/30 group-hover:bg-white/60"
                  }`}
                >
                  {isActive && (
                    <span
                      key={`progress-${current}`}
                      className="absolute inset-y-0 left-0 rounded-full bg-brand-500 [animation:heroProgress_5.5s_linear_forwards]"
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <QuoteModal open={quoteOpen} onOpenChange={setQuoteOpen} />
    </section>
  );
}
