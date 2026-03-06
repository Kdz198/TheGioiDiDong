import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type { PaginatedResponse } from "@/interfaces/api.types";
import type { Order, PaymentMethod, ShippingInfo } from "@/interfaces/order.types";
import { apiClient } from "@/lib/api";
import { mockOrders } from "@/mocks/orders.mock";

interface CreateOrderRequest {
  shippingInfo: ShippingInfo;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
  pointsUsed?: number;
  notes?: string;
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
        orderCode: `TG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Date.now()).slice(-3)}`,
        shippingInfo: data.shippingInfo,
        paymentMethod: data.paymentMethod,
        status: "pending",
        paymentStatus: data.paymentMethod === "cod" ? "pending" : "paid",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [
          { status: "pending", note: "Đơn hàng mới", timestamp: new Date().toISOString() },
        ],
      };
    }
    const response = await apiClient.post(API_ENDPOINTS.ORDERS.CREATE, data);
    return response.data.data;
  },

  getOrders: async (params: GetOrdersParams = {}): Promise<PaginatedResponse<Order>> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      let filtered = [...mockOrders];
      if (params.status) {
        filtered = filtered.filter((o) => o.status === params.status);
      }
      return {
        data: filtered,
        total: filtered.length,
        page: params.page || 1,
        limit: params.pageSize || 10,
        totalPages: 1,
      };
    }
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST, { params });
    return response.data.data;
  },

  getOrderById: async (orderId: number): Promise<Order> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const order = mockOrders.find((o) => o.id === orderId);
      if (!order) throw new Error("Đơn hàng không tồn tại");
      return order;
    }
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.DETAIL(orderId));
    return response.data.data;
  },

  cancelOrder: async (orderId: number, reason: string): Promise<Order> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const order = mockOrders.find((o) => o.id === orderId);
      if (!order) throw new Error("Đơn hàng không tồn tại");
      return { ...order, status: "canceled" };
    }
    const response = await apiClient.post(API_ENDPOINTS.ORDERS.CANCEL(orderId), { reason });
    return response.data.data;
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
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.ALL, { params });
    return response.data.data;
  },

  updateOrderStatus: async (orderId: number, status: string, _note?: string): Promise<Order> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const order = mockOrders.find((o) => o.id === orderId);
      if (!order) throw new Error("Đơn hàng không tồn tại");
      return { ...order, status: status as Order["status"] };
    }
    const response = await apiClient.put(API_ENDPOINTS.ORDERS.UPDATE_STATUS, null, {
      params: { orderId, status },
    });
    return response.data.data;
  },

  getOrdersByUserId: async (userId: number): Promise<Order[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockOrders.filter((o) => o.userId === userId);
    }
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.BY_USER(userId));
    return response.data.data;
  },
};
