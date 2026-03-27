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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

import { ProductCard } from "@/components/common/ProductCard";
import { ProductCardSkeleton } from "@/components/common/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import type { AppProduct } from "@/interfaces/product.types.ts";

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

export function ProductListPage() {
  const navigate = useNavigate();
  const { id: categoryIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggle: toggleWishlist } = useWishlistStore();

  // --- STATE LỌC & SẮP XẾP ---
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"hot" | "price_asc" | "price_desc">("hot");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12; // Để 12 cho chẵn hàng (lưới 4 cột)

  // --- API CALLS ---
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  const selectedCategory = categoryIdParam
    ? categories?.find((c) => c.id.toString() === categoryIdParam)
    : undefined;

  // Lấy TOÀN BỘ sản phẩm active (tương tự trang chủ) để xử lý lọc
  const { data: allProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["products", "all-active"],
    queryFn: productService.getAppFeaturedProducts,
  });

  // --- LOGIC LỌC DỮ LIỆU ---
  const filterOptions = useMemo(() => {
    if (!allProducts) return { brands: [], versions: [] };
    // Chỉ lấy options từ SẢN PHẨM (type: true)
    const realProducts = allProducts.filter((p) => p.type === true);
    return {
      brands: Array.from(new Set(realProducts.map((p) => p.brandName).filter(Boolean))),
      versions: Array.from(new Set(realProducts.map((p) => p.versionName).filter(Boolean))),
    };
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];

    const result = allProducts.filter((p) => {
      // 1. Chỉ lấy SẢN PHẨM (bỏ dịch vụ)
      if (p.type === false) return false;

      // 2. Lọc theo Danh mục (từ URL param)
      if (selectedCategory && p.categoryName !== selectedCategory.name) return false;

      // 3. Lọc theo Từ khóa tìm kiếm (nếu có)
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      // 4. Lọc theo Brand & Version (từ các nút bấm)
      const matchBrand = selectedBrand ? p.brandName === selectedBrand : true;
      const matchVersion = selectedVersion ? p.versionName === selectedVersion : true;

      return matchBrand && matchVersion;
    });

    // 5. Sắp xếp
    if (sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);

    return result;
  }, [allProducts, selectedCategory, searchQuery, selectedBrand, selectedVersion, sortBy]);

  // --- PHÂN TRANG ---
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset trang về 1 khi đổi bộ lọc
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, selectedBrand, selectedVersion, sortBy]);

  const handleCategoryClick = (categoryId: number | null) => {
    if (categoryId) {
      navigate(`/category/${categoryId}`);
    } else {
      navigate(`/products`); // Xoá URL param để về "Tất cả"
    }
  };

  const handleAddToCart = (product: AppProduct) => {
    const firstImage = product.imgUrls?.[0] || "";
    addItem({
      id: product.id,
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
    toast.success("Đã thêm vào giỏ hàng!");
  };

  const pageTitle = searchQuery
    ? `Tìm kiếm: "${searchQuery}"`
    : selectedCategory
      ? selectedCategory.name
      : "Tất Cả Sản Phẩm";

  return (
    <div className="min-h-screen bg-[#f1f1f1] pt-8 pb-12">
      <section className="relative h-62.5 w-full overflow-hidden rounded-b-4xl md:h-50">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/category-banner.svg')" }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-zinc-950/65 via-zinc-900/40 to-zinc-900/20" />

        <div className="relative container mx-auto flex h-full items-center px-4">
          <div className="max-w-2xl text-left text-white">
            <p className="text-xs font-semibold tracking-[0.2em] text-teal-100 uppercase">
              Danh mục sản phẩm
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight uppercase md:text-4xl">
              {pageTitle}
            </h1>
            <p className="mt-2 text-sm text-teal-50 md:text-base">
              Hiện có {filteredProducts.length} sản phẩm sẵn sàng để bạn khám phá.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-6 px-4">
        {/* THANH DANH MỤC */}
        <section className="rounded-b-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="scrollbar-hide flex gap-4 overflow-x-auto">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`group flex min-w-[100px] flex-col items-center justify-center rounded-lg border p-3 transition-all ${
                !categoryIdParam
                  ? "border-teal-500 bg-teal-50 font-semibold text-teal-700 shadow-inner"
                  : "border-gray-100 text-gray-700 hover:border-teal-200 hover:bg-gray-50"
              }`}>
              <LayoutGrid
                className={`mb-2 h-7 w-7 ${
                  !categoryIdParam ? "text-teal-600" : "text-gray-400 group-hover:text-teal-500"
                }`}
              />
              <span className="line-clamp-2 text-center text-xs">Tất cả</span>
            </button>

            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group flex min-w-[100px] flex-col items-center justify-center rounded-lg border p-3 transition-all ${
                  categoryIdParam === cat.id.toString()
                    ? "border-teal-500 bg-teal-50 font-semibold text-teal-700 shadow-inner"
                    : "border-gray-100 text-gray-700 hover:border-teal-200 hover:bg-gray-50"
                }`}>
                {getCategoryIcon(cat.name, categoryIdParam === cat.id.toString())}
                <span className="line-clamp-2 text-center text-xs">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* BỘ LỌC & LƯỚI SẢN PHẨM */}
        <section className="rounded-xl bg-white p-4 shadow-sm">
          {/* LỌC NHANH */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="mr-2 flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4" /> Lọc nhanh
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
            {(selectedBrand || selectedVersion) && (
              <button
                onClick={() => {
                  setSelectedBrand(null);
                  setSelectedVersion(null);
                }}
                className="flex items-center gap-1 rounded-full px-4 py-1.5 text-sm text-red-500 hover:bg-red-50">
                <X className="h-4 w-4" /> Bỏ chọn
              </button>
            )}
          </div>

          {/* SẮP XẾP */}
          <div className="mb-6 flex items-center gap-4 border-b border-gray-100 pb-4 text-sm">
            <span className="text-gray-500">Xếp theo:</span>
            <button
              onClick={() => setSortBy("hot")}
              className={`${sortBy === "hot" ? "font-bold text-teal-600" : "text-gray-600 hover:text-teal-600"}`}>
              Nổi bật
            </button>
            <button
              onClick={() => setSortBy("price_desc")}
              className={`flex items-center ${sortBy === "price_desc" ? "font-bold text-teal-600" : "text-gray-600 hover:text-teal-600"}`}>
              Giá cao <ArrowDown className="ml-1 h-3 w-3" />
            </button>
            <button
              onClick={() => setSortBy("price_asc")}
              className={`flex items-center ${sortBy === "price_asc" ? "font-bold text-teal-600" : "text-gray-600 hover:text-teal-600"}`}>
              Giá thấp <ArrowUp className="ml-1 h-3 w-3" />
            </button>
          </div>

          {/* LƯỚI SẢN PHẨM */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {productsLoading ? (
              Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
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
                <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp</p>
                {(selectedBrand || selectedVersion || searchQuery) && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSelectedBrand(null);
                      setSelectedVersion(null);
                      if (searchQuery) navigate("/products");
                    }}>
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* PHÂN TRANG */}
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
