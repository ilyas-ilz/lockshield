import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Building2, MapPin, Calendar, Tag } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Project } from "@/models";
import { QuickQuoteForm } from "@/components/frontend/QuickQuoteForm";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB().catch(() => {});
  const project = await Project.findOne({ slug, publishStatus: "published" }).lean().catch(() => null);

  const title = project?.title || slug.replace(/-/g, " ");
  return {
    title: `${title} | Project Case Study | Lock Shield UAE`,
    description: project?.summary || `Fire safety and protection project case study for ${title} in Dubai, UAE.`,
  };
}

interface ProjectDoc {
  title: string;
  client?: string;
  sector?: string;
  emirate?: string;
  year?: number;
  summary?: string;
  scopeTags?: string[];
  coverImage?: { url: string; alt?: string };
  gallery?: { url: string; alt?: string }[];
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let project: ProjectDoc | null = null;

  try {
    await connectDB();
    project = (await Project.findOne({ slug, publishStatus: "published" }).lean()) as ProjectDoc | null;
  } catch {
    // DB error
  }

  // Sample fallback if matching slug
  if (!project) {
    const titleFromSlug = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    project = {
      title: titleFromSlug,
      client: titleFromSlug,
      sector: "Commercial Fit-out",
      emirate: "Dubai",
      year: 2024,
      summary:
        "Full turnkey fire safety fit-out, Civil Defence drawings, testing and commissioning compliant with DCD regulations.",
      scopeTags: ["Civil Defence Approval", "Fire Alarm System", "Fire Sprinklers", "Kitchen Suppression"],
      coverImage: { url: "/assets/images/commercial.webp" },
    };
  }

  return (
    <>
      <section className="pt-36 pb-16 bg-[#0d1220] text-white relative overflow-hidden">
        <div className="blueprint-grid-dark absolute inset-0 opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/projects" className="hover:text-white transition-colors">
              Projects
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white font-medium truncate">{project.title}</span>
          </div>

          <div className="max-w-3xl">
            <span className="font-tech text-xs font-bold uppercase tracking-widest text-[#e01b24]">
              {project.sector || "Commercial Project"}
            </span>
            <h1 className="font-tech text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white mt-2">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-gray-300">
              {project.client && (
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-[#e01b24]" />
                  <span>Client: {project.client}</span>
                </div>
              )}
              {project.emirate && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-[#e01b24]" />
                  <span>Location: {project.emirate}, UAE</span>
                </div>
              )}
              {project.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-[#e01b24]" />
                  <span>Completed: {project.year}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
              {project.coverImage?.url && (
                <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.coverImage.url}
                    alt={project.title}
                    className="w-full h-auto max-h-[480px] object-cover"
                  />
                </div>
              )}

              <div>
                <h2 className="font-tech text-2xl font-bold uppercase tracking-tight text-gray-900">
                  Project Overview &amp; Execution
                </h2>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base mt-4">
                  {project.summary ||
                    "Our engineering division executed the complete life safety package, ensuring 100% compliance with Dubai Civil Defence specifications and safety standards."}
                </p>
              </div>

              {/* Scope of Work Tags */}
              {project.scopeTags && project.scopeTags.length > 0 && (
                <div>
                  <h3 className="font-tech text-lg font-bold uppercase tracking-wider text-gray-900 mb-3">
                    Scope of Work
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.scopeTags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-800"
                      >
                        <Tag className="size-3 text-[#e01b24]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Gallery if available */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="font-tech text-lg font-bold uppercase tracking-wider text-gray-900">
                    Project Gallery
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {project.gallery.map((img: { url: string; alt?: string }, i: number) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.alt || "Gallery image"} className="size-full object-cover hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                <QuickQuoteForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
