import { create } from "zustand";
import type { Product } from "@/lib/types/product";

interface ProductStoreState {
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
}

export const useProductStore = create<ProductStoreState>((set) => ({
  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
}));
