"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Headset, HardHat, Award, ArrowRight, ChevronRight, Phone } from "lucide-react";
import { QuoteModal } from "./QuoteModal";

const SLIDES = [
  "/assets/images/bg-banner-01.webp",
  "/assets/images/banner-1.webp",
  "/assets/images/banner-3.webp",
  "/assets/images/banner-4.webp",
];

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
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-[#0d1220]">
      {/* Background Image Carousel with Crossfade */}
      <div className="absolute inset-0 z-0">
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              i === current ? "opacity-40 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
            style={{ backgroundImage: `url(${src})`, transitionProperty: "opacity, transform" }}
          />
        ))}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1220] via-[#0d1220]/70 to-[#0d1220]/40" />
        <div className="blueprint-grid-dark absolute inset-0 opacity-20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 space-y-6">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e01b24]/20 border border-[#e01b24]/40 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white tracking-wide">
              <span className="size-2 rounded-full bg-[#e01b24] animate-ping" />
              <span>Civil Defence Approved Fire Safety UAE</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-tech text-4xl sm:text-6xl xl:text-7xl font-bold uppercase tracking-tight text-white leading-none">
              Complete <br />
              <span className="text-white">Fire Protection</span> <br />
              Solutions <br />
              <span className="text-[#e01b24]">You Can Trust</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed font-light">
              We design, install, test, and maintain world-class firefighting and suppression
              systems across Dubai & the UAE — with engineering excellence, compliance, and 24/7
              readiness at our core.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                className="btn-pill inline-flex items-center gap-2 bg-[#e01b24] py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#e01b24]/30 hover:bg-[#b3121a] active:scale-95 transition-all cursor-pointer"
              >
                <span>Request a Free Quote</span>
                <ArrowRight className="size-4" />
              </button>

              <Link
                href="/services"
                className="btn-pill inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 py-3.5 text-sm font-semibold text-white backdrop-blur-xs transition-colors"
              >
                <span>Explore Services</span>
                <ChevronRight className="size-4 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Right Pillar Features Cards */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 flex items-center gap-4 hover:border-[#e01b24]/50 transition-colors">
              <div className="size-12 rounded-xl bg-[#e01b24]/20 border border-[#e01b24]/30 flex items-center justify-center text-[#e01b24] shrink-0">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-tech uppercase tracking-wide">
                  Civil Defence Approved
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  DCD compliant drawings, inspection & approvals
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 flex items-center gap-4 hover:border-[#e01b24]/50 transition-colors">
              <div className="size-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Headset className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-tech uppercase tracking-wide">
                  24/7 Expert Support
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Always on-call rapid response across UAE
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 flex items-center gap-4 hover:border-[#e01b24]/50 transition-colors">
              <div className="size-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <HardHat className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-tech uppercase tracking-wide">
                  Certified Engineers
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Certified professionals with 15+ years experience
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 flex items-center gap-4 hover:border-[#e01b24]/50 transition-colors">
              <div className="size-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Award className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-tech uppercase tracking-wide">
                  Premium Guaranteed Quality
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  UL/FM approved genuine safety products
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-2 mt-12">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === current ? "w-8 bg-[#e01b24]" : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      <QuoteModal open={quoteOpen} onOpenChange={setQuoteOpen} />
    </section>
  );
}
