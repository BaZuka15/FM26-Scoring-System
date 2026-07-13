// Classic O(n^3) Hungarian algorithm (Kuhn-Munkres) for the rectangular
// assignment problem, minimizing total cost. Handles cost matrices where
// rows (n) and columns (m) differ by padding columns with a very high but
// finite dummy cost internally — callers never see the padding.
//
// Ported from the standard competitive-programming formulation (u/v
// potentials + augmenting paths). Finite sentinels are used instead of
// Infinity throughout: subtracting Infinity from Infinity produces NaN and
// silently corrupts the algorithm, which would happen here whenever a slot
// has zero eligible candidates (e.g. no goalkeeper in the squad).
const DUMMY_PAD_COST = 1e9;

export interface HungarianResult {
  /** assignment[i] = column index assigned to row i, or -1 if the row only matched padding (no real candidate existed). */
  assignment: number[];
  totalCost: number;
}

export function hungarianMinCost(costMatrix: number[][]): HungarianResult {
  const n = costMatrix.length;
  if (n === 0) return { assignment: [], totalCost: 0 };
  const realCols = Math.max(...costMatrix.map((row) => row.length));
  const size = Math.max(n, realCols);

  const cost: number[][] = costMatrix.map((row) => {
    const padded = row.slice();
    while (padded.length < size) padded.push(DUMMY_PAD_COST);
    return padded;
  });

  const INF = Number.MAX_SAFE_INTEGER / 4;
  const u = new Array(n + 1).fill(0);
  const v = new Array(size + 1).fill(0);
  const p = new Array(size + 1).fill(0); // p[j] = 1-indexed row assigned to column j
  const way = new Array(size + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array(size + 1).fill(INF);
    const used = new Array(size + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = INF;
      let j1 = -1;
      for (let j = 1; j <= size; j++) {
        if (!used[j]) {
          const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }
      for (let j = 0; j <= size; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  const assignment = new Array(n).fill(-1);
  for (let j = 1; j <= size; j++) {
    if (p[j] > 0) {
      const rowIdx = p[j] - 1;
      const colIdx = j - 1;
      assignment[rowIdx] = colIdx < realCols ? colIdx : -1;
    }
  }

  let totalCost = 0;
  for (let i = 0; i < n; i++) {
    if (assignment[i] >= 0) totalCost += costMatrix[i][assignment[i]];
  }

  return { assignment, totalCost };
}
