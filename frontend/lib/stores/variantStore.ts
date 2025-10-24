import { create } from "zustand";
import type { ProductVariant } from "@/lib/types/variant";

interface VariantState {
  openAdd: boolean;
  editVariant: ProductVariant | null;
  openAddModal: () => void;
  closeAddModal: () => void;
  startEdit: (variant: ProductVariant) => void;
  endEdit: () => void;
}

export const useVariantStore = create<VariantState>((set) => ({
  openAdd: false,
  editVariant: null,
  openAddModal: () => set({ openAdd: true }),
  closeAddModal: () => set({ openAdd: false }),
  startEdit: (variant) => set({ editVariant: variant }),
  endEdit: () => set({ editVariant: null }),
}));
