import api from "@/lib/axios";
import type { Order } from "@/lib/types/order";

export const orderApi = {
  /** 📦 ایجاد سفارش جدید */
  async create(payload: {
    addressId: number;
    shippingCost: number;
  }): Promise<Order> {
    const { data } = await api.post("/orders", payload);
    return data;
  },

  /** 📋 دریافت لیست سفارش‌های کاربر جاری */
  async list(): Promise<Order[]> {
    const { data } = await api.get("/orders");
    return data;
  },

  /** 🔍 دریافت جزئیات یک سفارش خاص بر اساس شناسه */
  async getById(orderId: number): Promise<Order> {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  },
};
