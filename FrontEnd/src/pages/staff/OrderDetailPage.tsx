import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { Badge } from "@/components/ui/badge";
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
import { ORDER_STATUS_UPDATE_OPTIONS } from "@/constants/order.const";
import type { ApiPayment } from "@/interfaces/payment.types";
import { ROUTES } from "@/router/routes.const";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Gift, Loader2, ShoppingCart, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";

/** Render a badge that clearly shows the line-item type (buy / gift / other) */
function ItemTypeBadge({ type }: { type?: string }) {
  if (!type) return null;
  if (type.toLowerCase() === "buy") {
    return (
      <Badge className="border-0 bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">
        <ShoppingCart className="mr-1 h-3 w-3" />
        Mua
      </Badge>
    );
  }
  if (type.toLowerCase() === "gift") {
    return (
      <Badge className="border-0 bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-700">
        <Gift className="mr-1 h-3 w-3" />
        Tặng kèm
      </Badge>
    );
  }
  return <Badge className="border-0 bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{type}</Badge>;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  momo: "Ví MoMo",
  vnpay: "VNPay",
  PAYOS: "PayOS",
};

const PAYMENT_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ xử lý", className: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "Thành công", className: "bg-green-100 text-green-700" },
  FAILED: { label: "Thất bại", className: "bg-red-100 text-red-600" },
};

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const isAdminContext = location.pathname.startsWith("/admin");
  const ordersRoute = isAdminContext ? ROUTES.ADMIN_ORDERS : ROUTES.STAFF_ORDERS;
  const queryPrefix = isAdminContext ? "admin" : "staff";
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: [queryPrefix, "order", orderId],
    queryFn: () => orderService.getOrderById(Number(orderId)),
    enabled: !!orderId,
  });

  const { data: allPayments = [] } = useQuery({
    queryKey: [queryPrefix, "payments"],
    queryFn: () => paymentService.getAllPayments(),
    enabled: !!orderId,
  });

  const payment: ApiPayment | undefined = useMemo(
    () => allPayments.find((p) => p.order?.id === Number(orderId)),
    [allPayments, orderId]
  );

  const updateMutation = useMutation({
    mutationFn: () => orderService.updateOrderStatus(Number(orderId), newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryPrefix, "order", orderId] });
      queryClient.invalidateQueries({ queryKey: [queryPrefix, "orders"] });
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

  const hasDiscount = order.discountAmount > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ordersRoute}>
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

      {/* Status update */}
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
                {ORDER_STATUS_UPDATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
        {/* Left: order items */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chi tiết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {order.items?.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
                    {item.thumbnailUrl && (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.productName}
                        className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900">
                        {item.productName ?? `Sản phẩm #${item.productId}`}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <ItemTypeBadge type={item.variantLabel} />
                        <span className="text-xs text-gray-500">SL: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-sm font-semibold text-zinc-900">
                      {formatVND(item.subtotal)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">Không có chi tiết sản phẩm</p>
              )}
            </CardContent>
          </Card>

          {/* Payment details (if available) */}
          {payment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4 text-indigo-400" />
                  Thông tin thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Trạng thái thanh toán</span>
                  <Badge
                    className={`border-0 ${(PAYMENT_STATUS_LABELS[payment.status] ?? { className: "bg-gray-100 text-gray-600" }).className}`}>
                    {(PAYMENT_STATUS_LABELS[payment.status] ?? { label: payment.status }).label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Phương thức</span>
                  <span className="font-medium">
                    {PAYMENT_METHOD_LABELS[payment.paymentMethod] ?? payment.paymentMethod}
                  </span>
                </div>
                {payment.transactionCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Mã giao dịch</span>
                    <span className="font-mono text-xs">{payment.transactionCode}</span>
                  </div>
                )}
                {payment.date && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Ngày thanh toán</span>
                    <span>{formatDate(payment.date)}</span>
                  </div>
                )}
                {payment.promotion && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
                    <Tag className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-700">
                      Khuyến mãi: {payment.promotion.code} — {payment.promotion.description}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {((order.orderInfo?.length ?? 0) > 0 || order.note) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin nhận hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {(order.orderInfo ?? []).map((info, index) => (
                  <div key={`${info.recipientName}-${index}`} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Người nhận</span>
                      <span className="font-medium text-zinc-900">{info.recipientName || "—"}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-gray-500">Số điện thoại</span>
                      <span className="font-medium text-zinc-900">{info.phoneNumber || "—"}</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-500">Địa chỉ</p>
                      <p className="mt-1 font-medium text-zinc-900">{info.address || "—"}</p>
                    </div>
                  </div>
                ))}

                {order.note && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                    <p className="text-xs text-blue-600">Ghi chú đơn hàng</p>
                    <p className="mt-1 text-sm font-medium text-blue-800">{order.note}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: order summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Mã đơn</span>
                <span className="font-mono text-xs">{order.orderCode ?? `#${order.id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Khách hàng</span>
                <span className="font-medium">{order.userName ?? "—"}</span>
              </div>
              <Separator />
              {order.subtotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Giá gốc</span>
                  <span className={hasDiscount ? "text-gray-400 line-through" : ""}>
                    {formatVND(order.subtotal)}
                  </span>
                </div>
              )}
              {hasDiscount && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>- {formatVND(order.discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Tổng cộng</span>
                <span className="text-teal-600">
                  {formatVND(order.total ?? order.subtotal ?? 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
