export type OrderStatus = "pending" | "paid" | "canceled";

export type PaymentMethod = "momo" | "vnpay" | "cod" | "payos"; // Added "payos" as a placeholder since backend is currently hardcoded to that. We can adjust this later when backend supports more methods.
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

/**
 * Keep shipping info as a legacy frontend-only interface for now (might reuse while implementing shipping management features in the future).
 * @deprecated Not using in this current checkout flow for now.
 */
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

export interface OrderInfo {
  recipientName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface Order {
  id: number;
  orderCode: string;
  userId?: number;
  userName?: string;
  items: OrderItem[];
  orderInfo?: OrderInfo[];
  shippingInfo?: ShippingInfo; // Frontend-only
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  appliedVoucherCode?: string; // Frontend-only
  pointsUsed: number; // Frontend-only
  pointsEarned: number; // Frontend-only
  note?: string;
  /** @deprecated use note */
  notes?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: OrderStatusHistory[]; // Frontend-only
}

// ─── Raw shapes returned by the backend (/api/orders) ─────────────────────────

export interface BackendOrderDetail {
  id?: number;
  productId?: number;
  productName?: string;
  quantity?: number;
  subtotal?: number;
  type?: string;
}

export interface BackendOrderInfo {
  recipientName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface OrderDetailDTO {
  orderDetailId: number;
  productId: number;
  productName: string;
  imgUrl: string;
  quantity: number;
  subtotal: number;
  type: string;
}

export interface OrderDTO {
  id: number;
  userName: string;
  status: string; // VD: "PENDING", "PAID", "CANCELED"
  totalPrice: number;
  basePrice: number;
  orderCode: string;
  orderDate: string;
  orderDetails: OrderDetailDTO[];
  orderInfo?: BackendOrderInfo[];
  note?: string;
}

export type BackendOrderStatus = "PENDING" | "PAID" | "CANCELED";

/** Matches OrderDto from schema-orders.d.ts */
export interface BackendOrder {
  id?: number;
  userId?: number;
  userName?: string;
  orderDate?: string;
  status?: BackendOrderStatus;
  totalPrice?: number;
  basePrice?: number;
  orderCode?: string;
  orderDetails?: BackendOrderDetail[];
  orderInfo?: BackendOrderInfo[];
  note?: string;
}

const STATUS_MAP: Record<BackendOrderStatus, OrderStatus> = {
  PENDING: "pending",
  PAID: "paid",
  CANCELED: "canceled",
};

export function mapBackendOrderStatus(status?: string): OrderStatus {
  const normalized = (status ?? "PENDING").toUpperCase() as BackendOrderStatus;
  return STATUS_MAP[normalized] ?? "pending";
}

export function toBackendOrderStatus(status: string): BackendOrderStatus {
  const normalized = status.toUpperCase();
  if (normalized === "PAID") return "PAID";
  if (normalized === "CANCELED") return "CANCELED";
  return "PENDING";
}

/** Map a raw BackendOrder (from /api/orders) to the frontend Order shape */
export function mapBackendOrder(raw: BackendOrder): Order {
  const mappedStatus = mapBackendOrderStatus(raw.status);
  return {
    id: raw.id ?? 0,
    orderCode: raw.orderCode ?? `#${raw.id ?? 0}`,
    userId: raw.userId,
    userName: raw.userName,
    items: (raw.orderDetails ?? []).map((d) => ({
      id: d.id ?? 0,
      productId: d.productId ?? 0,
      variantId: 0,
      productName: d.productName ?? `Sản phẩm #${d.productId ?? 0}`,
      variantLabel: d.type ?? "",
      thumbnailUrl: "",
      quantity: d.quantity ?? 0,
      unitPrice:
        d.subtotal && d.quantity && d.quantity > 0 ? Math.round(d.subtotal / d.quantity) : 0,
      subtotal: d.subtotal ?? 0,
    })),
    orderInfo: (raw.orderInfo ?? []).map((info) => ({
      recipientName: info.recipientName ?? "",
      phoneNumber: info.phoneNumber ?? "",
      address: info.address ?? "",
    })),
    shippingInfo: undefined,
    paymentMethod: "payos", // Since system only allows PayOS for now (backend is hardcoded to that), we can default to it
    paymentStatus: mappedStatus === "paid" ? "paid" : "pending",
    status: mappedStatus,
    subtotal: raw.basePrice ?? 0,
    discountAmount:
      (raw.basePrice ?? 0) - (raw.totalPrice ?? 0) > 0
        ? (raw.basePrice ?? 0) - (raw.totalPrice ?? 0)
        : 0,
    shippingFee: 0,
    total: raw.totalPrice ?? 0,
    pointsUsed: 0,
    pointsEarned: 0,
    note: raw.note,
    notes: raw.note,
    createdAt: raw.orderDate ?? "",
    updatedAt: raw.orderDate ?? "",
    statusHistory: [],
  };
}
