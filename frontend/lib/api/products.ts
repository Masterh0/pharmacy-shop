// lib/api/productApi.ts
import api from "@/lib/axios";
import type { Product } from "@/lib/types/product";
import type { CreateProductDTO } from "@/lib/types/productInput";

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get("/products");
    return data;
  },
  getFiltered: async (search = "") => {
    const { data } = await api.get(`/products/filter${search}`);
    return data;
  },
  getById: async (id: number): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  create: async (input: CreateProductDTO): Promise<Product> => {
    const fd = new FormData();

    fd.append("name", input.name);
    fd.append("description", input.description ?? "");
    fd.append("slug", input.slug);
    fd.append("shortDescription", input.shortDescription ?? "");
    fd.append("metaTitle", input.metaTitle ?? "");
    fd.append("metaDescription", input.metaDescription ?? "");
    fd.append("brandId", String(input.brandId));
    fd.append("categoryId", String(input.categoryId));
    fd.append("isBlock", String(input.isBlock ?? false));

    // 🏷️ ویژگی‌های سطح Product
    if (input.attributes && input.attributes.length > 0) {
      fd.append("attributes", JSON.stringify(input.attributes));
    }

    // 🖼️ تصویر اصلی محصول
    if (input.image instanceof File) {
      fd.append("image", input.image);
    }

    // 📦 واریانت‌ها بدون تصاویر (JSON)
    const variantsWithoutImages = input.variants?.map(
      ({ images, ...rest }) => rest,
    );
    fd.append("variants", JSON.stringify(variantsWithoutImages));

    // 🖼️ تصاویر واریانت‌ها
    input.variants?.forEach((variant, index) => {
      if (Array.isArray(variant.images) && variant.images.length > 0) {
        variant.images.forEach((file) => {
          if (file instanceof File) {
            fd.append(`variantImages_${index}`, file);
          }
        });
      }
    });

    const { data } = await api.post("/products", fd);
    return data.data;
  },

  update: async (
    id: number,
    data: Partial<CreateProductDTO> | FormData,
  ): Promise<Product> => {
    const { data: res } = await api.put(`/products/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  block: async (id: number, isBlock: boolean): Promise<Product> => {
    const { data } = await api.patch(`/products/${id}/block`, { isBlock });
    return data.data;
  },

  getAllForAdmin: async (): Promise<Product[]> => {
    const { data } = await api.get("/products/admin/all");
    return data.data;
  },
  getSimilarProducts: async (id: number): Promise<Product[]> => {
    const { data } = await api.get(`/products/${id}/similar`);
    return data.data;
  },
  getLatestProducts: async (limit = 8): Promise<Product[]> => {
    const { data } = await api.get(
      `/products/filter?page=1&limit=${limit}&sort=latest`,
    );

    return data.products;
  },
};
