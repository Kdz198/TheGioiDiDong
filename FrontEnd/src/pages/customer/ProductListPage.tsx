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
  const { slug: categorySlug } = useParams();
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

  const selectedCategory = categorySlug
    ? categories?.find((c) => c.slug === categorySlug)
    : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["products", { categoryId: selectedCategory?.id, search: searchQuery, sortBy, page }],
    queryFn: () =>
      productService.getProducts({
        categoryId: selectedCategory?.id,
        search: searchQuery || undefined,
        sortBy: sortBy as "price_asc" | "price_desc" | "newest" | "rating" | "sold",
        page,
      }),
  });

  const handleAddToCart = (product: NonNullable<typeof data>["items"][0], variantId: number) => {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return;
    addItem({
      id: variant.id,
      productId: product.id,
      variantId: variant.id,
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        thumbnailUrl: product.thumbnailUrl,
      },
      variant: {
        id: variant.id,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        price: variant.price,
        originalPrice: variant.originalPrice,
        stockQuantity: variant.stockQuantity,
      },
      quantity: 1,
      subtotal: variant.price,
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
                onAddToCart={() => handleAddToCart(product, product.variants[0]?.id ?? 0)}
                isWishlisted={isInWishlist(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
      </div>

      {data && data.items.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-500">Không tìm thấy sản phẩm nào</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
