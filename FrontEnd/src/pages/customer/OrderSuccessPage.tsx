import { Button } from "@/components/ui/button";
import { ROUTES } from "@/router/routes.const";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function OrderSuccessPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
      <CheckCircle className="mb-6 h-20 w-20 text-teal-500" />
      <h1 className="text-3xl font-bold text-zinc-900">Đặt hàng thành công!</h1>
      <p className="mt-3 max-w-md text-gray-500">
        Cảm ơn bạn đã đặt hàng tại TechGear. Chúng tôi sẽ xử lý đơn hàng và thông báo cho bạn sớm
        nhất.
      </p>
      <p className="mt-2 text-sm text-gray-400">Thời gian giao hàng dự kiến: 2-5 ngày</p>
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
