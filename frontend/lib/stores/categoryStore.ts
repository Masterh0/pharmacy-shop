import { create } from "zustand";
import { CreateCategoryDTO } from "../api/category";

interface CategoryFormState {
  formData: CreateCategoryDTO;
  setField: <K extends keyof CreateCategoryDTO>(
    field: K,
    value: CreateCategoryDTO[K]
  ) => void;
  resetForm: () => void;
}

export const useCategoryStore = create<CategoryFormState>((set) => ({
  formData: { name: "", parentId: null },
  setField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),
  resetForm: () => set({ formData: { name: "", parentId: null } }),
}));
