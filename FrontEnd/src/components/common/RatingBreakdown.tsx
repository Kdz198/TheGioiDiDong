import type { RatingBreakdown as RatingBreakdownType } from "@/interfaces/review.types";
import { Star } from "lucide-react";

interface RatingBreakdownProps {
  breakdown: RatingBreakdownType;
}

export function RatingBreakdown({ breakdown }: RatingBreakdownProps) {
  return (
    <div className="flex items-start gap-8">
      <div className="text-center">
        <div className="text-4xl font-bold text-zinc-900">{breakdown.average}</div>
        <div className="mt-1 flex items-center justify-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= Math.round(breakdown.average)
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="mt-1 text-sm text-gray-500">{breakdown.total} đánh giá</p>
      </div>

      <div className="flex-1 space-y-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = breakdown.distribution[star];
          const percentage = breakdown.total > 0 ? Math.round((count / breakdown.total) * 100) : 0;

          return (
            <div key={star} className="flex items-center gap-2">
              <span className="w-3 text-xs text-gray-500">{star}</span>
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-yellow-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-gray-500">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
