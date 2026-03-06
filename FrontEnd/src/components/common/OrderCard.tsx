import type { Order } from "@/interfaces/order.types";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      to={`/orders/${order.id}`}
      className="block rounded-lg border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-900">{order.orderCode}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs text-gray-500">
            {formatDate(order.createdAt)} · {order.items.length} sản phẩm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-900">{formatVND(order.total)}</span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}
