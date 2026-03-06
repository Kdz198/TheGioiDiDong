export type OrderStatus = "pending" | "paid" | "canceled";

export type PaymentMethod = "momo" | "vnpay" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: number;
  productId: number;
  variantId: number;
  productName: string;
  variantLabel: string;
  thumbnailUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ShippingInfo {
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  deliveryNote?: string;
}

export interface OrderStatusHistory {
  status: string;
  note: string;
  timestamp: string;
  updatedBy?: string;
}

export interface Order {
  id: number;
  orderCode: string;
  userId?: number;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  appliedVoucherCode?: string;
  pointsUsed: number;
  pointsEarned: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: OrderStatusHistory[];
}
