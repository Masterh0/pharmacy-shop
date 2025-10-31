import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CreateCategoryDTO } from "../api/category";

// 🔹 تعریف وضعیت و اکشن‌ها
interface CategoryStoreState {
  // --- فرم ایجاد دسته‌بندی ---
  formData: CreateCategoryDTO;
  setField: <K extends keyof CreateCategoryDTO>(
    field: K,
    value: CreateCategoryDTO[K]
  ) => void;
  resetForm: () => void;

  // --- دسته انتخاب‌شده در برنامه ---
  selectedCategory: { id: number; name: string } | null;
  setSelectedCategory: (category: { id: number; name: string } | null) => void;
}

// 🔹 پیاده‌سازی استور با persist (ذخیره در localStorage)
export const useCategoryStore = create<CategoryStoreState>()(
  persist(
    (set) => ({
      // حالت اولیه فرم ایجاد دسته
      formData: { name: "", parentId: null },

      setField: (field, value) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
        })),

      resetForm: () => set({ formData: { name: "", parentId: null } }),

      // مدیریت دسته انتخاب‌شده
      selectedCategory: null,

      setSelectedCategory: (category) => set({ selectedCategory: category }),
    }),
    {
      name: "category-store", // اسم کلید در localStorage
    }
  )
);
