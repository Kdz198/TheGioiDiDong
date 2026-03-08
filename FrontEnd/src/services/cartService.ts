import { API_ENDPOINTS } from "@/constants/api.config";
import type { CartItem } from "@/interfaces/cart.types";
import type { ApiPromotion, ApiPromotionType, Voucher } from "@/interfaces/promotion.types";
import { apiClient } from "@/lib/api";

/** Map backend ApiPromotion to the frontend Voucher shape */
function mapPromotionToVoucher(promo: ApiPromotion): Voucher {
  const typeMap: Record<ApiPromotionType, Voucher["type"]> = {
    PERCENTAGE: "percentage",
    MONEY: "fixed_amount",
    BOGO: "fixed_amount",
  };
  return {
    id: promo.id,
    code: promo.code,
    type: typeMap[promo.type] ?? "fixed_amount",
    discountValue: promo.discountValue,
    minOrderValue: promo.minOrderAmount ?? 0,
    maxDiscountAmount: promo.maxDiscountValue,
    usageLimit: promo.quantity,
    usedCount: 0,
    expiresAt: promo.endDate,
    isActive: promo.active,
  };
}

// Cart state is managed entirely by cartStore (localStorage via Zustand persist).
// There is no cart service on the backend — these methods are no-ops that keep the
// cartStore as the single source of truth.
export const cartService = {
  getCart: async (): Promise<CartItem[]> => {
    return [];
  },

  addToCart: async (_variantId: number, _quantity: number): Promise<CartItem> => {
    return {} as CartItem;
  },

  updateCartItem: async (_itemId: number, _quantity: number): Promise<CartItem> => {
    return {} as CartItem;
  },

  removeCartItem: async (_itemId: number): Promise<void> => {
    // no-op — cartStore handles removal
  },

  clearCart: async (): Promise<void> => {
    // no-op — cartStore handles clearing
  },

  applyVoucher: async (code: string): Promise<Voucher> => {
    const response = await apiClient.get<ApiPromotion>(API_ENDPOINTS.PROMOTIONS.BY_CODE(code));
    const promo = response.data;
    if (!promo.active) throw new Error("Mã giảm giá đã hết hạn hoặc không hoạt động");
    return mapPromotionToVoucher(promo);
  },
};
