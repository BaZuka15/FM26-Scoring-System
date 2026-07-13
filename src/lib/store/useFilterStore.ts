import { create } from "zustand";
import type { PositionGroup } from "@/lib/types";

export interface FilterState {
  positionGroup: PositionGroup | "ALL";
  ageMin: number | null;
  ageMax: number | null;
  clubQuery: string;
  nationalityQuery: string;
  transferStatusQuery: string;
  minRating: number | null;
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

interface FilterStore extends FilterState {
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULT_FILTERS,
  setFilter: (key, value) => set({ [key]: value } as Pick<FilterState, typeof key>),
  resetFilters: () => set(DEFAULT_FILTERS),
}));

export function isFilterActive(filters: FilterState): boolean {
  return (
    filters.positionGroup !== DEFAULT_FILTERS.positionGroup ||
    filters.ageMin !== null ||
    filters.ageMax !== null ||
    filters.clubQuery !== "" ||
    filters.nationalityQuery !== "" ||
    filters.transferStatusQuery !== "" ||
    filters.minRating !== null
  );
}
