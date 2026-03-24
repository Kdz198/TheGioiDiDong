import { Button } from "@/components/ui/button";
import { CHECKOUT_PENDING_ORDER_CODE_KEY } from "@/constants/checkout.const";
import { ROUTES } from "@/router/routes.const";
import { paymentService } from "@/services/paymentService";
import { useCartStore } from "@/stores/cartStore";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export function OrderCancelPage() {
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionCode = searchParams.get("orderCode")?.trim() ?? "";
  const [resolvedOrderCode, setResolvedOrderCode] = useState("");
  const [isResolvingOrderCode, setIsResolvingOrderCode] = useState(Boolean(transactionCode));
  const [resolveNote, setResolveNote] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const orderCodeFromSession =
      sessionStorage.getItem(CHECKOUT_PENDING_ORDER_CODE_KEY)?.trim() ?? "";

    const resolveOrderCode = async () => {
      if (!transactionCode) {
        if (active) {
          setResolvedOrderCode(orderCodeFromSession);
          setIsResolvingOrderCode(false);
        }
        sessionStorage.removeItem(CHECKOUT_PENDING_ORDER_CODE_KEY);
        return;
      }

      try {
        const orderCode = (
          await paymentService.getOrderCodeByTransactionCode(transactionCode)
        ).trim();
        console.log("Resolved order code from transaction:", { transactionCode, orderCode });
        if (active) {
          setResolvedOrderCode(orderCode || orderCodeFromSession);
          if (!orderCode && orderCodeFromSession) {
            setResolveNote("Không thể đổi mã đơn qua giao dịch, đang dùng mã đơn trong phiên.");
          }
        }
      } catch {
        if (active) {
          setResolvedOrderCode(orderCodeFromSession);
          if (orderCodeFromSession) {
            setResolveNote(
              "Không thể lấy mã đơn từ giao dịch PayOS, đang dùng mã đơn trong phiên."
            );
          }
        }
      } finally {
        if (active) {
          setIsResolvingOrderCode(false);
        }
        // Clear pending orderCode to avoid stale fallback on result pages.
        sessionStorage.removeItem(CHECKOUT_PENDING_ORDER_CODE_KEY);
      }
    };

    void resolveOrderCode();

    return () => {
      active = false;
    };
  }, [transactionCode]);

  const retryCheckoutUrl = resolvedOrderCode
    ? `${ROUTES.CHECKOUT}?orderCode=${encodeURIComponent(resolvedOrderCode)}`
    : ROUTES.CART;
  const handleOrderOtherItems = () => {
    clearCart();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
      <AlertTriangle className="mb-6 h-20 w-20 text-amber-500" />
      <h1 className="text-3xl font-bold text-zinc-900">Thanh toán chưa hoàn tất</h1>
      <p className="mt-3 max-w-md text-gray-500">
        Giao dịch đã bị hủy hoặc chưa hoàn thành. Đơn hàng của bạn chưa được ghi nhận thanh toán.
      </p>
      {resolvedOrderCode && (
        <p className="mt-2 text-sm text-gray-400">
          Mã đơn hàng: <span className="font-medium text-zinc-600">{resolvedOrderCode}</span>
        </p>
      )}
      {isResolvingOrderCode && (
        <p className="mt-2 text-sm text-gray-400">Đang đồng bộ mã đơn từ giao dịch PayOS...</p>
      )}
      {resolveNote && <p className="mt-2 text-sm text-amber-600">{resolveNote}</p>}
      <div className="mt-8 flex gap-4">
        <Button asChild className="bg-amber-500 hover:bg-amber-600">
          <Link to={retryCheckoutUrl}>Thử thanh toán lại</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={ROUTES.CART}>Quay lại giỏ hàng</Link>
        </Button>
        <Button type="button" variant="outline" onClick={handleOrderOtherItems}>
          Đặt mặt hàng khác
        </Button>
      </div>
    </div>
  );
}
