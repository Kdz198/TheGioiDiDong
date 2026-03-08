import type { DashboardKPI, RevenueReport } from "@/interfaces/report.types";

// No report endpoints exist in the backend schema — all data is served from mock.
export const reportService = {
  getDashboardKPI: async (): Promise<DashboardKPI> => {
    return {
      totalRevenue: 125000000,
      revenueGrowthPercent: 12.5,
      totalOrders: 156,
      orderGrowthPercent: 8.3,
      totalCustomers: 1250,
      newCustomers: 45,
      pendingOrders: 12,
      lowStockProducts: 5,
    };
  },

  getRevenueReport: async (): Promise<RevenueReport> => {
    return {
      totalRevenue: 2500000000,
      totalOrders: 3200,
      averageOrderValue: 780000,
      data: [
        { date: "2026-02-22", revenue: 15000000, orderCount: 18 },
        { date: "2026-02-23", revenue: 18000000, orderCount: 22 },
        { date: "2026-02-24", revenue: 12000000, orderCount: 15 },
        { date: "2026-02-25", revenue: 20000000, orderCount: 25 },
        { date: "2026-02-26", revenue: 22000000, orderCount: 28 },
        { date: "2026-02-27", revenue: 19000000, orderCount: 23 },
        { date: "2026-02-28", revenue: 25000000, orderCount: 30 },
      ],
      topProducts: [],
      topCategories: [],
    };
  },
};
