export interface StaffPendingCheckoutContext {
  orderCode: string;
  userId: number;
  basePrice: number;
  totalPrice: number;
  recipientName: string;
  phoneNumber: string;
  address: string;
  note?: string;
  createdAt: string;
}

export interface StaffPaymentResultContext {
  orderCode: string;
  paymentUrl?: string;
  promotionCode?: string;
  createdAt: string;
}
