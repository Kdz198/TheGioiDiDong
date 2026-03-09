import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowRight, ArrowUp, Filter, Star, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { ROUTES } from "@/router/routes.const";
import { productService } from "@/services/productService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

import { ProductCard } from "@/components/common/ProductCard";
import { ProductCardSkeleton } from "@/components/common/ProductCardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppProduct } from "@/interfaces/product.types.ts";

// --- COMPONENT ĐẾM NGƯỢC GIỮ NGUYÊN ---
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

  // --- STATE BỘ LỌC VÀ SẮP XẾP ---
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"hot" | "price_asc" | "price_desc">("hot");

  // --- CALL API ---
  const { data: flashSaleProducts, isLoading: flashSaleLoading } = useQuery({
    queryKey: ["products", "flash-sale"],
    queryFn: productService.getAppFlashSaleProducts,
  });

  // Gọi API lấy toàn bộ sản phẩm active để xử lý lọc
  const { data: allProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["products", "all-active"],
    // Tạm dùng getProducts (nếu API này trả về nhiều) hoặc getFeaturedProducts tuỳ bạn
    queryFn: productService.getAppFeaturedProducts,
  });

  // --- LOGIC TRÍCH XUẤT DANH SÁCH LỌC DUY NHẤT ---
  const filterOptions = useMemo(() => {
    if (!allProducts) return { brands: [], categories: [], versions: [] };
    return {
      brands: Array.from(new Set(allProducts.map((p) => p.brandName).filter(Boolean))),
      categories: Array.from(new Set(allProducts.map((p) => p.categoryName).filter(Boolean))),
      versions: Array.from(new Set(allProducts.map((p) => p.versionName).filter(Boolean))),
    };
  }, [allProducts]);

  // --- LOGIC ÁP DỤNG BỘ LỌC & SẮP XẾP ---
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];

    // 1. Lọc (Filter)
    const result = allProducts.filter((p) => {
      const matchBrand = selectedBrand ? p.brandName === selectedBrand : true;
      const matchCategory = selectedCategory ? p.categoryName === selectedCategory : true;
      const matchVersion = selectedVersion ? p.versionName === selectedVersion : true;
      return matchBrand && matchCategory && matchVersion;
    });

    // 2. Sắp xếp (Sort)
    if (sortBy === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    }
    // "hot" thì giữ nguyên thứ tự gốc hoặc tự custom thêm

    return result;
  }, [allProducts, selectedBrand, selectedCategory, selectedVersion, sortBy]);

  // --- THÊM GIỎ HÀNG ---
  const handleAddToCart = (product: AppProduct) => {
    addItem({
      id: Date.now(),
      productId: product.id,
      variantId: product.id,
      product: {
        id: product.id,
        slug: product.name,
        name: product.name,
        thumbnailUrl: product.imgUrl,
      },
      appProduct: {
        id: product.id,
        name: product.name,
        imgUrl: product.imgUrl,
      },
      variant: {
        id: product.id,
        sku: `SKU-${product.id}`,
        color: "Mặc định",
        size: "Mặc định",
        price: product.price,
        originalPrice: product.price,
        stockQuantity: product.quantity ?? 0,
      },
      quantity: 1,
      subtotal: product.price,
    });
    toast.success("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="min-h-screen space-y-12 bg-gray-50 pb-12">
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

      {/* Flash Sale */}
      <section className="container mx-auto px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 fill-red-500 text-red-500" />
            <h2 className="text-xl font-bold text-red-500 italic">SĂN SALE ONLINE</h2>
            {flashSaleProducts?.[0]?.active && (
              <CountdownTimer endAt={new Date(Date.now() + 86400000).toISOString()} /> // Giả lập đồng hồ 24h
            )}
          </div>
          <Link
            to={ROUTES.PRODUCTS}
            className="flex items-center gap-1 text-sm text-red-500 hover:underline">
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
                    onAddToCart={() => handleAddToCart(product)}
                    isWishlisted={isInWishlist(product.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                </div>
              ))}
        </div>
      </section>

      {/* TẤT CẢ SẢN PHẨM & BỘ LỌC GIỐNG TGDD */}
      <section className="container mx-auto px-4">
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-zinc-900">Gợi ý cho bạn</h2>

          <div className="space-y-4">
            {/* ROW 1: BRAND (THƯƠNG HIỆU) */}
            {filterOptions.brands.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-24 text-sm font-medium text-gray-500">Thương hiệu:</span>
                {filterOptions.brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                      selectedBrand === brand
                        ? "border-teal-500 bg-teal-50 font-semibold text-teal-700"
                        : "border-gray-200 text-gray-600 hover:border-teal-300"
                    }`}>
                    {brand}
                  </button>
                ))}
              </div>
            )}

            {/* ROW 2: CATEGORY (DANH MỤC) */}
            {filterOptions.categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-24 text-sm font-medium text-gray-500">Danh mục:</span>
                {filterOptions.categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                      selectedCategory === cat
                        ? "border-blue-500 bg-blue-50 font-semibold text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-blue-300"
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* ROW 3: VERSION (PHIÊN BẢN) */}
            {filterOptions.versions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-24 text-sm font-medium text-gray-500">Dòng máy:</span>
                {filterOptions.versions.map((ver) => (
                  <button
                    key={ver}
                    onClick={() => setSelectedVersion(selectedVersion === ver ? null : ver)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                      selectedVersion === ver
                        ? "border-purple-500 bg-purple-50 font-semibold text-purple-700"
                        : "border-gray-200 text-gray-600 hover:border-purple-300"
                    }`}>
                    {ver}
                  </button>
                ))}
              </div>
            )}

            {/* Xoá bộ lọc */}
            {(selectedBrand || selectedCategory || selectedVersion) && (
              <div className="flex pt-2">
                <button
                  onClick={() => {
                    setSelectedBrand(null);
                    setSelectedCategory(null);
                    setSelectedVersion(null);
                  }}
                  className="flex items-center gap-1 rounded-full border border-red-200 px-4 py-1.5 text-sm text-red-500 hover:bg-red-50">
                  <X className="h-4 w-4" /> Bỏ chọn tất cả
                </button>
              </div>
            )}
          </div>

          <hr className="my-4 border-gray-100" />

          {/* SẮP XẾP */}
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-gray-500">
              <Filter className="h-4 w-4" /> Sắp xếp theo:
            </span>
            <button
              onClick={() => setSortBy("hot")}
              className={`transition-colors ${sortBy === "hot" ? "font-bold text-teal-600" : "text-gray-600 hover:text-teal-600"}`}>
              Nổi bật
            </button>
            <button
              onClick={() => setSortBy("price_desc")}
              className={`flex items-center gap-1 transition-colors ${sortBy === "price_desc" ? "font-bold text-teal-600" : "text-gray-600 hover:text-teal-600"}`}>
              Giá cao <ArrowDown className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSortBy("price_asc")}
              className={`flex items-center gap-1 transition-colors ${sortBy === "price_asc" ? "font-bold text-teal-600" : "text-gray-600 hover:text-teal-600"}`}>
              Giá thấp <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* LƯỚI SẢN PHẨM */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {productsLoading ? (
            Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                isWishlisted={isInWishlist(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
              <Star className="mb-4 h-12 w-12 text-gray-300" />
              <p className="text-lg">Không tìm thấy sản phẩm nào phù hợp với bộ lọc!</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedBrand(null);
                  setSelectedCategory(null);
                  setSelectedVersion(null);
                }}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
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
