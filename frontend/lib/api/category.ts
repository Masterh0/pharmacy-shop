import api from "../axios";
import { Product } from "../types/product";
const API_URL = "/categories";
export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  subCategories?: Category[];
}

export interface CreateCategoryDTO {
  name: string;
  parentId?: number | null;
}

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    try {
      const res = await api.get(API_URL);

      console.log("CATEGORY API RESPONSE:", res.data);

      // اطمینان از برگشت آرایه صحیح
      if (Array.isArray(res.data)) {
        return res.data;
      }
      if (Array.isArray(res.data.data)) {
        return res.data.data;
      }

      // اگر ساختار با انتظار ما فرق داشت
      return [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      // در صورت خطا هرگز undefined برنگردون
      return [];
    }
  },
  getAllWithChildren: async (): Promise<Category[]> => {
    const res = await api.get(`${API_URL}/getAllWithChildren`);
    return res.data;
  },
  create: async (data: CreateCategoryDTO) => {
    const res = await api.post(API_URL, data);
    return res.data;
  },
  search: async (q: string): Promise<Category[]> => {
    const query = q?.trim();
    if (!query) return [];
    const res = await api.get(
      `${API_URL}/search?q=${encodeURIComponent(query)}`
    );
    return res.data;
  },
  getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
    try {
      const res = await api.get(`${API_URL}/${categoryId}/products`);
      return res.data;
    } catch (error) {
      console.error("Error fetching category products:", error);
      return [];
    }
  },
};
