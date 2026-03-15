import { CartItemRow } from "@/components/common/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/router/routes.const";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { formatVND } from "@/utils/formatPrice";
import { ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export function CartPage() {
  const { items, removeItem, updateQuantity, removeVoucher } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  // Voucher is only supported at checkout.
  useEffect(() => {
    removeVoucher();
  }, [removeVoucher]);

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Giỏ hàng ({totalItems} sản phẩm)</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQty={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-red-400">{formatVND(subtotal)}</span>
              </div>
              <Button className="w-full bg-teal-500 hover:bg-teal-600" onClick={handleCheckout}>
                Tiến hành thanh toán
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
