import { useMutationHandler } from "@/hooks/useMutationHandler";
import type { RatingBreakdown, Review } from "@/interfaces/review.types";
import { reviewService } from "@/services/reviewService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useProductReviews(productId: number) {
  return useQuery<{ reviews: Review[]; breakdown: RatingBreakdown }>({
    queryKey: ["reviews", productId],
    queryFn: () => reviewService.getProductReviews(productId),
    enabled: productId > 0,
  });
}

interface CreateReviewData {
  productId: number;
  rating: number;
  title?: string;
  content: string;
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutationHandler<Review, CreateReviewData>({
    mutationFn: (data) => reviewService.createReview(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.productId] });
    },
    successMessage: "Đánh giá đã được gửi thành công!",
    errorMessage: "Không thể gửi đánh giá",
  });
}

export function useMarkReviewHelpful() {
  const queryClient = useQueryClient();

  return useMutationHandler<void, number>({
    mutationFn: (reviewId) => reviewService.markReviewHelpful(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    showSuccessToast: false,
    errorMessage: "Không thể thực hiện thao tác",
  });
}
