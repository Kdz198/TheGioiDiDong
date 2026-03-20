import { CartItemRow } from "@/components/common/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes.const";
import { checkoutService } from "@/services";
import { promotionService } from "@/services/promotionService";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { formatVND } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { Gift, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const REQUIRED_SHIPPING_FIELDS = ["recipientName", "phoneNumber", "address"] as const;
type RequiredShippingField = (typeof REQUIRED_SHIPPING_FIELDS)[number];
type ShippingFormField = RequiredShippingField | "notes";

export function CartPage() {
  const { items, removeItem, updateQuantity, removeVoucher } = useCartStore();
  const { isLoggedIn, user } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState<Record<ShippingFormField, string>>({
    recipientName: "",
    phoneNumber: "",
    address: "",
    notes: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<RequiredShippingField, string>>({
    recipientName: "",
    phoneNumber: "",
    address: "",
  });

  const requiredFieldWarnings: Record<RequiredShippingField, string> = {
    recipientName: "Vui lòng nhập người nhận",
    phoneNumber: "Vui lòng nhập số điện thoại",
    address: "Vui lòng nhập địa chỉ cụ thể",
  };

  const isRequiredShippingField = (field: ShippingFormField): field is RequiredShippingField =>
    REQUIRED_SHIPPING_FIELDS.includes(field as RequiredShippingField);

  const handleChange = (field: ShippingFormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (isRequiredShippingField(field) && value.trim() !== "") {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    removeVoucher();
  }, [removeVoucher]);

  const { data: promotions } = useQuery({
    queryKey: ["promotions", "active"],
    queryFn: promotionService.getActivePromotions,
  });

  const bogoProductIds = useMemo(() => {
    if (!promotions) return [];
    const bogoPromo = promotions.find((p) => p.type === "BOGO" || p.code === "BOGO-1");
    return bogoPromo?.applicableProductIds || [];
  }, [promotions]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  const validateShippingForm = () => {
    const nextErrors = REQUIRED_SHIPPING_FIELDS.reduce(
      (acc, field) => {
        acc[field] = form[field].trim() === "" ? requiredFieldWarnings[field] : "";
        return acc;
      },
      {} as Record<RequiredShippingField, string>
    );

    setFieldErrors(nextErrors);
    return REQUIRED_SHIPPING_FIELDS.every((field) => nextErrors[field] === "");
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate(`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(ROUTES.CART)}`);
      return;
    }

    if (!validateShippingForm()) {
      toast.error(
        "Vui lòng điền đầy đủ thông tin giao hàng trước khi tiến hành thanh toán"
      );
      return;
    }

    checkoutService
      .checkAvailable({
        userId: user?.id ?? 0,
        status: "PENDING",
        totalPrice: totalPrice,
        basePrice: totalPrice,
        orderDetails: items.flatMap((item) =>
          bogoProductIds.includes(item.productId)
            ? [
                {
                  productId: item.productId,
                  quantity: item.quantity,
                  subtotal: 0,
                  type: "gift",
                },
                {
                  productId: item.productId,
                  quantity: item.quantity,
                  subtotal: item.subtotal,
                  type: "buy",
                },
              ]
            : [
                {
                  productId: item.productId,
                  quantity: item.quantity,
                  subtotal: item.subtotal,
                  type: "buy",
                },
              ]
        ),
        orderInfo: [
          {
            recipientName: form.recipientName,
            phoneNumber: form.phoneNumber,
            address: form.address,
          },
        ],
        note: form.notes,
      })
      .then((available) => {
        if (available) {
          navigate(`${ROUTES.CHECKOUT}?orderCode=${available.orderCode}`, {
            state: { shippingInfo: form },
          });
        } else {
          alert(
            "Hiện tại không thể tiến hành thanh toán. Vui lòng thử lại sau."
          );
        }
      })
      .catch((error) => {
        if (error.status === 409) {
          toast.error("Sản phẩm trong giỏ hàng đã hết hàng hoặc không còn sẵn sàng để đặt mua.");
        } else {
          console.error("Error checking order availability:", error);
          toast.error("Đã có lỗi xảy ra khi kiểm tra đơn hàng. Vui lòng thử lại sau.");
        }
      });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="text-xl font-bold text-zinc-900">Giỏ hàng trống</h2>
        <p className="mt-2 text-gray-500">
          Bạn chưa có sản phẩm nào trong giỏ hàng
        </p>
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
            const isBogo = bogoProductIds.includes(item.productId);

            return (
              <div
                key={item.id}
                className="relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                <CartItemRow item={item} onUpdateQty={updateQuantity} onRemove={removeItem} />

                {isBogo && (
                  <div className="mt-4 ml-0 flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50/40 p-3 shadow-sm sm:ml-[100px]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-teal-100 bg-white">
                        <img
                          src={item.product.thumbnailUrl}
                          alt="gift"
                          className="h-10 w-10 object-contain p-1"
                        />
                      </div>

                      <div>
                        <span className="flex items-center gap-1 text-sm font-bold text-teal-800">
                          <Gift className="h-4 w-4 text-teal-500" />
                          [Quà tặng] {item.product.name}
                        </span>
                        <span className="mt-1 block text-xs text-teal-600">
                          Quà tặng kèm theo chương trình Mua 1
                          Tặng 1
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-sm font-bold text-teal-600 uppercase">
                        Miễn phí
                      </div>
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

        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="bg-white/80 pt-4 pl-4">
              <CardTitle className="text-lg font-semibold">Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div
                  className={cn(
                    "relative rounded-lg border border-gray-200 bg-gray-50 p-4 pb-4 transition-colors",
                    fieldErrors.recipientName && "border-red-200 bg-red-50/50"
                  )}>
                  <Label className="pb-4" htmlFor="recipientName">Người nhận</Label>
                  <Input
                    id="recipientName"
                    value={form.recipientName}
                    onChange={(e) => handleChange("recipientName", e.target.value)}
                    placeholder="Tên Người nhận"
                    aria-invalid={Boolean(fieldErrors.recipientName)}
                    className={cn(
                      fieldErrors.recipientName &&
                        "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200 .pnb"
                    )}
                  />
                  <p
                    className={cn(
                      "pointer-events-none absolute right-4 bottom-3 left-4 text-xs text-red-500 transition-opacity",
                      fieldErrors.recipientName ? "opacity-100" : "opacity-0"
                    )}>
                    {fieldErrors.recipientName || " "}
                  </p>
                </div>

                <div
                  className={cn(
                    "relative rounded-lg border border-gray-200 bg-gray-50 p-4 pb-8 transition-colors",
                    fieldErrors.phoneNumber && "border-red-200 bg-red-50/50"
                  )}>
                  <Label className="pb-4" htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    placeholder="092xxxxxxx"
                    aria-invalid={Boolean(fieldErrors.phoneNumber)}
                    className={cn(
                      fieldErrors.phoneNumber &&
                        "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
                    )}
                  />
                  <p
                    className={cn(
                      "pointer-events-none absolute right-4 bottom-3 left-4 text-xs text-red-500 transition-opacity",
                      fieldErrors.phoneNumber ? "opacity-100" : "opacity-0"
                    )}>
                    {fieldErrors.phoneNumber || " "}
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "relative rounded-lg border border-gray-200 bg-gray-50 p-4 pb-8 transition-colors",
                  fieldErrors.address && "border-red-200 bg-red-50/50"
                )}>
                <Label className="pb-4" htmlFor="address">Địa chỉ cụ thể</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="123 Nguyễn Huệ"
                  aria-invalid={Boolean(fieldErrors.address)}
                  className={cn(
                    fieldErrors.address &&
                      "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
                  )}
                />
                <p
                  className={cn(
                    "pointer-events-none absolute right-4 bottom-3 left-4 text-xs text-red-500 transition-opacity",
                    fieldErrors.address ? "opacity-100" : "opacity-0"
                  )}>
                  {fieldErrors.address || " "}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <Label className="pb-4" htmlFor="notes">Ghi chú cho shop (tùy chọn)</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Giao giờ hành chính..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm lg:sticky lg:top-6">
            <CardHeader className="border-b border-gray-50 bg-gray-50/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                Tóm tắt đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-medium">{formatVND(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
              </div>
              <Separator className="bg-gray-100" />
              <div className="flex justify-between text-lg">
                <span className="font-bold text-zinc-900">Tổng cộng</span>
                <span className="font-bold text-red-500">{formatVND(totalPrice)}</span>
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
