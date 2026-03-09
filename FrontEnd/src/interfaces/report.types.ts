import type { Category, Product } from "./product.types";

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  data: RevenueDataPoint[];
  topProducts: Array<{
    product: Pick<Product, "id" | "name" | "thumbnailUrl">;
    revenue: number;
    soldCount: number;
  }>;
  topCategories: Array<{
    category: Pick<Category, "id" | "name">;
    revenue: number;
    orderCount: number;
  }>;
}

export interface DashboardKPI {
  totalRevenue: number;
  revenueGrowthPercent: number;
  totalOrders: number;
  orderGrowthPercent: number;
  totalCustomers: number;
  newCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
}
