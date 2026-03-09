import { ProductCard } from "@/components/common/ProductCard";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/router/routes.const";
import { productService } from "@/services/productService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function WishlistPage() {
  const { productIds, toggle: toggleWishlist, isInWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const { data } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => productService.getProducts({ pageSize: 100 }),
  });

  const wishlistedProducts = data?.items.filter((p) => productIds.includes(p.id)) || [];

  const handleAddToCart = (product: (typeof wishlistedProducts)[0], variantId: number) => {
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
      appProduct: {
        id: product.id,
        name: product.name,
        imgUrl: product.thumbnailUrl,
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

  if (wishlistedProducts.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
        <Heart className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="text-xl font-bold text-zinc-900">Danh sách yêu thích trống</h2>
        <p className="mt-2 text-gray-500">Bạn chưa thêm sản phẩm nào vào danh sách yêu thích</p>
        <Button asChild className="mt-6 bg-teal-500 hover:bg-teal-600">
          <Link to={ROUTES.PRODUCTS}>Khám phá sản phẩm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        Sản phẩm yêu thích ({wishlistedProducts.length})
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {wishlistedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => handleAddToCart(product, product.variants[0]?.id ?? 0)}
            isWishlisted={isInWishlist(product.id)}
            onToggleWishlist={toggleWishlist}
          />
        ))}
      </div>
    </div>
  );
}
