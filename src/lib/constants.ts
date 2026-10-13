/**
 * Shared domain constants — plain data, zero imports.
 *
 * WHY this file exists separately from the models: these enums are needed
 * by BOTH the Mongoose schemas (server) and the admin form configs
 * (client). Importing them from `models/Project.ts` pulled that module —
 * and therefore Mongoose — into the browser bundle, where `mongoose.models`
 * is undefined and the page crashed with "Cannot read properties of
 * undefined (reading 'Project')".
 *
 * Rule of thumb: anything a client component needs lives here; anything
 * that touches Mongoose stays in src/models.
 */

export const LOCALES = ["en"] as const;
export type Locale = (typeof LOCALES)[number];

export const STATUSES = ["draft", "published"] as const;
export type ContentStatus = (typeof STATUSES)[number];

export const PROJECT_SECTORS = [
  "Retail",
  "F&B",
  "Healthcare",
  "Banking",
  "Residential",
  "Industrial",
  "Office",
  "Hospitality",
] as const;
export type ProjectSector = (typeof PROJECT_SECTORS)[number];

export const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;
export type Emirate = (typeof EMIRATES)[number];

export const SCOPE_TAGS = [
  "Fire Alarm",
  "Sprinkler",
  "FM-200",
  "Kitchen Suppression",
  "Hose Reel",
  "Fire Pump",
  "DCD Approval",
] as const;
export type ScopeTag = (typeof SCOPE_TAGS)[number];

export const PROJECT_STATUSES = ["Completed", "Ongoing"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const LEAD_SOURCES = ["contact", "amc", "career"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

/**
 * Which website form a lead was sent from. WHY separate from `source`:
 * source is *what* they want (quote / AMC / job), form is *where* they asked -
 * every quote form used to say "contact", so the popup, the Contact page and
 * the per-service forms were indistinguishable in the admin.
 */
export const LEAD_FORMS = ["quote_popup", "quote_form", "career"] as const;
export type LeadForm = (typeof LEAD_FORMS)[number];
export const LEAD_FORM_LABELS: Record<LeadForm, string> = {
  quote_popup: "Get a Quote popup",
  quote_form: "Quote form",
  career: "Job application form",
};

export const LEAD_STATUSES = ["new", "contacted", "qualified", "closed", "spam"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const USER_ROLES = ["ADMIN", "EDITOR"] as const;
export type UserRole = (typeof USER_ROLES)[number];
