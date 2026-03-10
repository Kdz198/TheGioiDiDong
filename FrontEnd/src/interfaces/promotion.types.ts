export type VoucherType = "percentage" | "fixed_amount" | "free_shipping";
export type PromotionType = "flash_sale" | "category_discount" | "bundle" | "voucher";
export type ApiPromotionType = "MONEY" | "PERCENTAGE" | "BOGO";

export interface Voucher {
  id: number;
  code: string;
  type: VoucherType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface FlashSale {
  id: number;
  name: string;
  startAt: string;
  endAt: string;
  products: Array<{
    productId: number;
    discountPercentage: number;
    stockLimit: number;
    soldCount: number;
  }>;
  isActive: boolean;
}

export interface Promotion {
  id: number;
  type: PromotionType;
  name: string;
  description: string;
  discountValue: number;
  appliesTo: "all" | "category" | "product";
  targetIds?: number[];
  startAt: string;
  endAt: string;
  isActive: boolean;
}

export interface ApiPromotion {
  id: number;
  code: string;
  description?: string;
  type: ApiPromotionType;
  discountValue: number;
  maxDiscountValue?: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  active: boolean;
  quantity: number;
  applicableProductIds?: number[];
}
