import type { AttrValue, AttributeKey, Player, RatingResult, RoleDefinition, RoleWeights } from "@/lib/types";

const ESTIMATE_THRESHOLD = 0.4;

/**
 * Merges all four attribute groups into one lookup bag. Safe because no
 * attribute key is shared across groups (GKs use the same TechnicalAttributes
 * as outfield players — see types.ts — so 'passing' etc. never collides with
 * GoalkeepingAttributes).
 */
function flattenAttributes(player: Player): Partial<Record<AttributeKey, AttrValue>> {
  return {
    ...(player.technical ?? {}),
    ...player.mental,
    ...player.physical,
    ...(player.goalkeeping ?? {}),
  };
}

export function computeRatingForRole(player: Player, roleWeights: RoleWeights): RatingResult {
  const attrs = flattenAttributes(player);
  let weightedSum = 0;
  let presentWeight = 0;
  let missingWeight = 0;

  for (const [key, weight] of Object.entries(roleWeights.weights) as [AttributeKey, number][]) {
    const value = attrs[key];
    if (value === null || value === undefined) {
      missingWeight += weight;
      continue;
    }
    weightedSum += value * weight;
    presentWeight += weight;
  }

  const totalWeight = presentWeight + missingWeight;
  const score = presentWeight > 0 ? weightedSum / presentWeight : 0;
  const isEstimate = totalWeight > 0 && missingWeight / totalWeight > ESTIMATE_THRESHOLD;

  return {
    playerId: player.id,
    roleId: roleWeights.roleId,
    score: Math.round(score * 10) / 10,
    isEstimate,
  };
}

export function computeRatingForRoleId(
  player: Player,
  roleId: string,
  roleWeightsMap: Record<string, RoleWeights>,
): RatingResult | null {
  const weights = roleWeightsMap[roleId];
  if (!weights) return null;
  return computeRatingForRole(player, weights);
}

/** Ratings for every player against every role applicable to their goalkeeper/outfield status. */
export function computeAllRatings(
  players: Player[],
  roles: RoleDefinition[],
  roleWeightsMap: Record<string, RoleWeights>,
): Record<string, Record<string, RatingResult>> {
  const result: Record<string, Record<string, RatingResult>> = {};

  for (const player of players) {
    const perRole: Record<string, RatingResult> = {};
    for (const role of roles) {
      if (role.isGoalkeeperRole !== player.isGoalkeeper) continue;
      const weights = roleWeightsMap[role.id];
      if (!weights) continue;
      perRole[role.id] = computeRatingForRole(player, weights);
    }
    result[player.id] = perRole;
  }

  return result;
}

export function getBestRating(ratingsForPlayer: Record<string, RatingResult> | undefined): RatingResult | null {
  if (!ratingsForPlayer) return null;
  let best: RatingResult | null = null;
  for (const rating of Object.values(ratingsForPlayer)) {
    if (!best || rating.score > best.score) best = rating;
  }
  return best;
}

export function mergeRoleWeights(
  defaults: RoleWeights,
  overrides: Partial<Record<AttributeKey, number>> | undefined,
): RoleWeights {
  if (!overrides || Object.keys(overrides).length === 0) return defaults;
  return { roleId: defaults.roleId, weights: { ...defaults.weights, ...overrides } };
}

export function buildEffectiveWeights(
  defaults: Record<string, RoleWeights>,
  overrides: Record<string, Partial<Record<AttributeKey, number>>>,
): Record<string, RoleWeights> {
  const result: Record<string, RoleWeights> = {};
  for (const [roleId, defaultWeights] of Object.entries(defaults)) {
    result[roleId] = mergeRoleWeights(defaultWeights, overrides[roleId]);
  }
  return result;
}
