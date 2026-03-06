import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderService } from "@/services/orderService";
import { reportService } from "@/services/reportService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, DollarSign, Package, ShoppingCart, Users } from "lucide-react";

export function DashboardPage() {
  const { data: kpi } = useQuery({
    queryKey: ["admin", "kpi"],
    queryFn: reportService.getDashboardKPI,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["admin", "recent-orders"],
    queryFn: () => orderService.getAllOrders({ pageSize: 10 }),
  });

  const kpiCards = [
    {
      title: "Doanh thu hôm nay",
      value: kpi ? formatVND(kpi.totalRevenue) : "...",
      growth: kpi?.revenueGrowthPercent,
      icon: DollarSign,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Đơn hàng mới",
      value: kpi?.totalOrders?.toString() || "...",
      growth: kpi?.orderGrowthPercent,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Khách hàng mới",
      value: kpi?.newCustomers?.toString() || "...",
      icon: Users,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      title: "Đơn chờ xử lý",
      value: kpi?.pendingOrders?.toString() || "...",
      icon: Package,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Tổng quan</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-3 ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-xl font-bold text-zinc-900">{card.value}</p>
                {card.growth !== undefined && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs ${card.growth >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {card.growth >= 0 ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {Math.abs(card.growth)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
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
                {recentOrders?.data.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 font-medium text-zinc-900">{order.orderCode}</td>
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

      {kpi && kpi.lowStockProducts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 p-4">
            <Package className="h-5 w-5 text-orange-500" />
            <p className="text-sm text-orange-700">
              Có <strong>{kpi.lowStockProducts}</strong> sản phẩm sắp hết hàng (số lượng &lt; 10)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
