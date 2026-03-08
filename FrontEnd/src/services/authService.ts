import { API_ENDPOINTS } from "@/constants/api.config";
import type { User } from "@/interfaces/user.types";
import { mapRoleName } from "@/interfaces/user.types";
import { apiClient } from "@/lib/api";

interface LoginRequest {
  email: string;
  password: string;
}

/** Shape returned by POST /api/users/auth/login */
interface BackendLoginResponse {
  token?: string;
  type?: string;
  message?: string;
  /** Role name e.g. "ADMIN", "STAFF", "USER" */
  role?: string;
  ttl?: number;
  /** Unix timestamp in milliseconds */
  expiresIn?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const loginRes = await apiClient.post<BackendLoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    const { token = "", expiresIn = 0, role = "" } = loginRes.data;

    const user: User = {
      id: 0,
      email: data.email,
      fullName: data.email,
      role: mapRoleName(role),
      roleName: role,
      isActive: true,
    };

    return { user, token, expiresIn };
  },

  logout: async (): Promise<void> => {},

  register: async (_data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<AuthResponse> => {
    throw new Error("Đăng ký tài khoản hiện chưa được hỗ trợ. Vui lòng liên hệ Admin.");
  },

  forgotPassword: async (_email: string): Promise<void> => {
    throw new Error("Chức năng quên mật khẩu hiện chưa được hỗ trợ.");
  },
};
