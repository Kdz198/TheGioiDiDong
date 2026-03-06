import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { paymentService } from "@/services/paymentService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function StaffPaymentManagerPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: payments } = useQuery({
    queryKey: ["staff", "payments"],
    queryFn: paymentService.getAllPayments,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => paymentService.updatePaymentStatus(id, "COMPLETED"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "payments"] });
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
                      {payment.paymentMethod === "cod" && payment.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={confirmMutation.isPending}
                          onClick={() => confirmMutation.mutate(payment.id)}>
                          Xác nhận nhận tiền
                        </Button>
                      )}
                    </td>
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
