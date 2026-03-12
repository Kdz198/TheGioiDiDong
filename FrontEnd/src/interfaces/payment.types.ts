import type { PaymentMethod } from "./order.types";
import type { ApiPromotion } from "./promotion.types";

export interface PaymentInitiateRequest {
  orderId: number;
  method: PaymentMethod;
  returnUrl: string;
}

export interface PaymentInitiateResponse {
  paymentUrl?: string;
  qrCode?: string;
  transactionId: string;
}

export type ApiPaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface ApiPayment {
  id: number;
  order: {
    id: number;
    userId?: number;
    status: string;
    totalPrice?: number;
    orderCode?: string;
    orderDate?: string;
  };
  paymentMethod: string;
  amount: number;
  date: string;
  promotion?: ApiPromotion | null;
  status: ApiPaymentStatus;
  transactionCode?: string;
}
