import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type { PaymentMethod } from "@/interfaces/order.types";
import type {
  ApiPayment,
  ApiPaymentStatus,
  PaymentInitiateResponse,
} from "@/interfaces/payment.types";
import { apiClient } from "@/lib/api";

const mockApiPayments: ApiPayment[] = [
  {
    id: 1,
    order: { id: 1, status: "PENDING" },
    paymentMethod: "cod",
    amount: 850000,
    date: "2025-06-20T10:00:00Z",
    status: "PENDING",
  },
  {
    id: 2,
    order: { id: 2, status: "PAID" },
    paymentMethod: "momo",
    amount: 1200000,
    date: "2025-06-21T14:00:00Z",
    status: "COMPLETED",
  },
  {
    id: 3,
    order: { id: 3, status: "CANCELED" },
    paymentMethod: "vnpay",
    amount: 320000,
    date: "2025-06-22T09:00:00Z",
    status: "FAILED",
  },
];

export const paymentService = {
  initiatePayment: async (
    orderId: number,
    method: PaymentMethod
  ): Promise<PaymentInitiateResponse> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 800));
      if (method === "cod") {
        return { transactionId: `COD-${orderId}` };
      }
      return {
        paymentUrl: `https://sandbox.${method}.vn/pay?orderId=${orderId}`,
        transactionId: `${method.toUpperCase()}-${orderId}-${Date.now()}`,
      };
    }
    const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.MAKE_PAYMENT, null, {
      params: { orderCode: String(orderId) },
    });
    return { transactionId: String(response.data), paymentUrl: String(response.data) };
  },

  getAllPayments: async (): Promise<ApiPayment[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return mockApiPayments;
    }
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.ALL);
    return response.data;
  },

  getPaymentsByStatus: async (status: string): Promise<ApiPayment[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockApiPayments.filter((p) => p.status === status);
    }
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.BY_STATUS(status));
    return response.data;
  },

  updatePaymentStatus: async (id: number, status: ApiPaymentStatus): Promise<ApiPayment> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const idx = mockApiPayments.findIndex((p) => p.id === id);
      if (idx !== -1) mockApiPayments[idx] = { ...mockApiPayments[idx], status };
      return mockApiPayments[idx] ?? mockApiPayments[0];
    }
    // BE requires full Payment entity for PUT — fetch current payment first
    const currentResp = await apiClient.get(API_ENDPOINTS.PAYMENTS.DETAIL(id));
    const current = currentResp.data as ApiPayment;
    const response = await apiClient.put(API_ENDPOINTS.PAYMENTS.UPDATE, { ...current, status });
    return response.data;
  },
};
