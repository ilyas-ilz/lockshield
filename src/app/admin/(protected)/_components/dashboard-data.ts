import { connectDB } from "@/lib/db";
import { Job, Lead, Post, Project, Service } from "@/models";
import type { LeadStatus } from "@/lib/constants";

const TZ = "Asia/Dubai";
const DAY_MS = 86_400_000;

export interface DashboardLead {
  id: string;
  name: string;
  source: string;
  status: LeadStatus;
  createdAt: string;
  email?: string;
  message?: string;
  /** Diagnostic submissions (e.g. "TEST - website email check") - flagged so they don't read as real customers. */
  isTest: boolean;
}

// Anchored on purpose: real enquiries say "fire alarm testing" or "hydrant
// test"; only a name that STARTS with a test marker, or a message that opens
// with "Diagnostic" / "Test -", is a diagnostic submission.
const TEST_NAME_RE = /^\s*(test|testing|diagnostic)\b/i;
const TEST_MESSAGE_RE = /^\s*(diagnostic\b|test\s*[-:])/i;

export interface DashboardData {
  leads: {
    total: number;
    byStatus: Record<LeadStatus, number>;
    thisMonth: number;
    lastMonth: number;
    recent: DashboardLead[];
    /** Oldest first, today last. */
    week: { key: string; weekday: string; day: number; count: number; isToday: boolean }[];
  };
  content: {
    publishedPosts: number;
    draftPosts: number;
    services: number;
    projects: number;
    openJobs: number;
  };
}

/** YYYY-MM-DD in Dubai time - the business's calendar, not the server's. */
function dubaiDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** Midnight at the start of a Dubai month (UAE is a fixed UTC+4, no DST). */
function dubaiMonthStart(now: Date, monthsBack: number): Date {
  const [y, m] = dubaiDayKey(now).split("-").map(Number) as [number, number];
  const index = y * 12 + (m - 1) - monthsBack;
  const year = Math.floor(index / 12);
  const month = String((index % 12) + 1).padStart(2, "0");
  return new Date(`${year}-${month}-01T00:00:00+04:00`);
}

export async function getDashboardData(now: Date = new Date()): Promise<DashboardData> {
  await connectDB();

  const weekKeys = Array.from({ length: 7 }, (_, i) => new Date(now.getTime() - (6 - i) * DAY_MS));
  const since = new Date(`${dubaiDayKey(weekKeys[0]!)}T00:00:00+04:00`);
  const monthStart = dubaiMonthStart(now, 0);
  const lastMonthStart = dubaiMonthStart(now, 1);

  const [
    total,
    statusRows,
    thisMonth,
    lastMonth,
    recent,
    dayRows,
    publishedPosts,
    draftPosts,
    services,
    projects,
    openJobs,
  ] = await Promise.all([
    Lead.countDocuments({}),
    Lead.aggregate<{ _id: LeadStatus; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Lead.countDocuments({ createdAt: { $gte: monthStart } }),
    Lead.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: monthStart } }),
    Lead.find().sort({ createdAt: -1 }).limit(5).select("name email message source status createdAt").lean(),
    Lead.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TZ } }, count: { $sum: 1 } } },
    ]),
    Post.countDocuments({ status: "published" }),
    Post.countDocuments({ status: "draft" }),
    Service.countDocuments({ status: "published" }),
    Project.countDocuments({ publishStatus: "published" }),
    Job.countDocuments({ status: "published" }),
  ]);

  const byStatus: Record<LeadStatus, number> = { new: 0, contacted: 0, qualified: 0, closed: 0, spam: 0 };
  for (const row of statusRows) if (row._id in byStatus) byStatus[row._id] = row.count;

  const perDay = new Map(dayRows.map((r) => [r._id, r.count]));
  const todayKey = dubaiDayKey(now);
  const week = weekKeys.map((date) => {
    const key = dubaiDayKey(date);
    return {
      key,
      weekday: new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short" }).format(date),
      day: Number(key.slice(8, 10)),
      count: perDay.get(key) ?? 0,
      isToday: key === todayKey,
    };
  });

  return {
    leads: {
      total,
      byStatus,
      thisMonth,
      lastMonth,
      recent: recent.map((l) => ({
        id: String(l._id),
        name: l.name,
        source: l.source,
        status: l.status,
        createdAt: new Date(l.createdAt).toISOString(),
        email: l.email,
        message: l.message,
        isTest: TEST_NAME_RE.test(l.name) || TEST_MESSAGE_RE.test(l.message ?? ""),
      })),
      week,
    },
    content: { publishedPosts, draftPosts, services, projects, openJobs },
  };
}
