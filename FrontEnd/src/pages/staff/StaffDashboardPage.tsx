import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/router/routes.const";
import { orderService } from "@/services/orderService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Package, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export function StaffDashboardPage() {
  const { data: orders } = useQuery({
    queryKey: ["staff", "orders"],
    queryFn: () => orderService.getAllOrders({ pageSize: 10 }),
  });

  const pendingCount = orders?.data.filter((o) => o.status === "pending").length || 0;
  const paidCount = orders?.data.filter((o) => o.status === "paid").length || 0;

  const summaryCards = [
    {
      title: "Đơn chờ xử lý",
      value: pendingCount,
      icon: Package,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      title: "Đơn đã thanh toán",
      value: paidCount,
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Phản hồi chưa xử lý",
      value: 1,
      icon: MessageSquare,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Tổng quan</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-3 ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-zinc-900">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <Link to={ROUTES.STAFF_ORDERS} className="text-sm text-teal-500 hover:underline">
              Xem tất cả
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">Mã đơn</th>
                  <th className="pb-3 font-medium text-gray-500">Khách hàng</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Tổng tiền</th>
                  <th className="pb-3 font-medium text-gray-500">Trạng thái</th>
                  <th className="pb-3 font-medium text-gray-500">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {orders?.data.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3">
                      <Link
                        to={`/staff/orders/${order.id}`}
                        className="font-medium text-teal-500 hover:underline">
                        {order.orderCode}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-600">{order.shippingInfo.recipientName}</td>
                    <td className="py-3 text-right font-medium">{formatVND(order.total)}</td>
                    <td className="py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3 text-gray-400">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
