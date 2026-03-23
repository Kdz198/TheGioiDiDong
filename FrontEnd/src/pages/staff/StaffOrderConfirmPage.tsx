import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CHECKOUT_PENDING_ORDER_CODE_KEY,
  STAFF_CHECKOUT_LAST_RESULT_KEY,
  STAFF_CHECKOUT_PENDING_CONTEXT_KEY,
} from "@/constants/checkout.const";
import type {
  StaffPaymentResultContext,
  StaffPendingCheckoutContext,
} from "@/interfaces/staff-checkout.types";
import { ROUTES } from "@/router/routes.const";
import { checkoutService } from "@/services/checkoutService";
import {
  calculatePromotionDiscount,
  promotionService,
  validatePromotionForCheckout,
} from "@/services/promotionService";
import { formatVND } from "@/utils/formatPrice";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

function getReadableError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function readPendingCheckoutContext(): StaffPendingCheckoutContext | null {
  const raw = sessionStorage.getItem(STAFF_CHECKOUT_PENDING_CONTEXT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StaffPendingCheckoutContext;
  } catch {
    return null;
  }
}

export function StaffOrderConfirmPage() {
  const navigate = useNavigate();
  const [pendingContext] = useState<StaffPendingCheckoutContext | null>(() =>
    readPendingCheckoutContext()
  );

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(0);

  const previewTotal = useMemo(() => {
    if (!pendingContext) return 0;
    return Math.max(pendingContext.basePrice - promoDiscountAmount, 0);
  }, [pendingContext, promoDiscountAmount]);

  const applyPromoMutation = useMutation({
    mutationFn: async () => {
      if (!pendingContext) {
        throw new Error("Không tìm thấy đơn hàng cần xác nhận");
      }

      const code = promoInput.trim();
      if (!code) throw new Error("Vui lòng nhập mã khuyến mãi");

      const promotion = await promotionService.getPromotionByCode(code);
      const validationMessage = validatePromotionForCheckout(promotion, pendingContext.basePrice);
      if (validationMessage) {
        throw new Error(validationMessage);
      }

      const discount = calculatePromotionDiscount(promotion, pendingContext.basePrice);
      return { code: promotion.code, discount };
    },
    onSuccess: ({ code, discount }) => {
      setAppliedPromoCode(code);
      setPromoDiscountAmount(discount);
      toast.success("Áp dụng mã khuyến mãi thành công");
    },
    onError: (error) => {
      toast.error(getReadableError(error, "Không thể áp dụng mã khuyến mãi"));
      setAppliedPromoCode(null);
      setPromoDiscountAmount(0);
    },
  });

  const makePaymentMutation = useMutation({
    mutationFn: async () => {
      if (!pendingContext) {
        throw new Error("Không tìm thấy đơn hàng cần thanh toán");
      }

      const paymentUrl = await checkoutService.makePaymentWithRetry(
        pendingContext.orderCode,
        appliedPromoCode ?? undefined,
        { attempts: 10, delayMs: 500 }
      );

      if (!paymentUrl) {
        throw new Error("Không nhận được URL thanh toán");
      }

      const paymentContext: StaffPaymentResultContext = {
        orderCode: pendingContext.orderCode,
        paymentUrl,
        promotionCode: appliedPromoCode ?? undefined,
        createdAt: new Date().toISOString(),
      };

      sessionStorage.setItem(CHECKOUT_PENDING_ORDER_CODE_KEY, pendingContext.orderCode);
      sessionStorage.setItem(STAFF_CHECKOUT_LAST_RESULT_KEY, JSON.stringify(paymentContext));
      return paymentUrl;
    },
    onSuccess: (paymentUrl) => {
      toast.success("Đang chuyển đến trang thanh toán...");
      window.location.assign(paymentUrl);
    },
    onError: (error) => {
      toast.error(getReadableError(error, "Thanh toán thất bại"));
    },
  });

  const clearPromo = () => {
    setAppliedPromoCode(null);
    setPromoDiscountAmount(0);
    setPromoInput("");
  };

  if (!pendingContext) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to={ROUTES.STAFF_ORDER_CREATE}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Xác nhận thanh toán</h1>
            <p className="text-sm text-gray-500">Không có dữ liệu đơn hàng để thanh toán</p>
          </div>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6 text-sm">
            <p className="text-amber-700">
              Phiên xác nhận đơn đã hết hạn hoặc chưa được khởi tạo. Vui lòng tạo đơn lại từ bước 1.
            </p>
            <Button
              className="bg-teal-500 hover:bg-teal-600"
              onClick={() => navigate(ROUTES.STAFF_ORDER_CREATE)}>
              Quay lại bước tạo đơn
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ROUTES.STAFF_ORDER_CREATE}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Xác nhận thanh toán</h1>
          <p className="text-sm text-gray-500">Bước 2: Nhập mã giảm giá và tiến hành thanh toán</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Thông tin đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Mã đơn</span>
              <span className="font-semibold text-zinc-900">{pendingContext.orderCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Người nhận</span>
              <span className="font-medium text-zinc-900">{pendingContext.recipientName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Số điện thoại</span>
              <span className="font-medium text-zinc-900">{pendingContext.phoneNumber}</span>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500">Địa chỉ</p>
              <p className="font-medium text-zinc-900">{pendingContext.address}</p>
            </div>
            {pendingContext.note ? (
              <div className="space-y-1">
                <p className="text-gray-500">Ghi chú</p>
                <p className="font-medium text-zinc-900">{pendingContext.note}</p>
              </div>
            ) : null}
            <p className="rounded-lg border border-teal-100 bg-teal-50 p-3 text-xs text-teal-700">
              paymentMethod sẽ gửi ẩn về BE với giá trị CASH.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mã khuyến mãi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={promoInput}
                onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
                placeholder="Nhập mã khuyến mãi"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => applyPromoMutation.mutate()}
                  disabled={applyPromoMutation.isPending}>
                  Áp mã
                </Button>
                <Button type="button" variant="ghost" className="flex-1" onClick={clearPromo}>
                  Bỏ mã
                </Button>
              </div>
              {appliedPromoCode ? (
                <p className="text-xs text-green-600">
                  Đã áp dụng: <span className="font-semibold">{appliedPromoCode}</span>
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tóm tắt thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Giá trước giảm</span>
                <span className="font-medium text-zinc-900">
                  {formatVND(pendingContext.basePrice)}
                </span>
              </div>
              <div className="flex items-center justify-between text-green-600">
                <span>Giảm giá</span>
                <span>- {formatVND(promoDiscountAmount)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2 text-base font-bold">
                <span>Tổng thanh toán dự kiến</span>
                <span className="text-teal-600">{formatVND(previewTotal)}</span>
              </div>

              <Button
                className="mt-3 w-full bg-teal-500 hover:bg-teal-600"
                onClick={() => makePaymentMutation.mutate()}
                disabled={makePaymentMutation.isPending}>
                {makePaymentMutation.isPending
                  ? "Đang chuyển đến thanh toán..."
                  : "Tiếp thanh toán"}
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link to={ROUTES.STAFF_ORDER_CREATE}>Quay lại chỉnh sửa đơn</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
