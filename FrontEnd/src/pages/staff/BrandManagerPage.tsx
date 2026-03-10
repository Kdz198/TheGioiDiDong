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
import { Textarea } from "@/components/ui/textarea";
import type { Brand } from "@/interfaces/product.types";
import { productService } from "@/services/productService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function BrandManagerPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: brands, isLoading } = useQuery({
    queryKey: ["staff", "brands"],
    queryFn: productService.getBrands,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setLogoFile(null);
    setDialogOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditing(brand);
    setForm({ name: brand.name, description: brand.description ?? "" });
    setLogoFile(null);
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      if (editing) {
        return productService.updateBrand({
          id: editing.id,
          name: form.name,
          description: form.description,
          logoUrl: editing.logoUrl,
        });
      }
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      if (logoFile) fd.append("file", logoFile);
      return productService.createBrand(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "brands"] });
      toast.success(editing ? "Cập nhật thương hiệu thành công" : "Tạo thương hiệu thành công");
      setDialogOpen(false);
    },
    onError: () => toast.error("Thao tác thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "brands"] });
      toast.success("Đã xóa thương hiệu");
      setDeletingId(null);
    },
    onError: () => toast.error("Xóa thương hiệu thất bại"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý thương hiệu</h1>
        <Button className="bg-teal-500 hover:bg-teal-600" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Thêm thương hiệu
        </Button>
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
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-4 py-3">
                        <div className="h-10 animate-pulse rounded bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : brands?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                      Chưa có thương hiệu nào
                    </td>
                  </tr>
                ) : (
                  brands?.map((brand) => (
                    <tr key={brand.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="h-10 w-10 rounded object-contain"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                            N/A
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900">{brand.name}</td>
                      <td className="px-4 py-3 text-gray-500">{brand.description ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(brand)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400"
                            onClick={() => setDeletingId(brand.id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên thương hiệu</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nhập tên thương hiệu"
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả thương hiệu (không bắt buộc)"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}>
                  Chọn ảnh logo
                </Button>
                {logoFile && <span className="text-sm text-gray-500">{logoFile.name}</span>}
                {!logoFile && editing?.logoUrl && (
                  <img
                    src={editing.logoUrl}
                    alt="current logo"
                    className="h-8 w-8 rounded object-contain"
                  />
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-teal-500 hover:bg-teal-600"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.name.trim()}>
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
              Bạn có chắc muốn xóa thương hiệu này? Hành động này không thể hoàn tác.
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
