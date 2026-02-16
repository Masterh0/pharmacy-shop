// lib/api/wishlist.ts

import api from "@/lib/axios";

export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string | null;
    price: string;
    soldCount: number;
    wishlistCount: number;
    isBlock: boolean;
    category: {
      id: number;
      name: string;
    };
    brand: {
      id: number;
      name: string;
    };
  };
}

export interface WishlistResponse {
  success: boolean;
  data: {
    items: WishlistItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CheckResponse {
  success: boolean;
  data: {
    productId: number;
    isInWishlist: boolean;
  };
}

export interface CountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export const wishlistApi = {
  /** ✅ افزودن محصول به علاقه‌مندی‌ها */
  async add(productId: number): Promise<{ success: boolean; data: WishlistItem }> {
    const { data } = await api.post("/wishlist/add", { productId });
    return data;
  },

  /** ❌ حذف محصول از علاقه‌مندی‌ها */
  async remove(productId: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/wishlist/remove/${productId}`);
    return data;
  },

  /** 📋 دریافت لیست علاقه‌مندی‌ها */
  async getAll(params?: {
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "price" | "soldCount";
    sortOrder?: "asc" | "desc";
  }): Promise<WishlistResponse> {
    const { data } = await api.get("/wishlist", { params });
    return data;
  },

  /** 🔍 بررسی یک محصول */
  async check(productId: number): Promise<CheckResponse> {
    const { data } = await api.get(`/wishlist/check/${productId}`);
    return data;
  },

  /** 🔍 بررسی چند محصول یکجا */
  async checkMultiple(productIds: number[]): Promise<{
    success: boolean;
    data: { productId: number; isInWishlist: boolean }[];
  }> {
    const { data } = await api.post("/wishlist/check-multiple", { productIds });
    return data;
  },

  /** 🔢 دریافت تعداد آیتم‌ها */
  async getCount(): Promise<CountResponse> {
    const { data } = await api.get("/wishlist/count");
    return data;
  },

  /** 🗑️ پاک کردن همه */
  async clear(): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete("/wishlist/clear");
    return data;
  },
};
