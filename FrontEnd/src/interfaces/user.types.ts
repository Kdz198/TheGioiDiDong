export type UserRole = "guest" | "customer" | "staff" | "admin";

/** Raw role name returned by the backend */
export type BackendRoleName = "SUPER ADMIN" | "ADMIN" | "STAFF" | "USER";

/** All permission keys issued by the backend */
export type Permission =
  | "CREATE_ORDER"
  | "VIEW_OWN_ORDER"
  | "CREATE_REVIEW"
  | "ACCESS_VIP_DISCOUNTS"
  | "CREATE_PRODUCT"
  | "UPDATE_PRODUCT"
  | "VIEW_ALL_ORDERS"
  | "UPDATE_ORDER_STATUS"
  | "DELETE_PRODUCT"
  | "MANAGE_STAFF"
  | "VIEW_REVENUE_REPORT";

/** Maps backend roleName → frontend UserRole */
export function mapRoleName(roleName: string): UserRole {
  switch (roleName.toUpperCase()) {
    case "SUPER ADMIN":
    case "ADMIN":
      return "admin";
    case "STAFF":
      return "staff";
    case "USER":
      return "customer";
    default:
      return "customer";
  }
}

export interface User {
  id: number;
  email: string;
  phone?: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  /** Raw role name from backend (e.g. "SUPER ADMIN") */
  roleName?: string;
  /** All permissions granted (role defaults + custom) */
  allPermissions?: Permission[];
  isActive: boolean;
  createdAt?: string;
}

/** Raw account shape returned by GET /api/users */
export interface BackendUser {
  id?: number;
  email?: string;
  fullName?: string;
  roleName?: string;
  allPermissions?: Permission[];
  active?: boolean;
  createdAt?: string;
}

/** Role shape returned by GET /api/users/roles */
export interface BackendRole {
  id?: number;
  name?: string;
  description?: string;
  permissions?: string[];
}

/** Request body for POST /api/users and PUT /api/users/{id} */
export interface CreateAccountRequest {
  email?: string;
  password?: string;
  fullName?: string;
  roleId?: number;
  customPermissions?: string[];
}

/** Paginated response from GET /api/users */
export interface PagedUsers {
  content: User[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** Map a raw backend user to the frontend User shape */
export function mapBackendUser(u: BackendUser): User {
  return {
    id: u.id ?? 0,
    email: u.email ?? "",
    fullName: u.fullName ?? u.email ?? "",
    role: mapRoleName(u.roleName ?? ""),
    roleName: u.roleName,
    allPermissions: u.allPermissions,
    isActive: u.active ?? true,
    createdAt: u.createdAt,
  };
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
