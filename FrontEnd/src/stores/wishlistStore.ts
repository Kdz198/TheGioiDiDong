import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  productIds: number[];
  isLoading: boolean;

  toggle: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  hydrate: (productIds: number[]) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      isLoading: false,

      toggle: (productId) =>
        set((state) => {
          const exists = state.productIds.includes(productId);
          return {
            productIds: exists
              ? state.productIds.filter((id) => id !== productId)
              : [...state.productIds, productId],
          };
        }),

      isInWishlist: (productId) => get().productIds.includes(productId),
      hydrate: (productIds) => set({ productIds }),
      clear: () => set({ productIds: [] }),
    }),
    {
      name: "techgear-wishlist",
      partialize: (state) => ({ productIds: state.productIds }),
    }
  )
);
