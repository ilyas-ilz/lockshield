import { Users, Building2, MapPinned, Star } from "lucide-react";
import { Counter } from "../Counter";
import { Reveal } from "../Reveal";

const STATS = [
  { icon: Users, target: 50, label: "Employees" },
  { icon: Building2, target: 500, label: "Projects Completed" },
  { icon: MapPinned, target: 1000, label: "Sites Maintained" },
  // Single source of truth: 15+ years everywhere (hero, about, stats).
  { icon: Star, target: 15, label: "Years Experience" },
] as const;

/** Restores the legacy .stats section - a static "15+/24/7/100%" band in the
 * port replaced these count-up figures entirely. */
export function StatsSection() {
  return (
    // Shares `.section-y` with every other section - this band used to run
    // py-10/14/16 against its neighbours' py-12/16/20, which made the gap
    // above it visibly tighter than the gap below it.
    <section className="section-y bg-paper-soft">
      <div className="wrap">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              delayMs={i * 80}
              className="flex items-center gap-3 rounded-2xl border border-[var(--marketing-line)] bg-white p-4 transition-all duration-300 [transition-timing-function:var(--ease-brand)] hover:-translate-y-1.5 hover:shadow-[0_18px_44px_rgba(13,18,32,0.1)] sm:gap-4 sm:p-6"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-brand-500 text-brand-500 sm:size-13">
                <stat.icon className="size-4.5 sm:size-5" aria-hidden />
              </span>
              <span>
                <Counter
                  target={stat.target}
                  className="font-tech block text-2xl font-black leading-none tracking-tight text-navy-900 sm:text-3xl lg:text-[1.9rem]"
                />
                <small className="mt-1 block text-xs font-semibold text-ink/55 sm:text-sm">{stat.label}</small>
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
