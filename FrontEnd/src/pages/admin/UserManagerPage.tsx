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
import { Checkbox } from "@/components/ui/checkbox";
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
import type { CreateAccountRequest, User } from "@/interfaces/user.types";
import { userService } from "@/services/userService";
import { formatDate } from "@/utils/formatDate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Search, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UserFormState {
  email: string;
  password: string;
  fullName: string;
  roleId?: number; // Not used in this form since we're only managing customers
}

const PERMISSION_LABELS: Record<string, string> = {
  CREATE_ORDER: "Tạo đơn hàng",
  VIEW_OWN_ORDER: "Xem đơn hàng của mình",
  CREATE_REVIEW: "Đánh giá sản phẩm",
  ACCESS_VIP_DISCOUNTS: "Truy cập ưu đãi VIP",
  CREATE_PRODUCT: "Thêm sản phẩm",
  UPDATE_PRODUCT: "Cập nhật sản phẩm",
  VIEW_ALL_ORDERS: "Xem tất cả đơn hàng",
  UPDATE_ORDER_STATUS: "Cập nhật trạng thái đơn hàng",
  DELETE_PRODUCT: "Xóa sản phẩm",
  MANAGE_STAFF: "Quản lý nhân viên",
  VIEW_REVENUE_REPORT: "Xem báo cáo doanh thu",
};

const emptyForm: UserFormState = { email: "", password: "", fullName: "", roleId: 0 };
const PAGE_SIZE = 10;

export function UserManagerPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<"USER" | "STAFF">("USER");
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const { data: pagedData, isLoading } = useQuery({
    queryKey: ["admin", "users", page, roleFilter],
    queryFn: () => userService.getUsers(page, PAGE_SIZE, [roleFilter]),
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => userService.getRoles(),
  });
  const userRoleId =
    roles?.find((r) => r.name === (roleFilter === "STAFF" ? "STAFF" : "USER"))?.id ?? 3;

  const { data: availablePerms } = useQuery({
    queryKey: ["permissions"],
    queryFn: userService.getPermissions,
  });

  // Server already filters to USER role — no client-side role filter needed
  const users = pagedData?.content ?? [];

  const filtered = users.filter(
    (u) =>
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (data: CreateAccountRequest) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Thêm khách hàng thành công");
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("Thêm khách hàng thất bại"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateAccountRequest) => userService.updateUser(editingUser!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Cập nhật thành công");
      setDialogOpen(false);
      setEditingUser(null);
      setForm(emptyForm);
    },
    onError: () => toast.error("Cập nhật thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Xóa thành công");
      setDeletingUser(null);
    },
    onError: () => toast.error("Xóa thất bại"),
  });

  const updatePermsMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: number; permissions: string[] }) =>
      userService.updateUserPermissions(id, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Cập nhật quyền thành công");
      setPermissionsUser(null);
    },
    onError: () => toast.error("Cập nhật quyền thất bại"),
  });

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({ email: user.email, password: "", fullName: user.fullName });
    setDialogOpen(true);
  };

  const openPermissions = (user: User) => {
    setPermissionsUser(user);
    setSelectedPerms(user.allPermissions ?? []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    if (editingUser) {
      const payload: CreateAccountRequest = {
        email: form.email,
        fullName: form.fullName,
        ...(form.password ? { password: form.password } : {}),
        roleId: userRoleId,
      };
      updateMutation.mutate(payload);
    } else {
      if (!form.password) {
        toast.error("Vui lòng nhập mật khẩu");
        return;
      }
      createMutation.mutate({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        roleId: userRoleId,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const totalPages = pagedData?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">
          {roleFilter === "STAFF" ? "Quản lý nhân viên" : "Quản lý khách hàng"}
        </h1>
        <Button className="bg-teal-500 hover:bg-teal-600" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {roleFilter === "STAFF" ? "Thêm nhân viên" : "Thêm khách hàng"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={
              roleFilter === "STAFF" ? "Tìm kiếm nhân viên..." : "Tìm kiếm khách hàng..."
            }
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v as "USER" | "STAFF");
            setPage(0);
          }}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">Khách hàng</SelectItem>
            <SelectItem value="STAFF">Nhân viên</SelectItem>
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
                  <th className="px-4 py-3 font-medium text-gray-500">Vai trò</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ngày tham gia</th>
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
                  : filtered.map((user) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-zinc-900">{user.fullName}</td>
                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">
                            {user.roleName ?? user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              user.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }>
                            {user.isActive ? "Hoạt động" : "Khóa"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-teal-500"
                              title="Cấp quyền"
                              onClick={() => openPermissions(user)}>
                              <Shield className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(user)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:bg-red-50"
                              onClick={() => setDeletingUser(user)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      {roleFilter === "STAFF"
                        ? "Không tìm thấy nhân viên nào"
                        : "Không tìm thấy khách hàng nào"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}>
            Trước
          </Button>
          <span className="text-sm text-gray-600">
            Trang {page + 1}/{totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}>
            Sau
          </Button>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser
                ? roleFilter === "STAFF"
                  ? "Chỉnh sửa nhân viên"
                  : "Chỉnh sửa khách hàng"
                : roleFilter === "STAFF"
                  ? "Thêm nhân viên mới"
                  : "Thêm khách hàng mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cu-fullName">Họ và tên *</Label>
              <Input
                id="cu-fullName"
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cu-email">Email *</Label>
              <Input
                id="cu-email"
                type="email"
                placeholder="khachhang@email.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cu-password">
                Mật khẩu {editingUser ? "(để trống nếu không đổi)" : "*"}
              </Label>
              <Input
                id="cu-password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingUser ? "Lưu" : "Thêm"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={!!permissionsUser} onOpenChange={(open) => !open && setPermissionsUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cấp quyền — {permissionsUser?.fullName}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-gray-400">
            Quyền mặc định của vai trò luôn được giữ nguyên. Đây là các quyền đặc biệt bổ sung.
          </p>
          <div className="grid grid-cols-1 gap-3 py-2 sm:grid-cols-2">
            {(availablePerms ?? Object.keys(PERMISSION_LABELS)).map((perm) => (
              <div key={perm} className="flex items-center gap-2">
                <Checkbox
                  id={`perm-${perm}`}
                  checked={selectedPerms.includes(perm)}
                  onCheckedChange={(checked) =>
                    setSelectedPerms((prev) =>
                      checked ? [...prev, perm] : prev.filter((p) => p !== perm)
                    )
                  }
                />
                <Label htmlFor={`perm-${perm}`} className="cursor-pointer text-sm font-normal">
                  {PERMISSION_LABELS[perm] ?? perm}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsUser(null)}>
              Hủy
            </Button>
            <Button
              className="bg-teal-500 hover:bg-teal-600"
              disabled={updatePermsMutation.isPending}
              onClick={() =>
                permissionsUser &&
                updatePermsMutation.mutate({ id: permissionsUser.id, permissions: selectedPerms })
              }>
              {updatePermsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu quyền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa khách hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa khách hàng{" "}
              <span className="font-semibold">{deletingUser?.fullName}</span>? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deletingUser && deleteMutation.mutate(deletingUser.id)}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
