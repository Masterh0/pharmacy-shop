// ✅ lib/hooks/useProduct.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/lib/api/products";
import type { Product } from "@/lib/types/product";
import type { CreateProductDTO } from "@/lib/types/productInput";

const PRODUCT_KEY = ["products"];

export function useProducts() {
  const queryClient = useQueryClient();

  const getAll = useQuery<Product[]>({
    queryKey: PRODUCT_KEY,
    queryFn: productApi.getAll,
  });

  const create = useMutation({
    mutationFn: (dto: CreateProductDTO) => productApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEY });
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateProductDTO> | FormData;
    }) => productApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...PRODUCT_KEY, id] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEY });
    },
  });

  return { getAll, create, update, remove };
}

// ✅ ساخت هوک جدا برای گرفتن تک محصول
export function useProductById(id: number) {
  return useQuery<Product>({
    queryKey: [...PRODUCT_KEY, id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
}
