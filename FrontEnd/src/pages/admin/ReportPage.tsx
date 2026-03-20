import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  type CsvCell,
  type CsvColumn,
  buildCsvContent,
  downloadCsv,
  downloadZipOfCsvFiles,
} from "@/lib/reportExport";
import { cn } from "@/lib/utils";
import { feedbackService } from "@/services/feedbackService";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { productService } from "@/services/productService";
import { formatDate } from "@/utils/formatDate";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Download, FileArchive, Filter, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type RangeMode = "30" | "90" | "365" | "custom";
type Granularity = "day" | "week" | "month";
type RankMetric = "revenue" | "soldCount";

interface RevenuePoint {
  key: string;
  label: string;
  revenue: number;
  orderCount: number;
}

interface OrderStatusPoint {
  status: "pending" | "paid" | "canceled";
  label: string;
  count: number;
}

interface TopProductPoint {
  productId: number;
  productName: string;
  categoryName: string;
  soldCount: number;
  revenue: number;
}

interface TopCategoryPoint {
  categoryName: string;
  orderCount: number;
  soldCount: number;
  revenue: number;
}

interface LowStockPoint {
  productId: number;
  productName: string;
  categoryName: string;
  quantity: number;
  reserve: number;
  deficit: number;
}

interface FeedbackDistributionPoint {
  rating: number;
  label: string;
  count: number;
}

interface CsvMetaFields {
  report_code: string;
  generated_at: string;
  period_from: string;
  period_to: string;
  period_granularity: string;
  dataset_name: string;
  row_no: number;
}

const RANGE_OPTIONS: Array<{ label: string; value: Exclude<RangeMode, "custom"> }> = [
  { label: "30N", value: "30" },
  { label: "90N", value: "90" },
  { label: "12T", value: "365" },
];

const GRANULARITY_OPTIONS: Array<{ label: string; value: Granularity }> = [
  { label: "Ngày", value: "day" },
  { label: "Tuần", value: "week" },
  { label: "Tháng", value: "month" },
];

const STATUS_LABELS: Record<OrderStatusPoint["status"], string> = {
  pending: "Đang chờ",
  paid: "Đã thanh toán",
  canceled: "Đã hủy",
};

const STATUS_LIST: OrderStatusPoint["status"][] = ["pending", "paid", "canceled"];

function getStartOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function getEndOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
}

function createDefaultRange(mode: Exclude<RangeMode, "custom">): { from: Date; to: Date } {
  const to = getEndOfDay(new Date());
  const from = getStartOfDay(new Date(to));
  from.setDate(from.getDate() - (Number(mode) - 1));
  return { from, to };
}

function createPreviousRange(range: { from: Date; to: Date }): { from: Date; to: Date } {
  const spanMs = range.to.getTime() - range.from.getTime();
  const prevTo = new Date(range.from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - spanMs);
  return {
    from: getStartOfDay(prevFrom),
    to: getEndOfDay(prevTo),
  };
}

