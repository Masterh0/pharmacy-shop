import api from "../axios";
import { Product } from "../types/product";
export interface CategoryFilters {
  brands: {
    id: number;
    name: string;
    slug?: string; // slug هم میتونه باشه
  }[];
  price: {
    min: number;
    max: number;
  };
  hasDiscount: boolean;
  hasInStock: boolean;
}
export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  parent?: Category | null;
  subCategories?: Category[];
  products?: Product[];
}
export interface ProductsByCategoryBySlugResponse {
  category: Pick<Category, "id" | "name" | "slug">;
  products: Product[]; // تغییر نام از data به products برای همخوانی با بک‌اند
  pagination: PaginationMeta;
}
export interface CreateCategoryDTO {
  name: string;
  parentId?: number | null;
  slug?: string;
}
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsByCategoryResponse {
  products: Product[];
  pagination: PaginationMeta;
}

// 🆕 اینترفیس جدید برای Options فیلترینگ
export interface FilteredProductsOptions {
  sort?: string;
  page?: number;
  limit?: number;
  brandIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  hasDiscount?: boolean;
  inStock?: boolean;
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

  // ✅ دریافت محصولات یک کتگوری و زیردسته‌ها (بر اساس ID)
  // ⛔️ توصیه می‌شود که به جای این متد، از getProductsByCategoryBySlug استفاده کنید.
  // در صورتی که نیاز باشد، باید به صورت دستی categoryId را به slug تبدیل کنید.
  getProductsByCategory: async (
    id: number,
    options: FilteredProductsOptions // از اینترفیس جدید استفاده می‌کنیم
  ): Promise<ProductsByCategoryResponse> => {
    const params = new URLSearchParams({
      sort: options.sort || "latest", // default changed to latest for consistency
      page: String(options.page || 1),
      limit: String(options.limit || 24),
    });

    // اضافه کردن پارامترهای فیلتر به URLSearchParams
    if (options.brandIds && options.brandIds.length > 0) {
      options.brandIds.forEach((id) => params.append("brandIds[]", String(id)));
    }
    if (options.minPrice !== undefined) {
      params.append("minPrice", String(options.minPrice));
    }
    if (options.maxPrice !== undefined) {
      params.append("maxPrice", String(options.maxPrice));
    }
    if (options.hasDiscount !== undefined) {
      params.append("hasDiscount", String(options.hasDiscount));
    }
    if (options.inStock !== undefined) {
      params.append("inStock", String(options.inStock));
    }

    const res = await api.get(`${API_URL}/${id}/products?${params}`);
    return res.data as ProductsByCategoryResponse;
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

  // ✅ دریافت محصولات یک کتگوری بر اساس Slug همراه با فیلترینگ
  getProductsByCategoryBySlug: async (
    slug: string,
    search = ""
  ): Promise<ProductsByCategoryBySlugResponse> => {
    if (!slug) {
      throw new Error("Category slug is required");
    }

    const res = await api.get(`/categories/${slug}/products${search}`);

    const data = res.data;

    return {
      category: data.category,
      products: data.products ?? data.data,
      pagination: data.pagination,
    };
  },

  // ✅ دریافت فیلترهای پویا برای یک کتگوری
  getCategoryFilters: async (categoryId: number): Promise<CategoryFilters> => {
    if (!categoryId || isNaN(categoryId)) {
      throw new Error("Category id is required");
    }

    const res = await api.get(`${API_URL}/${categoryId}/filters`);
    return res.data.data as CategoryFilters; // فرض بر این است که بک‌اند در یک فیلد 'data' پاسخ می‌دهد
  },
};
