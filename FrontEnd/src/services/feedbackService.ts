import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import { apiClient } from "@/lib/api";

interface Feedback {
  id: number;
  customerName: string;
  customerEmail: string;
  message: string;
  status: "open" | "resolved";
  replies: Array<{ message: string; staffName: string; createdAt: string }>;
  createdAt: string;
}

export const feedbackService = {
  getFeedbacks: async (): Promise<Feedback[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return [
        {
          id: 1,
          customerName: "Nguyễn Văn An",
          customerEmail: "an.nguyen@email.com",
          message: "Sản phẩm bị lỗi, tôi muốn đổi hàng",
          status: "open",
          replies: [],
          createdAt: "2026-02-27T10:00:00Z",
        },
        {
          id: 2,
          customerName: "Phạm Minh Đức",
          customerEmail: "duc.pham@email.com",
          message: "Đơn hàng giao chậm so với dự kiến",
          status: "resolved",
          replies: [
            {
              message: "Xin lỗi quý khách, đơn hàng đã được xử lý lại. Dự kiến giao trong 24h.",
              staffName: "Trần Thị Bình",
              createdAt: "2026-02-27T14:00:00Z",
            },
          ],
          createdAt: "2026-02-26T09:00:00Z",
        },
      ];
    }
    const response = await apiClient.get(API_ENDPOINTS.FEEDBACK.LIST);
    return response.data.data;
  },

  replyFeedback: async (id: number, message: string): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return;
    }
    await apiClient.post(API_ENDPOINTS.FEEDBACK.REPLY(id), { message });
  },

  resolveFeedback: async (id: number): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return;
    }
    await apiClient.post(API_ENDPOINTS.FEEDBACK.RESOLVE(id));
  },
};
