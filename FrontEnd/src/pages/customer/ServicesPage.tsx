import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Battery,
  BatteryCharging,
  Bluetooth,
  Box,
  Camera,
  ChevronLeft,
  ChevronRight,
  Filter,
  Headphones,
  LayoutGrid,
  Mouse,
  Phone,
  Star,
  Watch,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

import { ProductCard } from "@/components/common/ProductCard";
import { ProductCardSkeleton } from "@/components/common/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import type { AppProduct } from "@/interfaces/product.types.ts";

// --- DÙNG LẠI BỘ ICON TỪ HOMEPAGE ---
const getCategoryIcon = (categoryName: string, isSelected: boolean) => {
  const baseClassName = `w-7 h-7 mb-2 transition-colors ${
    isSelected ? "text-teal-600" : "text-gray-400 group-hover:text-teal-500"
  }`;

  switch (categoryName.trim()) {
    case "Ốp lưng":
      return <Phone className={`${baseClassName} text-sky-500`} />;
    case "Sạc, cáp":
      return <BatteryCharging className={`${baseClassName} text-orange-500`} />;
    case "Tai nghe":
      return <Headphones className={`${baseClassName} text-purple-500`} />;
    case "Ốp tai nghe":
      return <Box className={`${baseClassName} text-pink-500`} />;
    case "Sạc dự phòng":
      return <Battery className={`${baseClassName} text-green-500`} />;
    case "Loa":
      return <Bluetooth className={`${baseClassName} text-indigo-500`} />;
    case "Chuột, bàn phím":
      return <Mouse className={`${baseClassName} text-amber-500`} />;
    case "Camera":
      return <Camera className={`${baseClassName} text-red-500`} />;
    case "Đồng hồ":
      return <Watch className={`${baseClassName} text-rose-500`} />;
    default:
      return <LayoutGrid className={`${baseClassName} text-gray-400`} />;
  }
};

export function ServicesPage() {
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggle: toggleWishlist } = useWishlistStore();

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"hot" | "price_asc" | "price_desc">("hot");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrand, selectedCategory, selectedVersion, sortBy]);

  const { data: allProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["products", "all-active"],
    queryFn: productService.getAppFeaturedProducts,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  // LOGIC LỌC DỮ LIỆU: CHỈ LẤY DỊCH VỤ (type === false)
  const filterOptions = useMemo(() => {
    if (!allProducts) return { brands: [], versions: [] };
    const serviceProducts = allProducts.filter((p) => p.type === false);
    return {
      brands: Array.from(new Set(serviceProducts.map((p) => p.brandName).filter(Boolean))),
      versions: Array.from(new Set(serviceProducts.map((p) => p.versionName).filter(Boolean))),
    };
  }, [allProducts]);

  const filteredServices = useMemo(() => {
    if (!allProducts) return [];
    const result = allProducts.filter((p) => {
      // BẮT BUỘC LÀ DỊCH VỤ
      if (p.type === true) return false;
      const matchBrand = selectedBrand ? p.brandName === selectedBrand : true;
      const matchCategory = selectedCategory ? p.categoryName === selectedCategory : true;
      const matchVersion = selectedVersion ? p.versionName === selectedVersion : true;
      return matchBrand && matchCategory && matchVersion;
    });

    if (sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);

    return result;
  }, [allProducts, selectedBrand, selectedCategory, selectedVersion, sortBy]);

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
      {/* HEADER ĐƠN GIẢN MÀU XANH TEAL (KHÔNG ẢNH BANNER) */}
      <section className="bg-gradient-to-r from-teal-500 to-teal-600 pt-16 pb-24">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-3xl font-extrabold tracking-tight uppercase md:text-5xl">
            Dịch Vụ & Cá Nhân Hóa
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-medium text-teal-100">
            Thiết kế riêng theo phong cách của bạn. In ốp lưng, dán màn hình và hơn thế nữa.
          </p>
        </div>
      </section>

      {/* THANH DANH MỤC (ĐÈ LÊN HEADER XANH TEAL) */}
      <section className="relative z-10 container mx-auto -mt-12 px-4">
        <div className="scrollbar-hide flex gap-4 overflow-x-auto rounded-xl border border-gray-100 bg-white p-4 shadow-md">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`group flex min-w-[100px] flex-col items-center justify-center rounded-lg border p-3 transition-all ${
              selectedCategory === null
                ? "border-teal-500 bg-teal-50 font-semibold text-teal-700 shadow-inner"
                : "border-gray-100 text-gray-700 hover:border-teal-200 hover:bg-gray-50"
            }`}>
            <LayoutGrid
              className={`mb-2 h-7 w-7 ${
                selectedCategory === null
                  ? "text-teal-600"
                  : "text-gray-400 group-hover:text-teal-500"
              }`}
            />
            <span className="line-clamp-2 text-center text-xs">Tất cả</span>
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`group flex min-w-[100px] flex-col items-center justify-center rounded-lg border p-3 transition-all ${
                selectedCategory === cat.name
                  ? "border-teal-500 bg-teal-50 font-semibold text-teal-700 shadow-inner"
                  : "border-gray-100 text-gray-700 hover:border-teal-200 hover:bg-gray-50"
              }`}>
              {getCategoryIcon(cat.name, selectedCategory === cat.name)}
              <span className="line-clamp-2 text-center text-xs">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="container mx-auto mt-8 space-y-8 px-4">
        {/* KHU VỰC DỊCH VỤ & BỘ LỌC */}
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
            <h2 className="text-xl font-bold text-zinc-900 uppercase">Khám phá Dịch vụ</h2>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="mr-2 flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4" /> Lọc
            </div>
            {filterOptions.brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  selectedBrand === brand
                    ? "border-teal-500 bg-teal-50 font-semibold text-teal-700"
                    : "border-gray-200 text-gray-600 hover:border-teal-500"
                }`}>
                {brand}
              </button>
            ))}
            {filterOptions.versions.map((ver) => (
              <button
                key={ver}
                onClick={() => setSelectedVersion(selectedVersion === ver ? null : ver)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  selectedVersion === ver
                    ? "border-teal-500 bg-teal-50 font-semibold text-teal-700"
                    : "border-gray-200 text-gray-600 hover:border-teal-500"
                }`}>
                {ver}
              </button>
            ))}
            {(selectedBrand || selectedCategory || selectedVersion) && (
              <button
                onClick={() => {
                  setSelectedBrand(null);
                  setSelectedCategory(null);
                  setSelectedVersion(null);
                }}
                className="flex items-center gap-1 rounded-full px-4 py-1.5 text-sm text-red-500 hover:bg-red-50">
                <X className="h-4 w-4" /> Bỏ chọn
              </button>
            )}
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
                <p className="text-gray-500">Hiện chưa có dịch vụ nào phù hợp.</p>
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
