import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function FavoriteStarIcon({ starred }: { starred: boolean }) {
  return (
    <StarIcon
      aria-hidden
      className={cn(starred && "fill-amber-400 text-amber-400")}
    />
  );
}
