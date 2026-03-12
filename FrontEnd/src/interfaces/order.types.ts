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
  userName?: string;
  items: OrderItem[];
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

export type BackendOrderStatus = "PENDING" | "PAID" | "CANCELED";

/** Matches OrderDto from schema-orders.d.ts */
export interface BackendOrder {
  id?: number;
  userName?: string;
  orderDate?: string;
  status?: BackendOrderStatus;
  totalPrice?: number;
  basePrice?: number;
  orderCode?: string;
  orderDetails?: BackendOrderDetail[];
}

const STATUS_MAP: Record<string, OrderStatus> = {
  PENDING: "pending",
  PAID: "paid",
  CANCELED: "canceled",
};

/** Map a raw BackendOrder (from /api/orders) to the frontend Order shape */
export function mapBackendOrder(raw: BackendOrder): Order {
  const rawStatus = (raw.status ?? "PENDING").toUpperCase();
  return {
    id: raw.id ?? 0,
    orderCode: raw.orderCode ?? `#${raw.id ?? 0}`,
    userId: undefined,
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
    shippingInfo: undefined,
    paymentMethod: "cod",
    paymentStatus: rawStatus === "PAID" ? "paid" : "pending",
    status: STATUS_MAP[rawStatus] ?? "pending",
    subtotal: raw.basePrice ?? 0,
    discountAmount:
      (raw.basePrice ?? 0) - (raw.totalPrice ?? 0) > 0
        ? (raw.basePrice ?? 0) - (raw.totalPrice ?? 0)
        : 0,
    shippingFee: 0,
    total: raw.totalPrice ?? 0,
    pointsUsed: 0,
    pointsEarned: 0,
    createdAt: raw.orderDate ?? "",
    updatedAt: raw.orderDate ?? "",
    statusHistory: [],
  };
}
