import api from "@/lib/axios";
import type { Address } from "@/lib/types/address";

export const addressApi = {
  /** دریافت همه‌ی آدرس‌های کاربر جاری */
  async list(): Promise<Address[]> {
    const { data } = await api.get("/addresses");
    return data;
  },

  /** دریافت جزئیات یک آدرس مشخص */
  async get(id: number): Promise<Address> {
    const { data } = await api.get(`/addresses/${id}`);
    return data;
  },

  /** ایجاد آدرس جدید */
  async create(payload: {
    fullName: string;
    phone: string;
    province?: string | null;
    city: string;
    street: string;
    postalCode?: string | null;
    isDefault: boolean;
    lat?: number | null;
    lng?: number | null;
  }): Promise<Address> {
    const { data } = await api.post("/addresses", payload);
    return data;
  },

  /** بروزرسانی آدرس */
  async update(
    id: number,
    payload: Partial<Omit<Address, "id" | "userId">>
  ): Promise<Address> {
    const { data } = await api.put(`/addresses/${id}`, payload);
    return data;
  },

  /** حذف آدرس */
  async remove(id: number): Promise<{ message: string }> {
    const { data } = await api.delete(`/addresses/${id}`);
    return data;
  },

  /** تنظیم آدرس به عنوان پیش‌فرض */
  async setDefault(id: number): Promise<Address> {
    const { data } = await api.put(`/addresses/${id}/default`);
    return data;
  },
};
