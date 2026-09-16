import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Post } from "@/models";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;
const MAX_LIMIT = 24;

/**
 * Public paginated blog listing for the "Load more" button on /blog.
 * Only published summaries - never drafts, never bodies.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const skip = Math.max(0, Number(searchParams.get("skip") || 0));
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get("limit") || PAGE_SIZE)));

    await connectDB();
    const [posts, total] = await Promise.all([
      Post.find({ status: "published" })
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("title slug excerpt coverImage publishedAt")
        .lean(),
      Post.countDocuments({ status: "published" }),
    ]);

    return NextResponse.json({ posts, total });
  } catch {
    return NextResponse.json({ posts: [], total: 0 }, { status: 500 });
  }
}
