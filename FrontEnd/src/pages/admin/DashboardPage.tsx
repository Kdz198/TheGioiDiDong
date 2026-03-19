import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import type { ApiPayment } from "@/interfaces/payment.types";
import { cn } from "@/lib/utils";
import { feedbackService } from "@/services/feedbackService";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { userService } from "@/services/userService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Pie,
  PieChart,
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
function buildChartDataByDates(
  payments: ApiPayment[],
  startDate: string,
  endDate: string
): ChartPoint[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: ChartPoint[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10);
    const label = `${String(cur.getDate()).padStart(2, "0")}/${String(cur.getMonth() + 1).padStart(2, "0")}`;
    days.push({ date: key, label, revenue: 0, orderCount: 0 });
    cur.setDate(cur.getDate() + 1);
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
  startDate: string,
  endDate: string
): { revenue: number; orderCount: number } {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const spanMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - spanMs);
  let revenue = 0;
  let orderCount = 0;
  for (const p of payments) {
    if (p.status !== "COMPLETED") continue;
    const d = new Date(p.date ?? "");
    if (d >= prevStart && d <= prevEnd) {
      revenue += p.amount ?? 0;
      orderCount += 1;
    }
  }
  return { revenue, orderCount };
}

// Returns the interval for XAxis ticks to avoid label overcrowding:
// ≤30 pts → all labels, ≤60 → every 2nd, ≤120 → ~20 labels, >120 → ~12 labels
function getXAxisInterval(numPoints: number): number {
  if (numPoints <= 30) return 0;
  if (numPoints <= 60) return 1;
  if (numPoints <= 120) return Math.ceil(numPoints / 20) - 1;
  return Math.ceil(numPoints / 12) - 1;
}

// ── Constants ──────────────────────────────────────────────────────────────────
type RangeMode = "7" | "14" | "30" | "custom";

const RANGE_OPTIONS: { label: string; value: Exclude<RangeMode, "custom"> }[] = [
  { label: "7N", value: "7" },
  { label: "14N", value: "14" },
  { label: "30N", value: "30" },
];

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

const ORDER_STATUS_LABELS: Record<"pending" | "paid" | "canceled", string> = {
  pending: "Đang chờ",
  paid: "Đã thanh toán",
  canceled: "Đã hủy",
};

const ORDER_STATUS_COLORS: Record<"pending" | "paid" | "canceled", string> = {
  pending: "#f97316",
  paid: "#14b8a6",
  canceled: "#f87171",
};

