import { PaginationControl } from "@/components/shared/PaginationControl";
import { SortButton, type SortDirection } from "@/components/shared/SortButton";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePagination } from "@/hooks/usePagination";
import type { ProductVersion } from "@/interfaces/product.types";
import { productService } from "@/services/productService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function ProductVersionManagerPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductVersion | null>(null);
  const [versionName, setVersionName] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: versions, isLoading } = useQuery({
    queryKey: ["product-versions"],
    queryFn: productService.getProductVersions,
  });

  const [sortDir, setSortDir] = useState<SortDirection>("none");

  const sortedVersions = useMemo(() => {
    if (sortDir === "none") return [...(versions ?? [])];
    return [...(versions ?? [])].sort((a, b) =>
      sortDir === "asc"
        ? a.versionName.localeCompare(b.versionName)
        : b.versionName.localeCompare(a.versionName)
    );
  }, [versions, sortDir]);

  const pagination = usePagination({ totalCount: sortedVersions.length, pageSize: 10 });
  const pageVersions = sortedVersions.slice(pagination.startIndex, pagination.endIndex + 1);

  const openCreate = () => {
    setEditing(null);
    setVersionName("");
    setDialogOpen(true);
  };

  const openEdit = (v: ProductVersion) => {
    setEditing(v);
    setVersionName(v.versionName);
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? productService.updateProductVersion({ id: editing.id, versionName })
        : productService.createProductVersion({ id: 0, versionName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-versions"] });
      toast.success(
        editing ? "Cập nhật phiên bản sản phẩm thành công" : "Tạo phiên bản sản phẩm thành công"
      );
      setDialogOpen(false);
    },
    onError: () => toast.error("Thao tác thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProductVersion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-versions"] });
      toast.success("Đã xóa phiên bản sản phẩm");
      setDeletingId(null);
    },
    onError: () => toast.error("Xóa phiên bản sản phẩm thất bại"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý phiên bản sản phẩm</h1>
        <Button className="bg-teal-500 hover:bg-teal-600" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Thêm phiên bản
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">ID</th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    <SortButton direction={sortDir} onChange={setSortDir}>
                      Tên phiên bản
                    </SortButton>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={3} className="px-4 py-3">
                        <div className="h-8 animate-pulse rounded bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : versions?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                      Chưa có phiên bản nào
                    </td>
                  </tr>
                ) : (
                  pageVersions.map((v) => (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{v.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-teal-500" />
                          <span className="font-medium text-zinc-900">{v.versionName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(v)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400"
                            onClick={() => setDeletingId(v.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <PaginationControl pagination={pagination} showPageSizeSelector={false} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Chỉnh sửa phiên bản sản phẩm" : "Thêm phiên bản sản phẩm"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên phiên bản</Label>
              <Input
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="VD: Standard, Pro, Plus"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-teal-500 hover:bg-teal-600"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !versionName.trim()}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa phiên bản sản phẩm này? Hành động này không thể hoàn tác.
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
