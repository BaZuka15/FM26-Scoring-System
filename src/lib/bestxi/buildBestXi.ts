import { getRatingBand } from "@/lib/rating/bands";
import type { Player, RatingResult } from "@/lib/types";
import type { Formation, FormationSlot } from "./formations";
import { hungarianMinCost } from "./hungarian";

const CANDIDATE_POOL_SIZE = 30;
const THIN_DEPTH_GAP = 2.0;
const NOT_ELIGIBLE_COST = 1e6;

interface Candidate {
  player: Player;
  rating: RatingResult;
}

export interface SlotResult {
  slot: FormationSlot;
  starter: Candidate | null;
  backups: Candidate[];
  isWeakStarter: boolean;
  isThinDepth: boolean;
}

export interface BestXiResult {
  slots: SlotResult[];
  totalRating: number;
}

export function buildBestXi(formation: Formation, players: Player[], ratings: Record<string, Record<string, RatingResult>>): BestXiResult {
  const slots = formation.slots;

  const candidatesPerSlot: Candidate[][] = slots.map((slot) => {
    return players
      .map((player): Candidate | null => {
        const rating = ratings[player.id]?.[slot.roleId];
        return rating ? { player, rating } : null;
      })
      .filter((c): c is Candidate => c !== null)
      .sort((a, b) => b.rating.score - a.rating.score)
      .slice(0, CANDIDATE_POOL_SIZE);
  });

  const candidateIds = Array.from(new Set(candidatesPerSlot.flat().map((c) => c.player.id)));
  const candidateIndex = new Map(candidateIds.map((id, i) => [id, i]));

  const costMatrix: number[][] = slots.map((slot, slotIdx) => {
    const row = new Array(candidateIds.length).fill(NOT_ELIGIBLE_COST);
    for (const candidate of candidatesPerSlot[slotIdx]) {
      row[candidateIndex.get(candidate.player.id)!] = -candidate.rating.score;
    }
    return row;
  });

  const { assignment } = candidateIds.length > 0 ? hungarianMinCost(costMatrix) : { assignment: slots.map(() => -1) };

  const slotResults: SlotResult[] = slots.map((slot, slotIdx) => {
    const assignedCol = assignment[slotIdx];
    const assignedPlayerId = assignedCol >= 0 ? candidateIds[assignedCol] : null;
    const starter = assignedPlayerId ? (candidatesPerSlot[slotIdx].find((c) => c.player.id === assignedPlayerId) ?? null) : null;

    const backups = candidatesPerSlot[slotIdx].filter((c) => c.player.id !== assignedPlayerId).slice(0, 3);

    const isWeakStarter = starter ? getRatingBand(starter.rating.score) === "red" : true;
    const isThinDepth = backups.length === 0 || (starter ? starter.rating.score - backups[0].rating.score >= THIN_DEPTH_GAP : true);

    return { slot, starter, backups, isWeakStarter, isThinDepth };
  });

  const totalRating = slotResults.reduce((sum, s) => sum + (s.starter?.rating.score ?? 0), 0);

  return { slots: slotResults, totalRating };
}
