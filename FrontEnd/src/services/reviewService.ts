import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type { RatingBreakdown, Review } from "@/interfaces/review.types";
import { apiClient } from "@/lib/api";
import { mockReviews } from "@/mocks/reviews.mock";

export const reviewService = {
  getProductReviews: async (
    productId: number
  ): Promise<{ reviews: Review[]; breakdown: RatingBreakdown }> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      const reviews = mockReviews.filter((r) => r.productId === productId);
      const total = reviews.length;
      const average =
        total > 0
          ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
          : 0;
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach((r) => {
        distribution[r.rating as keyof typeof distribution]++;
      });
      return { reviews, breakdown: { average, total, distribution } };
    }
    const response = await apiClient.get(API_ENDPOINTS.REVIEWS.LIST(productId));
    return response.data.data;
  },

  createReview: async (data: {
    productId: number;
    rating: number;
    title?: string;
    content: string;
  }): Promise<Review> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return {
        id: Date.now(),
        productId: data.productId,
        userId: 1,
        authorName: "Nguyễn Văn An",
        rating: data.rating,
        title: data.title,
        content: data.content,
        images: [],
        helpfulCount: 0,
        isVerifiedPurchase: true,
        createdAt: new Date().toISOString(),
      };
    }
    const response = await apiClient.post(API_ENDPOINTS.REVIEWS.CREATE(data.productId), data);
    return response.data.data;
  },

  markReviewHelpful: async (reviewId: number): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 200));
      return;
    }
    await apiClient.post(API_ENDPOINTS.REVIEWS.MARK_HELPFUL(reviewId));
  },
};
