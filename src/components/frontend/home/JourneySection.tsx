"use client";

import * as React from "react";
import Image from "next/image";
import { Reveal } from "../Reveal";

const STEPS = [
  {
    num: "01",
    title: "Site Survey",
    desc: "Our engineers walk your site, assess risks and map every zone before a single line is drawn.",
    image: "/assets/images/about-four-img-2.webp",
  },
  {
    num: "02",
    title: "Design & Drawings",
    desc: "Code-compliant system design and detailed shop drawings, engineered for your building.",
    image: "/assets/images/feature-two-img-3.webp",
  },
  {
    num: "03",
    title: "Civil Defence Approval",
    desc: "We prepare, submit and follow through the full DCD documentation and approval process.",
    image: "/assets/images/faqs-img.webp",
  },
  {
    num: "04",
    title: "Installation & Testing",
    desc: "Certified technicians install, commission and pressure-test every system to specification.",
    image: "/assets/images/commercial.webp",
  },
  {
    num: "05",
    title: "Handover & AMC",
    desc: "Training, documentation and a maintenance contract that keeps you protected year-round.",
    image: "/assets/images/mission.webp",
  },
] as const;

/**
 * Restores the legacy "Journey" section (dropped entirely from the port):
 * five steps in a horizontal, snap-scrolling track over a dark ink
 * background, with a progress bar synced to scroll position.
 *
 * Mobile-first note: the legacy version drove this with a GSAP tween and a
 * custom autoplay/drag state machine. This uses native scroll-snap instead -
 * it works by touch on a phone with no JS at all, degrades gracefully, and
 * is what the legacy CSS's own fallback path did when the GSAP CDN was
 * blocked. The progress bar and active-step emphasis are the only JS.
 */
export function JourneySection() {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);

  const onScroll = React.useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setProgress(max > 0 ? (track.scrollLeft / max) * 100 : 0);
  }, []);

  return (
    <section className="relative overflow-hidden bg-ink py-14 sm:py-20 lg:py-24">
      <div className="blueprint-grid-dark pointer-events-none absolute inset-0 opacity-[0.07]" />
      <div className="wrap relative">
        <Reveal className="mb-8 sm:mb-10">
          <span className="eyebrow">How We Deliver</span>
          <h2 className="font-tech mt-2 text-[clamp(1.6rem,5vw,2.75rem)] font-bold uppercase leading-tight tracking-tight text-white">
            Our story, told in five steps
          </h2>
        </Reveal>

        {/* Progress rail */}
        <div className="relative mb-6 h-0.5 rounded-full bg-white/15">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-brand-500 shadow-[0_0_12px_rgba(224,27,36,0.8)] transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div
          ref={trackRef}
          onScroll={onScroll}
          className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-5 sm:px-0"
        >
          {STEPS.map((step) => (
            <article
              key={step.num}
              className="w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors duration-300 hover:border-brand-500/60 sm:w-[46%] lg:w-[calc((100%-4*1.25rem)/5)]"
            >
              <div className="relative aspect-[16/10]">
                <Image src={step.image} alt={step.title} fill sizes="(min-width: 1024px) 20vw, 60vw" className="object-cover" />
                <span className="font-tech absolute left-3 top-3 rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-bold tracking-[0.1em] text-white">
                  {step.num}
                </span>
              </div>
              <div className="p-4">
                <b className="block text-base font-bold text-white">{step.title}</b>
                <p className="mt-1.5 text-sm leading-relaxed text-white/65">{step.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
