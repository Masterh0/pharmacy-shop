import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { wishlistApi } from "@/lib/api/wishlist";

import { useWishlistStore } from "@/lib/stores/wishlistStore";

import { toast } from "sonner";

import { useAuth } from "@/lib/context/AuthContext";

import { useEffect } from "react";

export function useWishlist() {
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const {
    addToWishlist: addToStore,
    removeFromWishlist: removeFromStore,
    setWishlistIds,
    setCount,
    isInWishlist,
    clear: clearStore,
  } = useWishlistStore();

  // 📋 دریافت لیست کامل Wishlist
  const {
    data: wishlistData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () =>
      wishlistApi.getAll({
        limit: 100,
      }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // 🔢 دریافت تعداد
  const { data: countData } = useQuery({
    queryKey: ["wishlist-count"],
    queryFn: wishlistApi.getCount,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // 🔄 Sync کردن Wishlist سرور با Zustand
  useEffect(() => {
    // اگر Guest هستیم، Wishlist باید کاملاً خالی باشد
    if (!user) {
      clearStore();
      return;
    }

    // هنوز Wishlist از سرور نیامده
    if (!wishlistData?.data?.items) {
      return;
    }

    // استخراج productId ها
    const productIds = wishlistData.data.items.map((item) => item.productId);

    // جایگزین کردن کامل Store
    setWishlistIds(productIds);
  }, [user, wishlistData, setWishlistIds, clearStore]);

  // 🔢 Sync تعداد با سرور
  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }

    if (countData?.data?.count !== undefined) {
      setCount(countData.data.count);
    }
  }, [user, countData, setCount]);

  // ✅ افزودن
  const addMutation = useMutation({
    mutationFn: wishlistApi.add,

    onMutate: async (productId) => {
      addToStore(productId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });

      queryClient.invalidateQueries({
        queryKey: ["wishlist-count"],
      });
    },

    onError: (error: any, productId) => {
      removeFromStore(productId);

      toast.error(
        error.response?.data?.message || "خطا در افزودن به علاقه‌مندی‌ها",
      );
    },
  });

  // ❌ حذف
  const removeMutation = useMutation({
    mutationFn: wishlistApi.remove,

    onMutate: async (productId) => {
      removeFromStore(productId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });

      queryClient.invalidateQueries({
        queryKey: ["wishlist-count"],
      });
    },

    onError: (error: any, productId) => {
      addToStore(productId);

      toast.error(
        error.response?.data?.message || "خطا در حذف از علاقه‌مندی‌ها",
      );
    },
  });

  // 🔄 Toggle
  const toggleWishlist = (productId: number) => {
    if (!user) {
      toast.error("لطفاً ابتدا وارد شوید");
      return;
    }

    if (isInWishlist(productId)) {
      removeMutation.mutate(productId);
    } else {
      addMutation.mutate(productId);
    }
  };

  // 🗑️ پاک کردن همه
  const clearMutation = useMutation({
    mutationFn: wishlistApi.clear,

    onSuccess: () => {
      clearStore();

      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });

      queryClient.invalidateQueries({
        queryKey: ["wishlist-count"],
      });

      toast.success("✅ همه موارد پاک شدند");
    },
  });

  return {
    wishlist: wishlistData?.data.items || [],

    count: countData?.data.count || 0,

    isLoading,

    isInWishlist,

    toggleWishlist,

    addToWishlist: addMutation.mutate,

    removeFromWishlist: removeMutation.mutate,

    clearWishlist: clearMutation.mutate,

    isAdding: addMutation.isPending,

    isRemoving: removeMutation.isPending,

    refetch,
  };
}
