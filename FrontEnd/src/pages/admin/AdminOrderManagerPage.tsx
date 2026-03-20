import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { PaymentDetailModal } from "@/components/common/PaymentDetailModal";
import { PaginationControl } from "@/components/shared/PaginationControl";
import { SortButton, type SortDirection } from "@/components/shared/SortButton";
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
import { ORDER_STATUS_FILTER_OPTIONS } from "@/constants/order.const";
import { usePagination } from "@/hooks/usePagination";
import type { ApiPayment } from "@/interfaces/payment.types";
import { ROUTES } from "@/router/routes.const";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Eye, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export function AdminOrderManagerPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingPayment, setViewingPayment] = useState<ApiPayment | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", statusFilter],
    queryFn: () =>
      orderService.getAllOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    select: (d) => ({ ...d, data: [...(d.data ?? [])].sort((a, b) => b.id - a.id) }),
  });

  const { data: paymentsData } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: () => paymentService.getAllPayments(),
  });

  const paymentsByOrderId = useMemo(() => {
    const map = new Map<number, ApiPayment>();
    (paymentsData ?? []).forEach((p) => {
      if (p.order?.id) map.set(p.order.id, p);
    });
    return map;
  }, [paymentsData]);

  const [orderSortField, setOrderSortField] = useState<"createdAt" | "total">("createdAt");
  const [orderSortDir, setOrderSortDir] = useState<SortDirection>("none");
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const orders = data?.data ?? [];
    let result = orders.filter((order) =>
      search
        ? (order.orderCode ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (order.userName ?? "").toLowerCase().includes(search.toLowerCase())
        : true
    );
    if (orderSortDir !== "none") {
      result = [...result].sort((a, b) => {
        if (orderSortField === "createdAt") {
          const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          return orderSortDir === "asc" ? diff : -diff;
        } else {
          const diff = a.total - b.total;
          return orderSortDir === "asc" ? diff : -diff;
        }
      });
    }
    return result;
  }, [data, search, orderSortField, orderSortDir]);

  const orderPagination = usePagination({ totalCount: filtered.length, pageSize });
  const pageOrders = filtered.slice(orderPagination.startIndex, orderPagination.endIndex + 1);

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
            {ORDER_STATUS_FILTER_OPTIONS.map((opt) => (
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
                  <th className="px-4 py-3 font-medium text-gray-500">Khách hàng</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Giá gốc</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">
                    <SortButton
                      direction={orderSortField === "total" ? orderSortDir : "none"}
                      onChange={(dir) => {
                        setOrderSortField("total");
                        setOrderSortDir(dir);
                      }}
                      className="ml-auto">
                      Tổng tiền
                    </SortButton>
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    <SortButton
                      direction={orderSortField === "createdAt" ? orderSortDir : "none"}
                      onChange={(dir) => {
                        setOrderSortField("createdAt");
                        setOrderSortDir(dir);
                      }}>
                      Ngày đặt
                    </SortButton>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>
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
                  : pageOrders.map((order) => {
                      return (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link
                              to={ROUTES.ADMIN_ORDER_DETAIL.replace(":orderId", String(order.id))}
                              className="font-medium text-teal-500 hover:underline">
                              {order.orderCode ?? `#${order.id}`}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{order.userName ?? "—"}</td>
                          <td className="px-4 py-3 text-right text-gray-500 line-through">
                            {order.subtotal > 0 ? formatVND(order.subtotal) : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatVND(order.total ?? 0)}
                          </td>
                          <td className="px-4 py-3">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {order.createdAt ? formatDate(order.createdAt) : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-teal-500"
                                asChild>
                                <Link
                                  to={ROUTES.ADMIN_ORDER_DETAIL.replace(
                                    ":orderId",
                                    String(order.id)
                                  )}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              {paymentsByOrderId.has(order.id) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-indigo-400"
                                  onClick={() =>
                                    setViewingPayment(paymentsByOrderId.get(order.id)!)
                                  }>
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              )}
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
      <PaginationControl
        pagination={orderPagination}
        onPageSizeChange={(size) => {
          setPageSize(size);
          orderPagination.goToFirstPage();
        }}
      />
      <PaymentDetailModal
        payment={viewingPayment}
        open={viewingPayment !== null}
        onClose={() => setViewingPayment(null)}
      />
    </div>
  );
}
