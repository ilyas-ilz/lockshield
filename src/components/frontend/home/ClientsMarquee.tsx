import { Reveal } from "../Reveal";

const CLIENTS = [
  "EMIRATES NBD",
  "PIZZA HUT",
  "AL MANARA PHARMACY",
  "MAD HOSPITALITY GROUP",
  "AL ABRAR CONTRACTING",
  "HIMAYA CONTRACTING",
  "FARSI RESTAURANT",
  "FEETLAB",
] as const;

/** Restores the legacy clients marquee - dropped entirely from the port.
 * Full-bleed (outside `.wrap`), pauses on hover/focus, respects
 * prefers-reduced-motion via the shared reduced-motion rule in globals.css. */
export function ClientsMarquee() {
  return (
    <section className="overflow-hidden bg-white py-12 sm:py-16">
      <Reveal className="wrap mb-0">
        <span className="eyebrow">Our Clients</span>
        <h2 className="font-tech mt-2 text-[clamp(1.4rem,4vw,2rem)] font-bold uppercase leading-tight tracking-tight text-navy-900">
          Trusted by leading organizations
        </h2>
      </Reveal>

      <div className="marquee mt-8 select-none overflow-hidden sm:mt-10">
        <div className="marquee-track flex w-max items-center">
          {[...CLIENTS, ...CLIENTS].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="font-tech shrink-0 whitespace-nowrap px-6 text-lg font-black tracking-wide text-ink/35 grayscale transition-all duration-300 hover:text-brand-500 hover:grayscale-0 sm:px-10 sm:text-2xl"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
