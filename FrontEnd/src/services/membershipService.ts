import type { MembershipInfo } from "@/interfaces/membership.types";

// No membership endpoint in the backend schema — data is served from mock.
const mockMembershipInfo: MembershipInfo = {
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

export const membershipService = {
  getMembershipInfo: async (): Promise<MembershipInfo> => {
    return mockMembershipInfo;
  },

  redeemPoints: async (points: number): Promise<{ discountValue: number }> => {
    return { discountValue: points * 1000 };
  },
};
