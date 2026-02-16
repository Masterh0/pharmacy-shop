// lib/hooks/useWishlist.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/lib/api/wishlist";
import { useWishlistStore } from "@/lib/stores/wishlistStore";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";

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

  // 📋 دریافت لیست کامل
  const {
    data: wishlistData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.getAll({ limit: 100 }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 دقیقه
  });

  // 🔢 دریافت تعداد
  const { data: countData } = useQuery({
    queryKey: ["wishlist-count"],
    queryFn: wishlistApi.getCount,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // ✅ افزودن به علاقه‌مندی‌ها
  const addMutation = useMutation({
    mutationFn: wishlistApi.add,
    onMutate: async (productId) => {
      // Optimistic Update
      addToStore(productId);
    },
    onSuccess: (data, productId) => {
      toast.success("✅ به علاقه‌مندی‌ها اضافه شد");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
    },
    onError: (error: any, productId) => {
      // Rollback
      removeFromStore(productId);
      toast.error(error.response?.data?.message || "خطا در افزودن به علاقه‌مندی‌ها");
    },
  });

  // ❌ حذف از علاقه‌مندی‌ها
  const removeMutation = useMutation({
    mutationFn: wishlistApi.remove,
    onMutate: async (productId) => {
      // Optimistic Update
      removeFromStore(productId);
    },
    onSuccess: (data, productId) => {
      toast.success("❌ از علاقه‌مندی‌ها حذف شد");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
    },
    onError: (error: any, productId) => {
      // Rollback
      addToStore(productId);
      toast.error(error.response?.data?.message || "خطا در حذف از علاقه‌مندی‌ها");
    },
  });

  // 🔄 Toggle (اضافه یا حذف)
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
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
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
