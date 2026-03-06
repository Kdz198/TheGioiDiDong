import { CART } from "@/constants/app.const";
import type { CartItem } from "@/interfaces/cart.types";
import type { Voucher } from "@/interfaces/promotion.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartState {
  items: CartItem[];
  appliedVoucher: Voucher | null;
  pointsToRedeem: number;
  pointsDiscountValue: number;
  isLoading: boolean;

  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  applyVoucher: (voucher: Voucher) => void;
  removeVoucher: () => void;
  applyPoints: (points: number, discountValue: number) => void;
  removePoints: () => void;
  clearCart: () => void;
  hydrateFromServer: (items: CartItem[]) => void;
}

function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

function calculateVoucherDiscount(voucher: Voucher | null, subtotal: number): number {
  if (!voucher) return 0;
  if (subtotal < voucher.minOrderValue) return 0;

  if (voucher.type === "percentage") {
    const discount = Math.round((subtotal * voucher.discountValue) / 100);
    return voucher.maxDiscountAmount ? Math.min(discount, voucher.maxDiscountAmount) : discount;
  }
  if (voucher.type === "fixed_amount") {
    return voucher.discountValue;
  }
  return 0;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      appliedVoucher: null,
      pointsToRedeem: 0,
      pointsDiscountValue: 0,
      isLoading: false,

      addItem: (item) =>
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.variantId === item.variantId);
          if (existingIndex >= 0) {
            const newItems = [...state.items];
            const existing = newItems[existingIndex];
            const newQty = Math.min(existing.quantity + item.quantity, CART.MAX_QUANTITY_PER_ITEM);
            newItems[existingIndex] = {
              ...existing,
              quantity: newQty,
              subtotal: existing.variant.price * newQty,
            };
            return { items: newItems };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        })),

      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  quantity: Math.min(Math.max(1, quantity), CART.MAX_QUANTITY_PER_ITEM),
                  subtotal:
                    i.variant.price * Math.min(Math.max(1, quantity), CART.MAX_QUANTITY_PER_ITEM),
                }
              : i
          ),
        })),

      applyVoucher: (voucher) => set({ appliedVoucher: voucher }),
      removeVoucher: () => set({ appliedVoucher: null }),
      applyPoints: (points, discountValue) =>
        set({ pointsToRedeem: points, pointsDiscountValue: discountValue }),
      removePoints: () => set({ pointsToRedeem: 0, pointsDiscountValue: 0 }),
      clearCart: () =>
        set({
          items: [],
          appliedVoucher: null,
          pointsToRedeem: 0,
          pointsDiscountValue: 0,
        }),
      hydrateFromServer: (items) => set({ items }),
    }),
    {
      name: CART.LOCAL_STORAGE_KEY,
      partialize: (state) => ({
        items: state.items,
        appliedVoucher: state.appliedVoucher,
      }),
    }
  )
);

export function useCartTotals() {
  const { items, appliedVoucher, pointsDiscountValue } = useCartStore();
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = calculateSubtotal(items);
  const voucherDiscount = calculateVoucherDiscount(appliedVoucher, subtotal);
  const discountAmount = voucherDiscount + pointsDiscountValue;
  const total = Math.max(0, subtotal - discountAmount);

  return { totalItems, subtotal, discountAmount, total };
}
