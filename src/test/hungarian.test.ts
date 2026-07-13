import { describe, expect, it } from "vitest";
import { hungarianMinCost } from "@/lib/bestxi/hungarian";

describe("hungarianMinCost", () => {
  it("solves a small square matrix optimally", () => {
    // Hand-verifiable: minimum is 1+2+3=6 via (0->0, 1->2, 2->1) or similar — brute force below confirms.
    const cost = [
      [4, 1, 3],
      [2, 0, 5],
      [3, 2, 2],
    ];
    const { assignment, totalCost } = hungarianMinCost(cost);
    // Brute force all permutations to confirm optimality independently.
    const perms = permutations([0, 1, 2]);
    const bruteForceBest = Math.min(...perms.map((perm) => perm.reduce((sum, col, row) => sum + cost[row][col], 0)));
    expect(totalCost).toBe(bruteForceBest);
    expect(assignment.reduce((sum, col, row) => sum + cost[row][col], 0)).toBe(totalCost);
  });

  it("beats naive greedy on a constructed double-claim scenario", () => {
    // Two slots, two candidates. P1 is marginally best for slot A but far better
    // suited to slot B; naive greedy (always take the single highest-rated
    // cell first) grabs P1->A because 10 is the largest number in the matrix,
    // then is stuck with P2->B, producing a worse total than the optimal swap.
    // Ratings: slotA: P1=10, P2=9 | slotB: P1=8, P2=1. Cost = -rating (minimize).
    const cost = [
      [-10, -9],
      [-8, -1],
    ];

    const greedyTotal = naiveGreedy(cost);
    const { assignment, totalCost } = hungarianMinCost(cost);

    expect(totalCost).toBeLessThan(greedyTotal); // lower cost = higher total rating
    expect(-totalCost).toBe(17); // optimal: P1->slotB (8) + P2->slotA (9) = 17
    expect(-greedyTotal).toBe(11); // greedy: P1->slotA (10) + P2->slotB (1) = 11
    expect(assignment).toEqual([1, 0]);
  });

  it("pads a non-square matrix (more slots than candidates) without crashing", () => {
    // 3 slots, 1 real candidate (only eligible for slot 1).
    const cost = [
      [1e6],
      [-15],
      [1e6],
    ];
    const { assignment } = hungarianMinCost(cost);
    expect(assignment[1]).toBe(0);
    expect(assignment[0]).toBe(-1);
    expect(assignment[2]).toBe(-1);
  });

  it("returns an empty result for an empty matrix", () => {
    expect(hungarianMinCost([])).toEqual({ assignment: [], totalCost: 0 });
  });
});

function naiveGreedy(cost: number[][]): number {
  const rows = cost.length;
  const cols = cost[0].length;
  const usedRows = new Set<number>();
  const usedCols = new Set<number>();
  const cells: { r: number; c: number; v: number }[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ r, c, v: cost[r][c] });
  cells.sort((a, b) => a.v - b.v); // most negative (best rating) first
  let total = 0;
  for (const cell of cells) {
    if (usedRows.has(cell.r) || usedCols.has(cell.c)) continue;
    usedRows.add(cell.r);
    usedCols.add(cell.c);
    total += cell.v;
  }
  return total;
}

function permutations(arr: number[]): number[][] {
  if (arr.length <= 1) return [arr];
  const result: number[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) result.push([arr[i], ...perm]);
  }
  return result;
}
