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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { ApiPromotion, ApiPromotionType } from "@/interfaces/promotion.types";
import { mapApiPromotionToVoucher, promotionService } from "@/services/promotionService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface PromoForm {
  code: string;
  description: string;
  type: ApiPromotionType;
  discountValue: number;
  maxDiscountValue: number;
  minOrderAmount: number;
  startDate: string;
  endDate: string;
  active: boolean;
  quantity: number;
}

const defaultForm: PromoForm = {
  code: "",
  description: "",
  type: "PERCENTAGE",
  discountValue: 0,
  maxDiscountValue: 0,
  minOrderAmount: 0,
  startDate: "",
  endDate: "",
  active: true,
  quantity: 100,
};

export function PromotionManagerPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApiPromotion | null>(null);
  const [form, setForm] = useState<PromoForm>(defaultForm);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: apiPromotions } = useQuery({
    queryKey: ["staff", "promotions"],
    queryFn: promotionService.getApiPromotions,
  });

  const vouchers = useMemo(() => apiPromotions?.map(mapApiPromotionToVoucher), [apiPromotions]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (promo: ApiPromotion) => {
    setEditing(promo);
    setForm({
      code: promo.code,
      description: promo.description ?? "",
      type: promo.type,
      discountValue: promo.discountValue,
      maxDiscountValue: promo.maxDiscountValue ?? 0,
      minOrderAmount: promo.minOrderAmount ?? 0,
      startDate: promo.startDate.length >= 16 ? promo.startDate.slice(0, 16) : promo.startDate,
      endDate: promo.endDate.length >= 16 ? promo.endDate.slice(0, 16) : promo.endDate,
      active: promo.active,
      quantity: promo.quantity,
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = {
        code: form.code,
        description: form.description || undefined,
        type: form.type,
        discountValue: form.discountValue,
        maxDiscountValue: form.maxDiscountValue || undefined,
        minOrderAmount: form.minOrderAmount || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        active: form.active,
        quantity: form.quantity,
      };
      return editing
        ? promotionService.updatePromotion({ id: editing.id, ...data })
        : promotionService.createPromotion(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "promotions"] });
      toast.success(editing ? "Cập nhật khuyến mãi thành công" : "Tạo khuyến mãi thành công");
      setDialogOpen(false);
    },
    onError: () => toast.error("Thao tác thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => promotionService.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "promotions"] });
      toast.success("Đã xóa khuyến mãi");
      setDeletingId(null);
    },
    onError: () => toast.error("Xóa khuyến mãi thất bại"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý khuyến mãi</h1>
        <Button className="bg-teal-500 hover:bg-teal-600" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tạo mới
        </Button>
      </div>

      <Tabs defaultValue="api-promotions">
        <TabsList>
          <TabsTrigger value="api-promotions">Khuyến mãi</TabsTrigger>
          <TabsTrigger value="vouchers">Voucher</TabsTrigger>
        </TabsList>

        <TabsContent value="api-promotions">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium text-gray-500">Mã</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Loại</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Giá trị</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Số lượng</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Bắt đầu</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Kết thúc</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {apiPromotions?.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-medium">{p.code}</td>
                      <td className="px-4 py-3 text-gray-600">{p.type}</td>
                      <td className="px-4 py-3">
                        {p.type === "MONEY" ? formatVND(p.discountValue) : `${p.discountValue}%`}
                      </td>
                      <td className="px-4 py-3">{p.quantity}</td>
                      <td className="px-4 py-3 text-gray-400">{formatDate(p.startDate)}</td>
                      <td className="px-4 py-3 text-gray-400">{formatDate(p.endDate)}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }>
                          {p.active ? "Hoạt động" : "Tắt"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(p)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400"
                            onClick={() => setDeletingId(p.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vouchers">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium text-gray-500">Mã</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Loại</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Giá trị</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Sử dụng</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Hết hạn</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers?.map((v) => (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-medium">{v.code}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">
                        {v.type.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3">
                        {v.type === "fixed_amount"
                          ? formatVND(v.discountValue)
                          : `${v.discountValue}%`}
                      </td>
                      <td className="px-4 py-3">
                        {v.usedCount}/{v.usageLimit}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{formatDate(v.expiresAt)}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            v.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }>
                          {v.isActive ? "Hoạt động" : "Tắt"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã khuyến mãi</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  placeholder="VD: SUMMER2025"
                />
              </div>
              <div className="space-y-2">
                <Label>Loại</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((p) => ({ ...p, type: v as ApiPromotionType }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONEY">Giảm tiền</SelectItem>
                    <SelectItem value="PERCENTAGE">Giảm %</SelectItem>
                    <SelectItem value="BOGO">Mua 1 tặng 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                placeholder="Mô tả khuyến mãi"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giá trị giảm</Label>
                <Input
                  type="number"
                  value={form.discountValue || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, discountValue: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Giảm tối đa</Label>
                <Input
                  type="number"
                  value={form.maxDiscountValue || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, maxDiscountValue: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Đơn tối thiểu</Label>
                <Input
                  type="number"
                  value={form.minOrderAmount || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, minOrderAmount: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Số lượng</Label>
                <Input
                  type="number"
                  value={form.quantity || ""}
                  onChange={(e) => setForm((p) => ({ ...p, quantity: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc</Label>
                <Input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
              />
              <Label>Kích hoạt</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-teal-500 hover:bg-teal-600"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.code.trim()}>
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
              Bạn có chắc muốn xóa khuyến mãi này? Hành động này không thể hoàn tác.
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
