import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/router/routes.const";
import { type CreateOrderRequest, orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { productService } from "@/services/productService";
import {
  calculatePromotionDiscount,
  promotionService,
  validatePromotionForCheckout,
} from "@/services/promotionService";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/stores";
import { extractAccountIdFromToken } from "@/utils/authToken";
import { formatVND } from "@/utils/formatPrice";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Copy, ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type OrderTargetMode = "customer" | "self";

interface DraftOrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  maxStock: number;
}

interface PaymentResultState {
  open: boolean;
  paymentUrl: string;
  orderCode: string;
}

function toPositiveInt(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return parsed;
}

function getReadableError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function StaffOrderCreatePage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [orderTargetMode, setOrderTargetMode] = useState<OrderTargetMode>("customer");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [items, setItems] = useState<DraftOrderItem[]>([]);

  const [recipientName, setRecipientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(0);

  const [paymentResult, setPaymentResult] = useState<PaymentResultState>({
    open: false,
    paymentUrl: "",
    orderCode: "",
  });

  const selfAccountId = useMemo(() => extractAccountIdFromToken(token), [token]);

  const { data: customerPaged, isLoading: isCustomersLoading } = useQuery({
    queryKey: ["staff", "order-create", "customers"],
    queryFn: () => userService.getUsers(0, 500, ["USER"]),
  });

  const { data: productList, isLoading: isProductsLoading } = useQuery({
    queryKey: ["staff", "order-create", "products"],
    queryFn: () => productService.getProducts({ page: 1, pageSize: 500, activeFilter: "active" }),
  });

  const customers = useMemo(() => customerPaged?.content ?? [], [customerPaged?.content]);
  const products = useMemo(() => productList?.items ?? [], [productList?.items]);

  const filteredCustomers = useMemo(() => {
    const keyword = customerSearch.trim().toLowerCase();
    if (!keyword) return customers;
    return customers.filter(
      (customer) =>
        customer.fullName.toLowerCase().includes(keyword) ||
        customer.email.toLowerCase().includes(keyword)
    );
  }, [customerSearch, customers]);

  const filteredProducts = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter((product) => product.name.toLowerCase().includes(keyword));
  }, [productSearch, products]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const effectiveTargetUserId = orderTargetMode === "self" ? selfAccountId : selectedCustomerId;

  const basePrice = useMemo(() => items.reduce((sum, item) => sum + item.subtotal, 0), [items]);

  const totalPrice = useMemo(
    () => Math.max(basePrice - promoDiscountAmount, 0),
    [basePrice, promoDiscountAmount]
  );

  const addItem = () => {
    if (!selectedProduct) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }

    const maxStock = selectedProduct.stockQuantity ?? 0;
    if (maxStock <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    if (selectedQuantity > maxStock) {
      toast.error(`Số lượng vượt tồn kho (${maxStock})`);
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.productId === selectedProduct.id);
      if (existing) {
        const nextQty = existing.quantity + selectedQuantity;
        if (nextQty > existing.maxStock) {
          toast.error(`Tổng số lượng vượt tồn kho (${existing.maxStock})`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === selectedProduct.id
            ? {
                ...item,
                quantity: nextQty,
                subtotal: nextQty * item.unitPrice,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          unitPrice: selectedProduct.defaultPrice,
          quantity: selectedQuantity,
          subtotal: selectedProduct.defaultPrice * selectedQuantity,
          maxStock,
        },
      ];
    });
  };

  const updateItemQuantity = (productId: number, quantityText: string) => {
    const nextQty = toPositiveInt(quantityText);
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const bounded = Math.min(nextQty, item.maxStock);
        return {
          ...item,
          quantity: bounded,
          subtotal: bounded * item.unitPrice,
        };
      })
    );
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const applyPromoMutation = useMutation({
    mutationFn: async () => {
      const code = promoInput.trim();
      if (!code) throw new Error("Vui lòng nhập mã khuyến mãi");
      if (basePrice <= 0) throw new Error("Vui lòng thêm sản phẩm trước khi áp mã");

      const promotion = await promotionService.getPromotionByCode(code);
      const validationMessage = validatePromotionForCheckout(promotion, basePrice);
      if (validationMessage) {
        throw new Error(validationMessage);
      }

      const discount = calculatePromotionDiscount(promotion, basePrice);
      return { code: promotion.code, discount };
    },
    onSuccess: ({ code, discount }) => {
      setAppliedPromoCode(code);
      setPromoDiscountAmount(discount);
      toast.success("Áp dụng mã khuyến mãi thành công");
    },
    onError: (error) => {
      toast.error(getReadableError(error, "Không thể áp dụng mã khuyến mãi"));
      setAppliedPromoCode(null);
      setPromoDiscountAmount(0);
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveTargetUserId) {
        throw new Error(
          orderTargetMode === "self"
            ? "Không xác định được tài khoản staff hiện tại"
            : "Vui lòng chọn khách hàng"
        );
      }

      if (!recipientName.trim() || !phoneNumber.trim() || !address.trim()) {
        throw new Error("Vui lòng nhập đầy đủ thông tin người nhận");
      }

      if (!items.length) {
        throw new Error("Vui lòng thêm ít nhất một sản phẩm");
      }

      const payload: CreateOrderRequest = {
        userId: effectiveTargetUserId,
        status: "PENDING",
        basePrice,
        totalPrice,
        orderDetails: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          subtotal: item.subtotal,
          type: "buy",
        })),
        orderInfo: [
          {
            recipientName: recipientName.trim(),
            phoneNumber: phoneNumber.trim(),
            address: address.trim(),
          },
        ],
        note: orderNote.trim() || undefined,
      };

      const order = await orderService.createOrder(payload);
      if (!order.orderCode) {
        throw new Error("Không nhận được mã đơn để khởi tạo thanh toán");
      }

      const payment = await paymentService.initiatePayment(
        order.orderCode,
        appliedPromoCode ?? undefined
      );
      if (!payment.paymentUrl) {
        throw new Error("Đơn đã tạo nhưng không nhận được link thanh toán");
      }

      return {
        orderCode: order.orderCode,
        paymentUrl: payment.paymentUrl,
      };
    },
    onSuccess: ({ orderCode, paymentUrl }) => {
      window.open(paymentUrl, "_blank", "noopener,noreferrer");
      setPaymentResult({
        open: true,
        paymentUrl,
        orderCode,
      });
      toast.success("Tạo đơn thành công, đã mở trang thanh toán");
    },
    onError: (error) => {
      toast.error(getReadableError(error, "Tạo đơn thất bại"));
    },
  });

  const handleSelfOrderToggle = (nextValue: string) => {
    const mode = nextValue as OrderTargetMode;
    setOrderTargetMode(mode);
    if (mode === "self") {
      setSelectedCustomerId(null);
      setRecipientName(user?.fullName ?? "");
      setPhoneNumber(user?.phone ?? "");
      setAddress("");
    }
  };

  const clearPromo = () => {
    setAppliedPromoCode(null);
    setPromoDiscountAmount(0);
    setPromoInput("");
  };

  const copyPaymentLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentResult.paymentUrl);
      toast.success("Đã sao chép link thanh toán");
    } catch {
      toast.error("Không thể sao chép link");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ROUTES.STAFF_ORDERS}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Tạo đơn hàng</h1>
          <p className="text-sm text-gray-500">
            Hỗ trợ tạo đơn cho khách hàng hoặc đặt cho chính bạn
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Đối tượng đặt hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={orderTargetMode} onValueChange={handleSelfOrderToggle}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Tạo đơn cho khách hàng</SelectItem>
                  <SelectItem value="self">Đặt cho tôi</SelectItem>
                </SelectContent>
              </Select>

              {orderTargetMode === "customer" ? (
                <div className="space-y-3 rounded-lg border border-gray-100 p-3">
                  <Label>Tìm khách hàng</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={customerSearch}
                      onChange={(event) => setCustomerSearch(event.target.value)}
                      placeholder="Nhập tên hoặc email"
                      className="pl-9"
                    />
                  </div>

                  <Select
                    value={selectedCustomerId ? String(selectedCustomerId) : ""}
                    onValueChange={(value) => setSelectedCustomerId(Number(value))}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isCustomersLoading ? "Đang tải khách hàng..." : "Chọn khách hàng"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={String(customer.id)}>
                          {customer.fullName} - {customer.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCustomer && (
                    <p className="text-xs text-gray-500">
                      Đang chọn:{" "}
                      <span className="font-medium text-zinc-700">{selectedCustomer.fullName}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm text-teal-700">
                  Đơn hàng sẽ được tạo cho chính bạn ({user?.fullName ?? "Staff"}).
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr,180px,130px]">
                <div className="space-y-2">
                  <Label>Tìm sản phẩm</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={productSearch}
                      onChange={(event) => setProductSearch(event.target.value)}
                      placeholder="Nhập tên sản phẩm"
                      className="pl-9"
                    />
                  </div>
                  <Select
                    value={selectedProductId ? String(selectedProductId) : ""}
                    onValueChange={(value) => setSelectedProductId(Number(value))}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={isProductsLoading ? "Đang tải sản phẩm..." : "Chọn sản phẩm"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          {product.name} - {formatVND(product.defaultPrice)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Số lượng</Label>
                  <Input
                    type="number"
                    min={1}
                    value={selectedQuantity}
                    onChange={(event) => setSelectedQuantity(toPositiveInt(event.target.value))}
                  />
                </div>

                <div className="flex items-end">
                  <Button className="w-full bg-teal-500 hover:bg-teal-600" onClick={addItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm
                  </Button>
                </div>
              </div>

              <div className="overflow-auto rounded-lg border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-500">
                      <th className="px-3 py-2 font-medium">Sản phẩm</th>
                      <th className="px-3 py-2 text-right font-medium">Đơn giá</th>
                      <th className="px-3 py-2 text-right font-medium">SL</th>
                      <th className="px-3 py-2 text-right font-medium">Thành tiền</th>
                      <th className="px-3 py-2 text-right font-medium">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.productId} className="border-b last:border-0">
                        <td className="px-3 py-2 font-medium text-zinc-900">{item.productName}</td>
                        <td className="px-3 py-2 text-right text-zinc-900">
                          {formatVND(item.unitPrice)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Input
                            type="number"
                            min={1}
                            max={item.maxStock}
                            value={item.quantity}
                            onChange={(event) =>
                              updateItemQuantity(item.productId, event.target.value)
                            }
                            className="ml-auto h-8 w-20 text-right"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-zinc-900">
                          {formatVND(item.subtotal)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => removeItem(item.productId)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!items.length && (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                          Chưa có sản phẩm nào trong đơn
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
              <CardTitle className="text-base">Thông tin nhận hàng</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Người nhận</Label>
                <Input
                  value={recipientName}
                  onChange={(event) => setRecipientName(event.target.value)}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="09xxxxxxxx"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Địa chỉ</Label>
                <Input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Ghi chú đơn hàng (không bắt buộc)</Label>
                <textarea
                  value={orderNote}
                  onChange={(event) => setOrderNote(event.target.value)}
                  placeholder="Nhập ghi chú nội bộ hoặc yêu cầu giao hàng"
                  className="min-h-24 w-full rounded-md border border-gray-200 px-3 py-2 text-sm ring-teal-500 outline-none focus:ring-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Khuyến mãi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={promoInput}
                onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
                placeholder="Nhập mã khuyến mãi"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => applyPromoMutation.mutate()}
                  disabled={applyPromoMutation.isPending}>
                  Áp mã
                </Button>
                <Button type="button" variant="ghost" className="flex-1" onClick={clearPromo}>
                  Bỏ mã
                </Button>
              </div>
              {appliedPromoCode && (
                <p className="text-xs text-green-600">
                  Đã áp dụng: <span className="font-semibold">{appliedPromoCode}</span>
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Giá gốc</span>
                <span className="font-medium text-zinc-900">{formatVND(basePrice)}</span>
              </div>
              <div className="flex items-center justify-between text-green-600">
                <span>Giảm giá</span>
                <span>- {formatVND(promoDiscountAmount)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between text-base font-bold">
                  <span>Tổng thanh toán</span>
                  <span className="text-teal-600">{formatVND(totalPrice)}</span>
                </div>
              </div>

              <Button
                className="mt-4 w-full bg-teal-500 hover:bg-teal-600"
                onClick={() => createOrderMutation.mutate()}
                disabled={createOrderMutation.isPending || !items.length}>
                {createOrderMutation.isPending ? "Đang xử lý..." : "Tạo đơn và thanh toán"}
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link to={ROUTES.STAFF_ORDERS}>Quay lại danh sách đơn</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={paymentResult.open}
        onOpenChange={(open) => setPaymentResult((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đã tạo đơn thành công</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              Mã đơn: <span className="font-semibold text-zinc-900">{paymentResult.orderCode}</span>
            </p>
            <div className="rounded-lg border bg-gray-50 p-3">
              <p className="mb-1 text-xs text-gray-500">Link thanh toán</p>
              <p className="text-xs break-all text-zinc-900">{paymentResult.paymentUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={copyPaymentLink}>
                <Copy className="mr-2 h-4 w-4" />
                Sao chép link
              </Button>
              <Button
                type="button"
                className="flex-1 bg-teal-500 hover:bg-teal-600"
                onClick={() =>
                  window.open(paymentResult.paymentUrl, "_blank", "noopener,noreferrer")
                }>
                <ExternalLink className="mr-2 h-4 w-4" />
                Mở lại thanh toán
              </Button>
            </div>
            <Button type="button" className="w-full" onClick={() => navigate(ROUTES.STAFF_ORDERS)}>
              Về quản lý đơn hàng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
