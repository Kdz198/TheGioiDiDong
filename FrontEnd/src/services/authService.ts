import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type { User } from "@/interfaces/user.types";
import { apiClient } from "@/lib/api";
import { mockAdmin, mockCustomer, mockStaff } from "@/mocks/users.mock";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 800));
      if (data.email === "admin@techgear.vn") {
        return { user: mockAdmin, token: "mock-admin-token" };
      }
      if (data.email === "staff@techgear.vn") {
        return { user: mockStaff, token: "mock-staff-token" };
      }
      if (data.email === "an.nguyen@email.com" && data.password === "password123") {
        return { user: mockCustomer, token: "mock-customer-token" };
      }
      throw new Error("Email hoặc mật khẩu không đúng");
    }
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 800));
      const newUser: User = {
        id: Date.now(),
        email: data.email,
        phone: data.phone,
        fullName: data.fullName,
        role: "customer",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      return { user: newUser, token: "mock-new-token" };
    }
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 800));
      return { message: "Link đặt lại mật khẩu đã được gửi đến email của bạn" };
    }
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  loginWithGoogle: async (_idToken: string): Promise<AuthResponse> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 800));
      return { user: mockCustomer, token: "mock-google-token" };
    }
    const response = await apiClient.post(API_ENDPOINTS.AUTH.GOOGLE, { idToken: _idToken });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    if (USE_MOCK_API) {
      return;
    }
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
};
