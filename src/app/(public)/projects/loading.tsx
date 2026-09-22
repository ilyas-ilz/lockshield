import { ListingPageSkeleton } from "@/components/frontend/skeletons";

/** Matches the projects grid, including its sector filter pill row. */
export default function ProjectsLoading() {
  return <ListingPageSkeleton withFilters count={9} />;
}
