import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, Shield } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

export function UserDetailAdminPage() {
  const { userId } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => userService.getUserById(Number(userId)),
    enabled: !!userId,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin", "user-orders", userId],
    queryFn: () => orderService.getOrdersByUserId(Number(userId)),
    enabled: !!userId,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: () => userService.toggleUserActive(Number(userId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Cập nhật trạng thái tài khoản thành công");
    },
    onError: () => toast.error("Cập nhật thất bại"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-zinc-900">Chi tiết người dùng #{userId}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userLoading ? (
              <>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
              </>
            ) : (
              <>
                <p className="font-medium text-zinc-900">{user?.fullName}</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{user?.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <Badge variant="outline" className="capitalize">
                    {user?.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Ngày tham gia:</span>
                  <span className="text-sm">{user ? formatDate(user.createdAt) : "—"}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trạng thái tài khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      user?.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }>
                    {user?.isActive ? "Đang hoạt động" : "Đã khóa"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActiveMutation.mutate()}
                  disabled={toggleActiveMutation.isPending}>
                  {user?.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch sử đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Mã đơn</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Tổng tiền</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-4 py-3">
                        <div className="h-8 animate-pulse rounded bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : orders?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                      Chưa có đơn hàng
                    </td>
                  </tr>
                ) : (
                  orders?.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-teal-500">{order.orderCode}</td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatVND(order.total)}</td>
                      <td className="px-4 py-3 text-gray-400">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
