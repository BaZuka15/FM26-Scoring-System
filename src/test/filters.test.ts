import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFmHtml } from "@/lib/parser/parseFmHtml";
import { computeRatingForRoleId } from "@/lib/rating/computeRating";
import { ROLE_WEIGHTS } from "@/lib/rating/roleWeights";
import { derivePositionGroups, playerPositionGroups } from "@/lib/utils/positions";
import { matchesFilters } from "@/components/rankings/filterPredicate";
import type { FilterState } from "@/lib/store/useFilterStore";
import type { RankingRow } from "@/components/rankings/columns";
import type { Player } from "@/lib/types";

const fixtureHtml = readFileSync(join(__dirname, "fixtures/sample-export.html"), "utf-8");
const { players } = parseFmHtml(fixtureHtml);

function findPlayer(name: string): Player {
  const player = players.find((p) => p.name === name);
  if (!player) throw new Error(`fixture player not found: ${name}`);
  return player;
}

const DEFAULT_FILTERS: FilterState = {
  positionGroup: "ALL",
  ageMin: null,
  ageMax: null,
  clubQuery: "",
  nationalityQuery: "",
  transferStatusQuery: "",
  minRating: null,
};

function toRow(player: Player, roleId?: string): RankingRow {
  const rating = roleId ? computeRatingForRoleId(player, roleId, ROLE_WEIGHTS) : null;
  return { player, rating, best: null, bestRole: null };
}

describe("derivePositionGroups", () => {
  it("maps a single central defender token to DC", () => {
    expect(derivePositionGroups({ group: "D", sides: ["C"] })).toEqual(["DC"]);
  });

  it("maps a multi-side token to multiple groups", () => {
    expect(derivePositionGroups({ group: "D", sides: ["R", "C"] })).toEqual(["DR", "DC"]);
  });

  it("maps WB tokens onto the D prefix, matching the role catalogue's DL/DR taxonomy", () => {
    expect(derivePositionGroups({ group: "WB", sides: ["R"] })).toEqual(["DR"]);
  });

  it("leaves groups without sides (GK, DM, ST) unchanged", () => {
    expect(derivePositionGroups({ group: "GK", sides: [] })).toEqual(["GK"]);
    expect(derivePositionGroups({ group: "ST", sides: [] })).toEqual(["ST"]);
  });

  it("dedupes across multiple tokens for a multi-position player", () => {
    const kwame = findPlayer("Kwame Osei"); // "D (RC), WB (R)"
    expect(playerPositionGroups(kwame.positions).sort()).toEqual(["DC", "DR"]);
  });
});

describe("matchesFilters", () => {
  it("filters by position group", () => {
    const diego = toRow(findPlayer("Diego Marchetti")); // D (C)
    const erik = toRow(findPlayer("Erik Solberg")); // ST (C)
    expect(matchesFilters(diego, { ...DEFAULT_FILTERS, positionGroup: "DC" })).toBe(true);
    expect(matchesFilters(erik, { ...DEFAULT_FILTERS, positionGroup: "DC" })).toBe(false);
  });

  it("filters by age range", () => {
    const tomas = toRow(findPlayer("Tomás Duarte")); // age 19
    expect(matchesFilters(tomas, { ...DEFAULT_FILTERS, ageMax: 21 })).toBe(true);
    expect(matchesFilters(tomas, { ...DEFAULT_FILTERS, ageMin: 25 })).toBe(false);
  });

  it("filters by club substring, case-insensitively", () => {
    const mateus = toRow(findPlayer("Mateus Rocha")); // Benfica
    expect(matchesFilters(mateus, { ...DEFAULT_FILTERS, clubQuery: "benf" })).toBe(true);
    expect(matchesFilters(mateus, { ...DEFAULT_FILTERS, clubQuery: "porto" })).toBe(false);
  });

  it("filters by minimum rating for the currently displayed role", () => {
    const erik = toRow(findPlayer("Erik Solberg"), "st-af-a");
    expect(matchesFilters(erik, { ...DEFAULT_FILTERS, minRating: 10 })).toBe(true);
    expect(matchesFilters(erik, { ...DEFAULT_FILTERS, minRating: 19 })).toBe(false);
  });

  it("excludes a player with no rating for the selected role when a minRating filter is set", () => {
    const tomas = toRow(findPlayer("Tomás Duarte")); // no roleId passed -> rating is null
    expect(matchesFilters(tomas, { ...DEFAULT_FILTERS, minRating: 5 })).toBe(false);
  });
});
