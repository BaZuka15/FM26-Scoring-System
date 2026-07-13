import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AttributeKey } from "@/lib/types";

export type WeightOverrides = Record<string, Partial<Record<AttributeKey, number>>>;

interface WeightsStore {
  overrides: WeightOverrides;
  setWeight: (roleId: string, key: AttributeKey, value: number) => void;
  resetRole: (roleId: string) => void;
  resetAll: () => void;
}

export const useWeightsStore = create<WeightsStore>()(
  persist(
    (set) => ({
      overrides: {},
      setWeight: (roleId, key, value) =>
        set((s) => ({
          overrides: { ...s.overrides, [roleId]: { ...s.overrides[roleId], [key]: value } },
        })),
      resetRole: (roleId) =>
        set((s) => {
          const next = { ...s.overrides };
          delete next[roleId];
          return { overrides: next };
        }),
      resetAll: () => set({ overrides: {} }),
    }),
    { name: "fm26-weight-overrides" },
  ),
);
