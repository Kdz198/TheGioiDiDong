import { ProductDetailModal } from "@/components/common/ProductDetailModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS } from "@/constants/api.config";
import type { BackendProduct } from "@/interfaces/product.types";
import { apiClient } from "@/lib/api";
import { ROUTES } from "@/router/routes.const";
import { feedbackService } from "@/services/feedbackService";
import { productService } from "@/services/productService";
import { formatVND } from "@/utils/formatPrice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, Pencil, Plus, Search, Star, Trash2, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function ProductManagerPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "product" | "service">("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewingProduct, setViewingProduct] = useState<BackendProduct | null>(null);
  const queryClient = useQueryClient();

  const { data: rawProducts, isLoading } = useQuery({
    queryKey: ["staff", "products-raw"],
    queryFn: async () => {
      const res = await apiClient.get<BackendProduct[]>(API_ENDPOINTS.PRODUCTS.LIST_ALL);
      return res.data;
    },
  });

  const { data: allFeedbacks = [] } = useQuery({
    queryKey: ["staff", "feedbacks-all"],
    queryFn: feedbackService.getFeedbacks,
  });

  const avgRatingByProduct = useMemo(() => {
    const map = new Map<number, number>();
    const sumMap = new Map<number, { sum: number; count: number }>();
    for (const fb of allFeedbacks) {
      const entry = sumMap.get(fb.productId) ?? { sum: 0, count: 0 };
      entry.sum += fb.rating;
      entry.count += 1;
      sumMap.set(fb.productId, entry);
    }
    for (const [id, { sum, count }] of sumMap.entries()) {
      map.set(id, Math.round((sum / count) * 10) / 10);
    }
    return map;
  }, [allFeedbacks]);

  const filteredProducts = (rawProducts ?? []).filter((p) => {
    if (activeFilter === "active" && !p.active) return false;
    if (activeFilter === "inactive" && p.active) return false;
    if (typeFilter === "product" && p.type === false) return false;
    if (typeFilter === "service" && p.type !== false) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "products-raw"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "products"] });
      toast.success("Đã xóa sản phẩm");
      setDeletingId(null);
    },
    onError: () => toast.error("Xóa sản phẩm thất bại"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý sản phẩm</h1>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-teal-500 hover:bg-teal-600" asChild>
            <Link to={`${ROUTES.STAFF_PRODUCT_CREATE}`}>
              <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
            </Link>
          </Button>
          <Button
            variant="outline"
            className="border-orange-400 text-orange-500 hover:bg-orange-50"
            asChild>
            <Link to={`${ROUTES.STAFF_PRODUCT_CREATE}?service=true`}>
              <Wrench className="mr-2 h-4 w-4" /> Thêm dịch vụ
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as "all" | "product" | "service")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="product">Sản phẩm</SelectItem>
            <SelectItem value="service">Dịch vụ</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={activeFilter}
          onValueChange={(v) => setActiveFilter(v as "all" | "active" | "inactive")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang bán</SelectItem>
            <SelectItem value="inactive">Ẩn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Sản phẩm</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Loại</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Danh mục</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Thương hiệu</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Giá</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Tồn kho</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Đánh giá</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={9} className="px-4 py-3">
                          <div className="h-10 animate-pulse rounded bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  : filteredProducts.map((product) => {
                      const rating = product.id ? avgRatingByProduct.get(product.id) : undefined;
                      return (
                        <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {product.imgUrl ? (
                                <img
                                  src={product.imgUrl}
                                  alt={product.name}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                                  ?
                                </div>
                              )}
                              <span className="font-medium text-zinc-900">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={
                                product.type === false
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                              }>
                              {product.type === false ? "Dịch vụ" : "Sản phẩm"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{product.categoryName}</td>
                          <td className="px-4 py-3 text-gray-600">{product.brandName}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatVND(product.price)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {product.type === false ? "—" : product.quantity}
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
                            {rating !== undefined ? (
                              <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium text-zinc-700">{rating}</span>
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-teal-500"
                                title="Xem chi tiết"
                                onClick={() => setViewingProduct(product)}>
                                <Info className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link
                                  to={ROUTES.STAFF_PRODUCT_EDIT.replace(":id", String(product.id))}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400"
                                onClick={() => setDeletingId(product.id ?? null)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ProductDetailModal
        product={viewingProduct}
        open={viewingProduct !== null}
        onClose={() => setViewingProduct(null)}
        allFeedbacks={allFeedbacks}
      />

      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deletingId !== null && deleteMutation.mutate(deletingId)}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
