import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { BackendProduct } from "@/interfaces/product.types";
import { formatVND } from "@/utils/formatPrice";
import { useState } from "react";

interface ProductDetailModalProps {
  product: BackendProduct | null;
  open: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
  const [activeImg, setActiveImg] = useState(0);

  if (!product) return null;

  const images = [
    product.imgUrl,
    product.imgUrl2,
    product.imgUrl3,
    product.imgUrl4,
    product.imgUrl5,
  ].filter(Boolean) as string[];

  const isService = product.type === false;

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

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
