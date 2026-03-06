import { useMutationHandler } from "@/hooks/useMutationHandler";
import { wishlistService } from "@/services/wishlistService";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useQuery } from "@tanstack/react-query";

export function useWishlist() {
  const store = useWishlistStore();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useQuery<number[]>({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const ids = await wishlistService.getWishlist();
      store.hydrate(ids);
      return ids;
    },
    enabled: isLoggedIn,
  });

  const toggleMutation = useMutationHandler<void, number>({
    mutationFn: async (productId) => {
      const isCurrentlyInWishlist = store.isInWishlist(productId);
      if (isCurrentlyInWishlist) {
        await wishlistService.removeFromWishlist(productId);
      } else {
        await wishlistService.addToWishlist(productId);
      }
    },
    onSuccess: (_data, productId) => {
      store.toggle(productId);
    },
    showSuccessToast: false,
    errorMessage: "Không thể cập nhật danh sách yêu thích",
  });

  return {
    productIds: store.productIds,
    isInWishlist: store.isInWishlist,
    toggle: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
    clear: store.clear,
  };
}
