import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Star, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PriceDisplay } from "@/components/common/PriceDisplay";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["product-reviews", product?.id],
    queryFn: () => feedbackService.getProductFeedbacks(product!.id),
    enabled: !!product?.id,
  });

  // --- Logic tính toán đánh giá ---
  const validReviews = useMemo(() => (Array.isArray(reviews) ? reviews : []), [reviews]);
  const totalReviews = validReviews.length;

  const ratingData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0]; // Index 1-5
    validReviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating]++;
    });
    const avg =
      totalReviews > 0
        ? (validReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : "5.0";
    return { avg, counts };
  }, [validReviews, totalReviews]);

  if (isLoading)
    return <div className="container mx-auto h-screen animate-pulse bg-gray-50 px-4 py-16" />;

  if (!product)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">Sản phẩm không tồn tại</p>
        <Button asChild className="mt-4 bg-teal-500">
          <Link to="/products">Quay lại</Link>
        </Button>
      </div>
    );

  const images = product.imgUrls?.length
    ? product.imgUrls
    : ["https://placehold.co/400x400?text=No+Image"];
  const handleAddToCart = () => {
    addItem({
      id: Date.now(),
      productId: product.id,
      variantId: product.id,
      product: { id: product.id, slug: product.name, name: product.name, thumbnailUrl: images[0] },
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
    <div className="min-h-screen bg-white pb-20">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-xs font-normal text-slate-400">
          <Link to="/" className="hover:text-teal-500">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span>{product.categoryName}</span>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{product.name}</span>
        </nav>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Cột trái: Hình ảnh */}
          <div className="space-y-4">
            <div className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50">
              <div
                className="flex h-full w-full transition-transform duration-500"
                style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}>
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    className="h-full w-full shrink-0 object-contain p-8"
                    alt={product.name}
                  />
                ))}
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImgIndex((p) => (p === 0 ? images.length - 1 : p - 1))}
                    className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow-sm transition-all group-hover:opacity-100">
                    <ChevronLeft className="h-5 w-5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setCurrentImgIndex((p) => (p + 1) % images.length)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow-sm transition-all group-hover:opacity-100">
                    <ChevronRight className="h-5 w-5 text-slate-600" />
                  </button>
                </>
              )}
            </div>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImgIndex(idx)}
                  className={`h-16 w-16 rounded-lg border-2 transition-all ${currentImgIndex === idx ? "border-teal-500" : "border-transparent opacity-60"}`}>
                  <img src={img} className="h-full w-full rounded-md object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Cột phải: Thông tin */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-medium tracking-wider text-teal-600 uppercase">
                {product.brandName}
              </span>
              <h1 className="text-2xl leading-tight font-semibold text-slate-900">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 py-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-slate-900">{ratingData.avg}</span>
                </div>
                <Separator orientation="vertical" className="h-3" />
                <span className="text-sm text-slate-400">{totalReviews} đánh giá</span>
              </div>
            </div>

            <div className="py-2">
              {/* Giá tiền màu đen theo yêu cầu */}
              <PriceDisplay
                price={product.price}
                originalPrice={product.originalPrice}
                size="lg"
                className="text-slate-900"
              />
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-5">
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium text-slate-500">Số lượng</span>
                <QuantityStepper
                  value={quantity}
                  max={product.quantity || 1}
                  onChange={setQuantity}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.quantity}
                  className="h-12 flex-1 rounded-xl bg-teal-500 shadow-lg shadow-teal-100 hover:bg-teal-600">
                  <ShoppingCart className="mr-2 h-5 w-5" /> Thêm vào giỏ hàng
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleWishlist(product.id)}
                  className="h-12 w-12 rounded-xl border-slate-200">
                  <Heart
                    className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-rose-500 text-rose-500" : "text-slate-400"}`}
                  />
                </Button>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Mô tả sản phẩm</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line text-slate-500">
                {product.description || "Đang cập nhật..."}
              </p>
            </div>
          </div>
        </div>

        {/* --- PHẦN ĐÁNH GIÁ (LAYOUT MỚI) --- */}
        <section className="mt-20 border-t border-slate-100 pt-16">
          <h2 className="mb-10 text-xl font-semibold text-slate-900">Khách hàng đánh giá</h2>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Bên trái: Tổng quan (4/12 width) */}
            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-8 text-center">
                <div className="mb-2 text-5xl font-semibold text-slate-900">
                  {ratingData.avg}
                  <span className="text-lg font-normal text-slate-400">/5</span>
                </div>
                <div className="mb-3 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${s <= Math.round(Number(ratingData.avg)) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-500">{totalReviews} lượt đánh giá </p>
              </div>

              <div className="space-y-3 px-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-4 text-sm">
                    <span className="w-3 font-medium text-slate-600">{star}</span>
                    <Star className="h-3 w-3 fill-slate-300 text-slate-300" />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-500 transition-all duration-1000"
                        style={{
                          width: `${totalReviews ? (ratingData.counts[star] / totalReviews) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-slate-400">
                      {totalReviews
                        ? Math.round((ratingData.counts[star] / totalReviews) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bên phải: Danh sách chi tiết (8/12 width) */}
            <div className="lg:col-span-8">
              {reviewsLoading ? (
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 w-full animate-pulse rounded-xl bg-slate-50" />
                  ))}
                </div>
              ) : totalReviews === 0 ? (
                <div className="rounded-2xl border border-dashed bg-slate-50 py-10 text-center">
                  <p className="text-sm text-slate-400">Chưa có đánh giá nào cho sản phẩm này.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {validReviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="group border-b border-slate-50 pb-8 last:border-0">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal-100 bg-teal-50 text-teal-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            {/* Hiển thị tên người đánh giá */}
                            <h4 className="text-sm font-semibold text-slate-900">
                              {review.userName ||
                                review.userFullName ||
                                `Khách hàng #${review.userId}`}
                            </h4>
                            <span className="text-[11px] font-normal text-slate-400">
                              {review.date
                                ? new Date(review.date).toLocaleDateString("vi-VN")
                                : "Gần đây"}
                            </span>
                          </div>
                          <div className="mb-3 flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3 w-3 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                              />
                            ))}
                          </div>
                          <p className="text-sm leading-relaxed text-slate-600 italic">
                            "{review.comment}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
