import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orderService } from "@/services/orderService";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Hash,
  Package,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const tabs = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xử lý", value: "PENDING", icon: <Clock className="mr-2 h-4 w-4" /> },
  { label: "Đã thanh toán", value: "PAID", icon: <CheckCircle2 className="mr-2 h-4 w-4" /> },
  { label: "Đã hủy", value: "CANCELED", icon: <XCircle className="mr-2 h-4 w-4" /> },
];

const getStatusStyles = (status: string) => {
  switch (status) {
    case "PAID":
      return "text-emerald-700 bg-emerald-50 border-emerald-100";
    case "CANCELED":
      return "text-rose-700 bg-rose-50 border-rose-100";
    case "PENDING":
      return "text-amber-700 bg-amber-50 border-amber-100";
    default:
      return "text-slate-600 bg-slate-50 border-slate-100";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "PAID":
      return "Đã thanh toán";
    case "CANCELED":
      return "Đã hủy";
    case "PENDING":
      return "Chờ xử lý";
    default:
      return status;
  }
};

export function OrderHistoryPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", "history"],
    queryFn: orderService.getAppOrdersByUserId,
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header Section */}
      <div className="mb-8 border-b border-gray-100 bg-white pt-10 pb-6">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-teal-500 p-2 text-white">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 uppercase">
              Đơn hàng của tôi
            </h1>
          </div>
          <p className="text-sm font-normal text-slate-500">
            Theo dõi và quản lý lịch sử mua sắm của bạn
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="scrollbar-hide flex h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-slate-500 transition-all data-[state=active]:border-teal-500 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-600 data-[state=active]:shadow-none">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="animate-in fade-in mt-0 space-y-4 duration-500">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-40 animate-pulse rounded-xl border border-gray-100 bg-white"
                    />
                  ))}
                </div>
              ) : (
                <>
                  {orders
                    ?.filter((order) => tab.value === "all" || order.status === tab.value)
                    .sort(
                      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
                    )
                    .map((order) => (
                      <div
                        key={order.id}
                        className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:border-teal-200">
                        {/* Order Header */}
                        <div className="flex items-center justify-between border-b border-gray-50 bg-slate-50/40 px-5 py-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-slate-900">
                              <Hash className="h-3.5 w-3.5 text-teal-500" />
                              <span className="text-sm font-medium">
                                {order.orderCode.split("-")[0]}...{order.orderCode.slice(-4)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Calendar className="h-3.5 w-3.5" />
                              <span className="text-xs">
                                {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`rounded-md border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${getStatusStyles(order.status)}`}>
                            {getStatusText(order.status)}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="divide-y divide-gray-50 px-5">
                          {order.orderDetails.map((item) => (
                            <div key={item.orderDetailId} className="flex items-center gap-4 py-4">
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white p-1">
                                <img
                                  src={item.imgUrl}
                                  alt={item.productName}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="line-clamp-1 text-sm font-medium text-slate-800">
                                  {item.productName}
                                </h4>
                                <p className="mt-1 text-xs font-normal text-slate-400">
                                  Số lượng: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-slate-900">
                                  {formatVND(item.subtotal)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Summary Footer */}
                        <div className="flex items-center justify-between border-t border-gray-50 bg-white px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-normal tracking-wider text-slate-400 uppercase">
                              Tổng cộng:
                            </span>
                            <span className="text-lg font-semibold text-slate-900">
                              {formatVND(order.totalPrice)}
                            </span>
                          </div>
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-xs font-medium text-teal-600 hover:bg-teal-50">
                            <Link to={`/orders/${order.id}`}>
                              Xem chi tiết <ChevronRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}

                  {/* Empty State */}
                  {orders?.filter((order) => tab.value === "all" || order.status === tab.value)
                    .length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                      <Package className="mb-4 h-10 w-10 text-slate-200" />
                      <h3 className="text-lg font-medium text-slate-800">Chưa có đơn hàng</h3>
                      <p className="mt-1 mb-6 text-sm text-slate-400">
                        Bạn chưa có đơn hàng nào trong mục này.
                      </p>
                      <Button
                        asChild
                        className="rounded-full bg-teal-500 px-8 shadow-sm hover:bg-teal-600">
                        <Link to="/products">Tiếp tục mua sắm</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
