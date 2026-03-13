import { PaginationControl } from "@/components/shared/PaginationControl";
import { SortButton, type SortDirection } from "@/components/shared/SortButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePagination } from "@/hooks/usePagination";
import type { BackendFeedback } from "@/services/feedbackService";
import { feedbackService } from "@/services/feedbackService";
import { formatDate } from "@/utils/formatDate";
import { useQuery } from "@tanstack/react-query";
import { Eye, MessageSquare, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function FeedbackManagerPage() {
  const {
    data: feedbacks,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["staff", "feedbacks"],
    queryFn: feedbackService.getFeedbacks,
    select: (data) =>
      [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  });

  const [detailFeedback, setDetailFeedback] = useState<BackendFeedback | null>(null);

  const [sortField, setSortField] = useState<"date" | "rating">("date");
  const [sortDir, setSortDir] = useState<SortDirection>("none");
  const [pageSize, setPageSize] = useState(10);

  const sortedFeedbacks = useMemo(() => {
    if (sortDir === "none") return [...(feedbacks ?? [])];
    return [...(feedbacks ?? [])].sort((a, b) => {
      if (sortField === "date") {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortDir === "asc" ? diff : -diff;
      } else {
        const diff = a.rating - b.rating;
        return sortDir === "asc" ? diff : -diff;
      }
    });
  }, [feedbacks, sortField, sortDir]);

  const pagination = usePagination({ totalCount: sortedFeedbacks.length, pageSize });
  const pageFeedbacks = sortedFeedbacks.slice(pagination.startIndex, pagination.endIndex + 1);

  const handleDelete = async (id: number) => {
    try {
      await feedbackService.deleteFeedback(id);
      toast.success("Đã xóa phản hồi");
      refetch();
    } catch {
      toast.error("Xóa phản hồi thất bại");
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý phản hồi</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Sắp xếp:</span>
          <SortButton
            direction={sortField === "date" ? sortDir : "none"}
            onChange={(dir) => {
              setSortField("date");
              setSortDir(dir);
            }}>
            Ngày
          </SortButton>
          <SortButton
            direction={sortField === "rating" ? sortDir : "none"}
            onChange={(dir) => {
              setSortField("rating");
              setSortDir(dir);
            }}>
            Đánh giá
          </SortButton>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {pageFeedbacks.map((fb: BackendFeedback) => (
            <Card key={fb.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-teal-500" />
                    <div>
                      <CardTitle className="text-base">
                        Người dùng #{fb.userId} — Sản phẩm #{fb.productId}
                      </CardTitle>
                      <p className="text-xs text-gray-400">{formatDate(fb.date)}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    <div className="flex items-center gap-1">{renderStars(fb.rating)}</div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">{fb.comment}</p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-teal-500"
                    onClick={() => setDetailFeedback(fb)}>
                    <Eye className="mr-1 h-4 w-4" />
                    Chi tiết
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                    onClick={() => fb.id !== undefined && handleDelete(fb.id)}>
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <PaginationControl
        pagination={pagination}
        onPageSizeChange={(size) => {
          setPageSize(size);
          pagination.goToFirstPage();
        }}
      />

      <Dialog open={!!detailFeedback} onOpenChange={(open) => !open && setDetailFeedback(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết phản hồi</DialogTitle>
          </DialogHeader>
          {detailFeedback && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">Người dùng</p>
                <p className="font-medium text-zinc-900">#{detailFeedback.userId}</p>
              </div>
              <div>
                <p className="text-gray-400">Sản phẩm</p>
                <p className="font-medium text-zinc-900">#{detailFeedback.productId}</p>
              </div>
              <div>
                <p className="text-gray-400">Đánh giá</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < detailFeedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="ml-1 text-gray-600">({detailFeedback.rating}/5)</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400">Nội dung</p>
                <p className="text-gray-700">{detailFeedback.comment}</p>
              </div>
              <div>
                <p className="text-gray-400">Ngày đánh giá</p>
                <p className="text-gray-700">{formatDate(detailFeedback.date)}</p>
              </div>
              {detailFeedback.orderDetail && (
                <div>
                  <p className="text-gray-400">Chi tiết đơn hàng</p>
                  <div className="mt-1 space-y-1 rounded-lg bg-gray-50 p-3">
                    <p>
                      Số lượng:{" "}
                      <span className="font-medium">{detailFeedback.orderDetail.quantity}</span>
                    </p>
                    <p>
                      Thành tiền:{" "}
                      <span className="font-medium">
                        {detailFeedback.orderDetail.subtotal?.toLocaleString("vi-VN")}đ
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
