import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { Project } from "@/models";
import { ProjectsGallery, type ProjectItem } from "@/components/frontend/ProjectsGallery";
import { PageHero } from "@/components/frontend/PageHero";
import { Section } from "@/components/frontend/Section";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

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

export default async function ProjectsPage() {
  let projectsList: ProjectItem[] = [];
  try {
    await connectDB();
    const found = await Project.find({ publishStatus: "published" })
      .sort({ featured: -1, createdAt: -1 })
      .select("title slug client sector emirate year coverImage")
      .lean();

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

  const items = projectsList.length > 0 ? projectsList : SAMPLE_PROJECTS;

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Projects" }]}
        title="Completed"
        accent="Projects"
        description="Showcasing over 1,000 certified fire protection installations across healthcare, banking, hospitality, retail, and commercial properties in the UAE."
      />

      <Section className="blueprint-grid bg-paper-soft">
        <ProjectsGallery projects={items} />
      </Section>
    </>
  );
}
