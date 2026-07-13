import { create } from "zustand";

interface SelectionStore {
  selectedIds: string[];
  toggle: (id: string) => void;
  clear: () => void;
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedIds: [],
  toggle: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id) ? s.selectedIds.filter((x) => x !== id) : [...s.selectedIds, id],
    })),
  clear: () => set({ selectedIds: [] }),
}));
