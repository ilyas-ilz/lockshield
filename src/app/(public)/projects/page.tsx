import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Project } from "@/models";
import { ProjectsGallery, type ProjectItem } from "@/components/frontend/ProjectsGallery";
import { PageHero } from "@/components/frontend/PageHero";
import { Section } from "@/components/frontend/Section";
import { Pagination } from "@/components/frontend/Pagination";
import {
  PUBLIC_PAGE_SIZE,
  parseFilter,
  parsePage,
  totalPagesFor,
  type PublicSearchParams,
} from "@/lib/public-listing";

// Reading searchParams makes this route render per request, which is what we
// want here: the listing is paginated and filtered from the URL, and an admin
// publishing a project now shows up immediately instead of waiting out an ISR
// window. The project *detail* pages stay cached and are busted explicitly on
// write — see lib/revalidate.ts.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Completed Projects & Fit-Outs | Lock Shield UAE",
  description:
    "Explore our portfolio of completed fire fighting, alarm, and kitchen suppression installations across commercial, healthcare, and retail sectors in Dubai.",
};

const SAMPLE_PROJECTS: ProjectItem[] = [
  {
    title: "Al Manara Pharmacy Fit-out",
    client: "Al Manara Pharmacy",
    sector: "Healthcare",
    emirate: "Dubai",
    slug: "al-manara-pharmacy",
    coverImage: { url: "/assets/images/projects/al-manara-pharmacy.webp" },
  },
  {
    title: "Emirates NBD Corporate Facility",
    client: "Emirates NBD",
    sector: "Banking",
    emirate: "Dubai",
    slug: "emirates-nbd",
    coverImage: { url: "/assets/images/projects/emirates-nbd.webp" },
  },
  {
    title: "Farsi Restaurant Kitchen Suppression",
    client: "Farsi Restaurant",
    sector: "Hospitality & F&B",
    emirate: "Dubai",
    slug: "farsi-restaurant",
    coverImage: { url: "/assets/images/projects/farsi-restaurant.webp" },
  },
  {
    title: "Feetlab Retail Center",
    client: "Feetlab",
    sector: "Retail",
    emirate: "Dubai",
    slug: "feetlab",
    coverImage: { url: "/assets/images/projects/feetlab.webp" },
  },
  {
    title: "Pizza Hut Restaurant Suppression",
    client: "Pizza Hut UAE",
    sector: "Hospitality & F&B",
    emirate: "Dubai",
    slug: "pizza-hut",
    coverImage: { url: "/assets/images/projects/pizza-hut.webp" },
  },
  {
    title: "The Grey Restaurant Fit-out",
    client: "The Grey Restaurant",
    sector: "Hospitality & F&B",
    emirate: "Dubai",
    slug: "grey-restaurant",
    coverImage: { url: "/assets/images/projects/grey-restaurant.webp" },
  },
];

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<PublicSearchParams> }) {
  const sp = await searchParams;
  const sector = parseFilter(sp.sector);

  let projectsList: ProjectItem[] = [];
  let sectors: string[] = [];
  let total = 0;
  let page = 1;
  let totalPages = 1;
  let usingFallback = false;

  try {
    await connectDB();

    const baseFilter: Record<string, unknown> = { publishStatus: "published" };
    const filter = sector ? { ...baseFilter, sector } : baseFilter;

    // Sector list is built from the whole published collection, not the
    // current page, so the filter tabs stay identical on every page.
    const [count, allSectors] = await Promise.all([
      Project.countDocuments(filter),
      Project.distinct("sector", baseFilter),
    ]);

    total = count;
    totalPages = totalPagesFor(total, PUBLIC_PAGE_SIZE);
    page = parsePage(sp.page, totalPages);

    const found = await Project.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .skip((page - 1) * PUBLIC_PAGE_SIZE)
      .limit(PUBLIC_PAGE_SIZE)
      .select("title slug client sector emirate year coverImage")
      .lean();

    sectors = (allSectors as unknown[])
      .filter((value): value is string => typeof value === "string" && value.trim() !== "")
      .sort((a, b) => a.localeCompare(b));

    projectsList = found.map((p) => ({
      _id: String(p._id),
      title: String(p.title || ""),
      slug: String(p.slug || ""),
      client: p.client ? String(p.client) : undefined,
      sector: p.sector ? String(p.sector) : undefined,
      emirate: p.emirate ? String(p.emirate) : undefined,
      year: typeof p.year === "number" ? p.year : undefined,
      coverImage: p.coverImage?.url
        ? {
            url: String(p.coverImage.url),
            alt: p.coverImage.alt ? String(p.coverImage.alt) : undefined,
          }
        : undefined,
    }));
  } catch {
    // Fallback
  }

  // The hardcoded samples are a "database is unreachable" safety net, not
  // content — they are never paginated or filtered, just shown as-is.
  if (total === 0 && projectsList.length === 0 && !sector) {
    usingFallback = true;
    projectsList = SAMPLE_PROJECTS;
    sectors = [];
    totalPages = 1;
    total = SAMPLE_PROJECTS.length;
  }

  const items = projectsList;

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Projects" }]}
        title="Completed"
        accent="Projects"
        description="Showcasing over 300 certified fire protection installations across healthcare, banking, hospitality, retail, and commercial properties in the UAE."
      />

      <Section className="blueprint-grid bg-paper-soft">
        {items.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-[var(--marketing-line)] bg-white p-10 text-center sm:p-16">
            <h2 className="font-tech text-lg font-bold uppercase text-navy-900 sm:text-xl">No projects in this sector</h2>
            <p className="mt-2 text-sm text-ink/62">
              Nothing is published under “{sector}” yet. Browse the full portfolio instead.
            </p>
            <div className="pt-6">
              <Link
                href="/projects"
                className="inline-flex min-h-11 items-center rounded-full bg-brand-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                View all projects
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ProjectsGallery projects={items} sectors={sectors} activeSector={sector} />
            {!usingFallback && (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                basePath="/projects"
                params={{ sector }}
                label="projects"
              />
            )}
          </>
        )}
      </Section>
    </>
  );
}
