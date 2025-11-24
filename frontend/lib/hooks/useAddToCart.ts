// src/hooks/useCart.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/cart";
import { useAuthStore } from "@/lib/stores/authStore";
import { getOrCreateSessionId } from "@/lib/utils/session";
import type { Cart, CartItem } from "@/lib/types/cart";

export function useCart() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const sessionId =
    typeof window !== "undefined" ? getOrCreateSessionId() : undefined;

  // 🧩 گرفتن داده سبد خرید (read-only)
  const { data: cart, isLoading, isError } = useQuery<Cart>({
    queryKey: ["cart", userId ?? sessionId],
    queryFn: async () => cartApi.get({ userId, sessionId }),
    enabled: !!userId || !!sessionId,
  });

  // 🔁 افزودن آیتم
  const addItem = useMutation({
    mutationFn: async (payload: {
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
      await queryClient.invalidateQueries({ queryKey: ["cart", userId ?? sessionId] });
    },
  });

  // 🧩 حذف آیتم
  const removeItem = useMutation({
    mutationFn: (itemId: number) => cartApi.removeItem(itemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart", userId ?? sessionId] });
    },
  });

  // 🔄 بروزرسانی تعداد
  const updateItem = useMutation({
    mutationFn: async (payload: { itemId: number; quantity: number }) =>
      cartApi.updateItemQuantity(payload.itemId, payload.quantity),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart", userId ?? sessionId] });
    },
  });

  // 🧹 خالی‌کردن کل سبد
  const clearCart = useMutation({
    mutationFn: async () => cartApi.clear({ userId, sessionId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart", userId ?? sessionId] });
    },
  });

  return {
    /** داده‌ی خام سبد خرید */
    cart,
    isLoading,
    isError,
    /** عملیات CRUD */
    addItem: addItem.mutate,
    removeItem: removeItem.mutate,
    updateItem: updateItem.mutate,
    clearCart: clearCart.mutate,
    /** وضعیت در دسترس */
    isAdding: addItem.isPending,
    isUpdating: updateItem.isPending,
    isRemoving: removeItem.isPending,
    isClearing: clearCart.isPending,
  };
}
