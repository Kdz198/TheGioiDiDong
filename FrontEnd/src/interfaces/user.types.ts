export type UserRole = "guest" | "customer" | "staff" | "admin";

export interface User {
  id: number;
  email: string;
  phone: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Address {
  id: number;
  userId: number;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
}

export interface CustomerProfile extends User {
  membershipPoints: number;
  totalOrders: number;
  savedAddresses: Address[];
}
