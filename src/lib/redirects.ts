import { connectDB } from "./db";
import { Redirect } from "@/models/Redirect";

/**
 * Looks up a 301/302 target for an incoming path. Used by middleware (or,
 * once the public frontend exists, a root catch-all) to send the old
 * `/blog/some-post.html`-style URLs from the legacy static site to their
 * new home instead of 404ing — see design doc: "Redirect manager in admin
 * + middleware.ts". Fire-and-forget hit counting so a lookup never gets
 * slower because of the write.
 */
export async function findRedirect(pathname: string): Promise<{ to: string; statusCode: 301 | 302 } | null> {
  await connectDB();
  const redirect = await Redirect.findOne({ from: pathname });
  if (!redirect) return null;

  void Redirect.updateOne({ _id: redirect._id }, { $inc: { hits: 1 }, $set: { lastHitAt: new Date() } }).exec();

  return { to: redirect.to, statusCode: redirect.statusCode };
}
