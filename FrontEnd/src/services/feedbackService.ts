import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import { apiClient } from "@/lib/api";

/** Backend Feedback entity shape */
export interface BackendFeedback {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  date: string;
  orderDetail?: {
    id: number;
    productId: number;
    quantity: number;
    subtotal: number;
    type: string;
  } | null;
}

const mockFeedbacks: BackendFeedback[] = [
  {
    id: 1,
    userId: 10,
    productId: 5,
    rating: 4,
    comment: "Sản phẩm tốt, giao hàng nhanh",
    date: "2026-02-27T10:00:00Z",
    orderDetail: null,
  },
  {
    id: 2,
    userId: 15,
    productId: 3,
    rating: 2,
    comment: "Sản phẩm bị lỗi, tôi muốn đổi hàng",
    date: "2026-02-26T09:00:00Z",
    orderDetail: null,
  },
];

export const feedbackService = {
  getFeedbacks: async (): Promise<BackendFeedback[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return mockFeedbacks;
    }
    const response = await apiClient.get(API_ENDPOINTS.FEEDBACKS.LIST);
    return response.data;
  },

  getFeedbackById: async (id: number): Promise<BackendFeedback> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const fb = mockFeedbacks.find((f) => f.id === id);
      if (!fb) throw new Error("Phản hồi không tồn tại");
      return fb;
    }
    const response = await apiClient.get(API_ENDPOINTS.FEEDBACKS.DETAIL(id));
    return response.data;
  },

  updateFeedback: async (data: BackendFeedback): Promise<BackendFeedback> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const idx = mockFeedbacks.findIndex((f) => f.id === data.id);
      if (idx !== -1) mockFeedbacks[idx] = data;
      return data;
    }
    const response = await apiClient.put(API_ENDPOINTS.FEEDBACKS.UPDATE, data);
    return response.data;
  },

  deleteFeedback: async (id: number): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const idx = mockFeedbacks.findIndex((f) => f.id === id);
      if (idx !== -1) mockFeedbacks.splice(idx, 1);
      return;
    }
    await apiClient.delete(API_ENDPOINTS.FEEDBACKS.DELETE(id));
  },
};
