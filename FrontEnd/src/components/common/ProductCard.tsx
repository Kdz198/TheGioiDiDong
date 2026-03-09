import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { truncateText } from "@/utils/truncateText";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { PriceDisplay } from "./PriceDisplay";

export function ProductCard({ product, onAddToCart, isWishlisted, onToggleWishlist }: any) {
  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.imgUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      {onToggleWishlist && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist(product.id);
          }}
          className="absolute top-2 right-2 rounded-full bg-white p-1.5 shadow-sm transition-colors hover:bg-gray-50">
          <Heart
            className={`h-4 w-4 ${isWishlisted ? "fill-teal-500 text-teal-500" : "text-gray-400"}`}
          />
        </button>
      )}
      <CardContent className="space-y-2 p-4">
        <p className="text-xs text-gray-400">{product.brandName}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm font-medium text-zinc-900 transition-colors hover:text-teal-500">
            {truncateText(product.name, 50)}
          </h3>
        </Link>
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
          <span className="text-xs text-gray-500">5.0 (0)</span>
          <span className="text-xs text-gray-400">| Kho: {product.quantity ?? 0}</span>
        </div>
        <PriceDisplay price={product.price || 0} originalPrice={product.price || 0} size="sm" />
        {onAddToCart && (
          <Button
            size="sm"
            className="w-full bg-teal-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-teal-600"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart();
            }}>
            <ShoppingCart className="mr-1 h-4 w-4" /> Thêm vào giỏ
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
