import { API_ENDPOINTS } from "@/constants/api.config";
import { apiClient } from "@/lib/api";

export const authManager = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    return response.data;
  },

  /** No separate signup endpoint in schema — falls through to users CREATE */
  signup: async (data: { email: string; password: string; name: string }) => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, data);
    return response.data;
  },

  /** Logout is client-side only — no backend endpoint */
  logout: async () => {
    return {};
  },

  getProfile: async (id: number) => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    return response.data;
  },
};
