import { useMutationHandler } from "@/hooks/useMutationHandler";
import type { PaginatedResponse } from "@/interfaces/api.types";
import type { Order, PaymentMethod, ShippingInfo } from "@/interfaces/order.types";
import { orderService } from "@/services/orderService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface UseOrdersParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export function useOrders(params: UseOrdersParams = {}) {
  return useQuery<PaginatedResponse<Order>>({
    queryKey: ["orders", params],
    queryFn: () => orderService.getOrders(params),
  });
}

export function useOrderDetail(orderId: number) {
  return useQuery<Order>({
    queryKey: ["orders", "detail", orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: orderId > 0,
  });
}

interface CreateOrderData {
  shippingInfo: ShippingInfo;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
  pointsUsed?: number;
  notes?: string;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutationHandler<Order, CreateOrderData>({
    mutationFn: (data) => orderService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    successMessage: "Đặt hàng thành công!",
    errorMessage: "Không thể tạo đơn hàng",
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutationHandler<Order, { orderId: number; reason: string }>({
    mutationFn: ({ orderId, reason }) => orderService.cancelOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    successMessage: "Đã hủy đơn hàng thành công",
    errorMessage: "Không thể hủy đơn hàng",
  });
}
