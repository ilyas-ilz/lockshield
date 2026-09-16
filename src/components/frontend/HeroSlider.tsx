"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Headset, HardHat, ArrowRight, ChevronRight } from "lucide-react";
import { QuoteModal } from "./QuoteModal";

const SLIDES = [
  "/assets/images/bg-banner-01.webp",
  "/assets/images/banner-1.webp",
  "/assets/images/banner-3.webp",
  "/assets/images/banner-4.webp",
];

const HEADLINE_LINES = ["Complete", "Fire Protection", "Solutions", "You Can Trust"];

const FEATURES = [
  { icon: ShieldCheck, title: "Civil Defence Approved", desc: "DCD compliant drawings, inspection & approvals", tint: "brand" },
  { icon: Headset, title: "24/7 Expert Support", desc: "Always on-call rapid response across UAE", tint: "blue" },
  { icon: HardHat, title: "Certified Engineers", desc: "Certified professionals with 15+ years experience", tint: "amber" },
] as const;

const TINT_CLASSES: Record<(typeof FEATURES)[number]["tint"], string> = {
  brand: "bg-brand-500/20 border-brand-500/30 text-brand-500",
  blue: "bg-blue-500/20 border-blue-500/30 text-blue-400",
  amber: "bg-amber-500/20 border-amber-500/30 text-amber-400",
};

export function HeroSlider() {
  const [current, setCurrent] = React.useState(0);
  const [quoteOpen, setQuoteOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    // Mobile-first: no forced min-height on small screens - four feature
    // cards plus the headline would otherwise get crushed into a fixed
    // 92vh box and push the CTA off-screen. The full-height treatment is a
    // desktop enhancement, not the mobile baseline.
    <section className="relative flex items-center justify-center overflow-hidden bg-ink pb-10 pt-24 sm:min-h-[85vh] sm:pb-16 sm:pt-28 lg:min-h-[92vh]">
      {/* Background Image Carousel with Crossfade */}
      <div className="absolute inset-0 z-0">
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? "opacity-40" : "pointer-events-none opacity-0"
            }`}
          >
            {/* All four are always in the DOM (crossfade toggles opacity, not
                mount) and each occupies the full hero, so any one of them
                can be the LCP candidate depending on load timing - not just
                index 0. All four get `priority`. */}
            <Image src={src} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>
        ))}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
        <div className="blueprint-grid-dark absolute inset-0 opacity-20" />
      </div>

      {/* Main Content */}
      <div className="wrap relative z-10 w-full pt-6 sm:pt-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-5 sm:space-y-6 lg:col-span-8">
            {/* Tag / Badge */}
            <div className="rise d1 inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/20 px-4 py-1.5 text-xs font-semibold tracking-wide text-white sm:text-sm">
              <span className="size-2 animate-ping rounded-full bg-brand-500" />
              <span>Dubai Civil Defence Approved Contractor</span>
            </div>

            {/* Main Headline - legacy line-mask reveal */}
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

            {/* CTA Buttons */}
            <div className="rise d3 flex flex-wrap items-center gap-3 pt-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
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

          {/* Right Pillar Features Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1 lg:gap-3.5">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="rise flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:border-brand-500/50"
                style={{ animationDelay: `${0.6 + i * 0.15}s` }}
              >
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl border ${TINT_CLASSES[feature.tint]}`}>
                  <feature.icon className="size-6" />
                </div>
                <div>
                  <h4 className="font-tech text-sm font-bold uppercase tracking-wide text-white">{feature.title}</h4>
                  <p className="mt-0.5 text-xs text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Dots */}
        {/* The visible dot stays small, but the button around it is a full
            44px tap target - the dot alone was 6px tall and unhittable on a phone. */}
        <div className="mt-8 flex items-center justify-center sm:mt-12">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="group flex h-11 cursor-pointer items-center justify-center px-2"
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${
                  i === current ? "w-8 bg-brand-500" : "w-2 bg-white/30 group-hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <QuoteModal open={quoteOpen} onOpenChange={setQuoteOpen} />
    </section>
  );
}
