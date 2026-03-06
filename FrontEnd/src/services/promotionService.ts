import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type { ApiPromotion, FlashSale, Promotion, Voucher } from "@/interfaces/promotion.types";
import { apiClient } from "@/lib/api";
import { mockFlashSales, mockPromotions, mockVouchers } from "@/mocks/promotions.mock";

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
    description: "Giảm thẳng 50,000 VNĐ",
    type: "MONEY",
    discountValue: 50000,
    minOrderAmount: 300000,
    startDate: "2025-01-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z",
    active: true,
    quantity: 500,
  },
];

export const promotionService = {
  getVouchers: async (): Promise<Voucher[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockVouchers;
    }
    const response = await apiClient.get(API_ENDPOINTS.PROMOTIONS.VOUCHERS);
    return response.data.data;
  },

  validateVoucher: async (code: string): Promise<Voucher> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const voucher = mockVouchers.find((v) => v.code === code && v.isActive);
      if (!voucher) throw new Error("Mã giảm giá không hợp lệ");
      return voucher;
    }
    const response = await apiClient.post(API_ENDPOINTS.PROMOTIONS.VALIDATE_VOUCHER, { code });
    return response.data.data;
  },

  getFlashSales: async (): Promise<FlashSale[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockFlashSales;
    }
    const response = await apiClient.get(API_ENDPOINTS.PROMOTIONS.FLASH_SALES);
    return response.data.data;
  },

  getPromotions: async (): Promise<Promotion[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockPromotions;
    }
    const response = await apiClient.get(API_ENDPOINTS.PROMOTIONS.LIST);
    return response.data.data;
  },

  getApiPromotions: async (): Promise<ApiPromotion[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockApiPromotions;
    }
    const response = await apiClient.get(API_ENDPOINTS.PROMOTIONS.LIST);
    return response.data.data;
  },

  createPromotion: async (data: Omit<ApiPromotion, "id">): Promise<ApiPromotion> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const newPromotion: ApiPromotion = { id: Date.now(), ...data };
      mockApiPromotions.push(newPromotion);
      return newPromotion;
    }
    const response = await apiClient.post(API_ENDPOINTS.PROMOTIONS.CREATE, data);
    return response.data.data;
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
    return response.data.data;
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
