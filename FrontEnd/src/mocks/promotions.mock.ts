import type { FlashSale, Promotion, Voucher } from "@/interfaces/promotion.types";

export const mockVouchers: Voucher[] = [
  {
    id: 1,
    code: "TECHGEAR50K",
    type: "fixed_amount",
    discountValue: 50000,
    minOrderValue: 500000,
    usageLimit: 100,
    usedCount: 45,
    expiresAt: "2026-03-31T23:59:59Z",
    isActive: true,
  },
  {
    id: 2,
    code: "TECHGEAR100K",
    type: "fixed_amount",
    discountValue: 100000,
    minOrderValue: 2000000,
    usageLimit: 50,
    usedCount: 20,
    expiresAt: "2026-03-31T23:59:59Z",
    isActive: true,
  },
  {
    id: 3,
    code: "FREESHIP",
    type: "free_shipping",
    discountValue: 0,
    minOrderValue: 300000,
    usageLimit: 200,
    usedCount: 150,
    expiresAt: "2026-03-31T23:59:59Z",
    isActive: true,
  },
];

export const mockFlashSales: FlashSale[] = [
  {
    id: 1,
    name: "Flash Sale Cuối Tuần",
    startAt: "2026-02-28T00:00:00Z",
    endAt: "2026-03-01T23:59:59Z",
    products: [
      { productId: 1, discountPercentage: 35, stockLimit: 50, soldCount: 32 },
      { productId: 4, discountPercentage: 29, stockLimit: 30, soldCount: 18 },
      { productId: 7, discountPercentage: 19, stockLimit: 40, soldCount: 25 },
      { productId: 12, discountPercentage: 11, stockLimit: 20, soldCount: 12 },
    ],
    isActive: true,
  },
];

export const mockPromotions: Promotion[] = [
  {
    id: 1,
    type: "category_discount",
    name: "Giảm giá Phụ kiện Di động",
    description: "Giảm 10% tất cả phụ kiện di động",
    discountValue: 10,
    appliesTo: "category",
    targetIds: [1],
    startAt: "2026-02-01T00:00:00Z",
    endAt: "2026-03-31T23:59:59Z",
    isActive: true,
  },
  {
    id: 2,
    type: "flash_sale",
    name: "Flash Sale Cuối Tuần",
    description: "Giảm sốc cuối tuần, nhiều sản phẩm hot",
    discountValue: 35,
    appliesTo: "product",
    targetIds: [1, 4, 7, 12],
    startAt: "2026-02-28T00:00:00Z",
    endAt: "2026-03-01T23:59:59Z",
    isActive: true,
  },
];
