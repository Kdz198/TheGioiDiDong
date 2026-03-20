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
import { productService } from "@/services/productService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);

  // --- STATE CHO SLIDER ẢNH ---
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

  // --- LOGIC ĐẢM BẢO LUÔN CÓ MẢNG ẢNH ---
  const images =
    product.imgUrls && product.imgUrls.length > 0 ? product.imgUrls : ["/placeholder-image.png"];

  const nextImg = () => setCurrentImgIndex((prev) => (prev + 1) % images.length);
  const prevImg = () => setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const handleAddToCart = () => {
    const firstImage = images[0];
    addItem({
      id: Date.now(),
      productId: product.id,
      variantId: product.id,
      product: {
        id: product.id,
        slug: product.name,
        name: product.name,
        thumbnailUrl: firstImage,
      },
      appProduct: {
        id: product.id,
        name: product.name,
        imgUrls: [firstImage],
      },
      variant: {
        id: product.id,
        sku: `SKU-${product.id}`,
        color: "Mặc định",
        size: "Mặc định",
        price: product.price,
        originalPrice: product.price,
        stockQuantity: product.quantity ?? 0,
      },
      quantity,
      subtotal: product.price * quantity,
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
        <span className="text-gray-500">{product.categoryName}</span>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* --- CỘT TRÁI: KHU VỰC HIỂN THỊ ẢNH (SLIDER) --- */}
        <div className="space-y-4">
          <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-gray-50">
            {/* Dải băng chứa ảnh */}
            <div
              className="flex h-full w-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}>
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} - ảnh ${index + 1}`}
                  className="h-full w-full shrink-0 object-contain p-4"
                />
              ))}
            </div>

            {/* Mũi tên TRÁI */}
            {images.length > 1 && (
              <button
                onClick={prevImg}
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 opacity-0 shadow-md backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-white hover:text-teal-600">
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Mũi tên PHẢI */}
            {images.length > 1 && (
              <button
                onClick={nextImg}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 opacity-0 shadow-md backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-white hover:text-teal-600">
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Dải ảnh nhỏ (Thumbnails) ở dưới */}
          {images.length > 1 && (
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImgIndex(index)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    currentImgIndex === index
                      ? "border-teal-500"
                      : "border-transparent hover:border-teal-300"
                  }`}>
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {currentImgIndex !== index && <div className="absolute inset-0 bg-white/40" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- CỘT PHẢI: THÔNG TIN VÀ MÔ TẢ --- */}
        <div className="space-y-6">
          {/* Box Thông tin cơ bản */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-teal-600">{product.brandName}</p>
            <h1 className="text-2xl leading-tight font-bold text-zinc-900">{product.name}</h1>

            {/* Đánh giá */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <span className="text-sm text-gray-500">5.0 (0 đánh giá)</span>
            </div>

            <PriceDisplay price={product.price} originalPrice={product.price} size="lg" />

            {/* Tình trạng kho */}
            <p
              className={`text-sm font-medium ${(product.quantity ?? 0) > 0 ? "text-green-600" : "text-gray-400"}`}>
              {(product.quantity ?? 0) > 0
                ? `Còn hàng (${product.quantity ?? 0} sản phẩm)`
                : "Hết hàng"}
            </p>
          </div>

          <Separator className="border-gray-100" />

          {/* Box Nút thêm vào giỏ */}
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
                <ShoppingCart className="mr-2 h-5 w-5" />
                Thêm vào giỏ hàng
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

          {/* --- KHU VỰC MÔ TẢ ĐÃ ĐƯỢC CHUYỂN LÊN TRÊN --- */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900">Mô tả sản phẩm</h3>
            <div className="prose max-w-none rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
                {product.description || "Đang cập nhật mô tả chi tiết cho sản phẩm này..."}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- KHU VỰC TABS BÊN DƯỚI (Chỉ còn Đánh giá) --- */}
      <div className="mt-12">
        <Tabs defaultValue="reviews" className="space-y-4">
          <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent px-6 py-3 text-base font-semibold data-[state=active]:border-teal-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Đánh giá từ khách hàng (0)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="pt-6">
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-100 bg-gray-50 py-12">
              <Star className="mb-3 h-12 w-12 text-gray-300" />
              <p className="font-medium text-gray-500">Chưa có đánh giá nào cho sản phẩm này</p>
              <p className="mt-1 text-sm text-gray-400">
                Hãy là người đầu tiên trải nghiệm và đánh giá nhé!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
