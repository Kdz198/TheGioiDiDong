import { ProductCard } from "@/components/common/ProductCard";
import { ProductCardSkeleton } from "@/components/common/ProductCardSkeleton";
import { FLASH_SALE } from "@/constants/app.const";
import type { Product } from "@/interfaces/product.types";
import { ROUTES } from "@/router/routes.const";
import { ArrowRight, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface FlashSaleSectionProps {
  products: Product[];
  isLoading?: boolean;
  endAt?: string;
  onAddToCart?: (product: Product, variantId: number) => void;
  isWishlisted?: (productId: number) => boolean;
  onToggleWishlist?: (productId: number) => void;
}

function CountdownTimer({ endAt }: { endAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endAt).getTime();
      const diff = Math.max(0, end - now);
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, FLASH_SALE.REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [endAt]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex gap-1">
      {[pad(timeLeft.hours), pad(timeLeft.minutes), pad(timeLeft.seconds)].map((val, i) => (
        <div key={i} className="flex items-center gap-1">
          <span className="rounded bg-red-400 px-2 py-1 text-sm font-bold text-white">{val}</span>
          {i < 2 && <span className="text-sm font-bold text-red-400">:</span>}
        </div>
      ))}
    </div>
  );
}

export function FlashSaleSection({
  products,
  isLoading,
  endAt,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: FlashSaleSectionProps) {
  return (
    <section className="container mx-auto px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-red-400" />
          <h2 className="text-xl font-bold text-zinc-900">SĂN SALE ONLINE</h2>
          {endAt && <CountdownTimer endAt={endAt} />}
        </div>
        <Link
          to={ROUTES.PRODUCTS}
          className="flex items-center gap-1 text-sm text-teal-500 hover:underline">
          Xem tất cả <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-56 shrink-0">
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((product) => (
              <div key={product.id} className="w-56 shrink-0">
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart ? () => onAddToCart(product, product.id) : undefined}
                  isWishlisted={isWishlisted?.(product.id)}
                  onToggleWishlist={onToggleWishlist}
                />
              </div>
            ))}
      </div>
    </section>
  );
}
