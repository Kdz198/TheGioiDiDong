import { PaymentMethodCard } from "@/components/common/PaymentMethodCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { PaymentMethod } from "@/interfaces/order.types";
import { ROUTES } from "@/router/routes.const";
import { orderService } from "@/services/orderService";
import { useCartStore, useCartTotals } from "@/stores/cartStore";
import { formatVND } from "@/utils/formatPrice";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function CheckoutPage() {
  const { items, clearCart, appliedVoucher } = useCartStore();
  const { subtotal, discountAmount, total } = useCartTotals();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const [form, setForm] = useState({
    recipientName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    streetAddress: "",
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.recipientName ||
      !form.phone ||
      !form.province ||
      !form.district ||
      !form.ward ||
      !form.streetAddress
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    try {
      setIsLoading(true);
      await orderService.createOrder({
        shippingInfo: {
          recipientName: form.recipientName,
          phone: form.phone,
          province: form.province,
          district: form.district,
          ward: form.ward,
          streetAddress: form.streetAddress,
          deliveryNote: form.notes || undefined,
        },
        paymentMethod,
        voucherCode: appliedVoucher?.code,
      });
      clearCart();
      toast.success("Đặt hàng thành công!");
      navigate(ROUTES.ORDER_SUCCESS);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đặt hàng thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Thanh Toán</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Họ tên người nhận</Label>
                    <Input
                      id="recipientName"
                      value={form.recipientName}
                      onChange={(e) => handleChange("recipientName", e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="0901234567"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="province">Tỉnh/Thành phố</Label>
                    <Input
                      id="province"
                      value={form.province}
                      onChange={(e) => handleChange("province", e.target.value)}
                      placeholder="Hồ Chí Minh"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">Quận/Huyện</Label>
                    <Input
                      id="district"
                      value={form.district}
                      onChange={(e) => handleChange("district", e.target.value)}
                      placeholder="Quận 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ward">Phường/Xã</Label>
                    <Input
                      id="ward"
                      value={form.ward}
                      onChange={(e) => handleChange("ward", e.target.value)}
                      placeholder="Phường Bến Nghé"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Địa chỉ cụ thể</Label>
                  <Input
                    id="streetAddress"
                    value={form.streetAddress}
                    onChange={(e) => handleChange("streetAddress", e.target.value)}
                    placeholder="123 Nguyễn Huệ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú cho shop (tùy chọn)</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Giao giờ hành chính..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(["momo", "vnpay", "cod"] as const).map((method) => (
                  <PaymentMethodCard
                    key={method}
                    method={method}
                    selected={paymentMethod === method}
                    onSelect={() => setPaymentMethod(method)}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Đơn hàng ({items.length} sản phẩm)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.product.thumbnailUrl}
                        alt={item.product.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div className="flex-1 text-xs">
                        <p className="font-medium text-zinc-900">{item.product.name}</p>
                        <p className="text-gray-400">SL: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-medium">{formatVND(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tạm tính</span>
                    <span>{formatVND(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span>-{formatVND(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-red-400">{formatVND(total)}</span>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600"
                  disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Đặt hàng
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
