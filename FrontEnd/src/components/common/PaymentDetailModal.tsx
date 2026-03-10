import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ApiPayment } from "@/interfaces/payment.types";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { X } from "lucide-react";

interface PaymentDetailModalProps {
  payment: ApiPayment | null;
  open: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ xử lý", className: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "Thành công", className: "bg-green-100 text-green-700" },
  FAILED: { label: "Thất bại", className: "bg-red-100 text-red-600" },
};

const METHOD_LABELS: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  momo: "Ví MoMo",
  vnpay: "VNPay",
};

export function PaymentDetailModal({ payment, open, onClose }: PaymentDetailModalProps) {
  if (!payment) return null;

  const statusInfo = STATUS_LABELS[payment.status] ?? {
    label: payment.status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Chi tiết thanh toán #{payment.id}</DialogTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <span className="text-sm text-gray-500">Trạng thái</span>
            <Badge className={`${statusInfo.className} border-0 font-medium`}>
              {statusInfo.label}
            </Badge>
          </div>

          {/* Payment info */}
          <div className="divide-y rounded-lg border">
            <Row label="Mã giao dịch" value={payment.transactionCode ?? "—"} />
            <Row
              label="Phương thức"
              value={METHOD_LABELS[payment.paymentMethod] ?? payment.paymentMethod}
            />
            <Row
              label="Số tiền"
              value={
                <span className="font-semibold text-teal-600">{formatVND(payment.amount)}</span>
              }
            />
            <Row label="Ngày thanh toán" value={formatDate(payment.date)} />
          </div>

          {/* Promotion */}
          {payment.promotion && (
            <div className="space-y-1 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-xs font-medium text-green-700">Khuyến mãi áp dụng</p>
              <p className="text-sm font-semibold text-green-800">
                {payment.promotion.code} — {payment.promotion.description}
              </p>
            </div>
          )}

          {/* Linked order */}
          {payment.order && (
            <div className="divide-y rounded-lg border">
              <div className="px-4 py-2">
                <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Đơn hàng liên kết
                </span>
              </div>
              <Row label="Mã đơn" value={payment.order.orderCode ?? `#${payment.order.id}`} />
              <Row label="Trạng thái đơn" value={payment.order.status} />
              {payment.order.totalPrice != null && (
                <Row label="Tổng đơn" value={formatVND(payment.order.totalPrice)} />
              )}
              {payment.order.orderDate && (
                <Row label="Ngày đặt" value={formatDate(payment.order.orderDate)} />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-zinc-900">{value}</span>
    </div>
  );
}
