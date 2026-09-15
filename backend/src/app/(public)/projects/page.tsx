import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { Project } from "@/models";
import { ProjectsGallery } from "@/components/frontend/ProjectsGallery";

export const metadata: Metadata = {
  title: "Completed Projects & Fit-Outs | Lock Shield UAE",
  description:
    "Explore our portfolio of completed fire fighting, alarm, and kitchen suppression installations across commercial, healthcare, and retail sectors in Dubai.",
};

const SAMPLE_PROJECTS = [
  {
    title: "Al Manara Pharmacy Fit-out",
    client: "Al Manara Pharmacy",
    sector: "Healthcare",
    emirate: "Dubai",
    slug: "al-manara-pharmacy",
    coverImage: { url: "/assets/images/commercial.webp" },
  },
  {
    title: "Emirates NBD Corporate Facility",
    client: "Emirates NBD",
    sector: "Banking",
    emirate: "Dubai",
    slug: "emirates-nbd",
    coverImage: { url: "/assets/images/about-img1.webp" },
  },
  {
    title: "Farsi Restaurant Kitchen Suppression",
    client: "Farsi Restaurant",
    sector: "Hospitality & F&B",
    emirate: "Dubai",
    slug: "farsi-restaurant",
    coverImage: { url: "/assets/images/restaurants.webp" },
  },
  {
    title: "Feetlab Retail Center",
    client: "Feetlab",
    sector: "Retail",
    emirate: "Dubai",
    slug: "feetlab",
    coverImage: { url: "/assets/images/showrooms.webp" },
  },
  {
    title: "Pizza Hut Restaurant Suppression",
    client: "Pizza Hut UAE",
    sector: "Hospitality & F&B",
    emirate: "Dubai",
    slug: "pizza-hut",
    coverImage: { url: "/assets/images/warehouses.webp" },
  },
  {
    title: "The Grey Restaurant Fit-out",
    client: "The Grey Restaurant",
    sector: "Hospitality & F&B",
    emirate: "Dubai",
    slug: "grey-restaurant",
    coverImage: { url: "/assets/images/residential.webp" },
  },
];

export default async function ProjectsPage() {
  let projectsList: any[] = [];
  try {
    await connectDB();
    const found = await Project.find({ publishStatus: "published" })
      .sort({ featured: -1, createdAt: -1 })
      .lean();
    projectsList = found || [];
  } catch {
    // Fallback
  }

  const items = projectsList.length > 0 ? projectsList : SAMPLE_PROJECTS;

  return (
    <>
      <section className="pt-36 pb-16 bg-[#0d1220] text-white relative overflow-hidden">
        <div className="blueprint-grid-dark absolute inset-0 opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <span className="font-tech text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e01b24]">
            Proven Experience
          </span>
          <h1 className="font-tech text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white mt-2">
            Completed <span className="text-[#e01b24]">Projects</span> &amp; Case Studies
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mt-4 font-light">
            Showcasing over 1,000 certified fire protection installations across healthcare,
            banking, hospitality, retail, and commercial properties in the UAE.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-[#f7f8fa] blueprint-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ProjectsGallery projects={items} />
        </div>
      </section>
    </>
  );
}
