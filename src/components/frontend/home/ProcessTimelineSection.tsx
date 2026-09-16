"use client";

import { MessageSquare, Compass, FileCheck2, Hammer, Handshake } from "lucide-react";
import { useInView } from "@/lib/hooks/useInView";
import { Reveal } from "../Reveal";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: "01", icon: MessageSquare, title: "Consultation", desc: "Understanding your requirements" },
  { num: "02", icon: Compass, title: "Design & Planning", desc: "Engineering safe & cost-effective solutions" },
  { num: "03", icon: FileCheck2, title: "Civil Defence Approval", desc: "Documentation & submission" },
  { num: "04", icon: Hammer, title: "Installation", desc: "Professional installation by certified team" },
  { num: "05", icon: Handshake, title: "Testing & Handover", desc: "Testing, training & final handover" },
] as const;

/**
 * Restores the legacy process timeline - dropped entirely from the port.
 * The key mobile-first behaviour: this is a 5-column horizontal rail on
 * desktop and a vertical rail on mobile, not the same layout shrunk down.
 */
export function ProcessTimelineSection() {
  const [ref, go] = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="section-y bg-paper-soft">
      <div className="wrap">
        <Reveal className="mb-10 sm:mb-14">
          <span className="eyebrow">Our Work Process</span>
          <h2 className="font-tech mt-2 text-[clamp(1.6rem,5vw,2.75rem)] font-bold uppercase leading-tight tracking-tight text-navy-900">
            How we deliver safety with excellence
          </h2>
        </Reveal>

        {/* Five-across only fits at desktop widths - tablet gets a 2-col
            grid with the vertical rail, phone a single column. */}
        <div ref={ref} className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {/* connecting rail: horizontal on desktop, vertical below lg */}
          <div className="absolute left-7 top-0 hidden h-full w-0.5 bg-[var(--marketing-line)] lg:top-7 lg:left-[10%] lg:right-[10%] lg:block lg:h-0.5 lg:w-auto" />
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-[var(--marketing-line)] lg:hidden" />
          <div
            className="absolute left-7 top-0 w-0.5 rounded-full bg-gradient-to-b from-brand-500 to-[#ff5a60] shadow-[0_0_14px_rgba(224,27,36,0.6)] transition-[height] duration-[1.8s] [transition-timing-function:var(--ease-brand)] lg:hidden"
            style={{ height: go ? "100%" : "0%" }}
          />
          <div
            className="absolute top-7 left-[10%] hidden h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-[#ff5a60] shadow-[0_0_14px_rgba(224,27,36,0.6)] transition-[width] duration-[1.8s] [transition-timing-function:var(--ease-brand)] lg:block"
            style={{ width: go ? "80%" : "0%" }}
          />

          {STEPS.map((step, i) => (
            <div key={step.num} className="relative flex items-start gap-4 lg:flex-col lg:items-center lg:text-center">
              <span
                className={cn(
                  "relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full border-2 bg-white text-ink/35 transition-all duration-500",
                  go ? "border-brand-500 bg-brand-500 text-white shadow-[0_0_0_8px_rgba(224,27,36,0.12),0_12px_28px_rgba(224,27,36,0.35)]" : "border-[var(--marketing-line)]"
                )}
                style={{ transitionDelay: go ? `${i * 0.3 + 0.35}s` : "0s" }}
              >
                <step.icon className="size-5" aria-hidden />
              </span>

              <div
                className="relative flex-1 overflow-hidden rounded-2xl border border-[var(--marketing-line)] bg-white p-5 transition-all duration-300 hover:border-brand-500/35 hover:shadow-[0_18px_44px_rgba(224,27,36,0.12)] lg:mt-2"
                style={{
                  opacity: go ? 1 : 0,
                  transform: go ? "none" : "translateY(26px)",
                  transitionProperty: "opacity, transform, box-shadow, border-color",
                  transitionDuration: "0.6s, 0.6s, 0.3s, 0.3s",
                  transitionDelay: go ? `${i * 0.15}s` : "0s",
                  transitionTimingFunction: "var(--ease-brand)",
                }}
              >
                <span className="font-tech pointer-events-none absolute right-3 top-1 text-4xl font-bold text-brand-500/[0.08]">
                  {step.num}
                </span>
                <b className="block text-sm font-bold text-navy-900 sm:text-base">{step.title}</b>
                <small className="mt-1 block text-xs leading-relaxed text-ink/55 sm:text-sm">{step.desc}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
