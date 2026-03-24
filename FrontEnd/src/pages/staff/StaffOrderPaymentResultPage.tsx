import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  STAFF_CHECKOUT_LAST_RESULT_KEY,
  STAFF_CHECKOUT_PENDING_CONTEXT_KEY,
} from "@/constants/checkout.const";
import type { StaffPaymentResultContext } from "@/interfaces/staff-checkout.types";
import { ROUTES } from "@/router/routes.const";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

function readPaymentResultContext(): StaffPaymentResultContext | null {
  const raw = sessionStorage.getItem(STAFF_CHECKOUT_LAST_RESULT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StaffPaymentResultContext;
  } catch {
    return null;
  }
}

export function StaffOrderPaymentResultPage() {
  const [searchParams] = useSearchParams();
  const status = (searchParams.get("status") || "").toLowerCase();
  const orderCodeFromQuery = searchParams.get("orderCode") || "";
  const localResult = useMemo(() => readPaymentResultContext(), []);

  const orderCode = orderCodeFromQuery || localResult?.orderCode || "-";
  const isSuccess = status === "success" || status === "paid";

  const statusText = isSuccess
    ? "Thanh toán đã được xác nhận thành công."
    : "Chưa xác minh được trạng thái thanh toán từ cổng thanh toán.";

  const statusHint = isSuccess
    ? "Bạn có thể kiểm tra lại tại trang quản lý đơn hàng staff."
    : "Bạn có thể kiểm tra lại danh sách đơn hàng hoặc thực hiện lại thanh toán nếu cần.";

  const clearContext = () => {
    sessionStorage.removeItem(STAFF_CHECKOUT_PENDING_CONTEXT_KEY);
    sessionStorage.removeItem(STAFF_CHECKOUT_LAST_RESULT_KEY);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Kết quả thanh toán</h1>
        <p className="text-sm text-gray-500">
          Bước 3: Theo dõi kết quả sau khi trở về từ cổng thanh toán
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trạng thái giao dịch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <CircleAlert className="h-5 w-5 text-amber-600" />
            )}
            <span className={isSuccess ? "text-green-700" : "text-amber-700"}>{statusText}</span>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Mã đơn hàng</p>
            <p className="font-semibold text-zinc-900">{orderCode}</p>
          </div>

          <p className="text-gray-600">{statusHint}</p>

          <div className="flex flex-wrap gap-2">
            <Button className="bg-teal-500 hover:bg-teal-600" onClick={clearContext} asChild>
              <Link to={ROUTES.STAFF_ORDERS}>Về quản lý đơn hàng</Link>
            </Button>
            <Button variant="outline" onClick={clearContext} asChild>
              <Link to={ROUTES.STAFF_ORDER_CREATE}>Tạo đơn mới</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
