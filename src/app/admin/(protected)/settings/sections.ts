import {
  Building,
  PhoneCall,
  Link2,
  Share2,
  Search as SearchIcon,
  BarChart3,
  Activity,
  type LucideIcon,
} from "lucide-react";
import type { FieldConfig } from "@/lib/admin/field-types";

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  fields: FieldConfig[];
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "identity",
    title: "Business Identity",
    description: "Legal brand details, registered company name, and official logo.",
    icon: Building,
    fields: [
      { name: "siteName", label: "Site Name", type: "text", required: true },
      { name: "legalName", label: "Legal (Registered) Name", type: "text", required: true },
      { name: "logoUrl", label: "Brand Logo", type: "image" },
    ],
  },
  {
    id: "contact",
    title: "Contact & NAP Details",
    description:
      "Official Name-Address-Phone (NAP) details used in footer, contact page, and Google LocalBusiness schema.",
    icon: PhoneCall,
    fields: [
      { name: "phones", label: "Phone Numbers", type: "stringArray" },
      { name: "whatsapp", label: "WhatsApp Number", type: "text" },
      {
        name: "emails",
        label: "Email Addresses",
        type: "stringArray",
        help: "New quote requests and job applications are emailed to every address here.",
      },
      { name: "address.poBox", label: "PO Box", type: "text" },
      { name: "address.street", label: "Street Address", type: "text" },
      { name: "address.locality", label: "City / Emirate", type: "text" },
      { name: "address.country", label: "Country Code", type: "text", help: "Two letters, e.g. AE" },
    ],
  },
  {
    id: "backlinks",
    title: "Partner Backlinks",
    description:
      "Strategic backlinks to lockshieldcart.com with varied anchor text to maintain healthy search rankings.",
    icon: Link2,
    fields: [
      {
        name: "partnerLinks",
        label: "Links",
        type: "objectArray",
        itemFields: [
          { name: "label", label: "Anchor Text", type: "text", required: true },
          { name: "url", label: "Target URL", type: "text", required: true },
          { name: "rel", label: "rel Attribute", type: "text", defaultValue: "noopener" },
        ],
      },
    ],
  },
  {
    id: "socials",
    title: "Social Profiles",
    description: "Official social media channels displayed in the website footer.",
    icon: Share2,
    fields: [
      {
        name: "socials",
        label: "Profiles",
        type: "objectArray",
        itemFields: [
          { name: "platform", label: "Platform (e.g. LinkedIn, Instagram, Facebook)", type: "text", required: true },
          { name: "url", label: "Profile URL", type: "text", required: true },
        ],
      },
    ],
  },
  {
    id: "seo",
    title: "Default SEO",
    description: "Fallback meta title and description used when a page has no custom metadata.",
    icon: SearchIcon,
    fields: [
      // Limits mirror seoInputSchema (lib/validation/common.ts).
      { name: "defaultSeo.title", label: "Default SEO Title", type: "text", help: "Up to 70 characters" },
      { name: "defaultSeo.description", label: "Default Meta Description", type: "textarea", help: "Up to 160 characters" },
      { name: "footerNote", label: "Footer Copyright / Compliance Note", type: "textarea" },
    ],
  },
  {
    id: "analytics",
    title: "Tracking & Analytics",
    description: "Measurement and tracking tags for Google Analytics and Google Tag Manager.",
    icon: BarChart3,
    fields: [
      { name: "analytics.gaId", label: "Google Analytics ID (GA4)", type: "text", help: "e.g. G-XXXXXXXXXX" },
      { name: "analytics.gtmId", label: "Google Tag Manager ID", type: "text", help: "e.g. GTM-XXXXXXX" },
    ],
  },
  {
    id: "system",
    title: "System & Health",
    description: "Database connectivity, storage backend, environment status, and runtime diagnostics.",
    icon: Activity,
    fields: [],
  },
];

export interface SettingsFieldLocation {
  sectionId: string;
  fieldName: string;
  label: string;
}

/**
 * Finds the form field a server validation path belongs to, so a failed save
 * can open that field's tab. Settings saves every tab in one request, so the
 * broken field is usually NOT on the tab the admin is looking at.
 * "emails.1" and "partnerLinks.0.url" resolve to their array field.
 */
export function findSettingsField(path: string): SettingsFieldLocation | null {
  for (const section of SETTINGS_SECTIONS) {
    for (const field of section.fields) {
      if (path === field.name || path.startsWith(`${field.name}.`)) {
        return { sectionId: section.id, fieldName: field.name, label: field.label };
      }
    }
  }
  return null;
}
