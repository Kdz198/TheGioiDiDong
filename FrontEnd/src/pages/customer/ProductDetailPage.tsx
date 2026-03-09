import { PriceDisplay } from "@/components/common/PriceDisplay";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { productService } from "@/services/productService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingCart, Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggle: toggleWishlist } = useWishlistStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.getAppProductById(slug!),
    enabled: !!slug,
  });

  // Tạm ẩn review vì backend chưa có API
  // const { data: reviewData } = useQuery({
  //   queryKey: ["reviews", product?.id],
  //   queryFn: () => reviewService.getProductReviews(product!.id),
  //   enabled: !!product?.id,
  // });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-64 rounded bg-gray-200" />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="aspect-square rounded-lg bg-gray-200" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-gray-200" />
              <div className="h-6 w-32 rounded bg-gray-200" />
              <div className="h-10 w-48 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-gray-500">Sản phẩm không tồn tại</p>
        <Button asChild className="mt-4">
          <Link to="/products">Quay lại</Link>
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Vì API không có variant (phân loại), ta truyền chính ID sản phẩm làm variant
    // Map các trường API thật (imgUrl, price, quantity) sang store của frontend
    addItem({
      id: Date.now(),
      productId: product.id,
      variantId: product.id,
      product: {
        id: product.id,
        slug: product.name,
        name: product.name,
        thumbnailUrl: product.imgUrl, // ĐÃ SỬA
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
        price: product.price, // ĐÃ SỬA
        originalPrice: product.price, // ĐÃ SỬA
        stockQuantity: product.quantity ?? 0, // ĐÃ SỬA
      },
      quantity,
      subtotal: product.price * quantity, // ĐÃ SỬA
    });
    toast.success("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-teal-500">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        {/* ĐÃ SỬA: Dùng product.categoryName */}
        <span className="text-gray-500">{product.categoryName}</span>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-white p-4">
          <img
            src={product.imgUrl} // ĐÃ SỬA
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Info */}
        <div className="space-y-4">
          {/* ĐÃ SỬA: Dùng product.brandName */}
          <p className="text-sm font-semibold text-teal-600">{product.brandName}</p>
          <h1 className="text-2xl font-bold text-zinc-900">{product.name}</h1>

          {/* Đánh giá giả lập vì API chưa có */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <span className="text-sm text-gray-500">5.0 (0 đánh giá)</span>
          </div>

          <PriceDisplay
            price={product.price} // ĐÃ SỬA
            originalPrice={product.price} // ĐÃ SỬA
            size="lg"
          />

          {/* Stock */}
          <p
            className={`text-sm ${(product.quantity ?? 0) > 0 ? "text-green-600" : "text-gray-400"}`}>
            {(product.quantity ?? 0) > 0
              ? `Còn hàng (${product.quantity ?? 0} sản phẩm)`
              : "Hết hàng"}
          </p>
          {/* Quantity + Actions */}
          <div className="flex items-center gap-4 pt-4">
            <QuantityStepper
              value={quantity}
              max={(product.quantity ?? 0) > 0 ? (product.quantity ?? 0) : 1}
              onChange={setQuantity}
            />
          </div>
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-teal-500 hover:bg-teal-600"
              onClick={handleAddToCart}
              disabled={(product.quantity ?? 0) === 0}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Thêm vào giỏ hàng
            </Button>
            <Button variant="outline" size="icon" onClick={() => toggleWishlist(product.id)}>
              <Heart
                className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-teal-500 text-teal-500" : ""}`}
              />
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Truck className="h-4 w-4" />
            Giao hàng dự kiến: 2-5 ngày
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Tabs */}
      <Tabs defaultValue="description" className="space-y-4">
        <TabsList>
          <TabsTrigger value="description">Mô tả</TabsTrigger>
          {/* <TabsTrigger value="specs">Thông số</TabsTrigger> */}
          <TabsTrigger value="reviews">Đánh giá (0)</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="prose max-w-none">
          {/* Render mô tả sản phẩm có xuống dòng */}
          <div className="leading-relaxed whitespace-pre-line text-gray-600">
            {product.description || "Đang cập nhật mô tả..."}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <p className="py-8 text-center text-gray-500">Chưa có đánh giá nào cho sản phẩm này</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
