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

    // ✅ 1️⃣ Optimistic update (لحظه‌ای)
    onMutate: async ({ id, isBlock }) => {
      // جلوی refetch همزمان رو بگیر
      await queryClient.cancelQueries({
        queryKey: PRODUCT_KEYS.all,
      });

      const previousProducts =
        queryClient.getQueryData<Product[]>(PRODUCT_KEYS.all);

      // ✅ Update لحظه‌ای لیست
      queryClient.setQueryData<Product[] | undefined>(
        PRODUCT_KEYS.all,
        (old) =>
          old?.map((p) =>
            p.id === id ? { ...p, isBlock } : p
          )
      );

      // ✅ Update لحظه‌ای دیتیل (اگه باز باشه)
      queryClient.setQueryData<Product | undefined>(
        PRODUCT_KEYS.detail(id),
        (old) => (old ? { ...old, isBlock } : old)
      );

      return { previousProducts };
    },

    // ✅ 2️⃣ Rollback اگه خطا خورد
    onError: (error, _vars, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(
          PRODUCT_KEYS.all,
          context.previousProducts
        );
      }

      const err = error as AxiosError<ErrorResponse>;
      toast.error(err.response?.data?.message ?? "خطا در تغییر وضعیت محصول");
    },

    // ✅ 3️⃣ Sync نهایی با سرور (سریع)
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: PRODUCT_KEYS.all,
      });
    },

    // ✅ 4️⃣ Toast بعد از موفقیت واقعی
    onSuccess: (updatedProduct) => {
      toast.success(
        updatedProduct.isBlock ? "محصول غیرفعال شد" : "محصول فعال شد"
      );
    },
  });
};
