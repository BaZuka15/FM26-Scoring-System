import type { PositionGroup, PositionToken } from "@/lib/types";

// The role catalogue conflates full-back and wing-back slots into a single
// DL/DR position group (see roleTemplates.ts), so "WB" tokens map to the "D"
// prefix rather than a separate "WB" one — keeping this the single place
// that encodes that simplification.
const GROUP_PREFIX: Record<string, string> = { D: "D", WB: "D", M: "M", AM: "AM" };

/** Maps a raw parsed position token (e.g. group "D", sides ["R","C"]) to our compound PositionGroup enum (e.g. "DR", "DC"). */
export function derivePositionGroups(token: PositionToken): PositionGroup[] {
  const group = token.group.toUpperCase();
  const prefix = GROUP_PREFIX[group];

  if (!prefix) {
    if (group === "GK" || group === "DM" || group === "ST") return [group as PositionGroup];
    return [];
  }

  if (token.sides.length === 0) {
    // No side specified (e.g. plain "M") — assume the central variant.
    return [`${prefix}C` as PositionGroup];
  }

  return token.sides
    .map((side) => `${prefix}${side.toUpperCase()}` as PositionGroup)
    .filter((g): g is PositionGroup => isKnownPositionGroup(g));
}

const KNOWN_GROUPS = new Set<PositionGroup>(["GK", "DC", "DL", "DR", "WBL", "WBR", "DM", "ML", "MC", "MR", "AML", "AMC", "AMR", "ST"]);

function isKnownPositionGroup(value: string): value is PositionGroup {
  return KNOWN_GROUPS.has(value as PositionGroup);
}

export function playerPositionGroups(positions: PositionToken[]): PositionGroup[] {
  const groups = new Set<PositionGroup>();
  for (const token of positions) {
    for (const group of derivePositionGroups(token)) groups.add(group);
  }
  return Array.from(groups);
}
