import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { productService } from "@/services/productService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

import { ProductCard } from "@/components/common/ProductCard";
import { ProductCardSkeleton } from "@/components/common/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import type { AppProduct } from "@/interfaces/product.types.ts";

export function ServicesPage() {
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggle: toggleWishlist } = useWishlistStore();

  const [sortBy, setSortBy] = useState<"hot" | "price_asc" | "price_desc">("hot");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Chỉ reset về trang 1 khi cách sắp xếp thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  const { data: allProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["products", "all-active"],
    queryFn: productService.getAppFeaturedProducts,
  });

  // LOGIC LỌC DỮ LIỆU: CHỈ LẤY DỊCH VỤ (type === false)
  const filteredServices = useMemo(() => {
    if (!allProducts) return [];

    // Lọc lấy các sản phẩm là dịch vụ
    const result = allProducts.filter((p) => p.type === false);

    // Xử lý sắp xếp
    if (sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);

    return result;
  }, [allProducts, sortBy]);

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddToCart = (product: AppProduct) => {
    const firstImage = product.imgUrls?.[0] || "";
    addItem({
      id: Date.now(),
      productId: product.id,
      variantId: product.id,
      product: { id: product.id, slug: product.name, name: product.name, thumbnailUrl: firstImage },
      appProduct: { id: product.id, name: product.name, imgUrls: [firstImage] },
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
    toast.success("Đã thêm dịch vụ vào giỏ hàng!");
  };

  return (
    <div className="min-h-screen bg-[#f1f1f1] pb-12">
      {/* HEADER ĐƠN GIẢN MÀU XANH TEAL */}
      {/* BANNER MỚI TINH TẾ PHONG CÁCH TMĐT */}
      <section className="relative h-[320px] w-full overflow-hidden bg-white md:h-[400px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-[1.02]"
          style={{ backgroundImage: "url('/service-banner-v2.png')" }}
        />

        {/* Soft Light Overlay for E-commerce feel */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent" />

        <div className="relative container mx-auto flex h-full items-center px-4 md:px-8">
          <div className="animate-in fade-in slide-in-from-left-4 max-w-xl text-left duration-700">
            <div className="mb-4 inline-flex items-center gap-2">
              <span className="h-[1px] w-8 bg-teal-600"></span>
              <span className="text-[11px] font-bold tracking-[0.2em] text-teal-600 uppercase">
                Dịch vụ Cá nhân hóa
              </span>
            </div>

            <h1 className="mb-4 text-3xl font-light tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
              Nâng Tầm <span className="font-semibold text-zinc-900">Phong Cách</span>
              <br />
              Thiết Bị Của Bạn
            </h1>

            <p className="mb-8 max-w-md text-sm leading-relaxed font-medium text-zinc-500 md:text-base">
              Dịch vụ in ốp lưng và dán skin cao cấp với công nghệ hiện đại. Sắc nét, bền bỉ và đậm
              chất riêng cho mọi dòng máy.
            </p>

            <button
              onClick={() =>
                document.getElementById("services-grid")?.scrollIntoView({ behavior: "smooth" })
              }
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-zinc-900 px-8 py-3.5 text-xs font-bold text-white transition-all hover:bg-teal-600">
              <span>KHÁM PHÁ NGAY</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      <div id="services-grid" className="container mx-auto mt-8 space-y-8 px-4">
        {/* KHU VỰC DỊCH VỤ */}
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
            <h2 className="text-xl font-bold text-zinc-900 uppercase">Khám phá Dịch vụ</h2>
          </div>

          <div className="mb-6 flex items-center gap-4 border-b border-gray-100 pb-4 text-sm">
            <span className="text-gray-500">Xếp theo:</span>
            <button
              onClick={() => setSortBy("hot")}
              className={`${sortBy === "hot" ? "font-bold text-teal-600" : "text-gray-600"}`}>
              Nổi bật
            </button>
            <button
              onClick={() => setSortBy("price_desc")}
              className={`flex items-center ${sortBy === "price_desc" ? "font-bold text-teal-600" : "text-gray-600"}`}>
              Phí cao <ArrowDown className="ml-1 h-3 w-3" />
            </button>
            <button
              onClick={() => setSortBy("price_asc")}
              className={`flex items-center ${sortBy === "price_asc" ? "font-bold text-teal-600" : "text-gray-600"}`}>
              Phí thấp <ArrowUp className="ml-1 h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {productsLoading ? (
              Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : paginatedServices.length > 0 ? (
              paginatedServices.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  isWishlisted={isInWishlist(product.id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <Star className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="text-gray-500">Hiện chưa có dịch vụ nào.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4 border-t border-gray-100 pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="gap-1 bg-white hover:bg-teal-50">
                <ChevronLeft className="h-4 w-4" /> Trước
              </Button>
              <span className="text-sm font-medium text-gray-600">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="gap-1 bg-white hover:bg-teal-50">
                Sau <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
