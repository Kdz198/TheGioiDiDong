// No wishlist endpoints exist in the backend schema.
// Wishlist state is managed entirely by wishlistStore (localStorage via Zustand persist).
export const wishlistService = {
  getWishlist: async (): Promise<number[]> => {
    return [];
  },

  addToWishlist: async (_productId: number): Promise<void> => {
    // no-op — wishlistStore handles state
  },

  removeFromWishlist: async (_productId: number): Promise<void> => {
    // no-op — wishlistStore handles state
  },
};
