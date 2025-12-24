import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/lib/api/products";
import { PRODUCT_KEYS } from "@/lib/queryKeys/products";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { Product } from "@/lib/types/product";

type BlockPayload = {
  id: number;
  isBlock: boolean;
};

type ErrorResponse = {
  message?: string;
};

export const useBlockProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isBlock }: BlockPayload) =>
      productApi.block(id, isBlock),

    // ✅ 1️⃣ Optimistic update
    onMutate: async ({ id, isBlock }) => {
      await queryClient.cancelQueries({
        queryKey: PRODUCT_KEYS.all,
      });

      const previousProducts = queryClient.getQueryData<Product[]>(PRODUCT_KEYS.all);

      // Update لیست محصولات
      queryClient.setQueryData<Product[] | undefined>(
        PRODUCT_KEYS.all,
        (old) => old?.map((p) => (p.id === id ? { ...p, isBlock } : p))
      );

      // Update دیتیل محصول
      queryClient.setQueryData<Product | undefined>(
        PRODUCT_KEYS.detail(id),
        (old) => (old ? { ...old, isBlock } : old)
      );

      return { previousProducts };
    },

    // ✅ 2️⃣ Rollback در صورت خطا
    onError: (error, _vars, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(PRODUCT_KEYS.all, context.previousProducts);
      }

      const err = error as AxiosError<ErrorResponse>;
      toast.error(err.response?.data?.message ?? "خطا در تغییر وضعیت محصول");
    },

    // ✅ 3️⃣ Sync نهایی
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: PRODUCT_KEYS.all,
      });
    },

    // ✅ 4️⃣ Toast موفقیت
    onSuccess: (updatedProduct) => {
      toast.success(
        updatedProduct.isBlock ? "محصول غیرفعال شد" : "محصول فعال شد"
      );
    },
  });
};
