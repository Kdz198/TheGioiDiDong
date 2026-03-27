import { Button } from "@/components/ui/button";
import { CHECKOUT_PENDING_ORDER_CODE_KEY } from "@/constants/checkout.const";
import { ROUTES } from "@/router/routes.const";
import { orderService } from "@/services/orderService";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { extractAccountIdFromToken } from "@/utils/authToken";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export function OrderSuccessPage() {
  const clearCart = useCartStore((s) => s.clearCart);
  const token = useAuthStore((s) => s.token);
  const [searchParams] = useSearchParams();
  const orderCodeFromUrl = searchParams.get("orderCode")?.trim() ?? "";
  const paymentStatusFromUrl = searchParams.get("status")?.trim().toLowerCase() ?? "";
  const [verificationNote, setVerificationNote] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const verifyAndClearCart = async () => {
      const isPaymentSuccessFromGateway =
        paymentStatusFromUrl === "paid" || paymentStatusFromUrl === "success";

      if (isPaymentSuccessFromGateway) {
        clearCart();
        sessionStorage.removeItem(CHECKOUT_PENDING_ORDER_CODE_KEY);
        if (active) {
          setVerificationNote(null);
        }
        return;
      }

      const orderCodeFromSession = sessionStorage.getItem(CHECKOUT_PENDING_ORDER_CODE_KEY)?.trim();
      const orderCode = orderCodeFromUrl || orderCodeFromSession;

      if (!orderCode) {
        if (active) {
          setVerificationNote("Chưa tìm thấy orderCode để đối chiếu kết quả thanh toán.");
        }
        return;
      }

      const userId = extractAccountIdFromToken(token);
      if (!userId) {
        if (active) {
          setVerificationNote("Không xác định được accountId từ token để xác minh đơn hàng.");
        }
        return;
      }

      try {
        const orders = await orderService.getOrdersByUserId(userId);
        const matchedOrder = orders.find((order) => order.orderCode === orderCode);

        if (!matchedOrder) {
          if (active) {
            setVerificationNote("");
          }
          return;
        }

        if (matchedOrder.status.toLowerCase() !== "paid") {
          if (active) {
            setVerificationNote(
              "Trạng thái thanh toán chưa xác nhận paid, giỏ hàng được giữ nguyên để tránh xóa sai."
            );
          }
          return;
        }

        clearCart();
        sessionStorage.removeItem(CHECKOUT_PENDING_ORDER_CODE_KEY);
        if (active) {
          setVerificationNote(null);
        }
      } catch {
        if (active) {
          setVerificationNote(
            "Không thể xác minh kết quả thanh toán lúc này, giỏ hàng được giữ nguyên."
          );
        }
      }
    };

    void verifyAndClearCart();
    return () => {
      active = false;
    };
  }, [clearCart, orderCodeFromUrl, paymentStatusFromUrl, token]);

  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
      <CheckCircle className="mb-6 h-20 w-20 text-teal-500" />
      <h1 className="text-3xl font-bold text-zinc-900">Đặt hàng thành công!</h1>
      <p className="mt-3 max-w-md text-gray-500">
        Cảm ơn bạn đã đặt hàng tại TechGear. Chúng tôi sẽ xử lý đơn hàng và thông báo cho bạn sớm
        nhất.
      </p>
      <p className="mt-2 text-sm text-gray-400">Thời gian giao hàng dự kiến: 2-5 ngày</p>
      {verificationNote && <p className="mt-2 text-sm text-amber-600">{verificationNote}</p>}
      <div className="mt-8 flex gap-4">
        <Button asChild className="bg-teal-500 hover:bg-teal-600">
          <Link to={ROUTES.ORDER_HISTORY}>Theo dõi đơn hàng</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={ROUTES.HOME}>Tiếp tục mua sắm</Link>
        </Button>
      </div>
    </div>
  );
}
