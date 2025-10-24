import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { variantApi } from "../api/variantApi";
import type { ProductVariant } from "@/lib/types/variant";

interface UpdateVariantParams {
  id: number;
  payload: Partial<ProductVariant>;
}

export const useVariants = (productId: number) => {
  const queryClient = useQueryClient();

  // 📦 گرفتن تمام واریانت‌های یک محصول
  const getAll = useQuery<ProductVariant[]>({
    queryKey: ["productVariants", productId],
    queryFn: () => variantApi.getAllByProductId(productId),
    enabled: !!productId,
  });

  // ➕ افزودن واریانت
  const add = useMutation({
    mutationFn: (payload: Omit<ProductVariant, "id">) =>
      variantApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productVariants", productId],
      });
    },
  });

  // ✏️ ویرایش واریانت
  const update = useMutation({
    mutationFn: ({ id, payload }: UpdateVariantParams) =>
      variantApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productVariants", productId],
      });
    },
  });

  // ❌ حذف واریانت
  const remove = useMutation({
    mutationFn: (id: number) => variantApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productVariants", productId],
      });
    },
  });

  return { getAll, add, update, remove };
};
