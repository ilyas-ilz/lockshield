import { connectDB } from "@/lib/db";
import { Job } from "@/models/Job";

export interface JobOpening {
  _id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description: unknown; // Tiptap JSON from the admin rich-text editor (or a legacy plain string)
  requirements: string[];
}

/**
 * Published jobs that are still accepting applications, newest first.
 *
 * WHY closesAt is filtered here: the admin sets a closing date, and before
 * this the careers page kept listing a role after it closed.
 * WHY mapped to plain objects: lean() still returns ObjectId instances, which
 * the careers page hands to a client component.
 */
export async function getOpenJobs(now: Date = new Date()): Promise<JobOpening[]> {
  await connectDB();
  const docs = await Job.find({
    status: "published",
    $or: [{ closesAt: null }, { closesAt: { $gt: now } }],
  })
    .sort({ createdAt: -1, _id: -1 })
    .select("title department location employmentType description requirements")
    .lean();

  return docs.map((doc) => ({
    _id: String(doc._id),
    title: doc.title,
    department: doc.department,
    location: doc.location,
    employmentType: doc.employmentType,
    description: doc.description,
    requirements: doc.requirements ?? [],
  }));
}
