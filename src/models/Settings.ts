import mongoose, { type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import { seoSchema } from "./shared";

// WHY: a "singleton" collection — exactly one document, enforced by always
// querying/upserting a fixed _id ("global") in lib/settings.ts rather than
// at the schema level (Mongoose has no native singleton constraint).
// Every page and every JSON-LD block reads NAP/contact/social data from here
// so there is exactly one place to correct an address or phone number.

const partnerLinkSchema = new Schema(
  {
    label: { type: String, required: true, trim: true }, // link text / anchor
    url: { type: String, required: true, trim: true },
    rel: { type: String, default: "noopener" }, // e.g. "noopener" or "noopener sponsored"
  },
  { _id: false }
);

const navItemSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
    children: [
      {
        _id: false,
        label: { type: String, required: true, trim: true },
        href: { type: String, required: true, trim: true },
      },
    ],
  },
  { _id: false }
);

// WHY Omit<Document, "_id"> not `extends Document`: this is a fixed-id
// singleton (_id is always the literal string "global", not an ObjectId —
// see settingsSchema._id below), so the base Document's `_id: ObjectId`
// has to be overridden rather than inherited.
export interface ISettings extends Omit<Document, "_id"> {
  _id: string;
  siteName: string;
  legalName: string;
  phones: string[];
  whatsapp: string;
  emails: string[];
  address: {
    poBox?: string;
    street: string;
    locality: string;
    country: string;
    geo?: { lat: number; lng: number };
  };
  socials: { platform: string; url: string }[];
  partnerLinks: { label: string; url: string; rel: string }[];
  nav: { label: string; href: string; children?: { label: string; href: string }[] }[];
  footerNote: string;
  logoUrl: string;
  logoLightUrl: string;
  defaultSeo: {
    title?: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
    noindex?: boolean;
    focusKeyword?: string;
  };
  analytics: { gaId?: string; gtmId?: string };
  updatedAt: Date;
}

const settingsSchema = new Schema(
  {
    _id: { type: String, default: "global" },
    siteName: { type: String, required: true, default: "Lock Shield" },
    legalName: { type: String, required: true, default: "Lock Shield Firefighting & Safety Equipment Installation LLC" },
    phones: { type: [String], default: [] },
    whatsapp: { type: String, default: "" },
    emails: { type: [String], default: [] },
    address: {
      poBox: String,
      street: { type: String, default: "" },
      locality: { type: String, default: "Dubai" },
      country: { type: String, default: "AE" },
      geo: { lat: Number, lng: Number },
    },
    socials: [{ _id: false, platform: { type: String, required: true }, url: { type: String, required: true } }],
    // WHY (this is the "ecart backlink" fix): real dofollow anchors to
    // lockshieldcart.com, rendered in the footer + a PartnerCallout block +
    // Organization.sameAs — replacing the broken `href="Email:..."`
    // pseudo-links found on the legacy site, which passed zero link equity.
    partnerLinks: { type: [partnerLinkSchema], default: [] },
    nav: { type: [navItemSchema], default: [] },
    footerNote: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    logoLightUrl: { type: String, default: "" },
    defaultSeo: { type: seoSchema, default: () => ({}) },
    analytics: { gaId: String, gtmId: String },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const Settings: Model<ISettings> = models.Settings ?? model<ISettings>("Settings", settingsSchema);
