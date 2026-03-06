import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type { CartItem } from "@/interfaces/cart.types";
import type { Voucher } from "@/interfaces/promotion.types";
import { apiClient } from "@/lib/api";
import { mockCartItems } from "@/mocks/cart.mock";
import { mockVouchers } from "@/mocks/promotions.mock";

export const cartService = {
  getCart: async (): Promise<CartItem[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockCartItems;
    }
    const response = await apiClient.get(API_ENDPOINTS.CART.GET);
    return response.data.data;
  },

  addToCart: async (variantId: number, quantity: number): Promise<CartItem> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const existing = mockCartItems.find((i) => i.variantId === variantId);
      if (existing) {
        return {
          ...existing,
          quantity: existing.quantity + quantity,
          subtotal: existing.variant.price * (existing.quantity + quantity),
        };
      }
      return mockCartItems[0];
    }
    const response = await apiClient.post(API_ENDPOINTS.CART.ADD, { variantId, quantity });
    return response.data.data;
  },

  updateCartItem: async (itemId: number, quantity: number): Promise<CartItem> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 200));
      const item = mockCartItems.find((i) => i.id === itemId);
      if (!item) throw new Error("Item not found");
      return { ...item, quantity, subtotal: item.variant.price * quantity };
    }
    const response = await apiClient.put(API_ENDPOINTS.CART.UPDATE(itemId), { quantity });
    return response.data.data;
  },

  removeCartItem: async (itemId: number): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 200));
      return;
    }
    await apiClient.delete(API_ENDPOINTS.CART.REMOVE(itemId));
  },

  clearCart: async (): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 200));
      return;
    }
    await apiClient.post(API_ENDPOINTS.CART.CLEAR);
  },

  applyVoucher: async (code: string): Promise<Voucher> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const voucher = mockVouchers.find((v) => v.code === code && v.isActive);
      if (!voucher) throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
      return voucher;
    }
    const response = await apiClient.post(API_ENDPOINTS.CART.APPLY_VOUCHER, { code });
    return response.data.data;
  },
};
