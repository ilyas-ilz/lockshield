import { ListingPageSkeleton } from "@/components/frontend/skeletons";

/** Matches the 3-across service card grid (icon tile, no cover image). */
export default function ServicesLoading() {
  return <ListingPageSkeleton withImage={false} count={9} />;
}
