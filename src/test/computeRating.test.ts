import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFmHtml } from "@/lib/parser/parseFmHtml";
import { computeRatingForRole, computeRatingForRoleId, getBestRating } from "@/lib/rating/computeRating";
import { ROLE_WEIGHTS } from "@/lib/rating/roleWeights";
import type { Player, RoleWeights } from "@/lib/types";

const fixtureHtml = readFileSync(join(__dirname, "fixtures/sample-export.html"), "utf-8");
const { players } = parseFmHtml(fixtureHtml);

function findPlayer(name: string): Player {
  const player = players.find((p) => p.name === name);
  if (!player) throw new Error(`fixture player not found: ${name}`);
  return player;
}

describe("computeRatingForRoleId", () => {
  it("rates a specialist defender highly for a defensive role and poorly for an attacking one", () => {
    const diego = findPlayer("Diego Marchetti");
    const cbRating = computeRatingForRoleId(diego, "dc-cd-d", ROLE_WEIGHTS)!;
    const strikerRating = computeRatingForRoleId(diego, "st-af-a", ROLE_WEIGHTS)!;

    expect(cbRating.score).toBeGreaterThan(strikerRating.score);
    expect(cbRating.score).toBeGreaterThan(13); // strong CB attributes -> green/high-amber band
  });

  it("rates a specialist striker highly for a striker role and poorly for a defensive one", () => {
    const erik = findPlayer("Erik Solberg");
    const strikerRating = computeRatingForRoleId(erik, "st-af-a", ROLE_WEIGHTS)!;
    const cbRating = computeRatingForRoleId(erik, "dc-cd-d", ROLE_WEIGHTS)!;

    expect(strikerRating.score).toBeGreaterThan(cbRating.score);
    expect(strikerRating.score).toBeGreaterThan(14);
  });

  it("returns null for a role id with no weight entry", () => {
    const diego = findPlayer("Diego Marchetti");
    expect(computeRatingForRoleId(diego, "not-a-real-role", ROLE_WEIGHTS)).toBeNull();
  });
});

describe("computeRatingForRole - missing attribute handling", () => {
  const basePlayer: Player = {
    id: "synthetic-1",
    name: "Synthetic Player",
    age: 25,
    club: null,
    nationality: null,
    positions: [],
    preferredFoot: null,
    transferStatus: null,
    transferValueRaw: null,
    transferValueNumeric: { min: null, max: null },
    wageRaw: null,
    wageNumeric: null,
    isGoalkeeper: false,
    technical: {
      corners: 10, crossing: 10, dribbling: 10, finishing: 10, firstTouch: 10, freeKickTaking: 10,
      heading: 10, longShots: 10, longThrows: 10, marking: 10, passing: 10, penaltyTaking: 10,
      tackling: 10, technique: 10,
    },
    mental: {
      aggression: 10, anticipation: 10, bravery: 10, composure: 10, concentration: 10, decisions: 10,
      determination: 10, flair: 10, leadership: 10, offTheBall: 10, positioning: 10, teamwork: 10,
      vision: 10, workRate: 10,
    },
    physical: {
      acceleration: 10, agility: 10, balance: 10, jumpingReach: 10, naturalFitness: 10, pace: 10,
      stamina: 10, strength: 10,
    },
    goalkeeping: null,
    attributeRanges: {},
    extra: {},
  };

  it("excludes null attributes from the weighted mean instead of treating them as zero", () => {
    const weightsWithMissing: RoleWeights = {
      roleId: "test-role",
      weights: { passing: 4, finishing: 4 },
    };
    const playerWithMissingFinishing: Player = {
      ...basePlayer,
      technical: { ...basePlayer.technical!, finishing: null },
    };

    const rating = computeRatingForRole(playerWithMissingFinishing, weightsWithMissing);
    // Only 'passing' (value 10) counts, so the mean should stay at 10, not drop toward 5.
    expect(rating.score).toBe(10);
  });

  it("flags isEstimate when more than 40% of the role's weight is missing", () => {
    const weights: RoleWeights = {
      roleId: "test-role-2",
      weights: { passing: 1, finishing: 1, tackling: 8 }, // tackling missing -> 8/10 = 80% missing
    };
    const playerMissingTackling: Player = {
      ...basePlayer,
      technical: { ...basePlayer.technical!, tackling: null },
    };

    const rating = computeRatingForRole(playerMissingTackling, weights);
    expect(rating.isEstimate).toBe(true);
  });

  it("does not flag isEstimate when attributes are mostly present", () => {
    const weights: RoleWeights = {
      roleId: "test-role-3",
      weights: { passing: 5, finishing: 5 },
    };
    const rating = computeRatingForRole(basePlayer, weights);
    expect(rating.isEstimate).toBe(false);
  });
});

describe("getBestRating", () => {
  it("picks the highest-scoring role for a player", () => {
    const erik = findPlayer("Erik Solberg");
    const ratings = {
      "dc-cd-d": computeRatingForRoleId(erik, "dc-cd-d", ROLE_WEIGHTS)!,
      "st-af-a": computeRatingForRoleId(erik, "st-af-a", ROLE_WEIGHTS)!,
      "st-poa-a": computeRatingForRoleId(erik, "st-poa-a", ROLE_WEIGHTS)!,
    };
    const best = getBestRating(ratings);
    expect(best).not.toBeNull();
    expect(best!.roleId === "st-af-a" || best!.roleId === "st-poa-a").toBe(true);
  });

  it("returns null when there are no ratings", () => {
    expect(getBestRating(undefined)).toBeNull();
    expect(getBestRating({})).toBeNull();
  });
});
