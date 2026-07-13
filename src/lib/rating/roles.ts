import type { PositionGroup } from "@/lib/types";
import { ROLE_CATALOGUE } from "./roleTemplates";

export { ROLE_CATALOGUE } from "./roleTemplates";

// WBL/WBR exist in the PositionGroup type for completeness but are unused: wing-back
// roles live under DL/DR (see roleTemplates.ts and utils/positions.ts).
export const POSITION_GROUP_ORDER: PositionGroup[] = ["GK", "DC", "DL", "DR", "DM", "MC", "ML", "MR", "AMC", "AML", "AMR", "ST"];

export const ROLE_BY_ID = new Map(ROLE_CATALOGUE.map((r) => [r.id, r]));
