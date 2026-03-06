import type { Address, CustomerProfile, User } from "@/interfaces/user.types";

export const mockAddresses: Address[] = [
  {
    id: 1,
    userId: 1,
    recipientName: "Nguyễn Văn An",
    phone: "0901234567",
    province: "Hồ Chí Minh",
    district: "Quận 1",
    ward: "Phường Bến Nghé",
    streetAddress: "123 Nguyễn Huệ",
    isDefault: true,
  },
  {
    id: 2,
    userId: 1,
    recipientName: "Nguyễn Văn An",
    phone: "0901234567",
    province: "Hồ Chí Minh",
    district: "Quận 7",
    ward: "Phường Tân Phong",
    streetAddress: "456 Nguyễn Thị Thập",
    isDefault: false,
  },
];

export const mockCustomer: CustomerProfile = {
  id: 1,
  email: "an.nguyen@email.com",
  phone: "0901234567",
  fullName: "Nguyễn Văn An",
  avatar: "/images/avatars/customer-1.jpg",
  role: "customer",
  isActive: true,
  createdAt: "2025-06-15T10:00:00Z",
  membershipPoints: 1250,
  totalOrders: 15,
  savedAddresses: mockAddresses,
};

export const mockStaff: User = {
  id: 2,
  email: "staff@techgear.vn",
  phone: "0987654321",
  fullName: "Trần Thị Bình",
  role: "staff",
  isActive: true,
  createdAt: "2025-03-01T10:00:00Z",
};

export const mockAdmin: User = {
  id: 3,
  email: "admin@techgear.vn",
  phone: "0912345678",
  fullName: "Lê Quốc Cường",
  role: "admin",
  isActive: true,
  createdAt: "2025-01-01T10:00:00Z",
};

export const mockUsers: User[] = [mockCustomer, mockStaff, mockAdmin];
