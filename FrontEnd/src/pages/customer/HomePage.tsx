import { CategoryCard } from "@/components/common/CategoryCard";
import { ProductCard } from "@/components/common/ProductCard";
import { ProductCardSkeleton } from "@/components/common/ProductCardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/interfaces/product.types";
import { ROUTES } from "@/router/routes.const";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

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
    }, 1000);
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

export function HomePage() {
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggle: toggleWishlist } = useWishlistStore();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  const { data: flashSaleProducts, isLoading: flashSaleLoading } = useQuery({
    queryKey: ["products", "flash-sale"],
    queryFn: productService.getFlashSaleProducts,
  });

  const { data: featuredProducts, isLoading: featuredLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: productService.getFeaturedProducts,
  });

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      productId: product.id,
      variantId: product.id,
      product: {
        id: product.id,
        slug: product.id.toString(),
        name: product.name,
        thumbnailUrl: product.thumbnailUrl,
      },
      variant: {
        id: product.id,
        sku: `SKU-${product.id}`,
        color: "Mặc định",
        size: "Mặc định",
        price: product.defaultPrice,
        originalPrice: product.defaultOriginalPrice,
        stockQuantity: product.variants[0]?.stockQuantity ?? 0,
      },
      quantity: 1,
      subtotal: product.defaultPrice,
    });
    toast.success("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-teal-500 to-teal-600">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-16 text-center text-white md:py-24">
          <Badge className="bg-red-400 text-white">SIÊU SALE</Badge>
          <h1 className="text-3xl font-bold md:text-5xl">Phụ Kiện Công Nghệ Chính Hãng</h1>
          <p className="max-w-lg text-teal-100">
            Giảm đến 50% cho hàng nghìn sản phẩm. Giao hàng nhanh toàn quốc.
          </p>
          <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100" asChild>
            <Link to={ROUTES.PRODUCTS}>
              Khám phá ngay <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <h2 className="mb-6 text-xl font-bold text-zinc-900">Danh Mục Sản Phẩm</h2>
        {categoriesLoading ? (
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-4">
                <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
            {categories?.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* Flash Sale */}
      <section className="container mx-auto px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-bold text-zinc-900">SĂN SALE ONLINE</h2>
            {flashSaleProducts?.[0]?.flashSaleEndAt && (
              <CountdownTimer endAt={flashSaleProducts[0].flashSaleEndAt} />
            )}
          </div>
          <Link
            to={ROUTES.PRODUCTS}
            className="flex items-center gap-1 text-sm text-teal-500 hover:underline">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {flashSaleLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-56 shrink-0">
                  <ProductCardSkeleton />
                </div>
              ))
            : flashSaleProducts?.map((product) => (
                <div key={product.id} className="w-56 shrink-0">
                  <ProductCard
                    product={product}
                    // ĐÃ SỬA: Bỏ truyền vid vì không còn biến thể
                    onAddToCart={() => handleAddToCart(product)}
                    isWishlisted={isInWishlist(product.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                </div>
              ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900">Sản Phẩm Nổi Bật</h2>
          <Link
            to={ROUTES.PRODUCTS}
            className="flex items-center gap-1 text-sm text-teal-500 hover:underline">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {featuredLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featuredProducts?.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  isWishlisted={isInWishlist(product.id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-teal-600">
        <div className="container mx-auto px-4 py-12 text-center text-white">
          <h2 className="text-2xl font-bold">Đăng ký nhận tin</h2>
          <p className="mt-2 text-teal-100">Nhận thông tin khuyến mãi và sản phẩm mới nhất</p>
          <div className="mx-auto mt-6 flex max-w-md gap-2">
            <input
              type="email"
              placeholder="Email của bạn"
              className="flex-1 rounded-lg border-0 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-gray-400"
            />
            <Button className="bg-white text-teal-600 hover:bg-gray-100">Đăng ký</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
