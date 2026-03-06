import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderService } from "@/services/orderService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function StaffOrderManagerPage() {
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["staff", "orders", statusFilter],
    queryFn: () =>
      orderService.getAllOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const filteredOrders = data?.data.filter((order) =>
    search
      ? order.orderCode.toLowerCase().includes(search.toLowerCase()) ||
        order.shippingInfo.recipientName.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Quản lý đơn hàng</h1>

      <div className="flex flex-wrap gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm đơn hàng..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ xử lý</SelectItem>
            <SelectItem value="paid">Đã thanh toán</SelectItem>
            <SelectItem value="canceled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Mã đơn</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Khách hàng</th>
                  <th className="px-4 py-3 font-medium text-gray-500">SĐT</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Thanh toán</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Tổng tiền</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={7} className="px-4 py-3">
                          <div className="h-10 animate-pulse rounded bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  : filteredOrders?.map((order) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link
                            to={`/staff/orders/${order.id}`}
                            className="font-medium text-teal-500 hover:underline">
                            {order.orderCode}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {order.shippingInfo.recipientName}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{order.shippingInfo.phone}</td>
                        <td className="px-4 py-3 text-gray-600 uppercase">{order.paymentMethod}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatVND(order.total)}
                        </td>
                        <td className="px-4 py-3">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(order.createdAt)}</td>
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
