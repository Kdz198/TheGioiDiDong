import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type { Category } from "@/interfaces/product.types";
import { apiClient } from "@/lib/api";
import { mockCategories } from "@/mocks/categories.mock";

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    // Tạm thời nếu vẫn còn code Mock cũ thì chặn nó lại
    if (USE_MOCK_API) {
      return [];
    }
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      return [];
    }
  },

  createCategory: async (data: { name: string; description?: string }): Promise<Category> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const newCat: Category = {
        id: Date.now(),
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        icon: "folder",
        productCount: 0,
      };
      mockCategories.push(newCat);
      return newCat;
    }
    const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, { id: 0, ...data });
    return response.data;
  },

  updateCategory: async (data: {
    id: number;
    name: string;
    description?: string;
  }): Promise<Category> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const idx = mockCategories.findIndex((c) => c.id === data.id);
      if (idx !== -1) {
        mockCategories[idx] = { ...mockCategories[idx], name: data.name };
      }
      return mockCategories[idx] ?? mockCategories[0];
    }
    const response = await apiClient.put(API_ENDPOINTS.CATEGORIES.UPDATE, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const idx = mockCategories.findIndex((c) => c.id === id);
      if (idx !== -1) mockCategories.splice(idx, 1);
      return;
    }
    await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
  },
};
