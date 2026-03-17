import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { orderService } from "@/services/orderService";
// Đảm bảo bạn import đúng đường dẫn format tiền và ngày tháng của dự án
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package, Receipt, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

// Hàm helper để render màu sắc trạng thái đồng bộ với trang History
const getStatusColor = (status: string) => {
  switch (status) {
    case "PAID":
      return "text-green-600 bg-green-50 border-green-200";
    case "CANCELED":
      return "text-red-600 bg-red-50 border-red-200";
    case "PENDING":
      return "text-amber-600 bg-amber-50 border-amber-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "PAID":
      return "Đã thanh toán";
    case "CANCELED":
      return "Đã hủy";
    case "PENDING":
      return "Chờ xử lý";
    default:
      return status;
  }
};

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getAppOrderById(Number(orderId)),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto min-h-screen bg-[#f1f1f1] px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-gray-100 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto min-h-screen bg-[#f1f1f1] px-4 py-16 text-center">
        <p className="mb-4 text-lg text-gray-500">
          Đơn hàng không tồn tại hoặc bạn không có quyền xem.
        </p>
        <Button asChild className="bg-teal-500 hover:bg-teal-600">
          <Link to="/orders">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  // Chức năng hủy đơn hàng (giả định API backend đã hỗ trợ)
  const handleCancel = async () => {
    try {
      // Nếu API backend yêu cầu gọi endpoint hủy, thay thế hàm này cho phù hợp
      await orderService.cancelOrder(order.id, "Khách hàng hủy đơn");
      toast.success("Đã yêu cầu hủy đơn hàng thành công!");
      // Có thể gọi refetch ở đây để cập nhật lại trạng thái
    } catch {
      toast.error("Không thể hủy đơn hàng lúc này.");
    }
  };

  // Tính toán số tiền giảm giá (nếu có)
  const discountAmount =
    order.basePrice > order.totalPrice ? order.basePrice - order.totalPrice : 0;

  return (
    <div className="min-h-screen bg-[#f1f1f1] pb-12">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Link
          to="/orders"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách đơn hàng
        </Link>

        {/* HEADER ĐƠN HÀNG */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 uppercase">
              Đơn hàng: {order.orderCode}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Ngày đặt: {new Date(order.orderDate).toLocaleString("vi-VN")}
            </p>
          </div>
          <div
            className={`rounded-full border px-4 py-1.5 text-sm font-bold ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG & DANH SÁCH SẢN PHẨM */}
          <div className="space-y-6 lg:col-span-2">
            {/* Thông tin người đặt */}
            <Card className="border-none border-gray-100 shadow-sm">
              <CardHeader className="border-b border-gray-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5 text-teal-500" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm font-medium text-zinc-900">
                  Người đặt: <span className="font-normal text-gray-600">{order.userName}</span>
                </p>
              </CardContent>
            </Card>

            {/* Danh sách sản phẩm */}
            <Card className="overflow-hidden border-none border-gray-100 shadow-sm">
              <CardHeader className="border-b border-gray-50 bg-gray-50/50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-5 w-5 text-teal-500" />
                  Sản phẩm ({order.orderDetails.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {order.orderDetails.map((item) => (
                    <div
                      key={item.orderDetailId}
                      className="flex gap-4 p-4 transition-colors hover:bg-gray-50">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white p-1">
                        <img
                          src={item.imgUrl}
                          alt={item.productName}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="line-clamp-2 text-sm font-medium text-zinc-900">
                            {item.productName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 capitalize">
                            Phân loại: {item.type || "Mặc định"}
                          </p>
                        </div>
                        <div className="mt-2 flex items-end justify-between">
                          <p className="text-sm font-medium text-gray-500">SL: {item.quantity}</p>
                          <span className="text-sm font-bold text-red-500">
                            {formatVND(item.subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className="space-y-6">
            <Card className="sticky top-6 border-none border-gray-100 shadow-sm">
              <CardHeader className="border-b border-gray-50 bg-gray-50/50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-5 w-5 text-teal-500" />
                  Tóm tắt đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-medium">{formatVND(order.basePrice)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between font-medium text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}

                <Separator className="my-2 border-gray-100" />

                <div className="flex items-center justify-between text-base">
                  <span className="font-bold text-zinc-900">Tổng cộng</span>
                  <span className="text-xl font-bold text-red-500">
                    {formatVND(order.totalPrice)}
                  </span>
                </div>
                <p className="text-right text-[10px] text-gray-400">(Đã bao gồm VAT nếu có)</p>
              </CardContent>

              {/* Nút Hủy Đơn Hàng (Chỉ hiện khi PENDING) */}
              {order.status === "PENDING" && (
                <div className="p-4 pt-0">
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    onClick={handleCancel}>
                    Yêu cầu hủy đơn
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
