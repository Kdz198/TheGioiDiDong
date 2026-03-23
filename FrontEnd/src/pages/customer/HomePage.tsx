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
  ChevronRightCircle,
  Filter,
  Headphones,
  LayoutGrid,
  Mouse,
  Phone,
  Star,
  Ticket,
  Watch,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { promotionService } from "@/services/promotionService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

import { ProductCard } from "@/components/common/ProductCard";
import { ProductCardSkeleton } from "@/components/common/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import type { AppProduct } from "@/interfaces/product.types.ts";
import { formatVND } from "@/utils/formatPrice";

const BANNER_PAIRS = [
  [
    "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/a3/79/a379154355efe99423b6d98c0726f3b8.png",
    "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/42/43/42434e6f2cb607843a7e1ade2cfbcc1d.png",
  ],
  [
    "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/be/4f/be4fd9af8e3c060d5204ae217d366064.png",
    "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/99/e0/99e0c4d15e6bc0d7c632326263b86f91.jpg",
  ],
  [
    "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/0d/01/0d01a110e0004a6bdd7a0e77db9e8344.png",
    "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/65/79/65793aa3501c282438704d55a085615d.png",
  ],
];

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

export function HomePage() {
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggle: toggleWishlist } = useWishlistStore();

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"hot" | "price_asc" | "price_desc">("hot");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // --- States for Sliders ---
  const [currentBanner, setCurrentBanner] = useState(0);
  const [bogoIdx, setBogoIdx] = useState(0);
  const [promoIdx, setPromoIdx] = useState(0);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrand, selectedCategory, selectedVersion, sortBy]);

  // --- Data Fetching ---
  const { data: promotions, isLoading: promoLoading } = useQuery({
    queryKey: ["promotions", "active"],
    queryFn: promotionService.getActivePromotions,
  });

  const { data: allProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["products", "all-active"],
    queryFn: productService.getAppFeaturedProducts,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  // --- Logic for Vouchers (Mã tặng bạn) ---
  const discountPromos = useMemo(
    () => promotions?.filter((p) => p.type !== "BOGO") || [],
    [promotions]
  );

  const nextPromo = () => setPromoIdx((prev) => (prev + 2 < discountPromos.length ? prev + 2 : 0));
  const prevPromo = () =>
    setPromoIdx((prev) => (prev - 2 >= 0 ? prev - 2 : Math.max(0, discountPromos.length - 2)));

  // --- Logic for BOGO ---
  const bogoPromotion = promotions?.find((p) => p.type === "BOGO");
  const bogoProductIds = bogoPromotion?.applicableProductIds?.filter((id) => id > 0) || [];

  const { data: bogoProducts, isLoading: bogoLoading } = useQuery({
    queryKey: ["bogo-products", bogoProductIds],
    queryFn: async () => {
      if (bogoProductIds.length === 0) return [];
      const promises = bogoProductIds.map((id) => productService.getAppProductById(id));
      const results = await Promise.allSettled(promises);
      return results
        .filter((res): res is PromiseFulfilledResult<AppProduct> => res.status === "fulfilled")
        .map((res) => res.value);
    },
  });

  const nextBogo = () =>
    setBogoIdx((prev) => (bogoProducts && prev + 2 < bogoProducts.length ? prev + 2 : 0));
  const prevBogo = () =>
    setBogoIdx((prev) =>
      bogoProducts && prev - 2 >= 0 ? prev - 2 : Math.max(0, (bogoProducts?.length || 0) - 2)
    );

  // --- Filtering & Sorting Logic ---
  const filterOptions = useMemo(() => {
    if (!allProducts) return { brands: [], versions: [] };
    const realProducts = allProducts.filter((p) => p.type === true);
    return {
      brands: Array.from(new Set(realProducts.map((p) => p.brandName).filter(Boolean))),
      versions: Array.from(new Set(realProducts.map((p) => p.versionName).filter(Boolean))),
    };
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    const result = allProducts.filter((p) => {
      if (p.type === false) return false;
      const matchBrand = selectedBrand ? p.brandName === selectedBrand : true;
      const matchCategory = selectedCategory ? p.categoryName === selectedCategory : true;
      const matchVersion = selectedVersion ? p.versionName === selectedVersion : true;
      return matchBrand && matchCategory && matchVersion;
    });
    if (sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);
    return result;
  }, [allProducts, selectedBrand, selectedCategory, selectedVersion, sortBy]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // --- Handlers ---
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã lưu mã: ${code}`);
  };

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
    toast.success("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="min-h-screen bg-[#f1f1f1] pb-12">
      {/* HERO BANNER */}
      <section className="bg-gradient-to-r from-teal-500 to-teal-600 pt-6 pb-20">
        <div className="group relative container mx-auto px-4">
          <div className="overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
              {BANNER_PAIRS.map((pair, idx) => (
                <div key={idx} className="flex w-full shrink-0 gap-2 sm:gap-4">
                  <div className="w-1/2 overflow-hidden rounded-xl shadow-md">
                    <img src={pair[0]} alt={`Banner left ${idx}`} className="block h-auto w-full" />
                  </div>
                  <div className="w-1/2 overflow-hidden rounded-xl shadow-md">
                    <img
                      src={pair[1]}
                      alt={`Banner right ${idx}`}
                      className="block h-auto w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setCurrentBanner((p) => (p === 0 ? BANNER_PAIRS.length - 1 : p - 1))}
            className="absolute top-1/2 left-0 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 transition-all group-hover:opacity-100 sm:-left-3 sm:p-3 lg:-left-5">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => setCurrentBanner((p) => (p + 1) % BANNER_PAIRS.length)}
            className="absolute top-1/2 right-0 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 transition-all group-hover:opacity-100 sm:-right-3 sm:p-3 lg:-right-5">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </section>

      {/* DANH MỤC */}
      <section className="relative z-10 container mx-auto -mt-6 px-4">
        <div className="scrollbar-hide flex gap-4 overflow-x-auto rounded-xl border border-gray-100 bg-white p-4 shadow-md">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`group flex min-w-[100px] flex-col items-center justify-center rounded-lg border p-3 transition-all ${selectedCategory === null ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-100 hover:bg-gray-50"}`}>
            <LayoutGrid
              className={`mb-2 h-7 w-7 ${selectedCategory === null ? "text-teal-600" : "text-gray-400"}`}
            />
            <span className="text-xs">Tất cả</span>
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`group flex min-w-[100px] flex-col items-center justify-center rounded-lg border p-3 transition-all ${selectedCategory === cat.name ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-100 hover:bg-gray-50"}`}>
              {getCategoryIcon(cat.name, selectedCategory === cat.name)}
              <span className="line-clamp-2 text-center text-xs">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="container mx-auto mt-8 space-y-8 px-4">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* CỘT TRÁI: MÃ TẶNG BẠN (Dạng Slider & Ticket) */}
          <div className="group relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">Mã tặng bạn</h2>
              {discountPromos.length > 2 && (
                <div className="flex gap-2">
                  <button
                    onClick={prevPromo}
                    className="rounded-full border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-teal-50 hover:text-teal-600">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextPromo}
                    className="rounded-full border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-teal-50 hover:text-teal-600">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3 overflow-hidden">
              {promoLoading ? (
                <p className="text-sm text-gray-400 italic">Đang tải mã...</p>
              ) : (
                discountPromos.slice(promoIdx, promoIdx + 2).map((promo) => (
                  <div
                    key={promo.id}
                    className="relative flex w-1/2 overflow-hidden rounded-xl border border-teal-100 bg-white shadow-sm transition-all hover:shadow-md">
                    {/* Left Side (Icon Section) */}
                    <div className="relative flex w-[35%] flex-col items-center justify-center bg-gradient-to-br from-teal-500 to-teal-600 p-2 text-white">
                      <Ticket className="mb-1 h-6 w-6" />
                      <span className="text-[9px] font-black uppercase opacity-80">
                        {promo.type}
                      </span>
                      <div className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-white shadow-inner" />
                      <div className="absolute -right-1.5 -bottom-1.5 h-3 w-3 rounded-full bg-white shadow-inner" />
                    </div>
                    {/* Right Side (Info Section) */}
                    <div className="flex w-[65%] flex-col justify-between border-l border-dashed border-teal-200 bg-teal-50/20 p-2.5">
                      <div>
                        <h3 className="line-clamp-1 text-[13px] font-extrabold text-teal-800">
                          GIẢM{" "}
                          {promo.type === "PERCENTAGE"
                            ? `${promo.discountValue}%`
                            : formatVND(promo.discountValue)}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[10px] leading-tight text-gray-500 italic">
                          {promo.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyCode(promo.code)}
                        className="mt-2 w-full rounded-lg border border-teal-500 bg-white py-1 text-[10px] font-bold text-teal-600 transition-all hover:bg-teal-600 hover:text-white">
                        Lưu mã
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CỘT PHẢI: MUA 1 TẶNG 1 */}
          <div className="group relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">Mua 1 Tặng 1</h2>
              {bogoProducts && bogoProducts.length > 2 && (
                <div className="flex gap-2">
                  <button
                    onClick={prevBogo}
                    className="rounded-full border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextBogo}
                    className="rounded-full border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3 overflow-hidden">
              {bogoLoading ? (
                <p className="text-sm text-gray-400">Đang tải...</p>
              ) : (
                bogoProducts?.slice(bogoIdx, bogoIdx + 2).map((product) => (
                  <Link
                    to={`/products/${product.id}`}
                    key={product.id}
                    className="flex w-1/2 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-2 transition-all hover:border-teal-300 hover:bg-white hover:shadow-sm">
                    <img
                      src={product.imgUrls?.[0]}
                      alt={product.name}
                      className="h-14 w-14 rounded-lg border bg-white object-cover"
                    />
                    <div className="flex-1 overflow-hidden">
                      <h4 className="line-clamp-2 text-xs font-medium text-gray-800">
                        {product.name}
                      </h4>
                      <p className="mt-1 text-sm font-bold text-red-500">
                        {formatVND(product.price)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* GỢI Ý SẢN PHẨM & BỘ LỌC */}
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
            <h2 className="text-xl font-bold text-zinc-900 uppercase">Gợi ý sản phẩm</h2>
            <Link
              to="/services"
              className="group flex items-center gap-2 rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-teal-600 hover:shadow-lg">
              Khám phá Dịch vụ{" "}
              <ChevronRightCircle className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="mr-2 flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4" /> Lọc
            </div>
            {filterOptions.brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${selectedBrand === brand ? "border-teal-500 bg-teal-50 font-bold text-teal-700" : "border-gray-200 text-gray-600 hover:border-teal-500"}`}>
                {brand}
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

          {/* Sort Bar */}
          <div className="mb-6 flex items-center gap-6 border-b border-gray-100 pb-4 text-sm">
            <span className="text-gray-500">Xếp theo:</span>
            <button
              onClick={() => setSortBy("hot")}
              className={`${sortBy === "hot" ? "font-bold text-teal-600 underline underline-offset-8" : "text-gray-600"}`}>
              Nổi bật
            </button>
            <button
              onClick={() => setSortBy("price_desc")}
              className={`flex items-center ${sortBy === "price_desc" ? "font-bold text-teal-600 underline underline-offset-8" : "text-gray-600"}`}>
              Giá cao <ArrowDown className="ml-1 h-3 w-3" />
            </button>
            <button
              onClick={() => setSortBy("price_asc")}
              className={`flex items-center ${sortBy === "price_asc" ? "font-bold text-teal-600 underline underline-offset-8" : "text-gray-600"}`}>
              Giá thấp <ArrowUp className="ml-1 h-3 w-3" />
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {productsLoading ? (
              Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
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
                <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4 border-t border-gray-100 pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="gap-1 bg-white hover:bg-teal-50">
                <ChevronLeft className="h-4 w-4" /> Trước
              </Button>
              <span className="text-sm font-medium text-gray-600">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
