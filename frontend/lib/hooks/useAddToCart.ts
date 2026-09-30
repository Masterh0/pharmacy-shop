"use client";

import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/cart";
import type { Cart, CartItem } from "@/lib/types/cart";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";
type AddItemPayload = {
  productId: number;
  variantId: number;
  quantity: number;
  priceAtAdd: number;
  product: CartItem["product"];
  variant: CartItem["variant"];
};

export function useCart() {
  const queryClient = useQueryClient();
  const snapshot = useRef<Cart | undefined>(undefined);
  const { status: authStatus } = useAuth();
  const {
    data: cart,
    isLoading,
    error,
    refetch,
  } = useQuery<Cart>({
    queryKey: ["cart"],

    queryFn: () => cartApi.get(),

    enabled: authStatus === "authenticated" || authStatus === "unauthenticated",

    staleTime: 1000 * 60 * 2,
    refetchOnMount: "always",
    placeholderData: (prev) => prev,
  });
  const pendingCount = useRef(0);
  function captureSnapshot() {
    if (pendingCount.current === 0) {
      snapshot.current = queryClient.getQueryData<Cart>(["cart"]);
    }
    pendingCount.current++;
  }

  function rollback() {
    if (snapshot.current) {
      queryClient.setQueryData(["cart"], snapshot.current);
    }
  }

  function settle() {
    pendingCount.current = Math.max(0, pendingCount.current - 1);
    if (pendingCount.current === 0) {
      snapshot.current = undefined;
    }
    return queryClient.invalidateQueries({
      queryKey: ["cart"],
      refetchType: "active",
    });
  }

  const addItemMutation = useMutation<Cart, Error, AddItemPayload>({
    mutationFn: ({ productId, variantId, quantity }) =>
      cartApi.add({ productId, variantId, quantity }),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      captureSnapshot();

      const current = queryClient.getQueryData<Cart>(["cart"]);

      if (!current) return;

      const existing = current.items.find(
        (x) => x.variantId === payload.variantId,
      );

      queryClient.setQueryData<Cart>(["cart"], {
        ...current,
        items: existing
          ? current.items.map((x) =>
              x.variantId === payload.variantId
                ? {
                    ...x,
                    quantity: x.quantity + payload.quantity,
                  }
                : x,
            )
          : [
              ...current.items,
              {
                // ID موقت لازم نیست عدد تصادفی باشد
                id: -Date.now(),
                productId: payload.productId,
                variantId: payload.variantId,
                quantity: payload.quantity,
                priceAtAdd: payload.priceAtAdd,
                product: payload.product,
                variant: payload.variant,
              } satisfies CartItem,
            ],
      });
    },

    onError: (err: unknown) => {
      rollback();
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "مشکلی پیش آمد. دوباره امتحان کنید.";
      toast.error(message);
    },

    onSuccess: () => toast.success("به سبد اضافه شد"),
    onSettled: settle,
  });

  const removeItemMutation = useMutation<
    void,
    Error,
    { itemId: number; silent?: boolean }
  >({
    mutationFn: ({ itemId }) =>
      cartApi.removeItem(itemId).then(() => undefined),

    onMutate: async ({ itemId }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      captureSnapshot();
      const current = queryClient.getQueryData<Cart>(["cart"]);
      if (current) {
        queryClient.setQueryData<Cart>(["cart"], {
          ...current,
          items: current.items.filter((x) => x.id !== itemId),
        });
      }
    },

    onError: (_err, { silent }) => {
      rollback();
      if (!silent) toast.error("حذف با خطا مواجه شد");
    },

    onSuccess: (_data, { silent }) => {
      if (!silent) toast.success("از سبد حذف شد");
    },

    onSettled: settle,
  });

  const updateItemMutation = useMutation<
    Cart,
    Error,
    { itemId: number; quantity: number; silent?: boolean }
  >({
    mutationFn: ({ itemId, quantity }) =>
      cartApi.updateItemQuantity(itemId, quantity),

    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      captureSnapshot();
      const current = queryClient.getQueryData<Cart>(["cart"]);
      if (current) {
        queryClient.setQueryData<Cart>(["cart"], {
          ...current,
          items: current.items.map((x) =>
            x.id === itemId ? { ...x, quantity } : x,
          ),
        });
      }
    },

    onSuccess: (_data, { silent }) => {
      if (!silent) toast.success("تعداد محصول بروزرسانی شد");
    },
    onSettled: settle,
  });

  const clearCartMutation = useMutation<Cart, Error, void>({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => {
      toast.success("سبد خرید خالی شد");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => toast.error("خطا در خالی کردن سبد"),
  });

  return {
    cart,
    isLoading,
    error,
    refetch,
    addItem: addItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAdding: addItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isRemoving: removeItemMutation.isPending,
    isClearing: clearCartMutation.isPending,
  };
}
