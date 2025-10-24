// lib/types/category.ts
export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  subCategories?: Category[]; // خودارجاعی (برای درختی بودن)
  createdAt?: string;
  updatedAt?: string;
}
