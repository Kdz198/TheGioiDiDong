import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Product } from "@/interfaces/product.types";
import { productService } from "@/services/productService";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search } from "lucide-react";
import { useState } from "react";

export function StaffProductManagerPage() {
  const [search, setSearch] = useState("");
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["staff", "products", search],
    queryFn: () => productService.getProducts({ search: search || undefined, pageSize: 50 }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Sản phẩm</h1>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Sản phẩm</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Danh mục</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Thương hiệu</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Giá</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Tồn kho</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-4 py-3">
                          <div className="h-10 animate-pulse rounded bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  : data?.items.map((product) => (
                      <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.imgUrl && (
                              <img
                                src={product.imgUrl}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            )}
                            <span className="font-medium text-zinc-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{product.categoryName ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{product.brandName ?? "—"}</td>
                        <td className="px-4 py-3 text-right font-medium text-zinc-900">
                          {formatVND(product.price)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          {product.quantity ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              product.active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }>
                            {product.active ? "Đang bán" : "Ẩn"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-teal-500"
                            onClick={() => setDetailProduct(product)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                {!isLoading && (!data?.items || data.items.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!detailProduct} onOpenChange={(open) => !open && setDetailProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết sản phẩm</DialogTitle>
          </DialogHeader>
          {detailProduct && (
            <div className="space-y-4">
              {detailProduct.thumbnailUrl && (
                <img
                  src={detailProduct.thumbnailUrl}
                  alt={detailProduct.name}
                  className="h-40 w-full rounded-lg bg-gray-50 object-contain"
                />
              )}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Tên sản phẩm</p>
                  <p className="font-medium text-zinc-900">{detailProduct.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Danh mục</p>
                  <p className="font-medium text-zinc-900">{detailProduct.category?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Thương hiệu</p>
                  <p className="font-medium text-zinc-900">{detailProduct.brand?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Trạng thái</p>
                  <Badge
                    className={
                      detailProduct.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }>
                    {detailProduct.isActive ? "Đang bán" : "Ẩn"}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400">Giá bán</p>
                  <p className="font-medium text-red-400">
                    {formatVND(detailProduct.defaultPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Giá gốc</p>
                  <p className="font-medium text-gray-500 line-through">
                    {formatVND(detailProduct.defaultOriginalPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Tồn kho</p>
                  <p className="font-medium text-zinc-900">
                    {detailProduct.variants?.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0) ??
                      0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Đánh giá</p>
                  <p className="font-medium text-zinc-900">
                    {detailProduct.rating?.toFixed(1)} ({detailProduct.reviewCount} đánh giá)
                  </p>
                </div>
              </div>
              {detailProduct.description && (
                <div>
                  <p className="text-sm text-gray-400">Mô tả</p>
                  <p className="mt-1 text-sm text-gray-700">{detailProduct.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
