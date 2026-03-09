import { ProductCard } from "@/components/common/ProductCard";
import { ProductCardSkeleton } from "@/components/common/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export function ProductListPage() {
  // ĐÃ SỬA: Lấy 'id' từ URL thay vì 'slug' do link ở CategoryCard truyền id
  const { id: categoryIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [sortBy, setSortBy] = useState<string>("newest");
  const [page] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggle: toggleWishlist } = useWishlistStore();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  // Tìm category đang chọn dựa trên ID
  const selectedCategory = categoryIdParam
    ? categories?.find((c) => c.id.toString() === categoryIdParam)
    : undefined;

  const { data, isLoading } = useQuery({
    queryKey: [
      "products",
      { categoryName: selectedCategory?.name, search: searchQuery, sortBy, page },
      undefined,
      selectedCategory,
    ],
    queryFn: () =>
      productService.getAppProducts({
        // Nếu API cần truyền categoryName hoặc categoryId để lọc thì truyền vào đây.
        // Ép kiểu 'as any' tạm thời để TypeScript không báo lỗi thuộc tính lạ
        ...(selectedCategory ? { categoryName: selectedCategory.name } : {}),
        search: searchQuery || undefined,
        sortBy: sortBy as "price_asc" | "price_desc" | "newest" | "rating" | "sold",
        page,
      } as never),
  });

  // ĐÃ SỬA: Bỏ variantId vì API không có variants
  const handleAddToCart = (product: NonNullable<typeof data>["items"][0]) => {
    // Map dữ liệu chuẩn API vào giỏ hàng
    addItem({
      id: Date.now(),
      productId: product.id,
      variantId: product.id,
      product: {
        id: product.id,
        slug: product.name,
        name: product.name,
        thumbnailUrl: product.imgUrl, // Đã sửa
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
        price: product.price, // Đã sửa
        originalPrice: product.price, // Đã sửa
        stockQuantity: product.quantity ?? 0, // Đã sửa
      },
      quantity: 1,
      subtotal: product.price,
    });
    toast.success("Đã thêm vào giỏ hàng!");
  };

  const pageTitle = searchQuery
    ? `Kết quả tìm kiếm: "${searchQuery}"`
    : selectedCategory
      ? selectedCategory.name
      : "Tất Cả Sản Phẩm";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{pageTitle}</h1>
          {data && <p className="mt-1 text-sm text-gray-500">{data.total} sản phẩm</p>}
        </div>
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="sold">Phổ biến</SelectItem>
              <SelectItem value="price_asc">Giá tăng dần</SelectItem>
              <SelectItem value="price_desc">Giá giảm dần</SelectItem>
              <SelectItem value="rating">Đánh giá cao</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : data?.items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                // ĐÃ SỬA: Chỉ truyền product
                onAddToCart={() => handleAddToCart(product)}
                isWishlisted={isInWishlist(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
      </div>

      {data && data.items.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-500">Không tìm thấy sản phẩm nào</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => (window.location.href = "/products")}>
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