// ── Component ──────────────────────────────────────────────────────────────────
export function DashboardPage() {
  // A — flexible date range
  const [rangeMode, setRangeMode] = useState<RangeMode>("7");
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined);
  // C — dual metric toggles
  const [showRevenue, setShowRevenue] = useState(true);
  const [showOrders, setShowOrders] = useState(true);

  const { data: allOrders } = useQuery({
    queryKey: ["admin", "all-orders"],
    queryFn: () => orderService.getAllOrders(),
  });

  const { data: allUsers } = useQuery({
    queryKey: ["admin", "all-users"],
    queryFn: () => userService.getUsers(0, 9999),
  });

  const { data: rawPayments = [] } = useQuery({
    queryKey: ["admin", "dashboard-payments"],
    queryFn: paymentService.getAllPayments,
  });

  const { data: rawFeedbacks = [] } = useQuery({
    queryKey: ["admin", "dashboard-feedbacks"],
    queryFn: feedbackService.getFeedbacks,
  });

  // KPI computed from real data
  const totalRevenue = useMemo(
    () =>
      rawPayments.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + (p.amount ?? 0), 0),
    [rawPayments]
  );
  const totalOrders = allOrders?.data?.length ?? 0;
  const totalCustomers = allUsers?.totalElements ?? 0;
  const pendingOrders = useMemo(
    () => (allOrders?.data ?? []).filter((o) => o.status === "pending").length,
    [allOrders]
  );

  const effectiveDates = useMemo(() => {
    if (rangeMode === "custom" && customFrom && customTo) {
      const fromStr = customFrom.toISOString().slice(0, 10);
      const toStr = customTo.toISOString().slice(0, 10);
      if (fromStr <= toStr) return { from: fromStr, to: toStr };
    }
    const today = new Date();
    const to = today.toISOString().slice(0, 10);
    const from = new Date(today);
    const days = rangeMode === "custom" ? 7 : Number(rangeMode);
    from.setDate(from.getDate() - (days - 1));
    return { from: from.toISOString().slice(0, 10), to };
  }, [rangeMode, customFrom, customTo]);

  const chartData = useMemo(
    () => buildChartDataByDates(rawPayments, effectiveDates.from, effectiveDates.to),
    [rawPayments, effectiveDates]
  );

  // D — period totals for header summary
  const periodTotals = useMemo(
    () => ({
      revenue: chartData.reduce((s, d) => s + d.revenue, 0),
      orderCount: chartData.reduce((s, d) => s + d.orderCount, 0),
    }),
    [chartData]
  );

  const prevTotals = useMemo(
    () => getPrevPeriodTotals(rawPayments, effectiveDates.from, effectiveDates.to),
    [rawPayments, effectiveDates]
  );

  const revenueGrowth =
    prevTotals.revenue > 0
      ? ((periodTotals.revenue - prevTotals.revenue) / prevTotals.revenue) * 100
      : null;

  // G — average revenue reference line
  const avgRevenue = chartData.length > 0 ? Math.round(periodTotals.revenue / chartData.length) : 0;

  // Payment method chart data
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

  // Transaction status pie data
  const statusPieData = useMemo(() => {
    const map: Record<string, number> = { COMPLETED: 0, PENDING: 0, FAILED: 0 };
    for (const p of rawPayments) {
      if (p.status in map) map[p.status] += 1;
    }
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([status, value]) => ({ name: STATUS_LABELS[status] ?? status, value, status }));
  }, [rawPayments]);

  const ordersInPeriod = useMemo(() => {
    const from = new Date(effectiveDates.from);
    from.setHours(0, 0, 0, 0);
    const to = new Date(effectiveDates.to);
    to.setHours(23, 59, 59, 999);
    return (allOrders?.data ?? []).filter((order) => {
      const created = new Date(order.createdAt);
      if (Number.isNaN(created.getTime())) return false;
      return created >= from && created <= to;
    });
  }, [allOrders, effectiveDates]);

  const orderStatusChartData = useMemo(() => {
    const map: Record<"pending" | "paid" | "canceled", number> = {
      pending: 0,
      paid: 0,
      canceled: 0,
    };
    ordersInPeriod.forEach((order) => {
      if (order.status in map) {
        map[order.status as "pending" | "paid" | "canceled"] += 1;
      }
    });
    return (Object.keys(map) as Array<"pending" | "paid" | "canceled">).map((status) => ({
      status,
      label: ORDER_STATUS_LABELS[status],
      value: map[status],
    }));
  }, [ordersInPeriod]);

  const feedbackInPeriod = useMemo(() => {
    const from = new Date(effectiveDates.from);
    from.setHours(0, 0, 0, 0);
    const to = new Date(effectiveDates.to);
    to.setHours(23, 59, 59, 999);
    return rawFeedbacks.filter((feedback) => {
      const created = new Date(feedback.date);
      if (Number.isNaN(created.getTime())) return false;
      return created >= from && created <= to;
    });
  }, [effectiveDates, rawFeedbacks]);

  const feedbackChartData = useMemo(() => {
    const map: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbackInPeriod.forEach((feedback) => {
      const rating = Math.round(feedback.rating ?? 0);
      if (rating >= 1 && rating <= 5) {
        map[rating] += 1;
      }
    });
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      label: `${rating} sao`,
      value: map[rating],
    }));
  }, [feedbackInPeriod]);

  const feedbackAverage = useMemo(() => {
    if (!feedbackInPeriod.length) return 0;
    const total = feedbackInPeriod.reduce((sum, feedback) => sum + (feedback.rating ?? 0), 0);
    return total / feedbackInPeriod.length;
  }, [feedbackInPeriod]);

  const kpiCards = [
    {
      title: "Doanh thu",
      value: totalRevenue > 0 ? formatVND(totalRevenue) : "...",
      icon: DollarSign,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Đơn hàng",
      value: totalOrders > 0 ? totalOrders.toString() : "...",
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Khách hàng",
      value: totalCustomers > 0 ? totalCustomers.toString() : "...",
      icon: Users,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      title: "Đơn chờ xử lý",
      value: pendingOrders > 0 ? pendingOrders.toString() : "0",
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
              <CardTitle className="text-base">
                {rangeMode === "custom" && customFrom && customTo
                  ? `Doanh thu từ ${customFrom.toLocaleDateString("vi-VN")} đến ${customTo.toLocaleDateString("vi-VN")}`
                  : `Doanh thu ${rangeMode} ngày qua`}
              </CardTitle>
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
              <div className="flex flex-col items-end gap-2">
                <div className="flex rounded-lg border border-gray-200 p-0.5">
                  {RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRangeMode(opt.value)}
                      className={cn(
                        "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                        rangeMode === opt.value
                          ? "bg-teal-500 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      )}>
                      {opt.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setRangeMode("custom")}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                      rangeMode === "custom"
                        ? "bg-teal-500 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}>
                    Tùy chỉnh
                  </button>
                </div>
                {rangeMode === "custom" && (
                  <div className="flex items-center gap-1.5">
                    <DatePicker
                      value={customFrom}
                      onChange={setCustomFrom}
                      maxDate={customTo}
                      placeholder="Từ ngày"
                      className="h-7 w-32 text-xs"
                    />
                    <span className="text-xs text-gray-400">đến</span>
                    <DatePicker
                      value={customTo}
                      onChange={setCustomTo}
                      minDate={customFrom}
                      placeholder="Đến ngày"
                      className="h-7 w-32 text-xs"
                    />
                  </div>
                )}
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
                interval={getXAxisInterval(chartData.length)}
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
      {/* Payment Method & Transaction Status Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
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
              <div className="flex h-64 items-center justify-center text-sm text-gray-400">
                Chưa có dữ liệu thanh toán
              </div>
            )}
          </CardContent>
        </Card>

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
              <div className="flex h-64 items-center justify-center text-sm text-gray-400">
                Chưa có dữ liệu thanh toán
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phân bố trạng thái đơn hàng</CardTitle>
            <p className="text-xs text-gray-500">Theo kỳ lọc hiện tại</p>
          </CardHeader>
          <CardContent>
            {orderStatusChartData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={orderStatusChartData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`${Number(value)} đơn`, "Số lượng"]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {orderStatusChartData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={ORDER_STATUS_COLORS[entry.status as "pending" | "paid" | "canceled"]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-gray-400">
                Chưa có dữ liệu đơn hàng theo kỳ lọc
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tổng hợp phản hồi khách hàng</CardTitle>
            <p className="text-xs text-gray-500">
              Theo kỳ lọc hiện tại · Điểm trung bình {feedbackAverage.toFixed(2)} / 5
            </p>
          </CardHeader>
          <CardContent>
            {feedbackChartData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={feedbackChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} width={70} />
                  <Tooltip formatter={(value) => [`${Number(value)} phản hồi`, "Số lượng"]} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-gray-400">
                Chưa có dữ liệu phản hồi theo kỳ lọc
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                {allOrders?.data.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{order.orderCode}</td>
                    <td className="px-4 py-3 text-gray-600">{order.userName ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">
                      {formatVND(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
                {!allOrders?.data.length && (
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
    </div>
  );
}
