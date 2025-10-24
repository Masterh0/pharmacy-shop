import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandApi } from "../api/brandApi";
import { CreateBrandDTO } from "../types/brand";

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: brandApi.getAll,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBrandDTO) => brandApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => brandApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};
