import { apiClient } from "@/lib/api";

export const authManager = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  },

  signup: async (data: { email: string; password: string; name: string }) => {
    const response = await apiClient.post("/auth/signup", data);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  },
};
