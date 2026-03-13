import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CHECKOUT_PENDING_ORDER_CODE_KEY } from "@/constants/checkout.const";
import type { CartItem } from "@/interfaces/cart.types";
import type { ApiPromotion } from "@/interfaces/promotion.types";
import { ROUTES } from "@/router/routes.const";
import { checkoutService } from "@/services/checkoutService";
import {
  calculatePromotionDiscount,
  promotionService,
  validatePromotionForCheckout,
} from "@/services/promotionService";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { extractAccountIdFromToken } from "@/utils/authToken";
import { formatVND } from "@/utils/formatPrice";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object") {
      const maybeError = (data as { error?: unknown; message?: unknown }).error;
      if (typeof maybeError === "string" && maybeError.trim()) return maybeError;
      const maybeMessage = (data as { error?: unknown; message?: unknown }).message;
      if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage;
    }
    if (error.message) return error.message;
  }
  return fallback;
}

function resolveOrderDetailType(item: CartItem): string {
  const maybeType = (item as CartItem & { type?: unknown }).type;
  if (typeof maybeType === "string" && maybeType.trim()) {
    return maybeType.trim();
  }
  return "buy";
}

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const hydrateFromServer = useCartStore((s) => s.hydrateFromServer);
  const removeVoucher = useCartStore((s) => s.removeVoucher);
  const removePoints = useCartStore((s) => s.removePoints);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isApplyingPromotion, setIsApplyingPromotion] = useState(false);
  const [promotionCodeInput, setPromotionCodeInput] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState<ApiPromotion | null>(null);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.subtotal, 0), [items]);

  const promotionDiscount = useMemo(() => {
    if (!appliedPromotion) return 0;
    return calculatePromotionDiscount(appliedPromotion, subtotal);
  }, [appliedPromotion, subtotal]);

  const estimatedPayable = Math.max(0, subtotal - promotionDiscount);

  const handleApplyPromotion = async () => {
    const code = promotionCodeInput.trim().toUpperCase();
    if (!code) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      setIsApplyingPromotion(true);
      const promotion = await promotionService.getPromotionByCode(code);
      const validationError = validatePromotionForCheckout(promotion, subtotal);
      if (validationError) {
        throw new Error(validationError);
      }
      setAppliedPromotion(promotion);
      setPromotionCodeInput(code);
      toast.success("Đã áp mã giảm giá");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Không thể áp mã giảm giá"));
    } finally {
      setIsApplyingPromotion(false);
    }
  };

  const handleRemovePromotion = () => {
    setAppliedPromotion(null);
    setPromotionCodeInput("");
  };

  const handleEditOrder = () => {
    const restoredItems = items.map((item) => {
      const quantity = Math.max(1, item.quantity);
      return {
        ...item,
        quantity,
        subtotal: item.variant.price * quantity,
      };
    });

    hydrateFromServer(restoredItems);
    removeVoucher();
    removePoints();
    setAppliedPromotion(null);
    setPromotionCodeInput("");
    sessionStorage.removeItem(CHECKOUT_PENDING_ORDER_CODE_KEY);
    navigate(ROUTES.CART);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Giỏ hàng đang trống");
      return;
    }

    // Backend JWT uses accountId claim; prefer it over authStore.user.id.
    const userId = extractAccountIdFromToken(token) ?? (user?.id && user.id > 0 ? user.id : null);
    if (!userId) {
      toast.error("Không xác định được accountId từ token đăng nhập");
      return;
    }

    if (appliedPromotion) {
      const validationError = validatePromotionForCheckout(appliedPromotion, subtotal);
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    const orderDetails = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      subtotal: item.subtotal,
      type: resolveOrderDetailType(item),
    }));

    try {
      setIsLoading(true);

      const checkAvailableResponse = await checkoutService.checkAvailable({
        userId,
        status: "PENDING",
        basePrice: subtotal,
        totalPrice: subtotal,
        orderDetails,
      });

      const orderCode = checkAvailableResponse.orderCode;
      if (!orderCode) {
        throw new Error("Không nhận được orderCode từ check-available");
      }

      const paymentUrl = await checkoutService.makePaymentWithRetry(
        orderCode,
        appliedPromotion?.code
      );

      if (!paymentUrl) {
        throw new Error("Không nhận được URL thanh toán");
      }

      sessionStorage.setItem(CHECKOUT_PENDING_ORDER_CODE_KEY, orderCode);
      window.location.assign(paymentUrl);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Thanh toán thất bại"));
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Giỏ hàng trống</h1>
        <p className="mt-2 text-gray-500">Bạn cần thêm sản phẩm trước khi thanh toán</p>
        <Button asChild className="mt-6 bg-teal-500 hover:bg-teal-600">
          <Link to={ROUTES.PRODUCTS}>Tiếp tục mua sắm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Thanh toán</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Quy trình thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                    1
                  </span>
                  <p>Xác nhận đơn hàng và kiểm tra tồn kho.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                    2
                  </span>
                  <p>Hệ thống chuyển bạn đến cổng thanh toán PayOS để thanh toán liên ngân hàng.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                    3
                  </span>
                  <p>Quay lại trang xác nhận sau khi giao dịch hoàn tất.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lưu ý thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <ul className="list-disc space-y-2 pl-5">
                  <li>Đơn hàng chỉ được xử lý sau khi thanh toán thành công.</li>
                  <li>Mã giảm giá chỉ áp dụng tại bước checkout này.</li>
                  <li>Giá hiển thị là ước tính, số tiền cuối cùng do backend xác nhận.</li>
                  <li>
                    Nếu cần đổi sản phẩm, quay lại giỏ hàng để chỉnh sửa trước khi thanh toán.
                  </li>
                </ul>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={handleEditOrder}>
                    Chỉnh sửa đơn hàng
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Đơn hàng ({items.length} sản phẩm)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.product.thumbnailUrl}
                        alt={item.product.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div className="flex-1 text-xs">
                        <p className="font-medium text-zinc-900">{item.product.name}</p>
                        <p className="text-gray-400">SL: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-medium">{formatVND(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="promotionCode">Mã giảm giá</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promotionCode"
                      value={promotionCodeInput}
                      onChange={(e) => setPromotionCodeInput(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      disabled={isApplyingPromotion || isLoading}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyPromotion}
                      disabled={isApplyingPromotion || isLoading || !promotionCodeInput.trim()}
                      className="bg-teal-500 hover:bg-teal-600">
                      {isApplyingPromotion ? <Loader2 className="h-4 w-4 animate-spin" /> : "Áp mã"}
                    </Button>
                  </div>
                  {appliedPromotion && (
                    <div className="flex items-center justify-between rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm">
                      <span className="font-medium text-teal-700">
                        Đã áp: {appliedPromotion.code}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePromotion}>
                        Bỏ
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tổng trước giảm</span>
                    <span>{formatVND(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá tạm tính</span>
                    <span>-{formatVND(promotionDiscount)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Ước tính thanh toán</span>
                  <span className="text-red-500">{formatVND(estimatedPayable)}</span>
                </div>

                <p className="text-xs text-gray-500">
                  Đây là số tiền ước tính. Số tiền cuối cùng do backend xác nhận khi tạo liên kết
                  thanh toán.
                </p>

                <Button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600"
                  disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Thanh toán qua PayOS
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
