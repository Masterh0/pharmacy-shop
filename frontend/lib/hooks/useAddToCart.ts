// src/hooks/useAddToCart.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/cart";

export function useAddToCart(userId?: number, sessionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      productId: number;
      variantId: number;
      quantity: number;
    }) =>
      cartApi.add({
        userId,
        sessionId,
        productId: payload.productId,
        variantId: payload.variantId,
        quantity: payload.quantity,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cart", userId ?? sessionId],
      });
    },
  });
}
