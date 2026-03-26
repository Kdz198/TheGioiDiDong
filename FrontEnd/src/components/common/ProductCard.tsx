import { Button } from "@/components/ui/button";
import type { AppProduct } from "@/interfaces/product.types";
import type { ProductFeedbackItem } from "@/services/feedbackService";
import { feedbackService } from "@/services/feedbackService";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: AppProduct;
  onAddToCart?: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images =
    product.imgUrls && product.imgUrls.length > 0 ? product.imgUrls : ["/placeholder-image.png"];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  // --- LẤY DỮ LIỆU FEEDBACK ---
  const { data: reviews, isError } = useQuery({
    queryKey: ["product-rating", product.id],
    queryFn: () => feedbackService.getProductFeedbacks(product.id),
    enabled: !!product.id,
    staleTime: 1000 * 60 * 10, // Cache 10 phút
    retry: false, // Không cần thử lại nhiều lần nếu server lỗi
  });

  // Tính toán số sao trung bình
  const { avgRating, totalReviews, hasFeedback } = useMemo(() => {
    // Nếu API lỗi (isError) hoặc không phải mảng, coi như không có feedback
    const validReviews: ProductFeedbackItem[] = Array.isArray(reviews) ? reviews : [];
    const count = validReviews.length;

    if (count === 0 || isError) {
      return { avgRating: null, totalReviews: 0, hasFeedback: false };
    }

    const sum = validReviews.reduce((acc: number, r) => acc + (r.rating ?? 0), 0);
    return {
      avgRating: (sum / count).toFixed(1),
      totalReviews: count,
      hasFeedback: true,
    };
  }, [reviews, isError]);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-white transition-all hover:shadow-lg">
      {/* HÌNH ẢNH */}
      <Link
        to={`/products/${product.id}`}
        className="relative aspect-square overflow-hidden bg-gray-50">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}>
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={product.name}
              className="h-full w-full shrink-0 object-cover"
            />
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute right-0 bottom-2 left-0 z-10 flex justify-center gap-1.5">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImgIndex ? "w-4 bg-teal-500" : "w-1.5 bg-gray-300/80"
                }`}
              />
            ))}
          </div>
        )}
      </Link>

      {/* NỘI DUNG */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          {product.brandName}
        </p>
        <Link to={`/products/${product.id}`}>
          <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-semibold text-zinc-800 transition-colors group-hover:text-teal-600">
            {product.name}
          </h3>
        </Link>

        {/* PHẦN ĐÁNH GIÁ ĐÃ ĐƯỢC XỬ LÝ LỖI */}
        <div className="mt-2 flex min-h-[20px] items-center gap-1">
          {hasFeedback ? (
            <>
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-700">{avgRating}</span>
              <span className="text-[10px] text-gray-400">({totalReviews})</span>
            </>
          ) : (
            <span className="text-[11px] text-gray-400 italic">Chưa có đánh giá</span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-red-500">{formatVND(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              className="w-full flex-1 bg-teal-500 text-white shadow-sm hover:bg-teal-600"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.();
              }}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Mua ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
