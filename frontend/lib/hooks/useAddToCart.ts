"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/cart";
import type { Cart } from "@/lib/types/cart";

export function useCart() {
  const queryClient = useQueryClient();

  // ✅ 1) گرفتن سبد خرید — بدون userId/sessionId
  const {
    data: cart,
    isLoading,
    isError,
  } = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: () => cartApi.get(),
  });

  // ✅ 2) افزودن آیتم — فقط 3 پارامتر
  const addItemMutation = useMutation({
    mutationFn: (payload: {
      productId: number;
      variantId: number;
      quantity: number;
    }) => cartApi.add(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  // ✅ 3) حذف آیتم با id
  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => cartApi.removeItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  // ✅ 4) آپدیت تعداد
  const updateItemMutation = useMutation({
    mutationFn: (payload: { itemId: number; quantity: number }) =>
      cartApi.updateItemQuantity(payload.itemId, payload.quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  // ✅ 5) خالی کردن سبد
  const clearCartMutation = useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  return {
    cart,
    isLoading,
    isError,

    /** عملیات CRUD */
    addItem: addItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    clearCart: clearCartMutation.mutate,

    /** وضعیت‌ها */
    isAdding: addItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isRemoving: removeItemMutation.isPending,
    isClearing: clearCartMutation.isPending,
  };
}
