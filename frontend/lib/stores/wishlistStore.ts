import { create } from "zustand";

interface WishlistState {
  wishlistIds: Set<number>;
  count: number;

  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
  setWishlistIds: (ids: number[]) => void;
  setCount: (count: number) => void;
  isInWishlist: (productId: number) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
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

  setCount: (count) =>
    set({
      count,
    }),

  isInWishlist: (productId) => get().wishlistIds.has(productId),

  clear: () =>
    set({
      wishlistIds: new Set<number>(),
      count: 0,
    }),
}));
