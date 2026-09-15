import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Building2, MapPin, Calendar, Tag } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Project } from "@/models";
import { QuickQuoteForm } from "@/components/frontend/QuickQuoteForm";
import { Reveal } from "@/components/frontend/Reveal";

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
      {/* Header */}
      <section className="relative overflow-hidden bg-ink pb-12 pt-28 text-white sm:pb-16 sm:pt-32 lg:pt-36">
        <div className="blueprint-grid-dark pointer-events-none absolute inset-0 opacity-10" />
        <div className="wrap relative z-10">
          <div className="font-tech mb-4 flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-white/55 sm:text-xs">
            <Link href="/" className="transition-colors hover:text-brand-400">
              Home
            </Link>
            <ChevronRight className="size-3 text-brand-500" />
            <Link href="/projects" className="transition-colors hover:text-brand-400">
              Projects
            </Link>
            <ChevronRight className="size-3 text-brand-500" />
            <span className="truncate font-medium text-white">{project.title}</span>
          </div>

          <div className="max-w-3xl">
            <span className="eyebrow">{project.sector || "Commercial Project"}</span>
            <h1 className="font-tech mt-2 text-[clamp(1.9rem,6vw,3.2rem)] font-bold uppercase leading-[1.05] tracking-tight text-white">
              {project.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs text-white/70 sm:text-sm">
              {project.client && (
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-brand-500" />
                  <span>Client: {project.client}</span>
                </div>
              )}
              {project.emirate && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-brand-500" />
                  <span>Location: {project.emirate}, UAE</span>
                </div>
              )}
              {project.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-brand-500" />
                  <span>Completed: {project.year}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <section className="bg-white py-14 sm:py-20 lg:py-24">
        <div className="wrap">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-8 lg:col-span-8">
              {project.coverImage?.url && (
                <Reveal className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-[var(--marketing-line)] shadow-md">
                  <Image
                    src={project.coverImage.url}
                    alt={project.coverImage.alt || project.title}
                    fill
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </Reveal>
              )}

              <Reveal delayMs={80}>
                <h2 className="font-tech text-xl font-bold uppercase tracking-tight text-navy-900 sm:text-2xl">
                  Project Overview &amp; Execution
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink/65 sm:text-base">
                  {project.summary ||
                    "Our engineering division executed the complete life safety package, ensuring 100% compliance with Dubai Civil Defence specifications and safety standards."}
                </p>
              </Reveal>

              {/* Scope of Work Tags */}
              {project.scopeTags && project.scopeTags.length > 0 && (
                <Reveal delayMs={120}>
                  <h3 className="font-tech mb-3 text-lg font-bold uppercase tracking-wider text-navy-900">
                    Scope of Work
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.scopeTags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--marketing-line)] bg-paper-soft px-4 py-1.5 text-xs font-semibold text-ink/75"
                      >
                        <Tag className="size-3 text-brand-500" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </Reveal>
              )}

              {/* Project Gallery if available */}
              {project.gallery && project.gallery.length > 0 && (
                <Reveal delayMs={160} className="space-y-4 pt-2">
                  <h3 className="font-tech text-lg font-bold uppercase tracking-wider text-navy-900">
                    Project Gallery
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                    {project.gallery.map((img: { url: string; alt?: string }, i: number) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--marketing-line)] bg-paper-soft">
                        <Image
                          src={img.url}
                          alt={img.alt || "Gallery image"}
                          fill
                          sizes="(min-width: 640px) 33vw, 50vw"
                          className="object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>

            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <QuickQuoteForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
