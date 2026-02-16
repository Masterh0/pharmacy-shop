// lib/stores/wishlistStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  wishlistIds: Set<number>;
  count: number;
  
  // Actions
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
  setWishlistIds: (ids: number[]) => void;
  setCount: (count: number) => void;
  isInWishlist: (productId: number) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: new Set<number>(),
      count: 0,

      addToWishlist: (productId) =>
        set((state) => {
          const newSet = new Set(state.wishlistIds);
          newSet.add(productId);
          return {
            wishlistIds: newSet,
            count: newSet.size,
          };
        }),

      removeFromWishlist: (productId) =>
        set((state) => {
          const newSet = new Set(state.wishlistIds);
          newSet.delete(productId);
          return {
            wishlistIds: newSet,
            count: newSet.size,
          };
        }),

      setWishlistIds: (ids) =>
        set({
          wishlistIds: new Set(ids),
          count: ids.length,
        }),

      setCount: (count) => set({ count }),

      isInWishlist: (productId) => get().wishlistIds.has(productId),

      clear: () =>
        set({
          wishlistIds: new Set(),
          count: 0,
        }),
    }),
    {
      name: "wishlist-storage",
      // تبدیل Set به Array برای ذخیره در localStorage
      partialize: (state) => ({
        wishlistIds: Array.from(state.wishlistIds),
        count: state.count,
      }),
      // بازگرداندن Array به Set
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        wishlistIds: new Set(persistedState?.wishlistIds || []),
        count: persistedState?.count || 0,
      }),
    }
  )
);
