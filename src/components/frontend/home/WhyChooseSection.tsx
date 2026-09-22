"use client";

import Image from "next/image";
import * as React from "react";
import { ShieldCheck, HardHat, BadgeCheck, Headset } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "../Reveal";

gsap.registerPlugin(ScrollTrigger);

const WHY_ITEMS = [
  { icon: ShieldCheck, title: "DCD Approved Contractor", desc: "Company licensed by Dubai Civil Defence; systems designed to DCD regulations and approved standards." },
  { icon: HardHat, title: "Experienced Team", desc: "Highly trained, certified professionals across every discipline." },
  { icon: BadgeCheck, title: "Quality Assurance", desc: "We use only certified, genuine products from approved manufacturers." },
  { icon: Headset, title: "24/7 Support", desc: "Always available when you need us — emergencies don't keep office hours." },
] as const;

/**
 * "Why Choose Lock Shield" — trust-media image with clip reveal +
 * subtle scroll parallax, copy column fades up. Content unchanged.
 */
export function WhyChooseSection() {
  const imgWrapRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!imgWrapRef.current || !imgRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: imgWrapRef.current, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="section-y blueprint-grid">
      <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-14">
        <Reveal variant="fade-right" className="order-2 lg:order-1">
          <span className="eyebrow">Why Choose Lock Shield?</span>
          <h2 className="font-tech mt-3 text-[clamp(1.6rem,5vw,2.6rem)] font-bold uppercase leading-tight tracking-tight text-navy-900">
            Engineered trust,
            <br />
            proven on site
          </h2>
          <div className="mt-5 divide-y divide-dashed divide-[var(--marketing-line)]">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="group flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-brand-500 text-brand-500 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105 group-hover:bg-brand-500 group-hover:text-white">
                  <item.icon className="size-4.5" aria-hidden />
                </span>
                <span>
                  <b className="block text-sm font-bold text-navy-900 sm:text-base">{item.title}</b>
                  <small className="mt-0.5 block text-sm leading-relaxed text-ink/60">{item.desc}</small>
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delayMs={100} variant="clip" className="order-1 lg:order-2">
          <div ref={imgWrapRef} className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_30px_70px_rgba(13,18,32,0.25)]">
            <div ref={imgRef} className="absolute -inset-y-[7%] inset-x-0 will-change-transform">
              <Image
                src="/assets/images/why-choose-lockshield.webp"
                alt="Lock Shield technicians installing a smoke detector and checking the fire alarm control panel on site in Dubai"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-ink/70 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white backdrop-blur-sm">
              <span className="size-2 rounded-full bg-brand-500 [animation:scrollPulse_1.4s_infinite]" />
              Field team · ready 24/7
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
