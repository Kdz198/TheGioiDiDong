import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/interfaces/product.types";
import { truncateText } from "@/utils/truncateText";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { PriceDisplay } from "./PriceDisplay";

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: number) => void;
}

export function ProductCard({
  product,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: ProductCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
      {/* ĐÃ SỬA: Dùng product.id thay vì slug vì API chi tiết dùng ID */}
      <Link to={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          {/* TẠM ẨN: API hiện tại chưa có trường isFlashSale. Nếu muốn hiện chữ 'Hoạt động', bạn có thể dùng product.active */}
          {/* {product.isFlashSale && (
            <Badge className="absolute left-2 top-2 bg-red-400 text-white">
              SALE
            </Badge>
          )} */}
        </div>
      </Link>

      {onToggleWishlist && (
        <button
          onClick={(e) => {
            e.preventDefault(); // Tránh kích hoạt Link khi bấm nút trái tim
            onToggleWishlist(product.id);
          }}
          className="absolute top-2 right-2 rounded-full bg-white p-1.5 shadow-sm transition-colors hover:bg-gray-50"
          aria-label={isWishlisted ? "Bỏ yêu thích" : "Thêm yêu thích"}>
          <Heart
            className={`h-4 w-4 ${isWishlisted ? "fill-teal-500 text-teal-500" : "text-gray-400"}`}
          />
        </button>
      )}

      <CardContent className="space-y-2 p-4">
        <p className="text-xs text-gray-400">{product.brand.name}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm font-medium text-zinc-900 transition-colors hover:text-teal-500">
            {truncateText(product.name, 50)}
          </h3>
        </Link>

        {/* LƯU Ý: API mới chưa có rating (đánh giá) và soldCount (đã bán).
            Mình tạm để mặc định là 5 sao và hiển thị Số lượng tồn kho (quantity) thay cho số đã bán */}
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
          <span className="text-xs text-gray-500">5.0 (0)</span>
          <span className="text-xs text-gray-400">
            | Kho: {product.variants[0]?.stockQuantity ?? 0}
          </span>
        </div>
        <PriceDisplay
          price={product.defaultPrice}
          originalPrice={product.defaultOriginalPrice}
          size="sm"
        />

        {onAddToCart && (
          <Button
            size="sm"
            className="w-full bg-teal-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-teal-600"
            onClick={(e) => {
              e.preventDefault(); // Tránh chuyển trang khi bấm thêm vào giỏ hàng
              onAddToCart(); // ĐÃ SỬA: Không truyền variantId nữa
            }}>
            <ShoppingCart className="mr-1 h-4 w-4" />
            Thêm vào giỏ
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
