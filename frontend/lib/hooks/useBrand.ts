import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandApi } from "@/lib/api/brandApi";
import type { Brand } from "@/lib/types/brand";
import type { CreateBrandDTO } from "@/lib/types/brandInput";

/**
 * گرفتن لیست کل برندها
 */
export const useBrands = () =>
  useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: brandApi.getAll,
  });

/**
 * گرفتن برند تکی بر اساس ID
 */
export const useBrand = (id: number) =>
  useQuery<Brand>({
    queryKey: ["brand", id],
    queryFn: () => brandApi.getById(id),
    enabled: !!id,
  });

/**
 * ایجاد برند جدید
 */
export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation<Brand, Error, CreateBrandDTO>({
    mutationFn: brandApi.create,
    onSuccess: () => {
      // بعد از موفقیت، کش برندها رو به‌روز کن
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

/**
 * حذف برند
 */
export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: brandApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

/**
 * ویرایش برند
 */
export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Brand,
    Error,
    { id: number; data: Partial<CreateBrandDTO> }
  >({
    mutationFn: ({ id, data }) => brandApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["brand", id] });
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};
