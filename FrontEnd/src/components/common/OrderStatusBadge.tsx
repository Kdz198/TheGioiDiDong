import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/interfaces/order.types";

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Chờ xử lý", className: "bg-yellow-500 text-white" },
  paid: { label: "Đã thanh toán", className: "bg-green-600 text-white" },
  canceled: { label: "Đã hủy", className: "bg-gray-400 text-white" },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const key = (status ?? "").toLowerCase();
  const config = statusConfig[key] ?? {
    label: status ?? "—",
    className: "bg-gray-200 text-gray-700",
  };
  return <Badge className={config.className}>{config.label}</Badge>;
}
