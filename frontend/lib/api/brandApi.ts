import api from "../axios";
import type { Brand } from "../types/brand";
import type { CreateBrandDTO, UpdateBrandDTO } from "../types/brandInput";

const API_URL = "/brands";

export const brandApi = {
  /**
   * 🧩 دریافت همه برندها
   */
  getAll: async (): Promise<Brand[]> => {
    try {
      const res = await api.get(API_URL);

      console.log("🧩 BRAND API RESPONSE:", res.data);

      // پشتیبانی از ساختارهای مختلف پاسخ (data یا بدون آن)
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      return data as Brand[];
    } catch (error) {
      console.error("❌ Error fetching brands:", error);
      throw error; // هندل توسط handleApiError
    }
  },

  /**
   * 📘 دریافت برند تکی بر اساس ID
   */
  getById: async (id: number): Promise<Brand> => {
    try {
      const res = await api.get(`${API_URL}/${id}`);

      const data = res.data?.data ?? res.data;
      return data as Brand;
    } catch (error) {
      console.error(`❌ Error fetching brand ID=${id}:`, error);
      throw error;
    }
  },

  /**
   * 🟢 ایجاد برند جدید
   */
  create: async (data: CreateBrandDTO): Promise<Brand> => {
    try {
      const res = await api.post(API_URL, data);

      const result = res.data?.data ?? res.data;
      console.log("✅ Brand created:", result);
      return result as Brand;
    } catch (error) {
      console.error("❌ Error creating brand:", error);
      throw error;
    }
  },

  /**
   * ✏️ ویرایش برند
   */
  update: async (id: number, data: UpdateBrandDTO): Promise<Brand> => {
    try {
      const res = await api.patch(`${API_URL}/${id}`, data);

      const updated = res.data?.data ?? res.data;
      console.log("📝 Brand updated:", updated);
      return updated as Brand;
    } catch (error) {
      console.error(`❌ Error updating brand ID=${id}:`, error);
      throw error;
    }
  },

  /**
   * ❌ حذف برند
   */
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_URL}/${id}`);
      console.log(`🗑️ Brand with ID=${id} deleted successfully`);
    } catch (error) {
      console.error(`❌ Error deleting brand ID=${id}:`, error);
      throw error;
    }
  },
};
