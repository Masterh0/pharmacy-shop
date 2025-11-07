// lib/api/productApi.ts
import api from "@/lib/axios";
import type { Product } from "@/lib/types/product";
import type { CreateProductDTO } from "@/lib/types/productInput";

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get("/products");
    return data.data;
  },

  getById: async (id: number): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  create: async (input: CreateProductDTO): Promise<Product> => {
    const fd = new FormData();
    fd.append("name", input.name);
    fd.append("sku", input.sku);
    fd.append("slug", input.slug);
    fd.append("description", input.description ?? "");
    fd.append("brandId", String(input.brandId));
    fd.append("categoryId", String(input.categoryId));
    fd.append("isBlock", String(input.isBlock));
    fd.append("variants", JSON.stringify(input.variants));
    if (input.image) fd.append("image", input.image);

    const { data } = await api.post("/products", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  update: async (
    id: number,
    data: Partial<CreateProductDTO> | FormData
  ): Promise<Product> => {
    const isFormData = data instanceof FormData;
    const { data: res } = await api.put(`/products/${id}`, data, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
