import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { productService } from "@/services/productService";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";

export function StaffProductManagerPage() {
  const [search, setSearch] = useState("");

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
                            {product.thumbnailUrl && (
                              <img
                                src={product.thumbnailUrl}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            )}
                            <span className="font-medium text-zinc-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{product.category?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{product.brand?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-right font-medium text-zinc-900">
                          {formatVND(product.defaultPrice)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          {product.variants?.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0) ??
                            0}
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
                      </tr>
                    ))}
                {!isLoading && (!data?.items || data.items.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
