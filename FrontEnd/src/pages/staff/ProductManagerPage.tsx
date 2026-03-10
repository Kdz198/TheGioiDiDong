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
import { ROUTES } from "@/router/routes.const";
import { productService } from "@/services/productService";
import { formatVND } from "@/utils/formatPrice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function ProductManagerPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["staff", "products", search, activeFilter],
    queryFn: () =>
      productService.getProducts({ search: search || undefined, pageSize: 100, activeFilter }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
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
        <Button className="bg-teal-500 hover:bg-teal-600" asChild>
          <Link to={ROUTES.STAFF_PRODUCT_CREATE}>
            <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
          </Link>
        </Button>
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
                  <th className="px-4 py-3 font-medium text-gray-500">Danh mục</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Thương hiệu</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Giá</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Tồn kho</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={7} className="px-4 py-3">
                          <div className="h-10 animate-pulse rounded bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  : data?.items.map((product) => (
                      <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.thumbnailUrl}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                            <span className="font-medium text-zinc-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{product.category.name}</td>
                        <td className="px-4 py-3 text-gray-600">{product.brand.name}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatVND(product.defaultPrice)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {product.variants.reduce((sum, v) => sum + v.stockQuantity, 0)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              product.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }>
                            {product.isActive ? "Đang bán" : "Ẩn"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link to={`/staff/products/${product.id}/edit`}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400"
                              onClick={() => setDeletingId(product.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
