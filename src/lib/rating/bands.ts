export type RatingBand = "red" | "amber" | "green";

// Thresholds are on FM's natural 1-20 attribute scale.
const AMBER_MIN = 10;
const GREEN_MIN = 14;

export function getRatingBand(score: number): RatingBand {
  if (score >= GREEN_MIN) return "green";
  if (score >= AMBER_MIN) return "amber";
  return "red";
}

export const RATING_BAND_COLORS: Record<RatingBand, string> = {
  red: "#ef4444",
  amber: "#f59e0b",
  green: "#22c55e",
};
