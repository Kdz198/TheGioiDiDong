import { Button } from "@/components/ui/button";
import { CHECKOUT_PENDING_ORDER_CODE_KEY } from "@/constants/checkout.const";
import { ROUTES } from "@/router/routes.const";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

export function OrderCancelPage() {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("orderCode")?.trim() ?? "";

  useEffect(() => {
    // User returned from payment provider with a cancel/fail signal.
    // Clear pending orderCode to avoid stale fallback on result pages.
    sessionStorage.removeItem(CHECKOUT_PENDING_ORDER_CODE_KEY);
  }, []);

  const retryCheckoutUrl = orderCode
    ? `${ROUTES.CHECKOUT}?orderCode=${encodeURIComponent(orderCode)}`
    : ROUTES.CART;

  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
      <AlertTriangle className="mb-6 h-20 w-20 text-amber-500" />
      <h1 className="text-3xl font-bold text-zinc-900">Thanh toán chưa hoàn tất</h1>
      <p className="mt-3 max-w-md text-gray-500">
        Giao dịch đã bị hủy hoặc chưa hoàn thành. Đơn hàng của bạn chưa được ghi nhận thanh toán.
      </p>
      {orderCode && (
        <p className="mt-2 text-sm text-gray-400">
          Mã đơn hàng: <span className="font-medium text-zinc-600">{orderCode}</span>
        </p>
      )}
      <div className="mt-8 flex gap-4">
        <Button asChild className="bg-amber-500 hover:bg-amber-600">
          <Link to={retryCheckoutUrl}>Thử thanh toán lại</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={ROUTES.CART}>Quay lại giỏ hàng</Link>
        </Button>
      </div>
    </div>
  );
}
