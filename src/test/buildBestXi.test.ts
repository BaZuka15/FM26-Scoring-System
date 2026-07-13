import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildBestXi } from "@/lib/bestxi/buildBestXi";
import { FORMATIONS } from "@/lib/bestxi/formations";
import { parseFmHtml } from "@/lib/parser/parseFmHtml";
import { computeAllRatings } from "@/lib/rating/computeRating";
import { ROLE_CATALOGUE } from "@/lib/rating/roles";
import { ROLE_WEIGHTS } from "@/lib/rating/roleWeights";

const fixtureHtml = readFileSync(join(__dirname, "fixtures/sample-export.html"), "utf-8");
const { players } = parseFmHtml(fixtureHtml);
const ratings = computeAllRatings(players, ROLE_CATALOGUE, ROLE_WEIGHTS);

describe("buildBestXi", () => {
  const formation442 = FORMATIONS.find((f) => f.id === "442")!;
  const result = buildBestXi(formation442, players, ratings);

  it("fills every slot it can from the available squad", () => {
    // Fixture has 7 players for an 11-slot formation, so most slots fill but not all.
    const filled = result.slots.filter((s) => s.starter !== null);
    expect(filled.length).toBeGreaterThan(0);
    expect(filled.length).toBeLessThanOrEqual(7);
  });

  it("never assigns the same player to two different slots", () => {
    const assignedIds = result.slots.filter((s) => s.starter).map((s) => s.starter!.player.id);
    expect(new Set(assignedIds).size).toBe(assignedIds.length);
  });

  it("assigns the only goalkeeper to the GK slot", () => {
    const gkSlot = result.slots.find((s) => s.slot.slotId === "gk")!;
    expect(gkSlot.starter?.player.name).toBe("Tomás Duarte");
  });

  it("assigns a genuine striker to a striker slot rather than leaving it to a defender", () => {
    const stSlot = result.slots.find((s) => s.slot.slotId === "st1")!;
    expect(stSlot.starter?.player.name).toBe("Erik Solberg");
  });

  it("flags slots with no starter as weak", () => {
    const empty = result.slots.find((s) => s.starter === null);
    if (empty) expect(empty.isWeakStarter).toBe(true);
  });

  it("computes a total rating equal to the sum of starter scores", () => {
    const manualSum = result.slots.reduce((sum, s) => sum + (s.starter?.rating.score ?? 0), 0);
    expect(result.totalRating).toBeCloseTo(manualSum, 5);
  });

  it("works across every defined formation without throwing", () => {
    for (const formation of FORMATIONS) {
      expect(() => buildBestXi(formation, players, ratings)).not.toThrow();
    }
  });
});
