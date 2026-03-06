import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { feedbackService } from "@/services/feedbackService";
import { formatDate } from "@/utils/formatDate";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function StaffFeedbackManagerPage() {
  const {
    data: feedbacks,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["staff", "feedbacks"],
    queryFn: feedbackService.getFeedbacks,
  });

  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleReply = async (id: number) => {
    if (!replyText.trim()) return;
    try {
      setIsSending(true);
      await feedbackService.replyFeedback(id, replyText);
      toast.success("Đã gửi phản hồi!");
      setReplyingId(null);
      setReplyText("");
      refetch();
    } catch {
      toast.error("Gửi phản hồi thất bại");
    } finally {
      setIsSending(false);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await feedbackService.resolveFeedback(id);
      toast.success("Đã đánh dấu đã xử lý");
      refetch();
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Quản lý phản hồi</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks?.map((fb) => (
            <Card key={fb.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-teal-500" />
                    <div>
                      <CardTitle className="text-base">{fb.customerName}</CardTitle>
                      <p className="text-xs text-gray-400">
                        {fb.customerEmail} · {formatDate(fb.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      fb.status === "open"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }>
                    {fb.status === "open" ? "Đang mở" : "Đã xử lý"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">{fb.message}</p>

                {fb.replies.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      {fb.replies.map((reply, i) => (
                        <div key={i} className="rounded-lg bg-teal-50 p-3">
                          <p className="text-xs font-medium text-teal-700">
                            {reply.staffName} · {formatDate(reply.createdAt)}
                          </p>
                          <p className="mt-1 text-sm text-teal-800">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {fb.status === "open" && (
                  <div className="space-y-3">
                    {replyingId === fb.id ? (
                      <>
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Nhập phản hồi..."
                        />
                        <div className="flex gap-2">
                          <Button
                            className="bg-teal-500 hover:bg-teal-600"
                            onClick={() => handleReply(fb.id)}
                            disabled={isSending}>
                            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Gửi
                            phản hồi
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setReplyingId(null);
                              setReplyText("");
                            }}>
                            Hủy
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setReplyingId(fb.id)}>
                          <MessageSquare className="mr-1 h-3.5 w-3.5" /> Trả lời
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleResolve(fb.id)}>
                          <CheckCircle className="mr-1 h-3.5 w-3.5" /> Đánh dấu đã xử lý
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
