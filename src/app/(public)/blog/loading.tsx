import { ListingPageSkeleton } from "@/components/frontend/skeletons";

/** Matches the blog card grid — cover image, date line, title, excerpt. */
export default function BlogLoading() {
  return <ListingPageSkeleton count={9} />;
}
