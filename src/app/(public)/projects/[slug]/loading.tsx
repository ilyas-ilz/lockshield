import { ArticlePageSkeleton } from "@/components/frontend/skeletons";

/** Project case study: hero, gallery image, write-up. No sidebar. */
export default function ProjectDetailLoading() {
  return <ArticlePageSkeleton withSidebar={false} />;
}
