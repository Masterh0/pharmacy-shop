// lib/types/category.ts
export interface Category {
  id: number;
  name: string;
  slug?: string; // ممکن است در بعضی موارد slug نداشته باشد
  parentId?: number | null;
  subCategories?: Category[]; // خودارجاعی (برای درختی بودن)
  createdAt?: string;
  updatedAt?: string;
}
