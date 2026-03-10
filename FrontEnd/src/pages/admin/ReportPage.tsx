import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { paymentService } from "@/services/paymentService";
import { reportService } from "@/services/reportService";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, DollarSign, ShoppingCart, TrendingUp, XCircle } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const METHOD_LABELS: Record<string, string> = {
  cod: "COD",
  momo: "MoMo",
  vnpay: "VNPay",
};

const PIE_COLORS: Record<string, string> = {
  COMPLETED: "#14b8a6",
  PENDING: "#f97316",
  FAILED: "#f87171",
};

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Hoàn thành",
  PENDING: "Đang xử lý",
  FAILED: "Thất bại",
};

export function ReportPage() {
  const { data: report } = useQuery({
    queryKey: ["admin", "revenue-report"],
    queryFn: reportService.getRevenueReport,
  });

  const { data: rawPayments = [] } = useQuery({
    queryKey: ["admin", "report-payments"],
    queryFn: paymentService.getAllPayments,
  });

  // ── Aggregations ──────────────────────────────────────────────────────────
  const paymentStats = useMemo(() => {
    const completed = rawPayments.filter((p) => p.status === "COMPLETED");
    const pending = rawPayments.filter((p) => p.status === "PENDING");
    const failed = rawPayments.filter((p) => p.status === "FAILED");
    return {
      completedCount: completed.length,
      completedRevenue: completed.reduce((s, p) => s + (p.amount ?? 0), 0),
      pendingCount: pending.length,
      failedCount: failed.length,
    };
  }, [rawPayments]);

  const methodChartData = useMemo(() => {
    const map: Record<string, { method: string; revenue: number; count: number }> = {};
    for (const p of rawPayments) {
      const key = p.paymentMethod ?? "other";
      if (!map[key]) map[key] = { method: METHOD_LABELS[key] ?? key, revenue: 0, count: 0 };
      if (p.status === "COMPLETED") {
        map[key].revenue += p.amount ?? 0;
        map[key].count += 1;
      }
    }
    return Object.values(map);
  }, [rawPayments]);

  const statusPieData = useMemo(() => {
    const map: Record<string, number> = { COMPLETED: 0, PENDING: 0, FAILED: 0 };
    for (const p of rawPayments) {
      if (p.status in map) map[p.status] += 1;
    }
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([status, value]) => ({ name: STATUS_LABELS[status] ?? status, value, status }));
  }, [rawPayments]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Báo cáo & Thống kê</h1>

      {/* ── KPI Summary ─────────────────────────────────────────────────── */}
      {report && (
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
      )}

      {/* ── Payment Stats ────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-teal-50 p-3">
              <CheckCircle2 className="h-6 w-6 text-teal-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Giao dịch hoàn thành</p>
              <p className="text-xl font-bold text-zinc-900">{paymentStats.completedCount}</p>
              <p className="text-xs text-gray-400">{formatVND(paymentStats.completedRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-orange-50 p-3">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đang xử lý</p>
              <p className="text-xl font-bold text-zinc-900">{paymentStats.pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-red-50 p-3">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Giao dịch thất bại</p>
              <p className="text-xl font-bold text-zinc-900">{paymentStats.failedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar chart: revenue by payment method */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo phương thức thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            {methodChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={methodChartData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="method" tick={{ fontSize: 12 }} />
                  <YAxis
                    yAxisId="rev"
                    orientation="left"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) =>
                      v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : `${(v / 1000).toFixed(0)}K`
                    }
                  />
                  <YAxis
                    yAxisId="cnt"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "revenue" ? formatVND(Number(value)) : `${Number(value)} giao dịch`,
                      name === "revenue" ? "Doanh thu" : "Số giao dịch",
                    ]}
                  />
                  <Legend
                    formatter={(value) => (value === "revenue" ? "Doanh thu" : "Số giao dịch")}
                  />
                  <Bar
                    yAxisId="rev"
                    dataKey="revenue"
                    fill="#14b8a6"
                    radius={[4, 4, 0, 0]}
                    name="revenue"
                  />
                  <Bar
                    yAxisId="cnt"
                    dataKey="count"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                    name="count"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-65 items-center justify-center text-sm text-gray-400">
                Chưa có dữ liệu thanh toán
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie chart: transaction status distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ trạng thái giao dịch</CardTitle>
          </CardHeader>
          <CardContent>
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {statusPieData.map((entry) => (
                      <Cell key={entry.status} fill={PIE_COLORS[entry.status] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value)} giao dịch`, "Số lượng"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-65 items-center justify-center text-sm text-gray-400">
                Chưa có dữ liệu thanh toán
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
