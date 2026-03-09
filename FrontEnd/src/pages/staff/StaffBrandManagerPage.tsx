import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Brand } from "@/interfaces/product.types";
import { productService } from "@/services/productService";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search } from "lucide-react";
import { useState } from "react";

export function StaffBrandManagerPage() {
  const [search, setSearch] = useState("");
  const [detailBrand, setDetailBrand] = useState<Brand | null>(null);

  const { data: brands, isLoading } = useQuery({
    queryKey: ["staff", "brands"],
    queryFn: productService.getBrands,
  });

  const filtered = brands?.filter(
    (b) => !search || b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Thương hiệu</h1>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Tìm kiếm thương hiệu..."
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
                  <th className="px-4 py-3 font-medium text-gray-500">Logo</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Tên thương hiệu</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Mô tả</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={3} className="px-4 py-3">
                          <div className="h-10 animate-pulse rounded bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  : filtered?.map((brand) => (
                      <tr key={brand.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {brand.logoUrl ? (
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className="h-8 w-8 rounded object-contain"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-gray-100" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-900">{brand.name}</td>
                        <td className="px-4 py-3 text-gray-500">{brand.description ?? "—"}</td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-teal-500"
                            onClick={() => setDetailBrand(brand)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                {!isLoading && (!filtered || filtered.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      Không tìm thấy thương hiệu nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!detailBrand} onOpenChange={(open) => !open && setDetailBrand(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Chi tiết thương hiệu</DialogTitle>
          </DialogHeader>
          {detailBrand && (
            <div className="space-y-4">
              {detailBrand.logoUrl && (
                <div className="flex justify-center">
                  <img
                    src={detailBrand.logoUrl}
                    alt={detailBrand.name}
                    className="h-20 w-20 rounded-lg bg-gray-50 object-contain p-2"
                  />
                </div>
              )}
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Tên thương hiệu</p>
                  <p className="font-medium text-zinc-900">{detailBrand.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Mô tả</p>
                  <p className="text-gray-700">{detailBrand.description ?? "Không có mô tả"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
