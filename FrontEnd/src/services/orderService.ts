import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type { PaginatedResponse } from "@/interfaces/api.types";
import type { BackendOrder, BackendOrderStatus, Order, OrderDTO } from "@/interfaces/order.types";
import {
  mapBackendOrder,
  mapBackendOrderStatus,
  toBackendOrderStatus,
} from "@/interfaces/order.types";
import { apiClient } from "@/lib/api";
import { mockOrders } from "@/mocks/orders.mock";
import { useAuthStore } from "@/stores";
import { extractAccountIdFromToken } from "@/utils/authToken.ts";

export interface CreateOrderRequest {
  userId: number;
  status?: BackendOrderStatus;
  totalPrice: number;
  basePrice: number;
  orderCode?: string;
  orderDetails: Array<{
    productId: number;
    quantity: number;
    subtotal: number;
    type: string;
  }>;
  orderInfo?: Array<{
    recipientName?: string;
    phoneNumber?: string;
    address?: string;
  }>;
  note?: string;
}

interface GetOrdersParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export const orderService = {
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 1000));
      return {
        ...mockOrders[0],
        id: Date.now(),
        orderCode:
          data.orderCode ||
          `TG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Date.now()).slice(-3)}`,
        userId: data.userId,
        status: "pending",
        paymentMethod: "cod",
        paymentStatus: "pending",
        subtotal: data.basePrice,
        total: data.totalPrice,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [
          { status: "pending", note: "Đơn hàng mới", timestamp: new Date().toISOString() },
        ],
      };
    }
    const response = await apiClient.post<BackendOrder>(API_ENDPOINTS.ORDERS.CREATE, data);
    return mapBackendOrder(response.data);
  },

  getOrders: async (params: GetOrdersParams = {}): Promise<PaginatedResponse<Order>> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      let filtered = [...mockOrders];
      if (params.status) {
        const normalized = mapBackendOrderStatus(params.status);
        filtered = filtered.filter((o) => o.status === normalized);
      }
      return {
        data: filtered,
        total: filtered.length,
        page: params.page || 1,
        limit: params.pageSize || 10,
        totalPages: 1,
      };
    }
    const response = await apiClient.get<BackendOrder[]>(API_ENDPOINTS.ORDERS.LIST, { params });
    const raw = Array.isArray(response.data) ? response.data : [];
    const orders = raw.map(mapBackendOrder);
    return {
      data: orders,
      total: orders.length,
      page: params.page || 1,
      limit: params.pageSize || 10,
      totalPages: 1,
    };
  },

  getOrderById: async (orderId: number): Promise<Order> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const order = mockOrders.find((o) => o.id === orderId);
      if (!order) throw new Error("Đơn hàng không tồn tại");
      return order;
    }
    const response = await apiClient.get<BackendOrder>(API_ENDPOINTS.ORDERS.DETAIL(orderId));
    return mapBackendOrder(response.data);
  },

  cancelOrder: async (orderId: number, _reason: string): Promise<Order> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const order = mockOrders.find((o) => o.id === orderId);
      if (!order) throw new Error("Đơn hàng không tồn tại");
      return { ...order, status: "canceled" };
    }
    const response = await apiClient.put<BackendOrder>(API_ENDPOINTS.ORDERS.UPDATE_STATUS, null, {
      params: { orderId, status: "CANCELED" },
    });
    return mapBackendOrder(response.data);
  },

  getAllOrders: async (params: GetOrdersParams = {}): Promise<PaginatedResponse<Order>> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return {
        data: mockOrders,
        total: mockOrders.length,
        page: params.page || 1,
        limit: params.pageSize || 10,
        totalPages: 1,
      };
    }
    // If filtering by status, use the BY_STATUS endpoint
    const endpoint = params.status
      ? API_ENDPOINTS.ORDERS.BY_STATUS(toBackendOrderStatus(params.status))
      : API_ENDPOINTS.ORDERS.ALL;
    const response = await apiClient.get<BackendOrder[]>(endpoint);
    const raw = Array.isArray(response.data) ? response.data : [];
    const orders = raw.map(mapBackendOrder);
    return {
      data: orders,
      total: orders.length,
      page: params.page || 1,
      limit: params.pageSize || 10,
      totalPages: 1,
    };
  },

  updateOrderStatus: async (orderId: number, status: string, _note?: string): Promise<Order> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const order = mockOrders.find((o) => o.id === orderId);
      if (!order) throw new Error("Đơn hàng không tồn tại");
      return { ...order, status: mapBackendOrderStatus(status) };
    }
    // Backend expects UPPERCASE status (PENDING/PAID/CANCELED)
    const response = await apiClient.put<BackendOrder>(API_ENDPOINTS.ORDERS.UPDATE_STATUS, null, {
      params: { orderId, status: toBackendOrderStatus(status) },
    });
    return mapBackendOrder(response.data);
  },

  getOrdersByUserId: async (userId: number): Promise<Order[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockOrders.filter((o) => o.userId === userId);
    }
    const response = await apiClient.get<BackendOrder[]>(API_ENDPOINTS.ORDERS.BY_USER(userId));
    return Array.isArray(response.data) ? response.data.map(mapBackendOrder) : [];
  },

  getAppOrdersByUserId: async (): Promise<OrderDTO[]> => {
    // Lấy token từ store để giải mã ra userId
    const token = useAuthStore.getState().token;
    const userId = extractAccountIdFromToken(token);

    if (!userId) throw new Error("User not found");

    const response = await apiClient.get<OrderDTO[]>(`/api/orders/user/${userId}`);
    return response.data;
  },

  getAppOrderById: async (id: number): Promise<OrderDTO> => {
    const response = await apiClient.get<OrderDTO>(`/api/orders/${id}`);
    return response.data;
  },
};
