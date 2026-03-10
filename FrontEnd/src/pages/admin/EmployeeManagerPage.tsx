import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { User } from "@/interfaces/user.types";
import { userService } from "@/services/userService";
import { formatDate } from "@/utils/formatDate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PERMISSION_LABELS: Record<string, string> = {
  CREATE_ORDER: "Tạo đơn hàng",
  VIEW_OWN_ORDER: "Xem đơn của bản thân",
  CREATE_REVIEW: "Viết đánh giá",
  ACCESS_VIP_DISCOUNTS: "Truy cập ưu đãi VIP",
  CREATE_PRODUCT: "Thêm sản phẩm",
  UPDATE_PRODUCT: "Chỉnh sửa sản phẩm",
  VIEW_ALL_ORDERS: "Xem tất cả đơn hàng",
  UPDATE_ORDER_STATUS: "Cập nhật trạng thái đơn",
  DELETE_PRODUCT: "Xóa sản phẩm",
  MANAGE_STAFF: "Quản lý nhân viên",
  VIEW_REVENUE_REPORT: "Xem báo cáo doanh thu",
};

interface EmployeeFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

const emptyForm: EmployeeFormState = { fullName: "", email: "", phone: "", password: "" };
const PAGE_SIZE = 10;

export function EmployeeManagerPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<EmployeeFormState>(emptyForm);
  const [page, setPage] = useState(0);

  // ── Edit state ─────────────────────────────────────────────────────────────
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", password: "" });

  // ── Permissions state ──────────────────────────────────────────────────────
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [permEmp, setPermEmp] = useState<User | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "employees", page],
    queryFn: () => userService.getUsers(page, PAGE_SIZE, ["STAFF"]),
  });

  const { data: availablePerms = [] } = useQuery({
    queryKey: ["permissions"],
    queryFn: userService.getPermissions,
    staleTime: Infinity,
  });

  const employees = users?.content ?? [];

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      !search ||
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && emp.isActive) ||
      (statusFilter === "inactive" && !emp.isActive);
    return matchesSearch && matchesStatus;
  });

  const createMutation = useMutation({
    mutationFn: () => userService.createEmployee(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "employees"] });
      toast.success("Thêm nhân viên thành công");
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("Thêm nhân viên thất bại"),
  });

  const editMutation = useMutation({
    mutationFn: () =>
      userService.updateEmployee(editingEmp!.id, editForm, editingEmp!.allPermissions ?? []),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "employees"] });
      toast.success("Cập nhật nhân viên thành công");
      setEditDialogOpen(false);
      setEditingEmp(null);
    },
    onError: () => toast.error("Cập nhật nhân viên thất bại"),
  });

  const permMutation = useMutation({
    mutationFn: () => userService.updateUserPermissions(permEmp!.id, selectedPerms),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "employees"] });
      toast.success("Cập nhật quyền thành công");
      setPermDialogOpen(false);
      setPermEmp(null);
    },
    onError: () => toast.error("Cập nhật quyền thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "employees"] });
      toast.success("Xóa nhân viên thành công");
    },
    onError: () => toast.error("Xóa nhân viên thất bại"),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    createMutation.mutate();
  };

  const openEditDialog = (emp: User) => {
    setEditingEmp(emp);
    setEditForm({ fullName: emp.fullName, email: emp.email, password: "" });
    setEditDialogOpen(true);
  };

  const openPermDialog = (emp: User) => {
    setPermEmp(emp);
    setSelectedPerms(emp.allPermissions ?? []);
    setPermDialogOpen(true);
  };

  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý nhân viên</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-500 hover:bg-teal-600">
              <Plus className="mr-2 h-4 w-4" />
              Thêm nhân viên
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm nhân viên mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nhanvien@techgear.vn"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  placeholder="0901234567"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600"
                  disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Thêm
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm nhân viên..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="inactive">Đã khóa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Tên</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ngày tham gia</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Quyền</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-4 py-3">
                          <div className="h-10 animate-pulse rounded bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  : filtered.map((emp) => (
                      <tr key={emp.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-zinc-900">{emp.fullName}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              emp.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }>
                            {emp.isActive ? "Hoạt động" : "Đã khóa"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(emp.createdAt)}</td>
                        <td className="px-4 py-3">
                          {emp.allPermissions && emp.allPermissions.length > 0 ? (
                            <span className="text-xs text-teal-600">
                              {emp.allPermissions.length} quyền
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Mặc định</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                              title="Chỉnh sửa"
                              onClick={() => openEditDialog(emp)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {/* Permissions button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-teal-500 hover:bg-teal-50"
                              title="Cấp quyền"
                              onClick={() => openPermDialog(emp)}>
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </Button>
                            {/* Delete button */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:bg-red-50">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xóa nhân viên</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc muốn xóa nhân viên{" "}
                                    <span className="font-semibold">{emp.fullName}</span>? Hành động
                                    này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => deleteMutation.mutate(emp.id)}>
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Không tìm thấy nhân viên nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {(users?.totalPages ?? 1) > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}>
            Trước
          </Button>
          <span className="text-sm text-gray-600">
            Trang {page + 1}/{users?.totalPages ?? 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= (users?.totalPages ?? 1) - 1}
            onClick={() => setPage((p) => p + 1)}>
            Sau
          </Button>
        </div>
      )}

      {/* ── Edit Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nhân viên</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editForm.fullName || !editForm.email) {
                toast.error("Vui lòng điền đầy đủ thông tin");
                return;
              }
              editMutation.mutate();
            }}
            className="space-y-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input
                value={editForm.fullName}
                onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="nhanvien@techgear.vn"
              />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu mới</Label>
              <Input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Để trống nếu không đổi mật khẩu"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600"
                disabled={editMutation.isPending}>
                {editMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Permissions Dialog ───────────────────────────────────────────────── */}
      <Dialog open={permDialogOpen} onOpenChange={setPermDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Cấp quyền cho <span className="text-teal-600">{permEmp?.fullName}</span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Chọn các quyền bổ sung ngoài quyền mặc định của nhân viên.
          </p>
          <div className="max-h-80 space-y-3 overflow-y-auto py-2">
            {availablePerms.map((perm) => (
              <div key={perm} className="flex items-center gap-3">
                <Checkbox
                  id={`perm-${perm}`}
                  checked={selectedPerms.includes(perm)}
                  onCheckedChange={() => togglePerm(perm)}
                />
                <Label htmlFor={`perm-${perm}`} className="cursor-pointer text-sm font-normal">
                  <span className="font-medium">{PERMISSION_LABELS[perm] ?? perm}</span>
                  <span className="ml-2 text-xs text-gray-400">{perm}</span>
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-teal-500 hover:bg-teal-600"
              disabled={permMutation.isPending}
              onClick={() => permMutation.mutate()}>
              {permMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu quyền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
