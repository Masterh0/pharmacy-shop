import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Category } from "@/lib/types/category";

export const useCategoriesQuery = () => {
  return useQuery<Category[]>({
    queryKey: ["categories", "all"],
    queryFn: async () => {
      const { data } = await api.get("/categories/children");
      return Array.isArray(data) ? data : data?.categories || data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
