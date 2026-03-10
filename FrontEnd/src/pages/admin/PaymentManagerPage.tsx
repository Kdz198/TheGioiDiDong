import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiPayment } from "@/interfaces/payment.types";
import { paymentService } from "@/services/paymentService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PaymentManagerPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailPayment, setDetailPayment] = useState<ApiPayment | null>(null);

  const { data: payments } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: paymentService.getAllPayments,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => paymentService.updatePaymentStatus(id, "COMPLETED"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      toast.success("Đã xác nhận thanh toán COD");
    },
    onError: () => toast.error("Xác nhận thất bại"),
  });

  const filtered = payments?.filter((p) => statusFilter === "all" || p.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý thanh toán</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
            <SelectItem value="COMPLETED">Đã thanh toán</SelectItem>
            <SelectItem value="FAILED">Thất bại</SelectItem>
            <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">ID Đơn</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Phương thức</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Số tiền</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ngày</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">#{payment.order.id}</td>
                    <td className="px-4 py-3 text-gray-600 uppercase">{payment.paymentMethod}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatVND(payment.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          payment.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : payment.status === "REFUNDED"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-red-100 text-red-700"
                        }>
                        {payment.status === "COMPLETED"
                          ? "Đã thanh toán"
                          : payment.status === "PENDING"
                            ? "Chờ thanh toán"
                            : payment.status === "REFUNDED"
                              ? "Đã hoàn tiền"
                              : "Thất bại"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(payment.date)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-teal-500"
                          onClick={() => setDetailPayment(payment)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.paymentMethod === "cod" && payment.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={confirmMutation.isPending}
                            onClick={() => confirmMutation.mutate(payment.id)}>
                            Xác nhận nhận tiền
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!detailPayment} onOpenChange={(open) => !open && setDetailPayment(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
          </DialogHeader>
          {detailPayment && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">Mã đơn hàng</p>
                <p className="font-medium text-zinc-900">
                  {detailPayment.order.orderCode ?? `#${detailPayment.order.id}`}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Phương thức thanh toán</p>
                <p className="font-medium text-zinc-900 uppercase">{detailPayment.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-400">Số tiền</p>
                <p className="font-medium text-red-400">{formatVND(detailPayment.amount)}</p>
              </div>
              <div>
                <p className="text-gray-400">Trạng thái</p>
                <Badge
                  className={
                    detailPayment.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : detailPayment.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : detailPayment.status === "REFUNDED"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-red-100 text-red-700"
                  }>
                  {detailPayment.status === "COMPLETED"
                    ? "Đã thanh toán"
                    : detailPayment.status === "PENDING"
                      ? "Chờ thanh toán"
                      : detailPayment.status === "REFUNDED"
                        ? "Đã hoàn tiền"
                        : "Thất bại"}
                </Badge>
              </div>
              <div>
                <p className="text-gray-400">Ngày thanh toán</p>
                <p className="text-gray-700">{formatDate(detailPayment.date)}</p>
              </div>
              {detailPayment.transactionCode && (
                <div>
                  <p className="text-gray-400">Mã giao dịch</p>
                  <p className="font-mono text-gray-700">{detailPayment.transactionCode}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