function formatRangeForFile(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function getWeekKey(date: Date): string {
  const normalized = getStartOfDay(date);
  const day = normalized.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(normalized);
  monday.setDate(normalized.getDate() + diffToMonday);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const d = String(monday.getDate()).padStart(2, "0");
  return `${y}-W-${m}-${d}`;
}

function getWeekLabel(date: Date): string {
  const normalized = getStartOfDay(date);
  const day = normalized.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(normalized);
  monday.setDate(normalized.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${String(monday.getDate()).padStart(2, "0")}/${String(monday.getMonth() + 1).padStart(2, "0")} - ${String(sunday.getDate()).padStart(2, "0")}/${String(sunday.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getMonthLabel(date: Date): string {
  return `T${date.getMonth() + 1}/${date.getFullYear()}`;
}

function toMetricLabel(mode: Granularity, date: Date): { key: string; label: string } {
  if (mode === "day") {
    const key = date.toISOString().slice(0, 10);
    const label = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
    return { key, label };
  }

  if (mode === "week") {
    return { key: getWeekKey(date), label: getWeekLabel(date) };
  }

  return { key: getMonthKey(date), label: getMonthLabel(date) };
}

function inDateRange(dateText: string | undefined, from: Date, to: Date): boolean {
  if (!dateText) return false;
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return false;
  return date >= from && date <= to;
}

function getOrderDateValue(order: { createdAt?: string; updatedAt?: string }): string {
  return order.createdAt || order.updatedAt || "";
}

function safeNumber(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function calculateGrowth(currentValue: number, previousValue: number): number | null {
  if (previousValue <= 0) return null;
  return ((currentValue - previousValue) / previousValue) * 100;
}

function formatGrowth(growth: number | null): string {
  if (growth === null) return "N/A";
  return `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`;
}

function exportCsv<T extends object>(fileName: string, rows: T[], columns: CsvColumn<T>[]): void {
  downloadCsv(fileName, rows, columns);
}

function withCsvMeta<T extends Record<string, CsvCell>>(
  rows: T[],
  datasetName: string,
  meta: Omit<CsvMetaFields, "dataset_name" | "row_no">
): Array<CsvMetaFields & T> {
  return rows.map((row, index) => ({
    report_code: meta.report_code,
    generated_at: meta.generated_at,
    period_from: meta.period_from,
    period_to: meta.period_to,
    period_granularity: meta.period_granularity,
    dataset_name: datasetName,
    row_no: index + 1,
    ...row,
  }));
}

function growthBadge(growth: number | null): React.ReactNode {
  if (growth === null) {
    return <span className="text-xs text-gray-400">N/A</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        growth >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
      )}>
      {growth >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {formatGrowth(growth)}
    </span>
  );
}

export function ReportPage() {
  const [rangeMode, setRangeMode] = useState<RangeMode>("30");
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [rankMetric, setRankMetric] = useState<RankMetric>("revenue");

  const ordersQuery = useQuery({
    queryKey: ["admin", "report", "orders"],
    queryFn: () => orderService.getAllOrders(),
  });

  const paymentsQuery = useQuery({
    queryKey: ["admin", "report", "payments"],
    queryFn: paymentService.getAllPayments,
  });

  const productsQuery = useQuery({
    queryKey: ["admin", "report", "products"],
    queryFn: () => productService.getProducts({ page: 1, pageSize: 10000, activeFilter: "all" }),
  });

  const feedbacksQuery = useQuery({
    queryKey: ["admin", "report", "feedbacks"],
    queryFn: feedbackService.getFeedbacks,
  });

  const isLoading =
    ordersQuery.isLoading ||
    paymentsQuery.isLoading ||
    productsQuery.isLoading ||
    feedbacksQuery.isLoading;

  const hasError =
    ordersQuery.isError || paymentsQuery.isError || productsQuery.isError || feedbacksQuery.isError;

  const effectiveRange = useMemo(() => {
    if (rangeMode === "custom" && customFrom && customTo) {
      const from = getStartOfDay(customFrom);
      const to = getEndOfDay(customTo);
      if (from <= to) {
        return { from, to };
      }
    }
    return createDefaultRange(rangeMode === "custom" ? "30" : rangeMode);
  }, [rangeMode, customFrom, customTo]);

  const previousRange = useMemo(() => createPreviousRange(effectiveRange), [effectiveRange]);

  const periodText = useMemo(() => {
    return `${effectiveRange.from.toLocaleDateString("vi-VN")} - ${effectiveRange.to.toLocaleDateString("vi-VN")}`;
  }, [effectiveRange]);

  const allOrders = useMemo(() => ordersQuery.data?.data ?? [], [ordersQuery.data?.data]);
  const allPayments = useMemo(() => paymentsQuery.data ?? [], [paymentsQuery.data]);
  const allProducts = useMemo(() => productsQuery.data?.items ?? [], [productsQuery.data?.items]);
  const allFeedbacks = useMemo(() => feedbacksQuery.data ?? [], [feedbacksQuery.data]);

  const filteredOrders = useMemo(
    () =>
      allOrders.filter((order) =>
        inDateRange(getOrderDateValue(order), effectiveRange.from, effectiveRange.to)
      ),
    [allOrders, effectiveRange]
  );

  const previousOrders = useMemo(
    () =>
      allOrders.filter((order) =>
        inDateRange(getOrderDateValue(order), previousRange.from, previousRange.to)
      ),
    [allOrders, previousRange]
  );

  const filteredPayments = useMemo(
    () =>
      allPayments.filter((payment) =>
        inDateRange(payment.date, effectiveRange.from, effectiveRange.to)
      ),
    [allPayments, effectiveRange]
  );

  const previousPayments = useMemo(
    () =>
      allPayments.filter((payment) =>
        inDateRange(payment.date, previousRange.from, previousRange.to)
      ),
    [allPayments, previousRange]
  );

  const completedPayments = useMemo(
    () => filteredPayments.filter((payment) => payment.status === "COMPLETED"),
    [filteredPayments]
  );

  const previousCompletedPayments = useMemo(
    () => previousPayments.filter((payment) => payment.status === "COMPLETED"),
    [previousPayments]
  );

  const filteredFeedbacks = useMemo(
    () =>
      allFeedbacks.filter((feedback) =>
        inDateRange(feedback.date, effectiveRange.from, effectiveRange.to)
      ),
    [allFeedbacks, effectiveRange]
  );

  const previousFeedbacks = useMemo(
    () =>
      allFeedbacks.filter((feedback) =>
        inDateRange(feedback.date, previousRange.from, previousRange.to)
      ),
    [allFeedbacks, previousRange]
  );

  const revenueSeries = useMemo<RevenuePoint[]>(() => {
    const map = new Map<string, RevenuePoint>();

    completedPayments.forEach((payment) => {
      const date = new Date(payment.date);
      if (Number.isNaN(date.getTime())) return;
      const metric = toMetricLabel(granularity, date);
      const existing = map.get(metric.key);
      if (existing) {
        existing.revenue += safeNumber(payment.amount);
        existing.orderCount += 1;
        return;
      }
      map.set(metric.key, {
        key: metric.key,
        label: metric.label,
        revenue: safeNumber(payment.amount),
        orderCount: 1,
      });
    });

    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [completedPayments, granularity]);

  const totalRevenue = useMemo(
    () => completedPayments.reduce((sum, payment) => sum + safeNumber(payment.amount), 0),
    [completedPayments]
  );

  const previousRevenue = useMemo(
    () => previousCompletedPayments.reduce((sum, payment) => sum + safeNumber(payment.amount), 0),
    [previousCompletedPayments]
  );

  const orderStatusData = useMemo<OrderStatusPoint[]>(() => {
    const map: Record<OrderStatusPoint["status"], number> = {
      pending: 0,
      paid: 0,
      canceled: 0,
    };

    filteredOrders.forEach((order) => {
      const status = order.status;
      if (status in map) {
        map[status as OrderStatusPoint["status"]] += 1;
      }
    });

    return STATUS_LIST.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: map[status],
    }));
  }, [filteredOrders]);

  const previousOrderStatusMap = useMemo(() => {
    const map: Record<OrderStatusPoint["status"], number> = {
      pending: 0,
      paid: 0,
      canceled: 0,
    };

    previousOrders.forEach((order) => {
      const status = order.status;
      if (status in map) {
        map[status as OrderStatusPoint["status"]] += 1;
      }
    });

    return map;
  }, [previousOrders]);

  const orderStatusDetails = useMemo(() => {
    const currentTotal = filteredOrders.length;
    return orderStatusData.map((item) => {
      const prevCount = previousOrderStatusMap[item.status];
      const share = currentTotal > 0 ? (item.count / currentTotal) * 100 : 0;
      return {
        ...item,
        previousCount: prevCount,
        growth: calculateGrowth(item.count, prevCount),
        share,
      };
    });
  }, [filteredOrders.length, orderStatusData, previousOrderStatusMap]);

  const productById = useMemo(() => {
    return new Map(allProducts.map((product) => [product.id, product]));
  }, [allProducts]);

  const topProducts = useMemo<TopProductPoint[]>(() => {
    const map = new Map<number, TopProductPoint>();

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.productId;
        const fromProduct = productById.get(productId);
        const existing = map.get(productId);
        const revenue = safeNumber(item.subtotal);
        const soldCount = safeNumber(item.quantity);

        if (existing) {
          existing.revenue += revenue;
          existing.soldCount += soldCount;
          return;
        }

        map.set(productId, {
          productId,
          productName: item.productName || fromProduct?.name || `SP #${productId}`,
          categoryName: fromProduct?.category?.name || "Chưa phân loại",
          soldCount,
          revenue,
        });
      });
    });

    const sorted = Array.from(map.values()).sort((a, b) => {
      if (rankMetric === "revenue") {
        return b.revenue - a.revenue;
      }
      return b.soldCount - a.soldCount;
    });

    return sorted.slice(0, 10);
  }, [filteredOrders, productById, rankMetric]);

  const topCategories = useMemo<TopCategoryPoint[]>(() => {
    const map = new Map<string, TopCategoryPoint>();

    filteredOrders.forEach((order) => {
      const categoriesInOrder = new Set<string>();

      order.items.forEach((item) => {
        const fromProduct = productById.get(item.productId);
        const categoryName = fromProduct?.category?.name || "Chưa phân loại";
        const existing = map.get(categoryName);
        const revenue = safeNumber(item.subtotal);
        const soldCount = safeNumber(item.quantity);

        if (existing) {
          existing.revenue += revenue;
          existing.soldCount += soldCount;
          if (!categoriesInOrder.has(categoryName)) {
            existing.orderCount += 1;
          }
        } else {
          map.set(categoryName, {
            categoryName,
            orderCount: 1,
            soldCount,
            revenue,
          });
        }

        categoriesInOrder.add(categoryName);
      });
    });

    const sorted = Array.from(map.values()).sort((a, b) => {
      if (rankMetric === "revenue") {
        return b.revenue - a.revenue;
      }
      return b.soldCount - a.soldCount;
    });

    return sorted.slice(0, 10);
  }, [filteredOrders, productById, rankMetric]);

  const lowStockData = useMemo<LowStockPoint[]>(() => {
    return allProducts
      .map((product) => {
        const quantity = safeNumber(product.stockQuantity);
        const reserve = safeNumber(product.reserve);
        return {
          productId: product.id,
          productName: product.name,
          categoryName: product.category?.name || "Chưa phân loại",
          quantity,
          reserve,
          deficit: reserve - quantity,
        };
      })
      .filter((product) => product.quantity <= product.reserve)
      .sort((a, b) => b.deficit - a.deficit);
  }, [allProducts]);

  const feedbackDistribution = useMemo<FeedbackDistributionPoint[]>(() => {
    const map: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    filteredFeedbacks.forEach((feedback) => {
      const rating = Math.round(safeNumber(feedback.rating));
      if (rating >= 1 && rating <= 5) {
        map[rating] += 1;
      }
    });

    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      label: `${rating} sao`,
      count: map[rating],
    }));
  }, [filteredFeedbacks]);

  const previousFeedbackMap = useMemo(() => {
    const map: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    previousFeedbacks.forEach((feedback) => {
      const rating = Math.round(safeNumber(feedback.rating));
      if (rating >= 1 && rating <= 5) {
        map[rating] += 1;
      }
    });

    return map;
  }, [previousFeedbacks]);

  const feedbackDetails = useMemo(() => {
    const total = filteredFeedbacks.length;
    return feedbackDistribution.map((item) => {
      const previousCount = previousFeedbackMap[item.rating];
      const ratio = total > 0 ? (item.count / total) * 100 : 0;
      return {
        ...item,
        previousCount,
        ratio,
        growth: calculateGrowth(item.count, previousCount),
      };
    });
  }, [feedbackDistribution, filteredFeedbacks.length, previousFeedbackMap]);

  const feedbackAverage = useMemo(() => {
    if (!filteredFeedbacks.length) return 0;
    const total = filteredFeedbacks.reduce((sum, feedback) => sum + safeNumber(feedback.rating), 0);
    return total / filteredFeedbacks.length;
  }, [filteredFeedbacks]);

  const previousFeedbackAverage = useMemo(() => {
    if (!previousFeedbacks.length) return 0;
    const total = previousFeedbacks.reduce((sum, feedback) => sum + safeNumber(feedback.rating), 0);
    return total / previousFeedbacks.length;
  }, [previousFeedbacks]);

  const successRate = useMemo(() => {
    if (!filteredPayments.length) return 0;
    const success = filteredPayments.filter((payment) => payment.status === "COMPLETED").length;
    return (success / filteredPayments.length) * 100;
  }, [filteredPayments]);

  const previousSuccessRate = useMemo(() => {
    if (!previousPayments.length) return 0;
    const success = previousPayments.filter((payment) => payment.status === "COMPLETED").length;
    return (success / previousPayments.length) * 100;
  }, [previousPayments]);

  const cancelRate = useMemo(() => {
    if (!filteredOrders.length) return 0;
    const canceled = filteredOrders.filter((order) => order.status === "canceled").length;
    return (canceled / filteredOrders.length) * 100;
  }, [filteredOrders]);

  const previousCancelRate = useMemo(() => {
    if (!previousOrders.length) return 0;
    const canceled = previousOrders.filter((order) => order.status === "canceled").length;
    return (canceled / previousOrders.length) * 100;
  }, [previousOrders]);

  const averageOrderValue = useMemo(() => {
    if (!completedPayments.length) return 0;
    return totalRevenue / completedPayments.length;
  }, [completedPayments, totalRevenue]);

  const previousAverageOrderValue = useMemo(() => {
    if (!previousCompletedPayments.length) return 0;
    return previousRevenue / previousCompletedPayments.length;
  }, [previousCompletedPayments, previousRevenue]);

  const positiveFeedbackRate = useMemo(() => {
    if (!filteredFeedbacks.length) return 0;
    const positive = filteredFeedbacks.filter(
      (feedback) => safeNumber(feedback.rating) >= 4
    ).length;
    return (positive / filteredFeedbacks.length) * 100;
  }, [filteredFeedbacks]);

  const previousPositiveFeedbackRate = useMemo(() => {
    if (!previousFeedbacks.length) return 0;
    const positive = previousFeedbacks.filter(
      (feedback) => safeNumber(feedback.rating) >= 4
    ).length;
    return (positive / previousFeedbacks.length) * 100;
  }, [previousFeedbacks]);

  const reportCode = useMemo(
    () =>
      `ADM_REPORT_${formatRangeForFile(effectiveRange.from)}_${formatRangeForFile(effectiveRange.to)}`,
    [effectiveRange]
  );

  const generatedAt = useMemo(() => new Date().toISOString(), []);

  const csvMeta = useMemo(
    () => ({
      report_code: reportCode,
      generated_at: generatedAt,
      period_from: effectiveRange.from.toISOString(),
      period_to: effectiveRange.to.toISOString(),
      period_granularity: granularity,
    }),
    [effectiveRange, generatedAt, granularity, reportCode]
  );

  const filePrefix = useMemo(() => {
    return `bao-cao-admin_${formatRangeForFile(effectiveRange.from)}_${formatRangeForFile(effectiveRange.to)}`;
  }, [effectiveRange]);

  const revenueRows = useMemo(
    () =>
      withCsvMeta(
        revenueSeries.map((point) => ({
          period_label: point.label,
          revenue_vnd: point.revenue,
          completed_orders: point.orderCount,
        })),
        "revenue_summary",
        csvMeta
      ),
    [csvMeta, revenueSeries]
  );

  const revenueColumns: CsvColumn<(typeof revenueRows)[number]>[] = [
    { key: "report_code", header: "report_code" },
    { key: "generated_at", header: "generated_at" },
    { key: "period_from", header: "period_from" },
    { key: "period_to", header: "period_to" },
    { key: "period_granularity", header: "period_granularity" },
    { key: "dataset_name", header: "dataset_name" },
    { key: "row_no", header: "row_no" },
    { key: "period_label", header: "period_label" },
    { key: "revenue_vnd", header: "revenue_vnd" },
    { key: "completed_orders", header: "completed_orders" },
  ];

  const orderStatusRows = useMemo(
    () =>
      withCsvMeta(
        orderStatusDetails.map((row) => ({
          order_status: row.status,
          order_status_label: row.label,
          current_count: row.count,
          previous_count: row.previousCount,
          growth_percent: row.growth === null ? "N/A" : row.growth.toFixed(2),
          share_percent: row.share.toFixed(2),
        })),
        "order_status_distribution",
        csvMeta
      ),
    [csvMeta, orderStatusDetails]
  );

  const orderStatusColumns: CsvColumn<(typeof orderStatusRows)[number]>[] = [
    { key: "report_code", header: "report_code" },
    { key: "generated_at", header: "generated_at" },
    { key: "period_from", header: "period_from" },
    { key: "period_to", header: "period_to" },
    { key: "period_granularity", header: "period_granularity" },
    { key: "dataset_name", header: "dataset_name" },
    { key: "row_no", header: "row_no" },
    { key: "order_status", header: "order_status" },
    { key: "order_status_label", header: "order_status_label" },
    { key: "current_count", header: "current_count" },
    { key: "previous_count", header: "previous_count" },
    { key: "growth_percent", header: "growth_percent" },
    { key: "share_percent", header: "share_percent" },
  ];

  const topProductRows = useMemo(
    () =>
      withCsvMeta(
        topProducts.map((row) => ({
          product_id: row.productId,
          product_name: row.productName,
          category_name: row.categoryName,
          sold_count: row.soldCount,
          revenue_vnd: row.revenue,
        })),
        "top_products",
        csvMeta
      ),
    [csvMeta, topProducts]
  );

  const topProductColumns: CsvColumn<(typeof topProductRows)[number]>[] = [
    { key: "report_code", header: "report_code" },
    { key: "generated_at", header: "generated_at" },
    { key: "period_from", header: "period_from" },
    { key: "period_to", header: "period_to" },
    { key: "period_granularity", header: "period_granularity" },
    { key: "dataset_name", header: "dataset_name" },
    { key: "row_no", header: "row_no" },
    { key: "product_id", header: "product_id" },
    { key: "product_name", header: "product_name" },
    { key: "category_name", header: "category_name" },
    { key: "sold_count", header: "sold_count" },
    { key: "revenue_vnd", header: "revenue_vnd" },
  ];

  const topCategoryRows = useMemo(
    () =>
      withCsvMeta(
        topCategories.map((row) => ({
          category_name: row.categoryName,
          order_count: row.orderCount,
          sold_count: row.soldCount,
          revenue_vnd: row.revenue,
        })),
        "top_categories",
        csvMeta
      ),
    [csvMeta, topCategories]
  );

  const topCategoryColumns: CsvColumn<(typeof topCategoryRows)[number]>[] = [
    { key: "report_code", header: "report_code" },
    { key: "generated_at", header: "generated_at" },
    { key: "period_from", header: "period_from" },
    { key: "period_to", header: "period_to" },
    { key: "period_granularity", header: "period_granularity" },
    { key: "dataset_name", header: "dataset_name" },
    { key: "row_no", header: "row_no" },
    { key: "category_name", header: "category_name" },
    { key: "order_count", header: "order_count" },
    { key: "sold_count", header: "sold_count" },
    { key: "revenue_vnd", header: "revenue_vnd" },
  ];

  const lowStockRows = useMemo(
    () =>
      withCsvMeta(
        lowStockData.map((row) => ({
          product_id: row.productId,
          product_name: row.productName,
          category_name: row.categoryName,
          stock_quantity: row.quantity,
          reserve_quantity: row.reserve,
          deficit_quantity: row.deficit,
        })),
        "low_stock_alert",
        csvMeta
      ),
    [csvMeta, lowStockData]
  );

  const lowStockColumns: CsvColumn<(typeof lowStockRows)[number]>[] = [
    { key: "report_code", header: "report_code" },
    { key: "generated_at", header: "generated_at" },
    { key: "period_from", header: "period_from" },
    { key: "period_to", header: "period_to" },
    { key: "period_granularity", header: "period_granularity" },
    { key: "dataset_name", header: "dataset_name" },
    { key: "row_no", header: "row_no" },
    { key: "product_id", header: "product_id" },
    { key: "product_name", header: "product_name" },
    { key: "category_name", header: "category_name" },
    { key: "stock_quantity", header: "stock_quantity" },
    { key: "reserve_quantity", header: "reserve_quantity" },
    { key: "deficit_quantity", header: "deficit_quantity" },
  ];

  const feedbackRows = useMemo(
    () =>
      withCsvMeta(
        feedbackDetails.map((row) => ({
          rating_star: row.rating,
          rating_label: row.label,
          current_count: row.count,
          previous_count: row.previousCount,
          growth_percent: row.growth === null ? "N/A" : row.growth.toFixed(2),
          share_percent: row.ratio.toFixed(2),
        })),
        "feedback_distribution",
        csvMeta
      ),
    [csvMeta, feedbackDetails]
  );

  const feedbackColumns: CsvColumn<(typeof feedbackRows)[number]>[] = [
    { key: "report_code", header: "report_code" },
    { key: "generated_at", header: "generated_at" },
    { key: "period_from", header: "period_from" },
    { key: "period_to", header: "period_to" },
    { key: "period_granularity", header: "period_granularity" },
    { key: "dataset_name", header: "dataset_name" },
    { key: "row_no", header: "row_no" },
    { key: "rating_star", header: "rating_star" },
    { key: "rating_label", header: "rating_label" },
    { key: "current_count", header: "current_count" },
    { key: "previous_count", header: "previous_count" },
    { key: "growth_percent", header: "growth_percent" },
    { key: "share_percent", header: "share_percent" },
  ];

  const exportAll = async () => {
    try {
      const files = [
        {
          fileName: `${filePrefix}_revenue-summary.csv`,
          csvContent: buildCsvContent(revenueRows, revenueColumns),
        },
        {
          fileName: `${filePrefix}_order-status.csv`,
          csvContent: buildCsvContent(orderStatusRows, orderStatusColumns),
        },
        {
          fileName: `${filePrefix}_top-products.csv`,
          csvContent: buildCsvContent(topProductRows, topProductColumns),
        },
        {
          fileName: `${filePrefix}_top-categories.csv`,
          csvContent: buildCsvContent(topCategoryRows, topCategoryColumns),
        },
        {
          fileName: `${filePrefix}_low-stock.csv`,
          csvContent: buildCsvContent(lowStockRows, lowStockColumns),
        },
        {
          fileName: `${filePrefix}_feedback-distribution.csv`,
          csvContent: buildCsvContent(feedbackRows, feedbackColumns),
        },
      ];

      await downloadZipOfCsvFiles(`${filePrefix}.zip`, files);
      toast.success("Đã xuất file ZIP báo cáo thành công");
    } catch {
      toast.error("Xuất file ZIP thất bại, vui lòng thử lại");
    }
  };

  const revenueGrowth = calculateGrowth(totalRevenue, previousRevenue);
  const orderGrowth = calculateGrowth(filteredOrders.length, previousOrders.length);
  const successGrowth = calculateGrowth(successRate, previousSuccessRate);
  const aovGrowth = calculateGrowth(averageOrderValue, previousAverageOrderValue);
  const cancelGrowth = calculateGrowth(cancelRate, previousCancelRate);
  const feedbackGrowth = calculateGrowth(feedbackAverage, previousFeedbackAverage);
  const positiveFeedbackGrowth = calculateGrowth(
    positiveFeedbackRate,
    previousPositiveFeedbackRate
  );

  if (hasError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900">Báo cáo phân tích</h1>
        <Card>
          <CardContent className="py-10 text-center text-sm text-red-500">
            Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Báo cáo phân tích</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kỳ báo cáo: <span className="font-medium text-zinc-700">{periodText}</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Trang báo cáo hiển thị thuần số liệu và bảng dữ liệu; biểu đồ được tách về trang Tổng
            quan.
          </p>
        </div>

        <Button onClick={exportAll} className="gap-2" disabled={isLoading}>
          <FileArchive className="h-4 w-4" />
          Xuất tất cả (ZIP)
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-teal-600" />
            Bộ lọc phân tích
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setRangeMode(option.value)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
                  rangeMode === option.value
                    ? "border-teal-500 bg-teal-500 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:text-zinc-900"
                )}>
                {option.label}
              </button>
            ))}
            <button
              onClick={() => setRangeMode("custom")}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
                rangeMode === "custom"
                  ? "border-teal-500 bg-teal-500 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:text-zinc-900"
              )}>
              Tùy chỉnh
            </button>
          </div>

          {rangeMode === "custom" && (
            <div className="grid gap-2 sm:grid-cols-2 lg:max-w-xl">
              <DatePicker
                value={customFrom}
                onChange={setCustomFrom}
                maxDate={customTo}
                placeholder="Từ ngày"
              />
              <DatePicker
                value={customTo}
                onChange={setCustomTo}
                minDate={customFrom}
                placeholder="Đến ngày"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">
              Chu kỳ tổng hợp CSV doanh thu:
            </span>
            {GRANULARITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setGranularity(option.value)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
                  granularity === option.value
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:text-zinc-900"
                )}>
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-xs text-gray-500">Doanh thu hoàn tất</p>
            <p className="text-xl font-bold text-zinc-900">{formatVND(totalRevenue)}</p>
            {growthBadge(revenueGrowth)}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-xs text-gray-500">Đơn hàng trong kỳ</p>
            <p className="text-xl font-bold text-zinc-900">{filteredOrders.length}</p>
            {growthBadge(orderGrowth)}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-xs text-gray-500">Tỷ lệ thanh toán thành công</p>
            <p className="text-xl font-bold text-teal-600">{successRate.toFixed(1)}%</p>
            {growthBadge(successGrowth)}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-xs text-gray-500">AOV (giá trị đơn trung bình)</p>
            <p className="text-xl font-bold text-zinc-900">
              {formatVND(Math.round(averageOrderValue))}
            </p>
            {growthBadge(aovGrowth)}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-xs text-gray-500">Tỷ lệ hủy đơn</p>
            <p className="text-xl font-bold text-red-500">{cancelRate.toFixed(1)}%</p>
            {growthBadge(cancelGrowth)}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-xs text-gray-500">Điểm phản hồi trung bình</p>
            <p className="text-xl font-bold text-yellow-600">{feedbackAverage.toFixed(2)} / 5</p>
            {growthBadge(feedbackGrowth)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Doanh thu theo kỳ (thuần số liệu)</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              exportCsv(`${filePrefix}_revenue-summary.csv`, revenueRows, revenueColumns);
              toast.success("Đã xuất CSV doanh thu theo format chuẩn");
            }}>
            <Download className="h-4 w-4" />
            Xuất CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Kỳ</th>
                  <th className="px-4 py-3 text-right font-medium">Doanh thu</th>
                  <th className="px-4 py-3 text-right font-medium">Đơn hoàn tất</th>
                </tr>
              </thead>
              <tbody>
                {revenueSeries.map((row) => (
                  <tr key={row.key} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{row.label}</td>
                    <td className="px-4 py-3 text-right text-zinc-900">{formatVND(row.revenue)}</td>
                    <td className="px-4 py-3 text-right text-zinc-900">{row.orderCount}</td>
                  </tr>
                ))}
                {!revenueSeries.length && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                      Không có dữ liệu doanh thu theo bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">
              Phân tích trạng thái đơn hàng (thuần số liệu)
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                exportCsv(`${filePrefix}_order-status.csv`, orderStatusRows, orderStatusColumns);
                toast.success("Đã xuất CSV trạng thái đơn hàng theo format chuẩn");
              }}>
              <Download className="h-4 w-4" />
              Xuất CSV
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Tổng đơn kỳ này</p>
                <p className="mt-1 text-lg font-bold text-zinc-900">{filteredOrders.length}</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Tổng đơn kỳ trước</p>
                <p className="mt-1 text-lg font-bold text-zinc-900">{previousOrders.length}</p>
              </div>
            </div>

            <div className="overflow-auto rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-500">
                    <th className="px-3 py-2 font-medium">Trạng thái</th>
                    <th className="px-3 py-2 text-right font-medium">Kỳ này</th>
                    <th className="px-3 py-2 text-right font-medium">Kỳ trước</th>
                    <th className="px-3 py-2 text-right font-medium">Tỷ trọng</th>
                    <th className="px-3 py-2 text-right font-medium">Tăng trưởng</th>
                  </tr>
                </thead>
                <tbody>
                  {orderStatusDetails.map((row) => (
                    <tr key={row.status} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-zinc-900">{row.label}</td>
                      <td className="px-3 py-2 text-right text-zinc-900">{row.count}</td>
                      <td className="px-3 py-2 text-right text-zinc-900">{row.previousCount}</td>
                      <td className="px-3 py-2 text-right text-zinc-900">
                        {row.share.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 text-right">{growthBadge(row.growth)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">
              Phân tích phản hồi khách hàng (thuần số liệu)
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                exportCsv(`${filePrefix}_feedback-distribution.csv`, feedbackRows, feedbackColumns);
                toast.success("Đã xuất CSV phản hồi theo format chuẩn");
              }}>
              <Download className="h-4 w-4" />
              Xuất CSV
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Tỷ lệ phản hồi tích cực (4-5 sao)</p>
                <p className="mt-1 text-lg font-bold text-green-600">
                  {positiveFeedbackRate.toFixed(1)}%
                </p>
                <div className="mt-1">{growthBadge(positiveFeedbackGrowth)}</div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Số phản hồi kỳ này</p>
                <p className="mt-1 text-lg font-bold text-zinc-900">{filteredFeedbacks.length}</p>
              </div>
            </div>

            <div className="overflow-auto rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-500">
                    <th className="px-3 py-2 font-medium">Mức đánh giá</th>
                    <th className="px-3 py-2 text-right font-medium">Kỳ này</th>
                    <th className="px-3 py-2 text-right font-medium">Kỳ trước</th>
                    <th className="px-3 py-2 text-right font-medium">Tỷ trọng</th>
                    <th className="px-3 py-2 text-right font-medium">Tăng trưởng</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackDetails.map((row) => (
                    <tr key={row.rating} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-zinc-900">{row.label}</td>
                      <td className="px-3 py-2 text-right text-zinc-900">{row.count}</td>
                      <td className="px-3 py-2 text-right text-zinc-900">{row.previousCount}</td>
                      <td className="px-3 py-2 text-right text-zinc-900">
                        {row.ratio.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 text-right">{growthBadge(row.growth)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Top sản phẩm và danh mục theo hiệu suất</CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRankMetric("revenue")}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
                rankMetric === "revenue"
                  ? "border-teal-500 bg-teal-500 text-white"
                  : "border-gray-200 bg-white text-gray-600"
              )}>
              Xếp theo doanh thu
            </button>
            <button
              onClick={() => setRankMetric("soldCount")}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
                rankMetric === "soldCount"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-gray-200 bg-white text-gray-600"
              )}>
              Xếp theo số lượng bán
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-100">
              <div className="flex items-center justify-between border-b bg-gray-50 px-3 py-2">
                <p className="text-sm font-semibold text-zinc-900">Top sản phẩm</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => {
                    exportCsv(`${filePrefix}_top-products.csv`, topProductRows, topProductColumns);
                    toast.success("Đã xuất CSV top sản phẩm theo format chuẩn");
                  }}>
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
              </div>
              <div className="max-h-80 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="px-3 py-2 font-medium">Sản phẩm</th>
                      <th className="px-3 py-2 font-medium">Danh mục</th>
                      <th className="px-3 py-2 text-right font-medium">SL bán</th>
                      <th className="px-3 py-2 text-right font-medium">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((row) => (
                      <tr key={row.productId} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-zinc-900">{row.productName}</td>
                        <td className="px-3 py-2 text-gray-500">{row.categoryName}</td>
                        <td className="px-3 py-2 text-right text-zinc-900">{row.soldCount}</td>
                        <td className="px-3 py-2 text-right text-zinc-900">
                          {formatVND(row.revenue)}
                        </td>
                      </tr>
                    ))}
                    {!topProducts.length && (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-gray-400">
                          Chưa có dữ liệu sản phẩm trong kỳ.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100">
              <div className="flex items-center justify-between border-b bg-gray-50 px-3 py-2">
                <p className="text-sm font-semibold text-zinc-900">Top danh mục</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => {
                    exportCsv(
                      `${filePrefix}_top-categories.csv`,
                      topCategoryRows,
                      topCategoryColumns
                    );
                    toast.success("Đã xuất CSV top danh mục theo format chuẩn");
                  }}>
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
              </div>
              <div className="max-h-80 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="px-3 py-2 font-medium">Danh mục</th>
                      <th className="px-3 py-2 text-right font-medium">Số đơn</th>
                      <th className="px-3 py-2 text-right font-medium">SL bán</th>
                      <th className="px-3 py-2 text-right font-medium">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCategories.map((row) => (
                      <tr
                        key={row.categoryName}
                        className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-zinc-900">{row.categoryName}</td>
                        <td className="px-3 py-2 text-right text-zinc-900">{row.orderCount}</td>
                        <td className="px-3 py-2 text-right text-zinc-900">{row.soldCount}</td>
                        <td className="px-3 py-2 text-right text-zinc-900">
                          {formatVND(row.revenue)}
                        </td>
                      </tr>
                    ))}
                    {!topCategories.length && (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-gray-400">
                          Chưa có dữ liệu danh mục trong kỳ.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-red-500" />
              Cảnh báo tồn kho thấp (quy tắc: tồn kho ≤ mức giữ)
            </CardTitle>
            <p className="mt-1 text-xs text-gray-500">
              Danh sách này dùng để ưu tiên xử lý nhập hàng hoặc điều chỉnh tồn kho.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              exportCsv(`${filePrefix}_low-stock.csv`, lowStockRows, lowStockColumns);
              toast.success("Đã xuất CSV tồn kho thấp theo format chuẩn");
            }}>
            <Download className="h-4 w-4" />
            Xuất CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Sản phẩm</th>
                  <th className="px-4 py-3 font-medium">Danh mục</th>
                  <th className="px-4 py-3 text-right font-medium">Tồn kho</th>
                  <th className="px-4 py-3 text-right font-medium">Mức giữ</th>
                  <th className="px-4 py-3 text-right font-medium">Mức thiếu</th>
                </tr>
              </thead>
              <tbody>
                {lowStockData.slice(0, 50).map((row) => (
                  <tr key={row.productId} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{row.productName}</td>
                    <td className="px-4 py-3 text-gray-500">{row.categoryName}</td>
                    <td className="px-4 py-3 text-right text-zinc-900">{row.quantity}</td>
                    <td className="px-4 py-3 text-right text-zinc-900">{row.reserve}</td>
                    <td className="px-4 py-3 text-right font-semibold text-red-500">
                      {row.deficit}
                    </td>
                  </tr>
                ))}
                {!lowStockData.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Không có sản phẩm nào dưới ngưỡng cảnh báo trong kỳ hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dấu mốc dữ liệu kỳ này</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <p>
              Dữ liệu đơn hàng cập nhật gần nhất:{" "}
              <span className="font-medium">
                {formatDate(allOrders[0]?.createdAt || "") || "N/A"}
              </span>
            </p>
            <p>
              Dữ liệu thanh toán cập nhật gần nhất:{" "}
              <span className="font-medium">{formatDate(allPayments[0]?.date || "") || "N/A"}</span>
            </p>
            <p>
              Dữ liệu phản hồi cập nhật gần nhất:{" "}
              <span className="font-medium">
                {formatDate(allFeedbacks[0]?.date || "") || "N/A"}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
