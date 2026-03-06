import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type { Address, CustomerProfile, User, UserRole } from "@/interfaces/user.types";
import { apiClient } from "@/lib/api";
import { mockAddresses, mockCustomer, mockUsers } from "@/mocks/users.mock";

export const userService = {
  getProfile: async (): Promise<CustomerProfile> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockCustomer;
    }
    const response = await apiClient.get(API_ENDPOINTS.USERS.PROFILE);
    return response.data.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return { ...mockCustomer, ...data };
    }
    const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
    return response.data.data;
  },

  changePassword: async (_data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return;
    }
    await apiClient.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD, _data);
  },

  getAddresses: async (): Promise<Address[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockAddresses;
    }
    const response = await apiClient.get(API_ENDPOINTS.USERS.ADDRESSES);
    return response.data.data;
  },

  getUsers: async (): Promise<User[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return mockUsers;
    }
    const response = await apiClient.get(API_ENDPOINTS.USERS.ALL);
    return response.data.data;
  },

  getUserById: async (id: number): Promise<User> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const user = mockUsers.find((u) => u.id === id);
      if (!user) throw new Error("Người dùng không tồn tại");
      return user;
    }
    const response = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    return response.data.data;
  },

  toggleUserActive: async (id: number): Promise<User> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const user = mockUsers.find((u) => u.id === id);
      if (!user) throw new Error("Người dùng không tồn tại");
      user.isActive = !user.isActive;
      return user;
    }
    const response = await apiClient.put(API_ENDPOINTS.USERS.TOGGLE_ACTIVE(id));
    return response.data.data;
  },

  updateUserRole: async (id: number, role: UserRole): Promise<User> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const user = mockUsers.find((u) => u.id === id);
      if (!user) throw new Error("Người dùng không tồn tại");
      user.role = role;
      return user;
    }
    const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE_ROLE(id), { role });
    return response.data.data;
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
    const response = await apiClient.post(API_ENDPOINTS.USERS.LIST, {
      ...data,
      role: "staff",
    });
    return response.data.data;
  },
};
