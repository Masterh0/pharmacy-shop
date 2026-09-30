import api from "@/lib/axios";
import type { Order } from "@/lib/types/order";

export const orderApi = {
  /** 📦 ایجاد سفارش جدید */
  async create(payload: {
    addressId: number;
    shippingCost: number;
  }): Promise<{ success: boolean; order: Order }> {
    const { data } = await api.post("/orders", payload);
    return data;
  },

  /** 📋 دریافت لیست سفارش‌های کاربر جاری */
  async list(): Promise<{ orders: Order[] }> {
    const { data } = await api.get("/orders");
    return data;
  },

  /** 🔍 دریافت جزئیات یک سفارش خاص */
  async getById(orderId: number): Promise<{ order: Order }> {
    const { data } = await api.get(`/orders/${orderId}`);
    return { order: data }; // wrap کن
  },

  /** ❌ کنسل کردن سفارش */
  async cancel(
    orderId: number,
  ): Promise<{ success: boolean; message: string }> {
    const { data } = await api.patch(`/orders/${orderId}/cancel`);
    return data;
  },
};
