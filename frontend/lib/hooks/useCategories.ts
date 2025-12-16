import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi, CreateCategoryDTO } from "../api/category";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDTO) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
export const useCategoryFilters = (categoryId?: number) => {
  return useQuery({
    queryKey: ["category-filters", categoryId],
    queryFn: () => categoryApi.getCategoryFilters(categoryId!),
    enabled: !!categoryId, // ✅ فقط وقتی id داریم
    staleTime: 1000 * 60 * 5, // ✅ 5 دقیقه (metadata زیاد تغییر نمی‌کنه)
    refetchOnWindowFocus: false,
  });
};
