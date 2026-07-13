import { create } from "zustand";
import { FmParseError, parseFmHtml } from "@/lib/parser/parseFmHtml";
import { buildEffectiveWeights, computeAllRatings } from "@/lib/rating/computeRating";
import { ROLE_CATALOGUE } from "@/lib/rating/roles";
import { ROLE_WEIGHTS } from "@/lib/rating/roleWeights";
import { useWeightsStore } from "@/lib/store/useWeightsStore";
import type { Player, RatingResult, RoleWeights } from "@/lib/types";

interface PlayerState {
  players: Player[];
  ratings: Record<string, Record<string, RatingResult>>;
  unrecognizedHeaders: string[];
  parseError: string | null;
  status: "empty" | "loaded";
  loadFromHtml: (html: string) => void;
  recomputeRatings: (roleWeightsMap: Record<string, RoleWeights>) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  players: [],
  ratings: {},
  unrecognizedHeaders: [],
  parseError: null,
  status: "empty",

  loadFromHtml: (html: string) => {
    try {
      const { players, unrecognizedHeaders } = parseFmHtml(html);
      const effectiveWeights = buildEffectiveWeights(ROLE_WEIGHTS, useWeightsStore.getState().overrides);
      const ratings = computeAllRatings(players, ROLE_CATALOGUE, effectiveWeights);
      set({ players, ratings, unrecognizedHeaders, parseError: null, status: "loaded" });
    } catch (err) {
      const message = err instanceof FmParseError ? err.message : "Couldn't parse this file. Make sure it's an FM HTML export.";
      set({ parseError: message });
    }
  },

  recomputeRatings: (roleWeightsMap: Record<string, RoleWeights>) => {
    const { players } = get();
    const ratings = computeAllRatings(players, ROLE_CATALOGUE, roleWeightsMap);
    set({ ratings });
  },

  reset: () => set({ players: [], ratings: {}, unrecognizedHeaders: [], parseError: null, status: "empty" }),
}));
