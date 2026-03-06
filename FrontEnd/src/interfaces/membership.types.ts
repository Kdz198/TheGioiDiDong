export interface PointTransaction {
  id: number;
  type: "earned" | "redeemed";
  points: number;
  description: string;
  createdAt: string;
}

export interface MembershipInfo {
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  transactions: PointTransaction[];
}
