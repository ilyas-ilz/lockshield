import mongoose, { type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import {
  PROJECT_SECTORS,
  EMIRATES,
  SCOPE_TAGS,
  PROJECT_STATUSES,
  type ProjectSector,
  type Emirate,
  type ProjectStatus,
} from "@/lib/constants";
import { seoSchema, imageSchema, slugField, STATUSES, LOCALES, type ContentStatus, type Locale, ISeo } from "./shared";

export {
  PROJECT_SECTORS,
  EMIRATES,
  SCOPE_TAGS,
  type ProjectSector,
  type Emirate,
} from "@/lib/constants";

export interface IProject extends Document {
  title: string;
  slug: string;
  client: string;
  clientLogo?: { url: string; publicId?: string; alt: string };
  sector: ProjectSector;
  emirate: Emirate;
  area?: string;
  year: number;
  status: ProjectStatus;
  scopeOfWork: string[];
  summary: string;
  body: unknown; // Tiptap JSON: challenge / solution / outcome
  coverImage: { url: string; publicId?: string; alt: string; caption?: string };
  gallery: { url: string; publicId?: string; alt: string; caption?: string }[];
  stats: { value: string; label: string }[];
  featured: boolean;
  order: number;
  publishStatus: ContentStatus;
  locale: Locale;
  translationGroupId: string;
  seo: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: slugField,
    client: { type: String, required: true, trim: true, maxlength: 150 },
    clientLogo: { type: imageSchema },
    sector: { type: String, enum: PROJECT_SECTORS, required: true },
    emirate: { type: String, enum: EMIRATES, required: true },
    area: { type: String, trim: true },
    year: { type: Number, required: true },
    status: { type: String, enum: PROJECT_STATUSES, default: "Completed" },
    scopeOfWork: { type: [String], enum: SCOPE_TAGS, default: [] },
    summary: { type: String, required: true, trim: true, maxlength: 300 },
    body: { type: Schema.Types.Mixed },
    coverImage: { type: imageSchema, required: true },
    gallery: { type: [imageSchema], default: [] },
    stats: [{ _id: false, value: { type: String, required: true }, label: { type: String, required: true } }],
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    // WHY named publishStatus not status: "status" already means
    // Completed/Ongoing (a project fact), this is the CMS draft/published state.
    publishStatus: { type: String, enum: STATUSES, default: "draft" },
    locale: { type: String, enum: LOCALES, default: "en" },
    translationGroupId: { type: String, required: true, index: true },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true }
);
projectSchema.index({ slug: 1, locale: 1 }, { unique: true });
projectSchema.index({ publishStatus: 1, featured: 1, order: 1 });
projectSchema.index({ publishStatus: 1, sector: 1, emirate: 1 });

export const Project: Model<IProject> = models.Project ?? model<IProject>("Project", projectSchema);
