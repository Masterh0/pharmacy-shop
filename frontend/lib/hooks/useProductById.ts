import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/products";

export const useProductById = (id?: number) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getById(id!),
    enabled: !!id,
  });
};
