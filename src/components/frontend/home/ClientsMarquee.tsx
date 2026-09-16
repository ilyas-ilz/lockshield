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
    <section className="section-y overflow-hidden bg-white">
      <Reveal className="wrap mb-0">
        <span className="eyebrow">Our Clients</span>
        <h2 className="font-tech mt-2 text-[clamp(1.4rem,4vw,2rem)] font-bold uppercase leading-tight tracking-tight text-navy-900">
          Trusted by leading organizations
        </h2>
      </Reveal>

      {/* Edge fade makes the clipping intentional rather than accidentally
          overflowed; mask only the track, not the heading. */}
      <div
        className="marquee mt-8 select-none overflow-hidden sm:mt-10 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
      >
        <div className="marquee-track flex w-max items-center">
          {[...CLIENTS, ...CLIENTS].map((name, i) => (
            <span
              key={`${name}-${i}`}
              aria-hidden={i >= CLIENTS.length}
              className="font-tech mx-3 flex shrink-0 items-center whitespace-nowrap rounded-full border border-[var(--marketing-line)] bg-paper-soft px-6 py-2.5 text-sm font-bold tracking-wide text-ink/45 transition-colors duration-300 hover:border-brand-500/40 hover:text-brand-500 sm:mx-4 sm:px-8 sm:text-base"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
