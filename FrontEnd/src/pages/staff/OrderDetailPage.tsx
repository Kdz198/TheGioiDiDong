import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/router/routes.const";
import { orderService } from "@/services/orderService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["staff", "order", orderId],
    queryFn: () => orderService.getOrderById(Number(orderId)),
    enabled: !!orderId,
  });

  const updateMutation = useMutation({
    mutationFn: () => orderService.updateOrderStatus(Number(orderId), newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["staff", "orders"] });
      toast.success("Cập nhật trạng thái thành công");
      setNewStatus("");
    },
    onError: () => toast.error("Cập nhật trạng thái thất bại"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  if (!order) return <p className="text-gray-500">Đơn hàng không tồn tại</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ROUTES.STAFF_ORDERS}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {order.orderCode ?? `Đơn hàng #${order.id}`}
          </h1>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt ?? "")}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cập nhật trạng thái</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Trạng thái mới</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                <SelectItem value="CANCELED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="bg-teal-500 hover:bg-teal-600"
            disabled={!newStatus || updateMutation.isPending}
            onClick={() => updateMutation.mutate()}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cập nhật trạng thái
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chi tiết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items?.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {item.thumbnailUrl && (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.productName}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900">
                        {item.productName ?? `Sản phẩm #${item.productId}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.variantLabel ? `${item.variantLabel} × ` : ""}
                        SL: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{formatVND(item.subtotal)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">Không có chi tiết sản phẩm</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Mã đơn</span>
                <span>{order.orderCode ?? `#${order.id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">User ID</span>
                <span>{order.userId ?? "—"}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span>{formatVND(order.total ?? order.subtotal ?? 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
