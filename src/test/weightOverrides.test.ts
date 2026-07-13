import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFmHtml } from "@/lib/parser/parseFmHtml";
import { buildEffectiveWeights, computeRatingForRoleId } from "@/lib/rating/computeRating";
import { ROLE_WEIGHTS } from "@/lib/rating/roleWeights";
import type { Player } from "@/lib/types";

const fixtureHtml = readFileSync(join(__dirname, "fixtures/sample-export.html"), "utf-8");
const { players } = parseFmHtml(fixtureHtml);

function findPlayer(name: string): Player {
  const player = players.find((p) => p.name === name);
  if (!player) throw new Error(`fixture player not found: ${name}`);
  return player;
}

describe("buildEffectiveWeights", () => {
  it("leaves roles with no override untouched", () => {
    const effective = buildEffectiveWeights(ROLE_WEIGHTS, {});
    expect(effective["dc-cd-d"]).toEqual(ROLE_WEIGHTS["dc-cd-d"]);
  });

  it("merges a partial override on top of the defaults, keeping other attributes intact", () => {
    const effective = buildEffectiveWeights(ROLE_WEIGHTS, { "dc-cd-d": { marking: 5 } });
    expect(effective["dc-cd-d"].weights.marking).toBe(5);
    // Untouched attribute keeps its default value.
    expect(effective["dc-cd-d"].weights.tackling).toBe(ROLE_WEIGHTS["dc-cd-d"].weights.tackling);
  });

  it("changes a player's computed rating when the relevant weight is overridden", () => {
    const diego = findPlayer("Diego Marchetti");
    const baseline = computeRatingForRoleId(diego, "dc-cd-d", ROLE_WEIGHTS)!;

    // Zero out every default weight except pace, so the score becomes exactly Diego's pace attribute.
    const zeroEverythingButPace = Object.fromEntries(
      Object.keys(ROLE_WEIGHTS["dc-cd-d"].weights).map((key) => [key, key === "pace" ? 20 : 0]),
    );
    const effective = buildEffectiveWeights(ROLE_WEIGHTS, { "dc-cd-d": zeroEverythingButPace });
    const adjusted = computeRatingForRoleId(diego, "dc-cd-d", effective)!;

    expect(adjusted.score).not.toBe(baseline.score);
    expect(adjusted.score).toBe(diego.physical.pace); // score is now driven entirely by the one non-zero weight
  });
});
