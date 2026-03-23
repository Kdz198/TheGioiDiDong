import { ProductPickerDialog } from "@/components/common/ProductPickerDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/router/routes.const";
import { checkoutService, type CheckAvailableRequest } from "@/services/checkoutService";
import { productService } from "@/services/productService";
import { useAuthStore } from "@/stores";
import { extractAccountIdFromToken } from "@/utils/authToken";
import { formatVND } from "@/utils/formatPrice";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DraftOrderItem {
  productId: number;
  productName: string;
  thumbnailUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  maxStock: number;
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

  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [items, setItems] = useState<DraftOrderItem[]>([]);

  const [recipientName, setRecipientName] = useState(user?.fullName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone ?? "");
  const [address, setAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const resolvedStaffUserId = useMemo(() => {
    if (typeof user?.id === "number" && user.id > 0) {
      return user.id;
    }
    return extractAccountIdFromToken(token);
  }, [token, user?.id]);

  const { data: productList, isLoading: isProductsLoading } = useQuery({
    queryKey: ["staff", "order-create", "products"],
    queryFn: () => productService.getProducts({ page: 1, pageSize: 500, activeFilter: "active" }),
  });

  const products = useMemo(() => productList?.items ?? [], [productList?.items]);
  const basePrice = useMemo(() => items.reduce((sum, item) => sum + item.subtotal, 0), [items]);

  const handleConfirmProductSelections = (
    selections: Array<{ productId: number; quantity: number }>
  ) => {
    if (!selections.length) return;

    setItems((prev) => {
      const next = [...prev];

      for (const selection of selections) {
        const product = products.find((item) => item.id === selection.productId);
        if (!product) continue;

        const maxStock = product.stockQuantity ?? 0;
        if (maxStock <= 0) continue;

        const safeQuantity = Math.max(1, Math.min(selection.quantity, maxStock));
        const existingIndex = next.findIndex((item) => item.productId === product.id);

        if (existingIndex >= 0) {
          const existing = next[existingIndex];
          const mergedQuantity = Math.min(existing.quantity + safeQuantity, existing.maxStock);
          next[existingIndex] = {
            ...existing,
            quantity: mergedQuantity,
            subtotal: mergedQuantity * existing.unitPrice,
          };
        } else {
          next.push({
            productId: product.id,
            productName: product.name,
            thumbnailUrl: product.thumbnailUrl || "",
            unitPrice: product.defaultPrice,
            quantity: safeQuantity,
            subtotal: safeQuantity * product.defaultPrice,
            maxStock,
          });
        }
      }

      return next;
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

  const prepareOrderMutation = useMutation({
    mutationFn: async () => {
      if (!resolvedStaffUserId) {
        throw new Error("Không xác định được tài khoản staff hiện tại");
      }

      if (!recipientName.trim() || !phoneNumber.trim() || !address.trim()) {
        throw new Error("Vui lòng nhập đầy đủ thông tin người nhận");
      }

      if (!items.length) {
        throw new Error("Vui lòng thêm ít nhất một sản phẩm");
      }

      const payload: CheckAvailableRequest = {
        userId: resolvedStaffUserId,
        status: "PENDING",
        basePrice,
        totalPrice: basePrice,
        orderCode: "",
        paymentMethod: "CASH",
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

      const available = await checkoutService.checkAvailable(payload);
      if (!available.orderCode) {
        throw new Error("Không nhận được mã đơn hợp lệ sau khi kiểm tra tồn kho");
      }

      return available;
    },
    onSuccess: () => {
      toast.success("Đặt hàng thành công. Đã quay về danh sách đơn hàng.");
      navigate(ROUTES.STAFF_ORDERS);
    },
    onError: (error) => {
      toast.error(getReadableError(error, "Không thể chuẩn bị đơn hàng"));
    },
  });

  const existingQuantities = useMemo(
    () =>
      items.reduce<Record<number, number>>((acc, item) => {
        acc[item.productId] = item.quantity;
        return acc;
      }, {}),
    [items]
  );

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
          <p className="text-sm text-gray-500">Bước cuối: Chuẩn bị đơn và kiểm tra tồn kho</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin tài khoản đặt đơn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm text-teal-700">
                <p>
                  Đơn hàng sẽ được tạo cho chính bạn:{" "}
                  <span className="font-semibold">{user?.fullName ?? "Staff"}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">Danh sách sản phẩm trong đơn</p>
                  <p className="text-xs text-gray-500">
                    Chọn nhiều sản phẩm và số lượng trong popup
                  </p>
                </div>
                <Button
                  type="button"
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={() => setProductPickerOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm sản phẩm
                </Button>
              </div>

              <div className="overflow-auto rounded-lg border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-500">
                      <th className="px-3 py-2 font-medium">Ảnh</th>
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
                        <td className="px-3 py-2">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.productName}
                              className="h-10 w-10 rounded-md border border-gray-100 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                              ?
                            </div>
                          )}
                        </td>
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
                        <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
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
              <CardTitle className="text-base">Lộ trình tạo đơn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p className="font-medium text-teal-700">1. Tạo đơn và kiểm tra tồn kho</p>
              <p>Hoàn tất và quay về danh sách đơn hàng</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tóm tắt bước 1</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Giá gốc</span>
                <span className="font-medium text-zinc-900">{formatVND(basePrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Tổng gửi check-available</span>
                <span className="font-semibold text-zinc-900">{formatVND(basePrice)}</span>
              </div>

              <Button
                className="mt-4 w-full bg-teal-500 hover:bg-teal-600"
                onClick={() => prepareOrderMutation.mutate()}
                disabled={prepareOrderMutation.isPending || !items.length}>
                {prepareOrderMutation.isPending ? "Đang kiểm tra..." : "Tiến hành đặt hàng"}
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link to={ROUTES.STAFF_ORDERS}>Quay lại danh sách đơn</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProductPickerDialog
        open={productPickerOpen}
        onOpenChange={setProductPickerOpen}
        products={products}
        isLoading={isProductsLoading}
        existingQuantities={existingQuantities}
        onConfirm={handleConfirmProductSelections}
      />
    </div>
  );
}
