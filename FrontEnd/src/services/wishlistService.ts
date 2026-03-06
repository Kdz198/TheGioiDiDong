import { USE_MOCK_API } from "@/constants/app.const";
import { apiClient } from "@/lib/api";

export const wishlistService = {
  getWishlist: async (): Promise<number[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return [1, 6, 12];
    }
    const response = await apiClient.get("/wishlist");
    return response.data.data;
  },

  addToWishlist: async (productId: number): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 200));
      return;
    }
    await apiClient.post("/wishlist", { productId });
  },

  removeFromWishlist: async (productId: number): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 200));
      return;
    }
    await apiClient.delete(`/wishlist/${productId}`);
  },
};
