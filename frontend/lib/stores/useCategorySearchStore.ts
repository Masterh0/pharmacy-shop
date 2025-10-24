import { create } from "zustand";
import { Category } from "@/lib/types/category";

interface CategorySearchState {
  selectedCategory: Category | null;
  setSelectedCategory: (cat: Category | null) => void;
}

export const useCategorySearchStore = create<CategorySearchState>((set) => ({
  selectedCategory: null,
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
}));
