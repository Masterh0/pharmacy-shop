// src/hooks/useDeleteProduct.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/lib/api/products";
import { toast } from "sonner";

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      await productApi.delete(productId);
    },
    onSuccess: (_, id) => {
      // 🔁 برو لیست محصولات رو از کش دوباره بگیر
      queryClient.invalidateQueries({
        queryKey: ["category-products"], // یا کلید واقعی که محصولاتت با آن دریافت می‌شوند
      });
      toast.success(`محصول با شناسه ${id} با موفقیت حذف شد ✅`);
    },
    onError: (err) => {
      console.error("❌ خطا در حذف محصول:", err);
      toast.error("خطایی در حذف محصول رخ داد ❌");
    },
  });
};
