import type { FieldConfig } from "./field-types";
import type { BlockType } from "@/lib/blocks/schemas";

// WHY one config map instead of 14 hand-built block editor forms: every
// block's Zod schema (lib/blocks/schemas.ts) is already just primitives,
// image refs, and small object lists — the same shapes ResourceForm
// already knows how to render. This is the field-level description that
// keeps the two in lockstep; if a block schema gains a field, add it here
// too (a schema test — lib/blocks/schemas.test.ts — is the guardrail that
// notices when they drift, since it exercises real block payloads shaped
// from these configs).
const cta: FieldConfig[] = [
  { name: "label", label: "Button label", type: "text", required: true },
  { name: "href", label: "Link", type: "text", required: true },
];

export const BLOCK_FIELD_CONFIGS: Record<BlockType, FieldConfig[]> = {
  hero: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "heading", label: "Heading", type: "text", required: true },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "image", label: "Image", type: "image" },
    { name: "primaryCta", label: "Primary Button", type: "object", itemFields: cta },
    { name: "secondaryCta", label: "Secondary Button", type: "object", itemFields: cta },
  ],
  serviceGrid: [{ name: "heading", label: "Heading", type: "text" }],
  stats: [{ name: "items", label: "Stats", type: "statsArray" }],
  logoWall: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "useProjectClients", label: "Auto-pull from featured Projects", type: "boolean", defaultValue: true },
    { name: "logos", label: "Manual logos (used when auto-pull is off)", type: "imageArray" },
  ],
  richText: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "content", label: "Content", type: "richtext" },
  ],
  imageGallery: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "images", label: "Images", type: "imageArray" },
    { name: "columns", label: "Columns", type: "select", options: ["2", "3", "4"] },
  ],
  faq: [
    { name: "heading", label: "Heading", type: "text" },
    {
      name: "items",
      label: "Questions",
      type: "objectArray",
      itemFields: [
        { name: "question", label: "Question", type: "text", required: true },
        { name: "answer", label: "Answer", type: "textarea", required: true },
      ],
    },
  ],
  cta: [
    { name: "heading", label: "Heading", type: "text", required: true },
    { name: "body", label: "Body", type: "textarea" },
    { name: "primaryCta", label: "Primary Button", type: "object", itemFields: cta },
    { name: "secondaryCta", label: "Secondary Button", type: "object", itemFields: cta },
  ],
  testimonials: [
    { name: "heading", label: "Heading", type: "text" },
    {
      name: "items",
      label: "Testimonials",
      type: "objectArray",
      itemFields: [
        { name: "quote", label: "Quote", type: "textarea", required: true },
        { name: "author", label: "Author", type: "text", required: true },
        { name: "role", label: "Role / Company", type: "text" },
      ],
    },
  ],
  contactSplit: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "body", label: "Body", type: "textarea" },
    { name: "showForm", label: "Show form", type: "boolean", defaultValue: true },
    { name: "formTarget", label: "Form target", type: "select", options: ["contact", "amc"] },
  ],
  jobList: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "emptyStateMessage", label: "Empty state message", type: "text" },
  ],
  projectGrid: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "featuredOnly", label: "Featured only", type: "boolean", defaultValue: true },
    { name: "limit", label: "Max items", type: "number", defaultValue: 6 },
  ],
  videoBanner: [
    { name: "videoUrl", label: "Video URL", type: "text", required: true },
    { name: "poster", label: "Poster image", type: "image" },
    { name: "heading", label: "Heading", type: "text" },
  ],
  steps: [
    { name: "heading", label: "Heading", type: "text" },
    {
      name: "items",
      label: "Steps",
      type: "objectArray",
      itemFields: [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
      ],
    },
  ],
};
