import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";
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
      {/* BANNER MỚI HIỆN ĐẠI HƠN */}
      <section className="relative h-[480px] w-full overflow-hidden">
        {/* Background Image with subtle zoom effect */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('/service-banner.png')" }}
        />
        
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[1px]" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-teal-500/20 to-transparent" />
        
        <div className="container relative mx-auto flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <div className="max-w-4xl rounded-[2rem] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl md:p-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-4 py-1.5 text-sm font-bold tracking-wider text-teal-300 uppercase backdrop-blur-md border border-teal-500/30">
              <Sparkles className="h-4 w-4" /> Dịch vụ đẳng cấp
            </div>
            
            <h1 className="mb-6 text-4xl font-black tracking-tighter uppercase md:text-7xl">
              <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
                Dịch Vụ
              </span>
              <span className="mx-2 text-teal-400">&</span>
              <span className="bg-gradient-to-b from-teal-300 to-teal-500 bg-clip-text text-transparent">
                Cá Nhân Hóa
              </span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg font-medium leading-relaxed text-zinc-100 md:text-xl">
              Nâng tầm đẳng cấp thiết bị của bạn với dịch vụ 
              <span className="mx-1 font-bold text-white underline decoration-teal-500 underline-offset-4">in ấn ốp lưng</span> 
              và 
              <span className="mx-1 font-bold text-white underline decoration-teal-500 underline-offset-4">dán skin phụ kiện</span> 
              sắc nét từng pixel, bền bỉ cùng thời gian.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-2xl bg-black/30 px-5 py-3 text-sm font-bold backdrop-blur-md border border-white/10 transition-colors hover:bg-black/50">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span>IN UV CỰC NÉT</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-black/30 px-5 py-3 text-sm font-bold backdrop-blur-md border border-white/10 transition-colors hover:bg-black/50">
                <ShieldCheck className="h-5 w-5 text-teal-400" />
                <span>DÁN SKIN KHÍT MÁY</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-black/30 px-5 py-3 text-sm font-bold backdrop-blur-md border border-white/10 transition-colors hover:bg-black/50">
                <Star className="h-5 w-5 text-orange-400" />
                <span>BẢO HÀNH TRỌN ĐỜI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto mt-8 space-y-8 px-4">
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
