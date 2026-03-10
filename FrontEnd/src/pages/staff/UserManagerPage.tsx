import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { User } from "@/interfaces/user.types";
import { userService } from "@/services/userService";
import { formatDate } from "@/utils/formatDate";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search } from "lucide-react";
import { useState } from "react";

export function UserManagerPage() {
  const [search, setSearch] = useState("");
  const [detailUser, setDetailUser] = useState<User | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["staff", "customers"],
    queryFn: () => userService.getUsers(0, 100, ["USER"]),
  });

  const filtered = (users?.content ?? []).filter(
    (user) =>
      !search ||
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Khách hàng</h1>

      <div className="flex flex-wrap gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm khách hàng..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
                  <th className="px-4 py-3 font-medium text-gray-500">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="px-4 py-3">
                          <div className="h-10 animate-pulse rounded bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  : filtered.map((user) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-zinc-900">{user.fullName}</td>
                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
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
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-teal-500"
                            onClick={() => setDetailUser(user)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Không tìm thấy khách hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!detailUser} onOpenChange={(open) => !open && setDetailUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Chi tiết khách hàng</DialogTitle>
          </DialogHeader>
          {detailUser && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">Họ và tên</p>
                <p className="font-medium text-zinc-900">{detailUser.fullName}</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-gray-700">{detailUser.email}</p>
              </div>
              {detailUser.phone && (
                <div>
                  <p className="text-gray-400">Số điện thoại</p>
                  <p className="text-gray-700">{detailUser.phone}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400">Trạng thái</p>
                <Badge
                  className={
                    detailUser.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }>
                  {detailUser.isActive ? "Hoạt động" : "Khóa"}
                </Badge>
              </div>
              <div>
                <p className="text-gray-400">Ngày tham gia</p>
                <p className="text-gray-700">{formatDate(detailUser.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
