import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type { MembershipInfo } from "@/interfaces/membership.types";
import { apiClient } from "@/lib/api";

export const membershipService = {
  getMembershipInfo: async (): Promise<MembershipInfo> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return {
        currentPoints: 1250,
        totalEarned: 3500,
        totalRedeemed: 2250,
        tier: "silver",
        transactions: [
          {
            id: 1,
            type: "earned",
            points: 640,
            description: "Đơn hàng TG-20260228-001",
            createdAt: "2026-02-25T10:00:00Z",
          },
          {
            id: 2,
            type: "earned",
            points: 7020,
            description: "Đơn hàng TG-20260227-002",
            createdAt: "2026-02-27T10:00:00Z",
          },
          {
            id: 3,
            type: "redeemed",
            points: 500,
            description: "Đổi điểm giảm giá 500.000đ",
            createdAt: "2026-02-20T14:00:00Z",
          },
        ],
      };
    }
    const response = await apiClient.get(API_ENDPOINTS.MEMBERSHIP.INFO);
    return response.data.data;
  },

  redeemPoints: async (points: number): Promise<{ discountValue: number }> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return { discountValue: points * 1000 };
    }
    const response = await apiClient.post(API_ENDPOINTS.MEMBERSHIP.REDEEM, { points });
    return response.data.data;
  },
};
