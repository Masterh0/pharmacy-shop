import api from "@/lib/axios";
import type { Cart, CartItem } from "@/lib/types/cart";

export const cartApi = {
  /** 🛒 دریافت سبد خرید جاری کاربر (بر اساس userId یا sessionId) */
  async get(): Promise<Cart> {
    const { data } = await api.get("/cart");
    return data;
  },

  /** ➕ افزودن آیتم (محصول و واریانت) به سبد خرید */
  async add(payload: {
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
    quantity: number,
  ): Promise<CartItem> {
    const { data } = await api.put(`/cart/item/${itemId}/quantity`, {
      quantity,
    });
    return data;
  },

  /** ❌ حذف آیتم خاص از سبد خرید */
  async removeItem(itemId: number): Promise<{ message: string }> {
    const { data } = await api.delete(`/cart/item/${itemId}`);
    return data;
  },

  /** 🧹 خالی‌کردن کل سبد خرید */
  async clear(): Promise<{ message: string }> {
    const { data } = await api.delete("/cart/clear");
    return data;
  },
};
