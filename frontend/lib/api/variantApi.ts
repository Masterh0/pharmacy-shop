import api from "@/lib/axios";
import type { ProductVariant } from "@/lib/types/variant";

export const variantApi = {
  /** دریافت همه‌ی واریانت‌های یک محصول خاص */
  async getAllByProductId(productId: number): Promise<ProductVariant[]> {
    const { data } = await api.get(`/products/${productId}/variants`);
    return data;
  },

  /** ایجاد واریانت جدید */
  async create(payload: Omit<ProductVariant, "id">): Promise<ProductVariant> {
    const { data } = await api.post("/variants", payload);
    return data;
  },

  /**‌ به‌روزرسانی واریانت */
  async update(
    id: number,
    payload: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    const { data } = await api.put(`/variants/${id}`, payload);
    return data;
  },

  /** حذف واریانت */
  async remove(id: number): Promise<{ message: string }> {
    const { data } = await api.delete(`/variants/${id}`);
    return data;
  },
};
