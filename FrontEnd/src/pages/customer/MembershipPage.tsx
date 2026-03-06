import { PointsBadge } from "@/components/common/PointsBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/router/routes.const";
import { membershipService } from "@/services/membershipService";
import { formatDate } from "@/utils/formatDate";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const tierConfig = {
  bronze: { label: "Đồng", color: "bg-amber-700", next: "Bạc", pointsNeeded: 5000 },
  silver: { label: "Bạc", color: "bg-gray-400", next: "Vàng", pointsNeeded: 15000 },
  gold: { label: "Vàng", color: "bg-yellow-500", next: "Bạch kim", pointsNeeded: 50000 },
  platinum: { label: "Bạch kim", color: "bg-purple-500", next: null, pointsNeeded: 0 },
};

export function MembershipPage() {
  const { data: membership, isLoading } = useQuery({
    queryKey: ["membership"],
    queryFn: membershipService.getMembershipInfo,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!membership) return null;

  const tier = tierConfig[membership.tier];
  const progressPercent =
    tier.pointsNeeded > 0 ? Math.min(100, (membership.totalEarned / tier.pointsNeeded) * 100) : 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Điểm thành viên</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <Badge className={`${tier.color} text-white`}>{tier.label}</Badge>
            <PointsBadge points={membership.currentPoints} size="lg" />
            <p className="text-sm text-gray-500">
              {membership.currentPoints} điểm ={" "}
              {(membership.currentPoints * 1000).toLocaleString("vi-VN")}đ giảm giá
            </p>
            {tier.next && (
              <div className="w-full max-w-xs">
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>{tier.label}</span>
                  <span>{tier.next}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <p className="mt-1 text-center text-xs text-gray-400">
                  Còn {(tier.pointsNeeded - membership.totalEarned).toLocaleString("vi-VN")} điểm để
                  lên hạng
                </p>
              </div>
            )}
            <Button asChild className="mt-4 bg-teal-500 hover:bg-teal-600">
              <Link to={ROUTES.CART}>
                Sử dụng điểm ngay <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thống kê</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Tổng tích lũy</p>
                <p className="font-bold text-zinc-900">
                  {membership.totalEarned.toLocaleString("vi-VN")} điểm
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Đã sử dụng</p>
                <p className="font-bold text-zinc-900">
                  {membership.totalRedeemed.toLocaleString("vi-VN")} điểm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">Loại</th>
                  <th className="pb-3 font-medium text-gray-500">Mô tả</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Điểm</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {membership.transactions.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0">
                    <td className="py-3">
                      {tx.type === "earned" ? (
                        <span className="text-green-600">Tích lũy</span>
                      ) : (
                        <span className="text-orange-500">Sử dụng</span>
                      )}
                    </td>
                    <td className="py-3 text-gray-600">{tx.description}</td>
                    <td
                      className={`py-3 text-right font-medium ${tx.type === "earned" ? "text-green-600" : "text-orange-500"}`}>
                      {tx.type === "earned" ? "+" : "-"}
                      {tx.points}
                    </td>
                    <td className="py-3 text-right text-gray-400">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
