"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/cart";
import type { Cart, CartItem } from "@/lib/types/cart";
import { toast } from "sonner";

export function useCart() {
  const queryClient = useQueryClient();

  // -------------------------------
  // 1) GET CART
  // -------------------------------
  const {
    data: cart,
    isLoading,
    isError,
  } = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: () => cartApi.get(),
  });

  // -------------------------------
  // 2) ADD ITEM (with optimistic)
  // -------------------------------
  const addItemMutation = useMutation({
    mutationFn: (payload: {
      productId: number;
      variantId: number;
      quantity: number;
    }) => {
      console.log("🚀 Sending to API:", payload); // ✅ چک کنید
      return cartApi.add(payload);
    },

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previous = queryClient.getQueryData<Cart>(["cart"]);

      // optimistic add
      if (previous) {
        const fakeItem: CartItem = {
          id: Math.random(),
          productId: payload.productId,
          variantId: payload.variantId,
          quantity: payload.quantity,
          priceAtAdd: 0,
          product: undefined,
          variant: undefined,
        };

        queryClient.setQueryData<Cart>(["cart"], {
          ...previous,
          items: [...previous.items, fakeItem],
        });
      }

      return { previous };
    },

    onError: (err: any, _payload, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["cart"], ctx.previous);
      }

      const message =
        err?.response?.data?.error ?? "مشکلی پیش آمد. دوباره امتحان کنید.";

      toast.error(message);
    },

    onSuccess: () => {
      toast.success("به سبد اضافه شد");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // -------------------------------
  // 3) REMOVE ITEM (with optimistic)
  // -------------------------------
  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => cartApi.removeItem(itemId),

    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData<Cart>(["cart"]);

      if (previous) {
        queryClient.setQueryData<Cart>(["cart"], {
          ...previous,
          items: previous.items.filter((x) => x.id !== itemId),
        });
      }

      return { previous };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["cart"], ctx.previous);
      toast.error("حذف با خطا مواجه شد");
    },

    onSuccess: () => {
      toast.success("حذف شد");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // -------------------------------
  // 4) UPDATE QUANTITY (optimistic)
  // -------------------------------
  const updateItemMutation = useMutation({
    mutationFn: (payload: { itemId: number; quantity: number }) =>
      cartApi.updateItemQuantity(payload.itemId, payload.quantity),

    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previous = queryClient.getQueryData<Cart>(["cart"]);

      if (previous) {
        queryClient.setQueryData<Cart>(["cart"], {
          ...previous,
          items: previous.items.map((x) =>
            x.id === itemId ? { ...x, quantity } : x
          ),
        });
      }

      return { previous };
    },

    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["cart"], ctx.previous);
      toast.error("بروزرسانی ناموفق بود");
    },

    onSuccess: () => {
      toast.success("تعداد بروزرسانی شد");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // -------------------------------
  // 5) CLEAR CART
  // -------------------------------
  const clearCartMutation = useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => {
      toast.success("سبد خرید خالی شد");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => {
      toast.error("خطا در خالی کردن سبد");
    },
  });

  return {
    cart,
    isLoading,
    isError,

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
