import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiPayment } from "@/interfaces/payment.types";
import { cn } from "@/lib/utils";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { reportService } from "@/services/reportService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ChartPoint {
  date: string;
  label: string;
  revenue: number;
  orderCount: number;
}

// ── Vietnamese day-of-week labels ──────────────────────────────────────────────
const DAY_VN = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

// ── Custom Tooltip (F) ─────────────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: ChartPoint;
  }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const d = new Date(point.date);
  return (
    <div className="min-w-40 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-gray-400">
        {DAY_VN[d.getDay()]}, {point.label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-500">
            {entry.name === "revenue" ? "Doanh thu" : "Số đơn"}:
          </span>
          <span className="ml-auto text-xs font-bold text-zinc-900">
            {entry.name === "revenue" ? formatVND(entry.value) : `${entry.value} đơn`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Data helpers ───────────────────────────────────────────────────────────────
function buildChartData(payments: ApiPayment[], rangeDays: number): ChartPoint[] {
  const today = new Date();
  const days: ChartPoint[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    days.push({ date: key, label, revenue: 0, orderCount: 0 });
  }
  for (const p of payments) {
    if (p.status !== "COMPLETED") continue;
    const day = (p.date ?? "").slice(0, 10);
    const slot = days.find((d) => d.date === day);
    if (slot) {
      slot.revenue += p.amount ?? 0;
      slot.orderCount += 1;
    }
  }
  return days;
}

function getPrevPeriodTotals(
  payments: ApiPayment[],
  rangeDays: number
): { revenue: number; orderCount: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const prevEnd = new Date(today);
  prevEnd.setDate(prevEnd.getDate() - rangeDays);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - rangeDays);
  let revenue = 0;
  let orderCount = 0;
  for (const p of payments) {
    if (p.status !== "COMPLETED") continue;
    const d = new Date(p.date ?? "");
    if (d >= prevStart && d < prevEnd) {
      revenue += p.amount ?? 0;
      orderCount += 1;
    }
  }
  return { revenue, orderCount };
}

// ── Constants ──────────────────────────────────────────────────────────────────
const RANGE_OPTIONS = [
  { label: "7N", days: 7 },
  { label: "14N", days: 14 },
  { label: "30N", days: 30 },
] as const;

// ── Component ──────────────────────────────────────────────────────────────────
export function DashboardPage() {
  // A — flexible date range
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(7);
  // C — dual metric toggles
  const [showRevenue, setShowRevenue] = useState(true);
  const [showOrders, setShowOrders] = useState(true);

  const { data: kpi } = useQuery({
    queryKey: ["admin", "kpi"],
    queryFn: reportService.getDashboardKPI,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["admin", "recent-orders"],
    queryFn: () => orderService.getAllOrders({ pageSize: 10 }),
  });

  const { data: rawPayments = [] } = useQuery({
    queryKey: ["admin", "dashboard-payments"],
    queryFn: paymentService.getAllPayments,
  });

  const chartData = useMemo(() => buildChartData(rawPayments, rangeDays), [rawPayments, rangeDays]);

  // D — period totals for header summary
  const periodTotals = useMemo(
    () => ({
      revenue: chartData.reduce((s, d) => s + d.revenue, 0),
      orderCount: chartData.reduce((s, d) => s + d.orderCount, 0),
    }),
    [chartData]
  );

  const prevTotals = useMemo(
    () => getPrevPeriodTotals(rawPayments, rangeDays),
    [rawPayments, rangeDays]
  );

  const revenueGrowth =
    prevTotals.revenue > 0
      ? ((periodTotals.revenue - prevTotals.revenue) / prevTotals.revenue) * 100
      : null;

  // G — average revenue reference line
  const avgRevenue = chartData.length > 0 ? Math.round(periodTotals.revenue / chartData.length) : 0;

  const kpiCards = [
    {
      title: "Doanh thu hôm nay",
      value: kpi ? formatVND(kpi.totalRevenue) : "...",
      growth: kpi?.revenueGrowthPercent,
      icon: DollarSign,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Đơn hàng mới",
      value: kpi?.totalOrders?.toString() || "...",
      growth: kpi?.orderGrowthPercent,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Khách hàng mới",
      value: kpi?.newCustomers?.toString() || "...",
      icon: Users,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      title: "Đơn chờ xử lý",
      value: kpi?.pendingOrders?.toString() || "...",
      icon: Package,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  // Prevent disabling both metrics simultaneously
  const handleToggleRevenue = () => {
    if (showRevenue && !showOrders) return;
    setShowRevenue((v) => !v);
  };
  const handleToggleOrders = () => {
    if (showOrders && !showRevenue) return;
    setShowOrders((v) => !v);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Tổng quan</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-3 ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-xl font-bold text-zinc-900">{card.value}</p>
                {card.growth !== undefined && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs ${card.growth >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {card.growth >= 0 ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {Math.abs(card.growth)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="pb-2">
          {/* D — Summary + Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: title + period summary */}
            <div>
              <CardTitle className="text-base">Doanh thu {rangeDays} ngày qua</CardTitle>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="text-2xl font-bold text-zinc-900">
                  {formatVND(periodTotals.revenue)}
                </span>
                {revenueGrowth !== null && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                      revenueGrowth >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                    )}>
                    {revenueGrowth >= 0 ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  · {periodTotals.orderCount} đơn hoàn thành
                </span>
              </div>
            </div>

            {/* Right: range selector + metric toggles */}
            <div className="flex flex-wrap items-center gap-2">
              {/* A — Date range selector */}
              <div className="flex rounded-lg border border-gray-200 p-0.5">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.days}
                    onClick={() => setRangeDays(opt.days)}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                      rangeDays === opt.days
                        ? "bg-teal-500 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}>
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* C — Metric toggles */}
              <button
                onClick={handleToggleRevenue}
                title={!showOrders ? "Không thể tắt cả 2 chỉ số" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all",
                  showRevenue
                    ? "border-teal-200 bg-teal-50 text-teal-700"
                    : "border-gray-200 bg-white text-gray-400 hover:text-gray-500"
                )}>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    showRevenue ? "bg-teal-500" : "bg-gray-300"
                  )}
                />
                Doanh thu
              </button>
              <button
                onClick={handleToggleOrders}
                title={!showRevenue ? "Không thể tắt cả 2 chỉ số" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all",
                  showOrders
                    ? "border-orange-200 bg-orange-50 text-orange-600"
                    : "border-gray-200 bg-white text-gray-400 hover:text-gray-500"
                )}>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    showOrders ? "bg-orange-400" : "bg-gray-300"
                  )}
                />
                Số đơn
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              {/* E — Gradient fills */}
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              {/* Always keep both axes to avoid layout shift when toggling */}
              <YAxis
                yAxisId="rev"
                orientation="left"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                hide={!showRevenue}
                tickFormatter={(v: number) =>
                  v >= 1000000
                    ? `${(v / 1000000).toFixed(0)}M`
                    : v >= 1000
                      ? `${(v / 1000).toFixed(0)}K`
                      : String(v)
                }
              />
              <YAxis
                yAxisId="ord"
                orientation="right"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                hide={!showOrders}
                allowDecimals={false}
              />

              {/* F — Custom tooltip */}
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }} />

              {/* G — Average revenue reference line */}
              {showRevenue && avgRevenue > 0 && (
                <ReferenceLine
                  yAxisId="rev"
                  y={avgRevenue}
                  stroke="#cbd5e1"
                  strokeDasharray="5 4"
                  label={{
                    value: `TB: ${formatVND(avgRevenue)}`,
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "#94a3b8",
                  }}
                />
              )}

              {/* Revenue area */}
              {showRevenue && (
                <Area
                  yAxisId="rev"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  fill="url(#gradRevenue)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#14b8a6", strokeWidth: 0 }}
                  name="revenue"
                />
              )}

              {/* Order count area */}
              {showOrders && (
                <Area
                  yAxisId="ord"
                  type="monotone"
                  dataKey="orderCount"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#gradOrders)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#f97316", strokeWidth: 0 }}
                  name="orderCount"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Mã đơn</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Khách hàng</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Tổng tiền</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders?.data.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{order.orderCode}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.userId ? `Khách #${order.userId}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">
                      {formatVND(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
                {!recentOrders?.data.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {kpi && kpi.lowStockProducts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 p-4">
            <Package className="h-5 w-5 text-orange-500" />
            <p className="text-sm text-orange-700">
              Có <strong>{kpi.lowStockProducts}</strong> sản phẩm sắp hết hàng (số lượng &lt; 10)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
