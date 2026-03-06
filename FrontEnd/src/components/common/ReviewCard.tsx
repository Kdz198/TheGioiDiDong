import type { Review } from "@/interfaces/review.types";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { CheckCircle, Star, ThumbsUp } from "lucide-react";

interface ReviewCardProps {
  review: Review;
  onMarkHelpful?: (reviewId: number) => void;
}

export function ReviewCard({ review, onMarkHelpful }: ReviewCardProps) {
  return (
    <div className="border-b border-gray-100 py-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-700">
          {review.authorAvatar ? (
            <img
              src={review.authorAvatar}
              alt={review.authorName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            review.authorName.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-900">{review.authorName}</span>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                Đã mua hàng
              </span>
            )}
          </div>

          <div className="mt-0.5 flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">{formatRelativeTime(review.createdAt)}</span>
          </div>

          {review.title && <p className="mt-2 text-sm font-medium text-zinc-900">{review.title}</p>}
          <p className="mt-1 text-sm text-gray-600">{review.content}</p>

          {review.images.length > 0 && (
            <div className="mt-2 flex gap-2">
              {review.images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt="Review"
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          {onMarkHelpful && (
            <button
              onClick={() => onMarkHelpful(review.id)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-teal-500">
              <ThumbsUp className="h-3 w-3" />
              Hữu ích ({review.helpfulCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
