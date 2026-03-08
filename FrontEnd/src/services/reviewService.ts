import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type { RatingBreakdown, Review } from "@/interfaces/review.types";
import { apiClient } from "@/lib/api";
import { mockReviews } from "@/mocks/reviews.mock";

/** Shape returned by GET /api/orders/feedbacks/product/{productId} */
interface ApiFeedback {
  id?: number;
  userId?: number;
  productId?: number;
  rating?: number;
  comment?: string;
  date?: string;
}

function mapFeedbackToReview(fb: ApiFeedback): Review {
  return {
    id: fb.id ?? 0,
    productId: fb.productId ?? 0,
    userId: fb.userId ?? 0,
    authorName: `Người dùng #${fb.userId ?? 0}`,
    rating: fb.rating ?? 0,
    content: fb.comment ?? "",
    images: [],
    helpfulCount: 0,
    isVerifiedPurchase: false,
    createdAt: fb.date ?? new Date().toISOString(),
  };
}

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
    const response = await apiClient.get<ApiFeedback[]>(
      API_ENDPOINTS.FEEDBACKS.BY_PRODUCT(productId)
    );
    const feedbacks = response.data ?? [];
    const reviews = feedbacks.map(mapFeedbackToReview);
    const total = reviews.length;
    const average =
      total > 0 ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10 : 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++;
    });
    return { reviews, breakdown: { average, total, distribution } };
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
    const response = await apiClient.post<ApiFeedback>(API_ENDPOINTS.FEEDBACKS.CREATE, {
      productId: data.productId,
      rating: data.rating,
      comment: data.content,
    });
    return mapFeedbackToReview(response.data);
  },

  markReviewHelpful: async (_reviewId: number): Promise<void> => {
    // No endpoint for marking reviews helpful in the backend schema
  },
};
