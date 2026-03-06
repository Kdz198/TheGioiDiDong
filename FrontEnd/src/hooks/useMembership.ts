import { MEMBERSHIP } from "@/constants/app.const";
import { useMutationHandler } from "@/hooks/useMutationHandler";
import type { MembershipInfo } from "@/interfaces/membership.types";
import { membershipService } from "@/services/membershipService";
import { useCartStore } from "@/stores/cartStore";
import { useQuery } from "@tanstack/react-query";

export function useMembership() {
  const { data, isLoading, error } = useQuery<MembershipInfo>({
    queryKey: ["membership"],
    queryFn: membershipService.getMembershipInfo,
  });

  const applyPoints = useCartStore((s) => s.applyPoints);
  const removePoints = useCartStore((s) => s.removePoints);

  const redeemMutation = useMutationHandler<{ discountValue: number }, number>({
    mutationFn: (points) => membershipService.redeemPoints(points),
    onSuccess: (result, points) => {
      applyPoints(points, result.discountValue);
    },
    successMessage: "Đã áp dụng điểm thành công!",
    errorMessage: "Không thể đổi điểm",
  });

  const cancelRedeem = () => {
    removePoints();
  };

  return {
    membershipInfo: data,
    isLoading,
    error,

    currentPoints: data?.currentPoints ?? 0,
    tier: data?.tier ?? "bronze",
    transactions: data?.transactions ?? [],

    canRedeem: (data?.currentPoints ?? 0) >= MEMBERSHIP.MIN_REDEEM,
    minRedeemPoints: MEMBERSHIP.MIN_REDEEM,
    pointsValueInVND: (data?.currentPoints ?? 0) * MEMBERSHIP.VND_PER_POINT,

    redeemPoints: redeemMutation.mutate,
    isRedeeming: redeemMutation.isPending,
    cancelRedeem,
  };
}
