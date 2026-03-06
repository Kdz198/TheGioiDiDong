import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { productService } from "@/services/productService";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";

export function StaffBrandManagerPage() {
  const [search, setSearch] = useState("");

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
                      </tr>
                    ))}
                {!isLoading && (!filtered || filtered.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                      Không tìm thấy thương hiệu nào
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
