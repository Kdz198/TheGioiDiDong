import { OrderCard } from "@/components/common/OrderCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orderService } from "@/services/orderService";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";

const tabs: { label: string; value: string }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xử lý", value: "pending" },
  { label: "Đã thanh toán", value: "paid" },
  { label: "Đã hủy", value: "canceled" },
];

export function OrderHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getOrders(),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Đơn hàng của tôi</h1>

      <Tabs defaultValue="all">
        <TabsList className="mb-6 flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : (
              <>
                {data?.data
                  .filter((order) => tab.value === "all" || order.status === tab.value)
                  .map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                {data?.data.filter((order) => tab.value === "all" || order.status === tab.value)
                  .length === 0 && (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Package className="mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">Không có đơn hàng nào</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
