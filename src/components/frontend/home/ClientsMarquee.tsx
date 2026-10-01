import Image from "next/image";
import { Reveal } from "../Reveal";

type ClientLogo = {
  name: string;
  src?: string;
  width: number;
  height: number;
  dark?: boolean;
};

/** Verified proper logos (downloaded from official sources, converted to
 * sharp WebP via `sharp`):
 * - Emirates NBD: Wikimedia Commons File:Emirates_NBD_Logo.jpg
 *   (source: emirates nbd website, author: emirates nbd pjsc)
 * - Pizza Hut: official Middle East site pizzahut-me.com
 *   (sites/all/themes/pizzahut/images/logo_n.png - white version for dark bg)
 * - Al Manara Pharmacy: official store manaraonline.com og:image
 * - MAD Hospitality Group: official site header wearemad.co
 *   (we-are-mad-logo.png 133x60 - the previous mad-h-p1.svg was a
 *   decorative graphic, not the logo; replaced with the real header logo)
 * - Farsi Restaurant: official site farsi-restaurant.com schema logo
 *   (cropped-farsiLogo.png 170x200)
 * - Feetlab: official site feetlab.vip schema + header logo
 *   (Colored-logo-1.png 249x100)
 * Al Abrar Contracting + Himaya Contracting: no verifiable official logo
 * found online (Al Abrar matches several unrelated firms - Ajman builder,
 * Sharjah metal works, Oman group; Himaya matches unrelated Saudi firms) -
 * kept as styled text fallback so we never install a wrong logo. */
const CLIENTS: ClientLogo[] = [
  { name: "Emirates NBD", src: "/assets/images/clients/emirates-nbd.webp", width: 216, height: 56 },
  { name: "Pizza Hut", src: "/assets/images/clients/pizza-hut.webp", width: 314, height: 58, dark: true },
  { name: "Al Manara Pharmacy", src: "/assets/images/clients/al-manara-pharmacy.webp", width: 1200, height: 628 },
  { name: "MAD Hospitality Group", src: "/assets/images/clients/mad-hospitality.webp", width: 133, height: 60 },
  { name: "Al Abrar Contracting", width: 0, height: 0 },
  { name: "Himaya Contracting", width: 0, height: 0 },
  { name: "Farsi Restaurant", src: "/assets/images/clients/farsi-restaurant.webp", width: 170, height: 200 },
  { name: "Feetlab", src: "/assets/images/clients/feetlab.webp", width: 249, height: 100 },
];

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
        <div className="marquee-track flex w-max items-center gap-3 sm:gap-4">
          {[...CLIENTS, ...CLIENTS].map((client, i) => (
            <span
              key={`${client.name}-${i}`}
              aria-hidden={i >= CLIENTS.length}
              className={`flex h-[72px] w-[180px] shrink-0 items-center justify-center rounded-xl border px-5 transition-colors duration-300 sm:h-20 sm:w-[200px] ${
                client.dark
                  ? "border-neutral-800 bg-neutral-900 hover:border-brand-500/50"
                  : "border-[var(--marketing-line)] bg-white hover:border-brand-500/40"
              }`}
            >
              {client.src ? (
                <Image
                  src={client.src}
                  alt={`${client.name} logo`}
                  width={client.width}
                  height={client.height}
                  loading="lazy"
                  className="h-auto max-h-[44px] w-auto max-w-full object-contain sm:max-h-[48px]"
                />
              ) : (
                <span className="font-tech text-center text-[13px] font-bold tracking-wide text-ink/45 sm:text-sm">
                  {client.name.toUpperCase()}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
