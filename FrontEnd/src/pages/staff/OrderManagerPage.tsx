import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/router/routes.const";
import { orderService } from "@/services/orderService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "CANCELED", label: "Đã hủy" },
];

export function OrderManagerPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [pendingStatus, setPendingStatus] = useState<Record<number, string>>({});
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["staff", "orders", statusFilter],
    queryFn: () =>
      orderService.getAllOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      orderService.updateOrderStatus(orderId, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff", "orders"] });
      toast.success("Cập nhật trạng thái thành công");
      setPendingStatus((prev) => {
        const next = { ...prev };
        delete next[variables.orderId];
        return next;
      });
      setUpdatingId(null);
    },
    onError: () => {
      toast.error("Cập nhật trạng thái thất bại");
      setUpdatingId(null);
    },
  });

  const orders = data?.data ?? [];
  const filtered = orders.filter((order) =>
    search
      ? (order.orderCode ?? "").toLowerCase().includes(search.toLowerCase()) ||
        String(order.userId ?? "").includes(search)
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
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
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
                  <th className="px-4 py-3 font-medium text-gray-500">User ID</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Tổng tiền</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ngày đặt</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Cập nhật TT</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-4 py-3">
                          <div className="h-10 animate-pulse rounded bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  : filtered.map((order) => {
                      const selectedStatus = pendingStatus[order.id] ?? "";
                      const isUpdating = updatingId === order.id && updateMutation.isPending;
                      return (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link
                              to={ROUTES.STAFF_ORDER_DETAIL.replace(":orderId", String(order.id))}
                              className="font-medium text-teal-500 hover:underline">
                              {order.orderCode ?? `#${order.id}`}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{order.userId ?? "—"}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatVND(order.total ?? 0)}
                          </td>
                          <td className="px-4 py-3">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {order.createdAt ? formatDate(order.createdAt) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-teal-500"
                                asChild>
                                <Link
                                  to={ROUTES.STAFF_ORDER_DETAIL.replace(
                                    ":orderId",
                                    String(order.id)
                                  )}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Select
                                value={selectedStatus}
                                onValueChange={(v) =>
                                  setPendingStatus((prev) => ({ ...prev, [order.id]: v }))
                                }>
                                <SelectTrigger className="h-8 w-36 text-xs">
                                  <SelectValue placeholder="Chọn TT" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                                  <SelectItem value="PAID">Đã thanh toán</SelectItem>
                                  <SelectItem value="CANCELED">Đã hủy</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                className="h-8 bg-teal-500 px-2 text-xs hover:bg-teal-600"
                                disabled={!selectedStatus || isUpdating}
                                onClick={() => {
                                  setUpdatingId(order.id);
                                  updateMutation.mutate({
                                    orderId: order.id,
                                    status: selectedStatus,
                                  });
                                }}>
                                {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Lưu"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
