import { useMutationHandler } from "@/hooks/useMutationHandler";
import type { FlashSale, Promotion, Voucher } from "@/interfaces/promotion.types";
import { promotionService } from "@/services/promotionService";
import { useCartStore } from "@/stores/cartStore";
import { useQuery } from "@tanstack/react-query";

export function useVouchers() {
  return useQuery<Voucher[]>({
    queryKey: ["promotions", "vouchers"],
    queryFn: promotionService.getVouchers,
  });
}

export function useFlashSales() {
  return useQuery<FlashSale[]>({
    queryKey: ["promotions", "flash-sales"],
    queryFn: promotionService.getFlashSales,
  });
}

export function usePromotions() {
  return useQuery<Promotion[]>({
    queryKey: ["promotions"],
    queryFn: promotionService.getPromotions,
  });
}

export function useApplyVoucher() {
  const applyVoucher = useCartStore((s) => s.applyVoucher);

  return useMutationHandler<Voucher, string>({
    mutationFn: (code) => promotionService.validateVoucher(code),
    onSuccess: (voucher) => {
      applyVoucher(voucher);
    },
    successMessage: "Áp dụng mã giảm giá thành công!",
    errorMessage: "Mã giảm giá không hợp lệ hoặc đã hết hạn",
  });
}
