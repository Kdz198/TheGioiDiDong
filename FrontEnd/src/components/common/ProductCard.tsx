import { Button } from "@/components/ui/button";
import type { AppProduct } from "@/interfaces/product.types";
import { formatVND } from "@/utils/formatPrice";
import { ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: AppProduct;
  onAddToCart?: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Đảm bảo luôn có ít nhất 1 ảnh để hiển thị (tránh lỗi nếu API trả về rỗng)
  const images =
    product.imgUrls && product.imgUrls.length > 0 ? product.imgUrls : ["/placeholder-image.png"];

  useEffect(() => {
    // Nếu chỉ có 1 ảnh thì không cần xoay vòng
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 6000); // Đổi ảnh mỗi 3 giây

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-white transition-all hover:shadow-lg">
      {/* KHUNG CHỨA HÌNH ẢNH */}
      <Link
        to={`/products/${product.id}`}
        className="relative aspect-square overflow-hidden bg-gray-50">
        {/* Dải băng chứa tất cả ảnh nằm ngang */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}>
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${product.name} - ảnh ${index + 1}`}
              // shrink-0 rất quan trọng để ảnh không bị bóp méo khi nằm chung trong flex
              className="h-full w-full shrink-0 object-cover"
            />
          ))}
        </div>

        {/* Các dấu chấm (Dots) hiển thị vị trí ảnh - Giống Shopee/Tiki */}
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

      {/* THÔNG TIN SẢN PHẨM */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-gray-400">{product.brandName}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-medium text-zinc-900 group-hover:text-teal-600">
            {product.name}
          </h3>
        </Link>

        {/* Đánh giá */}
        <div className="mt-2 flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium text-gray-600">5.0</span>
          <span className="text-xs text-gray-400">(0)</span>
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-red-500">{formatVND(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              className="w-full flex-1 bg-teal-500 text-white hover:bg-teal-600"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.();
              }}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Mua
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
