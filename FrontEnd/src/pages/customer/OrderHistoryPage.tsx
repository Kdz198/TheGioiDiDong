import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orderService } from "@/services/orderService";
import { formatVND } from "@/utils/formatPrice"; // Đảm bảo đúng đường dẫn format tiền của bạn
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Package } from "lucide-react";
import { Link } from "react-router-dom";

// Các tab lọc theo status API (PENDING, PAID, CANCELED)
const tabs = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xử lý", value: "PENDING" },
  { label: "Đã thanh toán", value: "PAID" },
  { label: "Đã hủy", value: "CANCELED" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "PAID":
      return "text-green-600 bg-green-50 border-green-200";
    case "CANCELED":
      return "text-red-600 bg-red-50 border-red-200";
    case "PENDING":
      return "text-amber-600 bg-amber-50 border-amber-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
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
    <div className="container mx-auto min-h-screen bg-[#f1f1f1] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 uppercase">Đơn hàng của tôi</h1>

        <Tabs
          defaultValue="all"
          className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <TabsList className="scrollbar-hide mb-6 flex h-auto w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-semibold whitespace-nowrap data-[state=active]:border-teal-500 data-[state=active]:bg-transparent data-[state=active]:text-teal-600 data-[state=active]:shadow-none">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-40 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
                    />
                  ))}
                </div>
              ) : (
                <>
                  {orders
                    ?.filter((order) => tab.value === "all" || order.status === tab.value)
                    // Sort giảm dần theo thời gian (mới nhất lên trên)
                    .sort(
                      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
                    )
                    .map((order) => (
                      <div
                        key={order.id}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-teal-300">
                        {/* Header Đơn hàng */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-zinc-800">Mã: {order.orderCode}</span>
                            <span className="hidden text-sm text-gray-500 sm:inline">
                              {/* Nếu bạn có hàm formatDate, bọc order.orderDate vào */}
                              Ngày đặt: {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <div
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </div>
                        </div>

                        {/* Danh sách sản phẩm */}
                        <div className="space-y-4 p-4">
                          {order.orderDetails.map((item) => (
                            <div key={item.orderDetailId} className="flex items-center gap-4">
                              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white p-1">
                                <img
                                  src={item.imgUrl}
                                  alt={item.productName}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="line-clamp-2 text-sm font-medium text-zinc-900">
                                  {item.productName}
                                </h4>
                                <p className="mt-1 text-sm text-gray-500">x {item.quantity}</p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-sm font-bold text-red-500">
                                  {formatVND(item.subtotal)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Footer Đơn hàng (Tổng tiền & Nút hành động) */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-4 py-3">
                          <div className="text-sm">
                            <span className="text-gray-600">Thành tiền: </span>
                            <span className="text-lg font-bold text-red-500">
                              {formatVND(order.totalPrice)}
                            </span>
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600">
                            <Link to={`/orders/${order.id}`} className="flex items-center">
                              Xem chi tiết <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}

                  {/* Trạng thái Empty */}
                  {orders?.filter((order) => tab.value === "all" || order.status === tab.value)
                    .length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-700">Chưa có đơn hàng nào</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Khi bạn đặt hàng, chúng sẽ xuất hiện ở đây.
                      </p>
                      <Button asChild className="mt-6 bg-teal-500 hover:bg-teal-600">
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
