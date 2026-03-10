import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type {
  Address,
  BackendRole,
  BackendUser,
  CreateAccountRequest,
  CustomerProfile,
  PagedUsers,
  User,
  UserRole,
} from "@/interfaces/user.types";
import { mapBackendUser } from "@/interfaces/user.types";
import { apiClient } from "@/lib/api";
import { mockAddresses, mockCustomer, mockUsers } from "@/mocks/users.mock";

export const userService = {
  /** Update a user's profile (no dedicated BE endpoint yet — no-op in production) */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return { ...mockCustomer, ...data };
    }
    return { ...mockCustomer, ...data };
  },

  /** No password-change endpoint in schema — succeeds silently */
  changePassword: async (_data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
    }
  },

  /** No addresses endpoint in schema — returns mock data */
  getAddresses: async (): Promise<Address[]> => {
    return mockAddresses;
  },

  /** Paginated list of accounts, optionally filtered by backend role names (e.g. "USER", "STAFF") */
  getUsers: async (page = 0, size = 10, roles?: string[]): Promise<PagedUsers> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const roleMap: Record<string, UserRole> = {
        USER: "customer",
        STAFF: "staff",
        ADMIN: "admin",
        "SUPER ADMIN": "admin",
      };
      const items = roles?.length
        ? mockUsers.filter((u) => roles.some((r) => roleMap[r] === u.role))
        : mockUsers;
      const start = page * size;
      const content = items.slice(start, start + size);
      return {
        content,
        totalElements: items.length,
        totalPages: Math.ceil(items.length / size) || 1,
        number: page,
        size,
      };
    }
    const sp = new URLSearchParams({ page: String(page), size: String(size) });
    if (roles?.length) roles.forEach((r) => sp.append("roles", r));
    const response = await apiClient.get(API_ENDPOINTS.USERS.LIST, { params: sp });
    const paged = response.data as {
      content?: BackendUser[];
      totalElements?: number;
      totalPages?: number;
      number?: number;
      size?: number;
    };
    return {
      content: (paged.content ?? []).map(mapBackendUser),
      totalElements: paged.totalElements ?? 0,
      totalPages: paged.totalPages ?? 1,
      number: paged.number ?? page,
      size: paged.size ?? size,
    };
  },

  /** Fetch all available roles (for dropdowns) */
  getRoles: async (): Promise<BackendRole[]> => {
    if (USE_MOCK_API) {
      return [
        { id: 1, name: "ADMIN" },
        { id: 2, name: "STAFF" },
        { id: 3, name: "USER" },
      ];
    }
    const response = await apiClient.get(API_ENDPOINTS.ROLES.LIST);
    return response.data as BackendRole[];
  },

  getUserById: async (id: number): Promise<User> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const user = mockUsers.find((u) => u.id === id);
      if (!user) throw new Error("Người dùng không tồn tại");
      return user;
    }
    const response = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    return mapBackendUser(response.data as BackendUser);
  },

  toggleUserActive: async (id: number): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const user = mockUsers.find((u) => u.id === id);
      if (!user) throw new Error("Người dùng không tồn tại");
      user.isActive = !user.isActive;
      return;
    }
    // Fetch current user to know their role
    const userResp = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    const currentUser = userResp.data as BackendUser;
    // Fetch all roles to find roleId by roleName
    const rolesResp = await apiClient.get<BackendRole[]>(API_ENDPOINTS.ROLES.LIST);
    const role = rolesResp.data.find((r) => r.name === currentUser.roleName);
    if (!role?.id) throw new Error("Không tìm thấy vai trò");
    // Send full update with all required fields
    await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), {
      email: currentUser.email,
      fullName: currentUser.fullName,
      password: "",
      roleId: role.id,
      customPermissions: currentUser.allPermissions ?? [],
    });
  },

  updateUserRole: async (id: number, role: UserRole): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const user = mockUsers.find((u) => u.id === id);
      if (!user) throw new Error("Người dùng không tồn tại");
      user.role = role;
      return;
    }
    // Fetch current user to get all fields
    const userResp = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    const currentUser = userResp.data as BackendUser;
    // Map FE role to BE role name
    const roleNameMap: Record<string, string> = {
      admin: "ADMIN",
      staff: "STAFF",
      customer: "USER",
    };
    const targetRoleName = roleNameMap[role] ?? "USER";
    // Fetch all roles to find target roleId
    const rolesResp = await apiClient.get<BackendRole[]>(API_ENDPOINTS.ROLES.LIST);
    const targetRole = rolesResp.data.find((r) => r.name === targetRoleName);
    if (!targetRole?.id) throw new Error("Không tìm thấy vai trò");
    await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), {
      email: currentUser.email,
      fullName: currentUser.fullName,
      password: "",
      roleId: targetRole.id,
      customPermissions: currentUser.allPermissions ?? [],
    });
  },

  /** Create a new account */
  createUser: async (data: CreateAccountRequest): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      mockUsers.push({
        id: Date.now(),
        email: data.email ?? "",
        fullName: data.fullName ?? "",
        role: "customer",
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      return;
    }
    await apiClient.post(API_ENDPOINTS.USERS.CREATE, data);
  },

  /** Update an existing account */
  updateUser: async (id: number, data: CreateAccountRequest): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return;
    }
    await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), data);
  },

  /** Delete an account */
  deleteUser: async (id: number): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const idx = mockUsers.findIndex((u) => u.id === id);
      if (idx !== -1) mockUsers.splice(idx, 1);
      return;
    }
    await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
  },

  createEmployee: async (data: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      mockUsers.push({
        id: Date.now(),
        email: data.email,
        fullName: data.fullName,
        role: "staff",
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      return;
    }
    // Fetch STAFF role ID dynamically
    const rolesResp = await apiClient.get<BackendRole[]>(API_ENDPOINTS.ROLES.LIST);
    const staffRole = rolesResp.data.find((r) => r.name === "STAFF");
    if (!staffRole?.id) throw new Error("Không tìm thấy vai trò STAFF");
    await apiClient.post(API_ENDPOINTS.USERS.CREATE, {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      roleId: staffRole.id,
      customPermissions: [],
    });
  },

  /** Fetch all available permissions from /api/users/roles/permissions */
  getPermissions: async (): Promise<string[]> => {
    if (USE_MOCK_API) {
      return [
        "CREATE_ORDER",
        "VIEW_OWN_ORDER",
        "CREATE_REVIEW",
        "ACCESS_VIP_DISCOUNTS",
        "CREATE_PRODUCT",
        "UPDATE_PRODUCT",
        "VIEW_ALL_ORDERS",
        "UPDATE_ORDER_STATUS",
        "DELETE_PRODUCT",
        "MANAGE_STAFF",
        "VIEW_REVENUE_REPORT",
      ];
    }
    const response = await apiClient.get(API_ENDPOINTS.ROLES.PERMISSIONS);
    return response.data;
  },

  /** Update a user's custom permissions — sends full CreateAccountRequest body */
  updateUserPermissions: async (id: number, permissions: string[]): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const user = mockUsers.find((u) => u.id === id);
      if (user) (user as { allPermissions?: string[] }).allPermissions = permissions;
      return;
    }
    const userResp = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    const currentUser = userResp.data as BackendUser;
    const rolesResp = await apiClient.get<BackendRole[]>(API_ENDPOINTS.ROLES.LIST);
    const role = rolesResp.data.find((r) => r.name === currentUser.roleName);
    if (!role?.id) throw new Error("Không tìm thấy vai trò");
    await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), {
      email: currentUser.email,
      fullName: currentUser.fullName,
      password: "",
      roleId: role.id,
      customPermissions: permissions,
    });
  },

  /** Update an employee's basic info (fullName, email, optional password) */
  updateEmployee: async (
    id: number,
    data: { fullName: string; email: string; password: string },
    currentAllPermissions: string[]
  ): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const user = mockUsers.find((u) => u.id === id);
      if (user) {
        user.fullName = data.fullName;
        user.email = data.email;
      }
      return;
    }
    const userResp = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    const currentUser = userResp.data as BackendUser;
    const rolesResp = await apiClient.get<BackendRole[]>(API_ENDPOINTS.ROLES.LIST);
    const role = rolesResp.data.find((r) => r.name === currentUser.roleName);
    if (!role?.id) throw new Error("Không tìm thấy vai trò");
    await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), {
      email: data.email,
      fullName: data.fullName,
      password: data.password,
      roleId: role.id,
      customPermissions: currentAllPermissions,
    });
  },

  /** Stub — no customer profile endpoint yet */
  getProfile: async (_id?: number): Promise<CustomerProfile> => {
    return mockCustomer;
  },
};
