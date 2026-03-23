import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { feedbackService } from "@/services/feedbackService";
import { orderService } from "@/services/orderService";
import { productService } from "@/services/productService";
import { useAuthStore } from "@/stores/authStore";
import { extractAccountIdFromToken } from "@/utils/authToken";
import { formatVND } from "@/utils/formatPrice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, Package, Receipt, Star, User, X } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

// --- Types ---
interface OrderItem {
  orderDetailId: number; // ID định danh chính xác cho dòng sản phẩm trong đơn hàng
  productId: number;
  productName: string;
  quantity: number;
  subtotal: number;
  imgUrl?: string;
  variantLabel?: string;
}

// --- Helpers ---
const getStatusColor = (status: string) => {
  const s = status?.toUpperCase();
  switch (s) {
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
  const s = status?.toUpperCase();
  switch (s) {
    case "PAID":
      return "Đã thanh toán";
    case "CANCELED":
      return "Đã hủy";
    case "PENDING":
      return "Chờ xử lý";
    default:
      return status || "Không xác định";
  }
};

// --- Components ---
function OrderItemImage({
  productId,
  fallbackImg,
  altText,
}: {
  productId: number;
  fallbackImg?: string;
  altText: string;
}) {
  const { data: product, isLoading } = useQuery({
    queryKey: ["product-detail-img", productId],
    queryFn: () => productService.getAppProductById(productId),
    enabled: !fallbackImg,
  });

  const finalImgUrl =
    fallbackImg ||
    product?.imgUrls?.[0] ||
    (product as any)?.imgUrl ||
    "https://placehold.co/100x100?text=No+Image";

  if (isLoading && !fallbackImg) {
    return <div className="h-full w-full animate-pulse rounded-md bg-gray-100" />;
  }
  return <img src={finalImgUrl} alt={altText} className="h-full w-full object-contain" />;
}

function FeedbackAction({
  item,
  userId,
  imageUrl,
}: {
  item: OrderItem;
  userId: number;
  imageUrl?: string;
}) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [localFeedback, setLocalFeedback] = useState<any>(null);

  // Lấy orderDetailId từ item (Dữ liệu từ API GET /api/orders/{id})
  const orderDetailId = item.orderDetailId;
  const productId = item.productId;

  // Lấy Feedback CHÍNH XÁC cho từng orderDetailId
  const { data: serverFeedback, isLoading } = useQuery({
    queryKey: ["feedback-order-detail", orderDetailId],
    queryFn: () => feedbackService.getFeedbackByOrderDetailId(orderDetailId),
    enabled: !!orderDetailId,
    retry: false, // Nếu chưa có feedback (404), không cần retry
  });

  // Bóc tách dữ liệu feedback an toàn
  const parsedFeedback = (() => {
    if (!serverFeedback) return null;
    if (typeof serverFeedback.rating === "number") return serverFeedback;
    if (serverFeedback.data && typeof serverFeedback.data.rating === "number")
      return serverFeedback.data;
    return null;
  })();

  const feedback = localFeedback || parsedFeedback;

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Đảm bảo không gửi orderDetailId = 0
      if (!orderDetailId || orderDetailId === 0) {
        toast.error("Lỗi: Không tìm thấy ID chi tiết đơn hàng.");
        throw new Error("Invalid orderDetailId");
      }

      return feedbackService.submitFeedback({
        userId,
        productId,
        rating,
        comment,
        orderDetailId: orderDetailId, // Sử dụng giá trị thật từ item
      });
    },
    onSuccess: (res) => {
      toast.success("Đã gửi đánh giá thành công!");
      setIsOpen(false);
      setLocalFeedback({ rating, comment, date: new Date().toISOString(), ...res });
      // Refresh cache cho orderDetail cụ thể này
      queryClient.invalidateQueries({ queryKey: ["feedback-order-detail", orderDetailId] });
    },
    onError: () => toast.error("Gửi đánh giá thất bại. Bạn có thể đã đánh giá sản phẩm này rồi!"),
  });

  if (isLoading) return <div className="mt-2 h-8 w-24 animate-pulse rounded-md bg-gray-100" />;

  // Nếu đã có đánh giá
  if (feedback) {
    return (
      <div className="animate-in fade-in mt-3 w-full rounded-lg border border-teal-100 bg-teal-50/50 p-3 duration-500">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3.5 w-3.5 ${s <= feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold tracking-wider text-teal-600 uppercase">
            Đã đánh giá
          </span>
        </div>
        <p className="text-sm text-gray-700 italic">"{feedback.comment || "Đẹp"}"</p>
      </div>
    );
  }

  // Nếu chưa có đánh giá
  return (
    <div className="mt-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 border-orange-200 text-xs text-orange-500 hover:bg-orange-50"
        onClick={() => setIsOpen(true)}>
        <MessageSquare className="mr-1 h-3 w-3" /> Đánh giá sản phẩm
      </Button>

      {isOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="animate-in zoom-in relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-bold text-zinc-900">Đánh giá sản phẩm</h3>
              <div className="mb-6 flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="h-12 w-12 shrink-0 rounded-md border border-gray-200 bg-white p-1">
                  <OrderItemImage
                    productId={productId}
                    fallbackImg={imageUrl}
                    altText={item.productName}
                  />
                </div>
                <p className="line-clamp-2 text-sm font-medium text-zinc-800">{item.productName}</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      onClick={() => setRating(s)}
                      className={`h-8 w-8 cursor-pointer transition-colors ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 hover:text-yellow-200"}`}
                    />
                  ))}
                </div>
                <textarea
                  rows={4}
                  placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <Button
                  className="w-full bg-teal-500 hover:bg-teal-600"
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const userId = extractAccountIdFromToken(token) || 0;

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getAppOrderById(Number(orderId)),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto min-h-screen bg-[#f1f1f1] px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-gray-100 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto min-h-screen bg-[#f1f1f1] px-4 py-16 text-center">
        <p className="mb-4 text-lg text-gray-500">
          Đơn hàng không tồn tại hoặc bạn không có quyền xem.
        </p>
        <Button asChild className="bg-teal-500 hover:bg-teal-600">
          <Link to="/orders">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  const handleCancel = async () => {
    try {
      const response = await orderService.cancelOrder(order.id, "Khách hàng hủy đơn");
      if (response.status === 200) {
        toast.success("Đã gửi yêu cầu hủy đơn hàng. Vui lòng chờ xác nhận từ hệ thống.");
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      } else {
        toast.error("Không thể hủy đơn hàng lúc này.");
      }
    } catch {
      toast.error("Không thể hủy đơn hàng lúc này.");
    }
  };

  // Mapped dữ liệu từ orderDetails trong JSON của bạn
  const orderItemsList: OrderItem[] = (order as any).orderDetails || [];
  const basePrice = order.basePrice || 0;
  const totalPrice = order.totalPrice || 0;
  const orderDate = order.orderDate || new Date();
  const discountAmount = basePrice > totalPrice ? basePrice - totalPrice : 0;

  return (
    <div className="min-h-screen bg-[#f1f1f1] pb-12">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Link
          to="/orders"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách đơn hàng
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 uppercase">
              Đơn hàng: {order.orderCode}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Ngày đặt: {new Date(orderDate).toLocaleString("vi-VN")}
            </p>
          </div>
          <div
            className={`rounded-full border px-4 py-1.5 text-sm font-bold ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b border-gray-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5 text-teal-500" /> Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm font-medium text-zinc-900">
                  Người đặt:{" "}
                  <span className="font-normal text-gray-600">
                    {order.userName || "Khách hàng"}
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-sm">
              <CardHeader className="border-b border-gray-50 bg-gray-50/50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-5 w-5 text-teal-500" /> Sản phẩm ({orderItemsList.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {orderItemsList.map((item) => {
                    const fallbackImageUrl = item.imgUrl;
                    return (
                      <div
                        key={item.orderDetailId}
                        className="flex flex-col gap-2 p-4 transition-colors hover:bg-gray-50">
                        <div className="flex gap-4">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white p-1">
                            <OrderItemImage
                              productId={item.productId}
                              fallbackImg={fallbackImageUrl}
                              altText={item.productName}
                            />
                          </div>
                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <p className="line-clamp-2 text-sm font-medium text-zinc-900">
                                {item.productName}
                              </p>
                              {item.variantLabel && (
                                <p className="mt-1 text-xs text-gray-500 capitalize">
                                  Phân loại: {item.variantLabel}
                                </p>
                              )}
                            </div>
                            <div className="mt-2 flex items-end justify-between">
                              <p className="text-sm font-medium text-gray-500">
                                SL: {item.quantity}
                              </p>
                              <span className="text-sm font-bold text-red-500">
                                {formatVND(item.subtotal)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Hiện nút đánh giá nếu đơn hàng đã thanh toán */}
                        {userId > 0 && order.status?.toUpperCase() === "PAID" && (
                          <FeedbackAction item={item} userId={userId} imageUrl={fallbackImageUrl} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6 border-none shadow-sm">
              <CardHeader className="border-b border-gray-50 bg-gray-50/50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-5 w-5 text-teal-500" /> Tóm tắt đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Tạm tính</span>
                  <span className="font-medium text-zinc-900">{formatVND(basePrice)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between font-medium text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}
                <Separator className="my-2 border-gray-100" />
                <div className="flex items-center justify-between text-base">
                  <span className="font-bold text-zinc-900">Tổng cộng</span>
                  <span className="text-xl font-bold text-red-500">{formatVND(totalPrice)}</span>
                </div>
                <p className="text-right text-[10px] text-gray-400 italic">
                  (Đã bao gồm VAT nếu có)
                </p>
              </CardContent>
              {order.status?.toUpperCase() === "PENDING" && (
                <div className="p-4 pt-0">
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-500 hover:bg-red-50"
                    onClick={handleCancel}>
                    Yêu cầu hủy đơn
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
