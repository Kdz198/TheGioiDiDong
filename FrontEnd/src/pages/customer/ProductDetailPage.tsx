import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PriceDisplay } from "@/components/common/PriceDisplay";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { feedbackService } from "@/services/feedbackService";
import { productService } from "@/services/productService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

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

  // --- GỌI API LẤY DANH SÁCH REVIEW (Giả định URL, thay đổi nếu BE cấu hình khác) ---
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["product-reviews", product?.id],
    queryFn: () => feedbackService.getProductFeedbacks(product!.id), // Dùng service gọi cho chuẩn
    enabled: !!product?.id,
  });

  // Tính số sao trung bình
  const validReviews = Array.isArray(reviews) ? reviews : [];
  const totalReviews = validReviews.length;
  const avgRating =
    totalReviews > 0
      ? (validReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

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

  if (!product)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-gray-500">Sản phẩm không tồn tại</p>
        <Button asChild className="mt-4">
          <Link to="/products">Quay lại</Link>
        </Button>
      </div>
    );

  const images =
    product.imgUrls && product.imgUrls.length > 0
      ? product.imgUrls
      : ["https://placehold.co/400x400?text=No+Image"];
  const nextImg = () => setCurrentImgIndex((prev) => (prev + 1) % images.length);
  const prevImg = () => setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const handleAddToCart = () => {
    const firstImage = images[0];
    addItem({
      id: Date.now(),
      productId: product.id,
      variantId: product.id,
      product: { id: product.id, slug: product.name, name: product.name, thumbnailUrl: firstImage },
      appProduct: { id: product.id, name: product.name, imgUrls: images },
      variant: {
        id: product.id,
        sku: `SKU-${product.id}`,
        color: "Mặc định",
        size: "Mặc định",
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        stockQuantity: product.quantity ?? 0,
      },
      quantity,
      subtotal: product.price * quantity,
    });
    toast.success("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-teal-500">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-500">{product.categoryName}</span>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-gray-50">
            <div
              className="flex h-full w-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}>
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`ảnh ${index + 1}`}
                  className="h-full w-full shrink-0 bg-white object-contain p-4"
                />
              ))}
            </div>
            {images.length > 1 && (
              <button
                onClick={prevImg}
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 opacity-0 shadow-md backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-white hover:text-teal-600">
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {images.length > 1 && (
              <button
                onClick={nextImg}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 opacity-0 shadow-md backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-white hover:text-teal-600">
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
          {images.length > 1 && (
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImgIndex(index)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${currentImgIndex === index ? "border-teal-500" : "border-transparent hover:border-teal-300"}`}>
                  <img
                    src={img}
                    alt={`Thumb ${index + 1}`}
                    className="h-full w-full bg-white object-cover"
                  />
                  {currentImgIndex !== index && <div className="absolute inset-0 bg-white/40" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-teal-600">{product.brandName}</p>
            <h1 className="text-2xl leading-tight font-bold text-zinc-900">{product.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(Number(avgRating)) ? "fill-yellow-500 text-yellow-500" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {avgRating} ({totalReviews} đánh giá)
              </span>
            </div>
            <PriceDisplay
              price={product.price}
              originalPrice={product.originalPrice || product.price}
              size="lg"
            />
            <p
              className={`text-sm font-medium ${(product.quantity ?? 0) > 0 ? "text-green-600" : "text-gray-400"}`}>
              {(product.quantity ?? 0) > 0
                ? `Còn hàng (${product.quantity ?? 0} sản phẩm)`
                : "Hết hàng"}
            </p>
          </div>

          <Separator className="border-gray-100" />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">Số lượng:</span>
              <QuantityStepper
                value={quantity}
                max={(product.quantity ?? 0) > 0 ? (product.quantity ?? 0) : 1}
                onChange={setQuantity}
              />
            </div>
            <div className="flex gap-3">
              <Button
                className="h-12 flex-1 bg-teal-500 text-base shadow-md shadow-teal-500/20 hover:bg-teal-600"
                onClick={handleAddToCart}
                disabled={(product.quantity ?? 0) === 0}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Thêm vào giỏ hàng
              </Button>
              <Button
                variant="outline"
                className="h-12 w-12 shrink-0 border-gray-200"
                onClick={() => toggleWishlist(product.id)}>
                <Heart
                  className={`h-5 w-5 transition-colors ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-500"}`}
                />
              </Button>
            </div>
          </div>

          <Separator className="border-gray-100" />

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900">Mô tả sản phẩm</h3>
            <div className="prose max-w-none rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
                {product.description || "Đang cập nhật mô tả..."}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- HIỂN THỊ TẤT CẢ ĐÁNH GIÁ --- */}
      <div className="mt-12">
        <Tabs defaultValue="reviews" className="space-y-4">
          <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent px-6 py-3 text-base font-semibold data-[state=active]:border-teal-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Đánh giá từ khách hàng ({totalReviews})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="pt-6">
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
              </div>
            ) : totalReviews === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-100 bg-gray-50 py-12">
                <Star className="mb-3 h-12 w-12 text-gray-300" />
                <p className="font-medium text-gray-500">Chưa có đánh giá nào cho sản phẩm này</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {validReviews.map(
                  (review: {
                    id: number;
                    userId: number;
                    rating: number;
                    comment: string;
                    date?: string;
                  }) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-600">
                            {/* Placeholder tên người dùng */}
                            {review.userId ? `U${review.userId}` : "KH"}
                          </div>
                          <div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                                />
                              ))}
                            </div>
                            {review.date && (
                              <p className="text-[10px] text-gray-400">
                                {new Date(review.date).toLocaleDateString("vi-VN")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-gray-700">{review.comment}</p>
                    </div>
                  )
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
