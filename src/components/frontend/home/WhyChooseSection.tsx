import Image from "next/image";
import { ShieldCheck, HardHat, BadgeCheck, Headset } from "lucide-react";
import { Reveal } from "../Reveal";

const WHY_ITEMS = [
  { icon: ShieldCheck, title: "DCD Approved Contractor", desc: "Company licensed by Dubai Civil Defence; systems designed to DCD regulations and approved standards." },
  { icon: HardHat, title: "Experienced Team", desc: "Highly trained, certified professionals across every discipline." },
  { icon: BadgeCheck, title: "Quality Assurance", desc: "We use only certified, genuine products from approved manufacturers." },
  { icon: Headset, title: "24/7 Support", desc: "Always available when you need us — emergencies don't keep office hours." },
] as const;

/**
 * Restores the legacy "Why Choose Lock Shield" section - dropped entirely
 * from the port. Trust-media image on the right (top on mobile) with a slow
 * Ken Burns drift and a pulsing "live" label, matching the legacy recipe.
 */
export function WhyChooseSection() {
  return (
    <section className="section-y blueprint-grid">
      <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-14">
        <Reveal className="order-2 lg:order-1">
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

        <Reveal delayMs={100} className="order-1 lg:order-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_30px_70px_rgba(13,18,32,0.25)]">
            <div className="absolute inset-0 [animation:kenburns_9s_ease-in-out_infinite_alternate]">
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
