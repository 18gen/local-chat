import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Shared by the sidebar and the workflow cards so stars look the same.
export function FavoriteStarIcon({ starred }: { starred: boolean }) {
  return (
    <StarIcon
      aria-hidden
      className={cn(starred && "fill-amber-400 text-amber-400")}
    />
  );
}
