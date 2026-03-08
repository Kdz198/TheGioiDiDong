import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type { Address, CustomerProfile, User, UserRole } from "@/interfaces/user.types";
import { apiClient } from "@/lib/api";
import { mockAddresses, mockCustomer, mockUsers } from "@/mocks/users.mock";

export const userService = {
  /** Fetch a user's profile by their account ID */
  getProfile: async (id: number): Promise<CustomerProfile> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockCustomer;
    }
    const response = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    return response.data;
  },

  /** Update a user's profile by their account ID */
  updateProfile: async (id: number, data: Partial<User>): Promise<User> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return { ...mockCustomer, ...data };
    }
    const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), data);
    return response.data;
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

  getUsers: async (): Promise<User[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return mockUsers;
    }
    const response = await apiClient.get(API_ENDPOINTS.USERS.LIST);
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const user = mockUsers.find((u) => u.id === id);
      if (!user) throw new Error("Người dùng không tồn tại");
      return user;
    }
    const response = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    return response.data;
  },

  toggleUserActive: async (id: number): Promise<User> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const user = mockUsers.find((u) => u.id === id);
      if (!user) throw new Error("Người dùng không tồn tại");
      user.isActive = !user.isActive;
      return user;
    }
    // Fetch current state then toggle
    const current = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    const currentUser = current.data as User;
    const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), {
      active: !currentUser.isActive,
    });
    return response.data;
  },

  updateUserRole: async (id: number, role: UserRole): Promise<User> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const user = mockUsers.find((u) => u.id === id);
      if (!user) throw new Error("Người dùng không tồn tại");
      user.role = role;
      return user;
    }
    const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), { role });
    return response.data;
  },

  createEmployee: async (data: {
    fullName: string;
    email: string;
    phone: string;
  }): Promise<User> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const newEmployee: User = {
        id: Date.now(),
        email: data.email,
        phone: data.phone,
        fullName: data.fullName,
        role: "staff",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      mockUsers.push(newEmployee);
      return newEmployee;
    }
    const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, {
      ...data,
      role: "staff",
    });
    return response.data;
  },
};
