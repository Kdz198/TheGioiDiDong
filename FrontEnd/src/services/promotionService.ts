import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type {
  ApiPromotion,
  ApiPromotionType,
  Promotion,
  Voucher,
} from "@/interfaces/promotion.types";
import { apiClient } from "@/lib/api";
import { mockPromotions } from "@/mocks/promotions.mock";

const mockApiPromotions: ApiPromotion[] = [
  {
    id: 1,
    code: "SUMMER2025",
    description: "Giảm giá mùa hè",
    type: "PERCENTAGE",
    discountValue: 10,
    maxDiscountValue: 100000,
    minOrderAmount: 500000,
    startDate: "2025-06-01T00:00:00Z",
    endDate: "2025-08-31T23:59:59Z",
    active: true,
    quantity: 200,
  },
  {
    id: 2,
    code: "FLAT50K",
    description: "Giảm thẳng 50,000 VND",
    type: "MONEY",
    discountValue: 50000,
    minOrderAmount: 300000,
    startDate: "2025-01-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z",
    active: true,
    quantity: 500,
  },
];

export function mapApiPromotionToVoucher(promo: ApiPromotion): Voucher {
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

export function calculatePromotionDiscount(promo: ApiPromotion, basePrice: number): number {
  if (basePrice <= 0) return 0;

  // Keep estimate aligned with current backend PaymentServiceImpl:
  // percentage => totalPrice * discountValue / 100, no maxDiscountValue cap at make-payment.
  if (promo.type === "PERCENTAGE") {
    return Math.max(0, Math.floor((basePrice * promo.discountValue) / 100));
  }

  return Math.max(0, promo.discountValue);
}

export function validatePromotionForCheckout(
  promo: ApiPromotion,
  basePrice: number,
  now: Date = new Date()
): string | null {
  if (!promo.active) return "Mã giảm giá đã hết hạn hoặc không hoạt động";
  if ((promo.quantity ?? 0) <= 0) return "Mã giảm giá đã hết lượt sử dụng";

  const start = promo.startDate ? new Date(promo.startDate) : null;
  if (start && !Number.isNaN(start.getTime()) && now < start) {
    return "Mã giảm giá chưa đến thời gian áp dụng";
  }

  const end = promo.endDate ? new Date(promo.endDate) : null;
  if (end && !Number.isNaN(end.getTime()) && now > end) {
    return "Mã giảm giá đã hết hạn";
  }

  if (basePrice < (promo.minOrderAmount ?? 0)) {
    return "Đơn hàng chưa đạt giá trị tối thiểu để áp mã";
  }

  return null;
}

async function getPromotionByCode(code: string): Promise<ApiPromotion> {
  if (USE_MOCK_API) {
    await new Promise((r) => setTimeout(r, 500));
    const promo = mockApiPromotions.find((p) => p.code.toUpperCase() === code.toUpperCase());
    if (!promo) throw new Error("Mã giảm giá không tồn tại");
    return promo;
  }

  const response = await apiClient.get<ApiPromotion>(API_ENDPOINTS.PROMOTIONS.BY_CODE(code));
  if (!response.data) throw new Error("Mã giảm giá không tồn tại");
  return response.data;
}

export const promotionService = {
  getPromotionByCode,

  // Legacy helper kept for existing hooks.
  validateVoucher: async (code: string): Promise<Voucher> => {
    const promo = await getPromotionByCode(code);
    const validationError = validatePromotionForCheckout(promo, promo.minOrderAmount ?? 0);
    if (validationError) throw new Error(validationError);
    return mapApiPromotionToVoucher(promo);
  },

  getPromotions: async (): Promise<Promotion[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockPromotions;
    }
    const response = await apiClient.get(API_ENDPOINTS.PROMOTIONS.LIST);
    return response.data;
  },

  getVouchers: async (): Promise<Voucher[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockApiPromotions.map(mapApiPromotionToVoucher);
    }
    const response = await apiClient.get(API_ENDPOINTS.PROMOTIONS.LIST);
    const promos = response.data as ApiPromotion[];
    return promos.map(mapApiPromotionToVoucher);
  },

  getFlashSales: async () => {
    // No flash-sale endpoint in schema.
    return [] as import("@/interfaces/promotion.types").FlashSale[];
  },

  getApiPromotions: async (): Promise<ApiPromotion[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockApiPromotions;
    }
    const response = await apiClient.get(API_ENDPOINTS.PROMOTIONS.LIST);
    return response.data;
  },

  createPromotion: async (data: Omit<ApiPromotion, "id">): Promise<ApiPromotion> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const newPromotion: ApiPromotion = { id: Date.now(), ...data };
      mockApiPromotions.push(newPromotion);
      return newPromotion;
    }
    const response = await apiClient.post(API_ENDPOINTS.PROMOTIONS.CREATE, { id: 0, ...data });
    return response.data;
  },

  updatePromotion: async (data: ApiPromotion): Promise<ApiPromotion> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const idx = mockApiPromotions.findIndex((p) => p.id === data.id);
      if (idx === -1) throw new Error("Khuyến mãi không tồn tại");
      mockApiPromotions[idx] = data;
      return mockApiPromotions[idx];
    }
    const response = await apiClient.put(API_ENDPOINTS.PROMOTIONS.UPDATE, data);
    return response.data;
  },

  deletePromotion: async (id: number): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const idx = mockApiPromotions.findIndex((p) => p.id === id);
      if (idx !== -1) mockApiPromotions.splice(idx, 1);
      return;
    }
    await apiClient.delete(API_ENDPOINTS.PROMOTIONS.DELETE(id));
  },
};
