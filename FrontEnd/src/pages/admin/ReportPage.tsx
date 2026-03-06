import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reportService } from "@/services/reportService";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ReportPage() {
  const { data: report } = useQuery({
    queryKey: ["admin", "revenue-report"],
    queryFn: reportService.getRevenueReport,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Báo cáo & Thống kê</h1>

      {report && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-teal-50 p-3">
                  <DollarSign className="h-6 w-6 text-teal-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tổng doanh thu</p>
                  <p className="text-xl font-bold">{formatVND(report.totalRevenue)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-blue-50 p-3">
                  <ShoppingCart className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                  <p className="text-xl font-bold">{report.totalOrders.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-orange-50 p-3">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giá trị TB/đơn</p>
                  <p className="text-xl font-bold">{formatVND(report.averageOrderValue)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Doanh thu 7 ngày qua</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={report.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis
                    yAxisId="revenue"
                    orientation="left"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`}
                  />
                  <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "revenue" ? formatVND(Number(value)) : value,
                      name === "revenue" ? "Doanh thu" : "Số đơn",
                    ]}
                  />
                  <Line
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="revenue"
                  />
                  <Line
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orderCount"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="orderCount"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
