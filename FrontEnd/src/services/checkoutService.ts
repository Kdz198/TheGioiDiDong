import { API_ENDPOINTS } from "@/constants/api.config";
import { apiClient } from "@/lib/api";
import axios from "axios";

export interface CheckoutOrderDetailRequest {
  productId: number;
  quantity: number;
  subtotal: number;
  type: string;
}

export interface CheckoutOrderInfo {
  recipientName: string;
  phoneNumber: string;
  address: string;
}

export interface CheckAvailableRequest {
  userId: number;
  status?: "PENDING" | "PAID" | "CANCELED";
  totalPrice: number;
  basePrice: number;
  orderCode?: string;
  orderDetails: CheckoutOrderDetailRequest[];
  orderInfo?: CheckoutOrderInfo[];
  note: string;
}

export interface CheckAvailableResponse extends CheckAvailableRequest {
  orderCode: string;
}

const PAYMENT_RETRY_ATTEMPTS = 5;
const PAYMENT_RETRY_DELAY_MS = 250;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isOrderNotReadyError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

async function makePayment(orderCode: string, promotionCode?: string): Promise<string> {
  const params: Record<string, string> = { orderCode };
  if (promotionCode) {
    params.promotionCode = promotionCode;
  }
  const response = await apiClient.post<string>(API_ENDPOINTS.PAYMENTS.MAKE_PAYMENT, null, {
    params,
  });
  return String(response.data);
}

async function makePaymentWithRetry(orderCode: string, promotionCode?: string): Promise<string> {
  for (let attempt = 1; attempt <= PAYMENT_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await makePayment(orderCode, promotionCode);
    } catch (error) {
      // Order is created by an async RabbitMQ listener after check-available.
      if (attempt === PAYMENT_RETRY_ATTEMPTS || !isOrderNotReadyError(error)) {
        throw error;
      }
      await sleep(PAYMENT_RETRY_DELAY_MS);
    }
  }
  throw new Error("Không thể tạo liên kết thanh toán");
}

export const checkoutService = {
  checkAvailable: async (payload: CheckAvailableRequest): Promise<CheckAvailableResponse> => {
    const response = await apiClient.post<CheckAvailableResponse>(
      API_ENDPOINTS.PRODUCTS.CHECK_AVAILABLE,
      payload
    );
    return response.data;
  },
  makePayment,
  makePaymentWithRetry,
};
