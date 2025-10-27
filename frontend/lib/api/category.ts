import api from "../axios";
import { Product } from "../types/product";

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  parent?: Category | null;
  subCategories?: Category[];
  products?: Product[];
}

export interface CreateCategoryDTO {
  name: string;
  parentId?: number | null;
  slug?: string;
}

const API_URL = "/categories";

export const categoryApi = {
  // ✅ همه کتگوری‌ها سطح بالا
  getAll: async (): Promise<Category[]> => {
    const res = await api.get(API_URL);
    return res.data || [];
  },

  // ✅ همه کتگوری‌ها همراه زیردسته‌ها (در دو سطح)
  getAllWithChildren: async (): Promise<Category[]> => {
    const res = await api.get(`${API_URL}/children`);
    return res.data || [];
  },

  // ✅ دریافت محصولات یک کتگوری و زیردسته‌ها
  getProductsByCategory: async (
    id: number,
    sort?: string
  ): Promise<Product[]> => {
    if (!id || isNaN(id)) return [];
    const res = await api.get(`${API_URL}/${id}/products`, {
      params: { sort },
    });
    return res.data || [];
  },

  // ✅ دریافت یک کتگوری خاص
  getById: async (id: number): Promise<Category | null> => {
    if (!id || isNaN(id)) return null;
    const res = await api.get(`${API_URL}/${id}`);
    return res.data || null;
  },

  // ✅ ساخت کتگوری جدید
  create: async (data: CreateCategoryDTO): Promise<Category> => {
    const res = await api.post(API_URL, data);
    return res.data;
  },

  // ✅ ویرایش کتگوری
  update: async (id: number, data: CreateCategoryDTO): Promise<Category> => {
    const res = await api.put(`${API_URL}/${id}`, data);
    return res.data;
  },

  // ✅ حذف کتگوری
  remove: async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
  },

  // ✅ جستجو در کتگوری‌ها
  search: async (q: string): Promise<Category[]> => {
    const text = q?.trim();
    if (!text) return [];
    const res = await api.get(
      `${API_URL}/search?q=${encodeURIComponent(text)}`
    );
    return res.data || [];
  },
};
