import { z } from "zod";

// WHY: every editable page (Home, About, Services, AMC, Career, Projects) is
// built from an ordered array of typed blocks instead of freeform HTML.
// This is the "typed block library" approach chosen over a WYSIWYG builder:
// each block has a Zod schema, so the admin form is generated from the
// schema (one generic form renderer, see lib/blocks/form-fields.ts on the
// admin side) and the public renderer does a type-safe switch — an editor
// can reorder/edit content but cannot break layout or inject arbitrary CSS.
// Adding a new block type = one entry here + one React renderer, nothing else.

const image = z.object({
  url: z.string().min(1),
  publicId: z.string().optional(),
  alt: z.string().min(1, "alt text is required"),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const cta = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const base = { id: z.string().min(1), hidden: z.boolean().default(false) };

export const heroBlockSchema = z.object({
  ...base,
  type: z.literal("hero"),
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  subheading: z.string().optional(),
  image: image.optional(),
  primaryCta: cta.optional(),
  secondaryCta: cta.optional(),
});

export const serviceGridBlockSchema = z.object({
  ...base,
  type: z.literal("serviceGrid"),
  heading: z.string().optional(),
  serviceIds: z.array(z.string()).default([]), // refs Service._id, resolved at render
});

export const statsBlockSchema = z.object({
  ...base,
  type: z.literal("stats"),
  items: z
    .array(z.object({ value: z.string().min(1), label: z.string().min(1) }))
    .min(1)
    .max(6),
});

export const logoWallBlockSchema = z.object({
  ...base,
  type: z.literal("logoWall"),
  heading: z.string().optional(),
  useProjectClients: z.boolean().default(true), // pulls Project.clientLogo when true
  logos: z.array(image).default([]), // manual overrides when useProjectClients is false
});

export const richTextBlockSchema = z.object({
  ...base,
  type: z.literal("richText"),
  heading: z.string().optional(),
  // Tiptap JSON document, validated structurally at the editor layer;
  // stored as unknown here since its shape is Tiptap's, not ours.
  content: z.unknown(),
});

export const imageGalleryBlockSchema = z.object({
  ...base,
  type: z.literal("imageGallery"),
  heading: z.string().optional(),
  images: z.array(image).min(1),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
});

export const faqBlockSchema = z.object({
  ...base,
  type: z.literal("faq"),
  heading: z.string().optional(),
  items: z
    .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .min(1),
});

export const ctaBlockSchema = z.object({
  ...base,
  type: z.literal("cta"),
  heading: z.string().min(1),
  body: z.string().optional(),
  primaryCta: cta,
  secondaryCta: cta.optional(),
});

export const testimonialsBlockSchema = z.object({
  ...base,
  type: z.literal("testimonials"),
  heading: z.string().optional(),
  items: z
    .array(
      z.object({
        quote: z.string().min(1),
        author: z.string().min(1),
        role: z.string().optional(),
        avatar: image.optional(),
      })
    )
    .min(1),
});

export const contactSplitBlockSchema = z.object({
  ...base,
  type: z.literal("contactSplit"),
  heading: z.string().optional(),
  body: z.string().optional(),
  showForm: z.boolean().default(true),
  formTarget: z.enum(["contact", "amc"]).default("contact"),
});

export const jobListBlockSchema = z.object({
  ...base,
  type: z.literal("jobList"),
  heading: z.string().optional(),
  emptyStateMessage: z.string().default("No open positions right now — check back soon."),
});

export const projectGridBlockSchema = z.object({
  ...base,
  type: z.literal("projectGrid"),
  heading: z.string().optional(),
  filterBySector: z.string().optional(),
  featuredOnly: z.boolean().default(true),
  limit: z.number().int().min(1).max(24).default(6),
});

export const videoBannerBlockSchema = z.object({
  ...base,
  type: z.literal("videoBanner"),
  videoUrl: z.string().min(1),
  poster: image.optional(),
  heading: z.string().optional(),
});

export const stepsBlockSchema = z.object({
  ...base,
  type: z.literal("steps"),
  heading: z.string().optional(),
  items: z
    .array(z.object({ title: z.string().min(1), description: z.string().optional() }))
    .min(1),
});

export const blockSchema = z.discriminatedUnion("type", [
  heroBlockSchema,
  serviceGridBlockSchema,
  statsBlockSchema,
  logoWallBlockSchema,
  richTextBlockSchema,
  imageGalleryBlockSchema,
  faqBlockSchema,
  ctaBlockSchema,
  testimonialsBlockSchema,
  contactSplitBlockSchema,
  jobListBlockSchema,
  projectGridBlockSchema,
  videoBannerBlockSchema,
  stepsBlockSchema,
]);

export const blocksArraySchema = z.array(blockSchema);

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];

export const BLOCK_TYPES: BlockType[] = [
  "hero",
  "serviceGrid",
  "stats",
  "logoWall",
  "richText",
  "imageGallery",
  "faq",
  "cta",
  "testimonials",
  "contactSplit",
  "jobList",
  "projectGrid",
  "videoBanner",
  "steps",
];

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero",
  serviceGrid: "Service Grid",
  stats: "Stats Strip",
  logoWall: "Logo Wall",
  richText: "Rich Text",
  imageGallery: "Image Gallery",
  faq: "FAQ",
  cta: "Call to Action",
  testimonials: "Testimonials",
  contactSplit: "Contact Split",
  jobList: "Job List",
  projectGrid: "Project Grid",
  videoBanner: "Video Banner",
  steps: "Steps",
};
