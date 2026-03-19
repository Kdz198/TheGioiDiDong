import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { BackendProduct } from "@/interfaces/product.types";
import type { BackendFeedback } from "@/services/feedbackService";
import { feedbackService } from "@/services/feedbackService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useState } from "react";

interface ProductDetailModalProps {
  product: BackendProduct | null;
  open: boolean;
  onClose: () => void;
  /** @deprecated Feedbacks are now fetched internally via /product/{id} endpoint */
  allFeedbacks?: BackendFeedback[];
}

export function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
  const [activeImg, setActiveImg] = useState(0);

  const { data: feedbacks = [] } = useQuery({
    queryKey: ["feedbacks", "product", product?.id],
    queryFn: () => feedbackService.getFeedbacksByProduct(product!.id),
    enabled: open && !!product?.id,
  });

  const avgRating =
    feedbacks.length > 0
      ? Math.round((feedbacks.reduce((s, f) => s + (f.rating ?? 0), 0) / feedbacks.length) * 10) /
        10
      : null;

  if (!product) return null;

  const images = (product.imgUrls ?? []).filter(Boolean) as string[];

  const isService = product.type === false;

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-zinc-900">Chi tiết sản phẩm</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="flex h-56 items-center justify-center overflow-hidden rounded-lg border bg-gray-50">
              {images.length > 0 ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-sm text-gray-400">Chưa có hình ảnh</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${
                      activeImg === i ? "border-teal-500" : "border-transparent"
                    }`}>
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">Tên</p>
              <p className="font-semibold text-zinc-900">{product.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Danh mục</p>
                <p className="text-zinc-700">{product.categoryName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Thương hiệu</p>
                <p className="text-zinc-700">{product.brandName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Phiên bản</p>
                <p className="text-zinc-700">{product.versionName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Loại</p>
                <Badge
                  className={
                    isService ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                  }>
                  {isService ? "Dịch vụ" : "Sản phẩm"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Giá bán</p>
                <p className="font-bold text-red-400">{formatVND(product.price)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Giá gốc</p>
                <p
                  className={`font-medium ${(product.originalPrice ?? product.price) > product.price ? "text-gray-400 line-through" : "text-zinc-900"}`}>
                  {formatVND(product.originalPrice ?? product.price)}
                </p>
              </div>
              {!isService && (
                <>
                  <div>
                    <p className="text-xs text-gray-400">Tồn kho</p>
                    <p className="font-medium text-zinc-900">{product.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Đang giữ trước</p>
                    <p className="font-medium text-zinc-700">{product.reserve}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Có thể bán</p>
                    <p className="font-medium text-teal-600">
                      {Math.max(0, product.quantity - product.reserve)}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-400">Trạng thái</p>
              <Badge
                className={
                  product.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }>
                {product.active ? "Đang bán" : "Ẩn"}
              </Badge>
            </div>

            {product.description && (
              <div>
                <p className="text-xs text-gray-400">Mô tả</p>
                <p className="leading-relaxed text-gray-600">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Feedbacks / Comments */}
        <div className="mt-4 border-t pt-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <span>Nhận xét của khách hàng ({feedbacks.length})</span>
            {avgRating !== null && (
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-zinc-700">{avgRating}/5</span>
              </span>
            )}
          </h3>
          {feedbacks.length > 0 ? (
            <div className="space-y-3">
              {feedbacks.map((fb, idx) => (
                <div key={idx} className="rounded-lg border bg-gray-50 p-3 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-800">
                        {fb.userName ?? "Khách hàng"}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {renderStars(fb.rating ?? 0)}
                        <span className="ml-1 text-xs text-gray-500">({fb.rating ?? 0}/5)</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {fb.date ? formatDate(fb.date) : ""}
                    </span>
                  </div>
                  <p className="text-gray-700">{fb.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Chưa có nhận xét nào.</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
