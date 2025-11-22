import api from "@/lib/axios";
import type { Cart, CartItem } from "@/lib/types/cart";

export const cartApi = {
  /** 🛒 دریافت سبد خرید جاری کاربر (بر اساس userId یا sessionId) */
  async get(params?: { userId?: number; sessionId?: string }): Promise<Cart> {
    const { data } = await api.get("/cart", { params });
    return data;
  },

  /** ➕ افزودن آیتم (محصول و واریانت) به سبد خرید */
  async add(payload: {
    userId?: number;
    sessionId?: string;
    productId: number;
    variantId: number;
    quantity: number;
  }): Promise<CartItem> {
    const { data } = await api.post("/cart/add", payload);
    return data;
  },

  /** 🔄 بروزرسانی تعداد آیتم خاص (اختیاری) */
  async updateItemQuantity(
    itemId: number,
    quantity: number
  ): Promise<CartItem> {
    const { data } = await api.patch(`/cart/item/${itemId}`, { quantity });
    return data;
  },

  /** ❌ حذف آیتم خاص از سبد خرید */
  async removeItem(itemId: number): Promise<{ message: string }> {
    const { data } = await api.delete(`/cart/item/${itemId}`);
    return data;
  },

  /** 🧹 خالی‌کردن کل سبد خرید */
  async clear(params?: {
    userId?: number;
    sessionId?: string;
  }): Promise<{ message: string }> {
    const { data } = await api.delete("/cart/clear", { params });
    return data;
  },
};
