import { CartItemRow } from "@/components/common/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/router/routes.const";
import { promotionService } from "@/services/promotionService"; // Gọi service khuyến mãi
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { Gift, ShoppingBag } from "lucide-react"; // Thêm icon Gift
import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

export function CartPage() {
  const { items, removeItem, updateQuantity, removeVoucher } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  // Voucher is only supported at checkout.
  useEffect(() => {
    removeVoucher();
  }, [removeVoucher]);

  // --- GỌI API KHUYẾN MÃI ĐỂ CHECK HÀNG TẶNG KÈM ---
  const { data: promotions } = useQuery({
    queryKey: ["promotions", "active"],
    queryFn: promotionService.getActivePromotions,
  });

  // Trích xuất mảng các ID sản phẩm được áp dụng BOGO
  const bogoProductIds = useMemo(() => {
    if (!promotions) return [];
    const bogoPromo = promotions.find((p) => p.type === "BOGO" || p.code === "BOGO-1");
    return bogoPromo?.applicableProductIds || [];
  }, [promotions]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate(`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(ROUTES.CHECKOUT)}`);
      return;
    }
    navigate(ROUTES.CHECKOUT);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="text-xl font-bold text-zinc-900">Giỏ hàng trống</h2>
        <p className="mt-2 text-gray-500">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <Button asChild className="mt-6 bg-teal-500 hover:bg-teal-600">
          <Link to={ROUTES.PRODUCTS}>Tiếp tục mua sắm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen bg-[#f1f1f1] px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 uppercase">
        Giỏ hàng ({totalItems} sản phẩm)
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {items.map((item) => {
            // Kiểm tra xem sản phẩm này có nằm trong danh sách Mua 1 Tặng 1 không
            const isBogo = bogoProductIds.includes(item.productId);

            return (
              <div
                key={item.id}
                className="relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                {/* Dòng hiển thị sản phẩm chính */}
                <CartItemRow item={item} onUpdateQty={updateQuantity} onRemove={removeItem} />

                {/* --- KHU VỰC HIỂN THỊ HÀNG TẶNG KÈM (Chỉ hiện nếu isBogo === true) --- */}
                {isBogo && (
                  <div className="mt-4 ml-0 flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50/40 p-3 shadow-sm sm:ml-[100px]">
                    <div className="flex items-center gap-3">
                      {/* Ảnh quà tặng */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-teal-100 bg-white">
                        <img
                          src={item.product.thumbnailUrl}
                          alt="gift"
                          className="h-10 w-10 object-contain p-1"
                        />
                      </div>

                      {/* Tên quà tặng */}
                      <div>
                        <span className="flex items-center gap-1 text-sm font-bold text-teal-800">
                          <Gift className="h-4 w-4 text-teal-500" />
                          [Quà tặng] {item.product.name}
                        </span>
                        <span className="mt-1 block text-xs text-teal-600">
                          Quà tặng kèm theo chương trình Mua 1 Tặng 1
                        </span>
                      </div>
                    </div>

                    {/* Số lượng & Giá quà tặng */}
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-bold text-teal-600 uppercase">Miễn phí</div>
                      <div className="mt-1 text-xs font-medium text-gray-500">
                        Số lượng: {item.quantity}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* TÓM TẮT ĐƠN HÀNG */}
        <div className="relative">
          <Card className="sticky top-6 border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-50 bg-gray-50/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-medium">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
              </div>
              <Separator className="bg-gray-100" />
              <div className="flex justify-between text-lg">
                <span className="font-bold text-zinc-900">Tổng cộng</span>
                <span className="font-bold text-red-500">{formatVND(subtotal)}</span>
              </div>
              <Button
                className="h-12 w-full bg-teal-500 text-base shadow-md shadow-teal-500/20 hover:bg-teal-600"
                onClick={handleCheckout}>
                Tiến hành thanh toán
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
