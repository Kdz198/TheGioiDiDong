import { calculateDiscountPercent, formatVND } from "@/utils/formatPrice";

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: { sale: "text-sm", original: "text-xs", badge: "text-xs px-1.5 py-0.5" },
  md: { sale: "text-lg", original: "text-sm", badge: "text-xs px-2 py-0.5" },
  lg: { sale: "text-2xl", original: "text-base", badge: "text-sm px-2 py-1" },
};

export function PriceDisplay({ price, originalPrice, size = "md" }: PriceDisplayProps) {
  const classes = sizeClasses[size];
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount ? calculateDiscountPercent(originalPrice, price) : 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`font-bold text-red-400 ${classes.sale}`}>{formatVND(price)}</span>
      {hasDiscount && (
        <>
          <span className={`text-gray-400 line-through ${classes.original}`}>
            {formatVND(originalPrice)}
          </span>
          <span className={`rounded bg-red-400 font-semibold text-white ${classes.badge}`}>
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}
