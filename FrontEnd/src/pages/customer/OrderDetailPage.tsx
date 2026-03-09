import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { orderService } from "@/services/orderService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrderById(Number(orderId)),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-gray-500">Đơn hàng không tồn tại</p>
      </div>
    );
  }

  const handleCancel = async () => {
    try {
      await orderService.cancelOrder(order.id, "Khách hàng hủy đơn");
      toast.success("Đã hủy đơn hàng");
    } catch {
      toast.error("Không thể hủy đơn hàng");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-teal-500 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Quay lại đơn hàng
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{order.orderCode}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lịch sử đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory.map((h, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <CheckCircle
                        className={`h-5 w-5 ${i === 0 ? "text-teal-500" : "text-gray-300"}`}
                      />
                      {i < order.statusHistory.length - 1 && (
                        <div className="h-full w-0.5 bg-gray-200" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{h.note}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(h.timestamp)}
                        {h.updatedBy && ` · ${h.updatedBy}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.productName}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900">{item.productName}</p>
                    <p className="text-xs text-gray-400">
                      {item.variantLabel} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{formatVND(item.subtotal)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Giao hàng</CardTitle>
            </CardHeader>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tạm tính</span>
                <span>{formatVND(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatVND(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span>{order.shippingFee === 0 ? "Miễn phí" : formatVND(order.shippingFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Tổng cộng</span>
                <span className="text-red-400">{formatVND(order.total)}</span>
              </div>
              {order.pointsEarned > 0 && (
                <p className="text-xs text-teal-500">+{order.pointsEarned} điểm thưởng</p>
              )}
            </CardContent>
          </Card>

          {order.status === "pending" && (
            <Button
              variant="outline"
              className="w-full text-red-500 hover:bg-red-50"
              onClick={handleCancel}>
              Hủy đơn hàng
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
