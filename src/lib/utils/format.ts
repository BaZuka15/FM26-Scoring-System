import type { PositionToken } from "@/lib/types";

export function formatPositions(positions: PositionToken[]): string {
  if (positions.length === 0) return "-";
  return positions.map((p) => (p.sides.length > 0 ? `${p.group} (${p.sides.join("")})` : p.group)).join(", ");
}

export function formatCurrency(min: number | null, max: number | null): string {
  if (min === null && max === null) return "-";
  if (min === max || max === null) return formatMoney(min);
  if (min === null) return formatMoney(max);
  return `${formatMoney(min)} - ${formatMoney(max)}`;
}

function formatMoney(value: number | null): string {
  if (value === null) return "-";
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `€${(value / 1_000).toFixed(0)}K`;
  return `€${value}`;
}

export function formatRating(score: number | null | undefined): string {
  if (score === null || score === undefined) return "-";
  return score.toFixed(1);
}

/** "firstTouch" -> "First Touch" */
export function humanizeKey(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}
