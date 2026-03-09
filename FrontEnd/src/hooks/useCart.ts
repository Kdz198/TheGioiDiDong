import { useMutationHandler } from "@/hooks/useMutationHandler";
import type { CartItem } from "@/interfaces/cart.types";
import type { Product, ProductVariant } from "@/interfaces/product.types";
import type { Voucher } from "@/interfaces/promotion.types";
import { cartService } from "@/services/cartService";
import { useCartStore, useCartTotals } from "@/stores/cartStore";

export function useCart() {
  const store = useCartStore();
  const totals = useCartTotals();

  const addToCartMutation = useMutationHandler<
    CartItem,
    { product: Product; variant: ProductVariant; quantity: number }
  >({
    mutationFn: async ({ variant, quantity }) => {
      return cartService.addToCart(variant.id, quantity);
    },
    onSuccess: (_data, { product, variant, quantity }) => {
      store.addItem({
        id: Date.now(),
        productId: product.id,
        variantId: variant.id,
        product: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          thumbnailUrl: product.thumbnailUrl,
        },
        appProduct: {
          id: product.id,
          name: product.name,
          imgUrl: product.thumbnailUrl,
        },
        variant: {
          id: variant.id,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          price: variant.price,
          originalPrice: variant.originalPrice,
          stockQuantity: variant.stockQuantity,
        },
        quantity,
        subtotal: variant.price * quantity,
      });
    },
    successMessage: "Đã thêm vào giỏ hàng!",
    errorMessage: "Không thể thêm vào giỏ hàng",
  });

  const updateQuantityMutation = useMutationHandler<CartItem, { itemId: number; quantity: number }>(
    {
      mutationFn: async ({ itemId, quantity }) => {
        return cartService.updateCartItem(itemId, quantity);
      },
      onSuccess: (_data, { itemId, quantity }) => {
        store.updateQuantity(itemId, quantity);
      },
      showSuccessToast: false,
      errorMessage: "Không thể cập nhật số lượng",
    }
  );

  const removeItemMutation = useMutationHandler<void, number>({
    mutationFn: async (itemId) => {
      return cartService.removeCartItem(itemId);
    },
    onSuccess: (_data, itemId) => {
      store.removeItem(itemId);
    },
    successMessage: "Đã xóa sản phẩm khỏi giỏ hàng",
    errorMessage: "Không thể xóa sản phẩm",
  });

  const applyVoucherMutation = useMutationHandler<Voucher, string>({
    mutationFn: async (code) => {
      return cartService.applyVoucher(code);
    },
    onSuccess: (voucher) => {
      store.applyVoucher(voucher);
    },
    successMessage: "Áp dụng mã giảm giá thành công!",
    errorMessage: "Mã giảm giá không hợp lệ",
  });

  return {
    items: store.items,
    appliedVoucher: store.appliedVoucher,
    pointsToRedeem: store.pointsToRedeem,
    isLoading: store.isLoading,
    ...totals,

    addToCart: addToCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,

    updateQuantity: updateQuantityMutation.mutate,
    isUpdatingQuantity: updateQuantityMutation.isPending,

    removeItem: removeItemMutation.mutate,
    isRemovingItem: removeItemMutation.isPending,

    applyVoucher: applyVoucherMutation.mutate,
    isApplyingVoucher: applyVoucherMutation.isPending,

    removeVoucher: store.removeVoucher,
    applyPoints: store.applyPoints,
    removePoints: store.removePoints,
    clearCart: store.clearCart,
  };
}
