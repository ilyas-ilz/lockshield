import { z } from "zod";
import { seoInputSchema } from "./common";

const partnerLinkSchema = z.object({
  label: z.string().trim().min(1),
  url: z.string().trim().min(1),
  rel: z.string().trim().default("noopener"),
});

const navChildSchema = z.object({ label: z.string().min(1), href: z.string().min(1) });
const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  children: z.array(navChildSchema).optional(),
});

// WHY: Settings is edited by ADMIN only (see rbac.ts) — it controls sitewide
// NAP data, nav, and the cart backlink anchors, all of which affect every
// page's SEO/schema output at once.
export const settingsUpdateSchema = z.object({
  siteName: z.string().trim().min(1).optional(),
  legalName: z.string().trim().min(1).optional(),
  phones: z.array(z.string().trim().min(1)).optional(),
  whatsapp: z.string().trim().optional(),
  emails: z.array(z.string().trim().email()).optional(),
  address: z
    .object({
      poBox: z.string().optional(),
      street: z.string().optional(),
      locality: z.string().optional(),
      country: z.string().optional(),
      geo: z.object({ lat: z.number(), lng: z.number() }).optional(),
    })
    .optional(),
  socials: z.array(z.object({ platform: z.string().min(1), url: z.string().min(1) })).optional(),
  partnerLinks: z.array(partnerLinkSchema).optional(),
  nav: z.array(navItemSchema).optional(),
  footerNote: z.string().optional(),
  logoUrl: z.string().optional(),
  logoLightUrl: z.string().optional(),
  defaultSeo: seoInputSchema.optional(),
  analytics: z.object({ gaId: z.string().optional(), gtmId: z.string().optional() }).optional(),
});
