"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getRatingBand } from "@/lib/rating/bands";
import { formatRating } from "@/lib/utils/format";
import type { RatingResult } from "@/lib/types";

interface RatingBadgeProps {
  rating: RatingResult | null | undefined;
  size?: "sm" | "md";
}

export function RatingBadge({ rating, size = "sm" }: RatingBadgeProps) {
  if (!rating) {
    return <span className="rating-chip px-2 py-0.5 text-muted-foreground" data-band="none">-</span>;
  }

  const band = getRatingBand(rating.score);
  const sizeClass = size === "md" ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-xs";
  const chip = (
    <span className={`rating-chip ${sizeClass}`} data-band={band}>
      {formatRating(rating.score)}
      {rating.isEstimate && <span className="ml-0.5 opacity-70">*</span>}
    </span>
  );

  if (!rating.isEstimate) return chip;

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>{chip}</TooltipTrigger>
      <TooltipContent>Based on partial/unscouted attribute data</TooltipContent>
    </Tooltip>
  );
}
