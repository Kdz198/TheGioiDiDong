import { API_ENDPOINTS } from "@/constants/api.config";
import type { CreateAccountRequest, User } from "@/interfaces/user.types";
import { mapRoleName } from "@/interfaces/user.types";
import { apiClient } from "@/lib/api";
import { extractAccountIdFromToken } from "@/utils/authToken";
import axios from "axios";

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

function mapRegisterError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Đăng ký thất bại. Vui lòng thử lại.";
  }

  const status = error.response?.status;
  if (status === 409) {
    return "Email đã tồn tại. Vui lòng dùng email khác.";
  }
  if (status === 400) {
    return "Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.";
  }

  return "Không thể đăng ký tài khoản lúc này. Vui lòng thử lại sau.";
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const loginRes = await apiClient.post<BackendLoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    const { token = "", expiresIn = 0, role = "" } = loginRes.data;
    const accountId = extractAccountIdFromToken(token) ?? 0;

    const user: User = {
      id: accountId,
      email: data.email,
      fullName: data.email,
      role: mapRoleName(role),
      roleName: role,
      isActive: true,
    };

    return { user, token, expiresIn };
  },

  logout: async (): Promise<void> => {},

  register: async (data: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const createPayload: CreateAccountRequest = {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      password: data.password,
      roleId: 3,
    };

    try {
      await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, createPayload);
    } catch (error) {
      throw new Error(mapRegisterError(error));
    }

    try {
      return await authService.login({
        email: createPayload.email ?? data.email,
        password: data.password,
      });
    } catch {
      throw new Error(
        "Đăng ký thành công nhưng tự động đăng nhập thất bại. Vui lòng đăng nhập lại."
      );
    }
  },

  forgotPassword: async (_email: string): Promise<void> => {
    throw new Error("Chức năng quên mật khẩu hiện chưa được hỗ trợ.");
  },
};
