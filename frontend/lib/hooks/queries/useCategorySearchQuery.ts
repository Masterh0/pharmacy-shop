import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api/category";
import { useDebounce } from "@/lib/hooks/ui/useDebounce";

export const useCategorySearchQuery = (query: string) => {
  const debounced = useDebounce(query, 400); // 🔸 جلوگیری از هر فشار کیبورد

  return useQuery({
    queryKey: ["categories", "search", debounced],
    queryFn: () => categoryApi.search(debounced),
    enabled: debounced.trim().length >= 2,
    staleTime: 60 * 1000,
  });
};
