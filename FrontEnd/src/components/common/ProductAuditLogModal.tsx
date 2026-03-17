import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductAuditLog } from "@/interfaces/product.types";
import { productService } from "@/services/productService";
import { formatDateTime } from "@/utils/formatDate";
import { formatValue } from "@/utils/formatValue";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ClipboardList, Eye } from "lucide-react";
import { useState } from "react";

interface ProductAuditLogModalProps {
  productId: number | null;
  productName?: string;
  open: boolean;
  onClose: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  ACTIVATE: "Kích hoạt",
  DEACTIVATE: "Ẩn",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  ACTIVATE: "bg-teal-100 text-teal-700",
  DEACTIVATE: "bg-gray-100 text-gray-500",
};

// ── Nested Change Details Dialog ───────────────────────────────────────────

interface ChangeDetailsPanelProps {
  log: ProductAuditLog;
  open: boolean;
  onClose: () => void;
}

function ChangeDetailsPanel({ log, open, onClose }: ChangeDetailsPanelProps) {
  const entries = Object.entries(log.changes ?? {});
  const actionLabel = ACTION_LABELS[log.action] ?? log.action;
  const actionColor = ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-zinc-900">
            <ClipboardList className="h-4 w-4 text-teal-500" />
            Chi tiết thay đổi
          </DialogTitle>
        </DialogHeader>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-xs">
          <div>
            <span className="text-gray-400">Hành động</span>
            <p className="mt-0.5">
              <Badge className={actionColor}>{actionLabel}</Badge>
            </p>
          </div>
          <div>
            <span className="text-gray-400">Thời gian</span>
            <p className="mt-0.5 font-medium text-zinc-700">{formatDateTime(log.createdAt)}</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-400">Người thực hiện</span>
            <p className="mt-0.5 font-medium text-zinc-700">{log.actorEmail || "—"}</p>
          </div>
        </div>

        <Separator />

        {entries.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">Không có dữ liệu thay đổi.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">{entries.length} trường thay đổi</p>
            {entries.map(([key, val]) => {
              if (val !== null && typeof val === "object" && "before" in val && "after" in val) {
                const before = formatValue((val as { before: unknown }).before);
                const after = formatValue((val as { after: unknown }).after);
                return (
                  <div
                    key={key}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <div className="border-b bg-gray-50 px-3 py-2">
                      <span className="text-xs font-semibold text-zinc-700">{key}</span>
                    </div>
                    <div className="grid grid-cols-[1fr,auto,1fr]">
                      <div className="bg-red-50/50 p-3">
                        <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-red-400 uppercase">
                          Trước
                        </p>
                        <p className="text-xs break-words whitespace-pre-wrap text-red-600 line-through">
                          {before}
                        </p>
                      </div>
                      <div className="flex items-center justify-center border-x border-gray-200 bg-white px-2">
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      </div>
                      <div className="bg-green-50/50 p-3">
                        <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-green-500 uppercase">
                          Sau
                        </p>
                        <p className="text-xs font-medium break-words whitespace-pre-wrap text-green-700">
                          {after}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={key}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                  <span className="min-w-[6rem] shrink-0 text-xs font-semibold text-zinc-600">
                    {key}
                  </span>
                  <span className="text-xs break-words whitespace-pre-wrap text-gray-600">
                    {formatValue(val)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Row ────────────────────────────────────────────────────────────────────

function AuditLogRow({ log }: { log: ProductAuditLog }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const actionLabel = ACTION_LABELS[log.action] ?? log.action;
  const actionColor = ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600";
  const hasChanges = log.changes && Object.keys(log.changes).length > 0;

  return (
    <>
      <tr className="border-b transition-colors last:border-0 hover:bg-gray-50/80">
        <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-500">
          {formatDateTime(log.createdAt)}
        </td>
        <td className="px-4 py-3">
          <Badge className={actionColor}>{actionLabel}</Badge>
        </td>
        <td className="px-4 py-3 text-sm text-zinc-700">{log.actorEmail || "—"}</td>
        <td className="px-4 py-3">
          {hasChanges ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs text-teal-600 hover:bg-teal-50 hover:text-teal-700"
              onClick={() => setDetailOpen(true)}>
              <Eye className="h-3 w-3" />
              Xem chi tiết ({Object.keys(log.changes).length})
            </Button>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </td>
      </tr>
      {hasChanges && (
        <ChangeDetailsPanel log={log} open={detailOpen} onClose={() => setDetailOpen(false)} />
      )}
    </>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────────────

function ModalSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b last:border-0">
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-28" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-5 w-20 rounded-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-36" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-7 w-28 rounded-md" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────

export function ProductAuditLogModal({
  productId,
  productName,
  open,
  onClose,
}: ProductAuditLogModalProps) {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["audit-log", "product", productId, page, PAGE_SIZE],
    queryFn: () => productService.getProductAuditLogs(productId!, { page, size: PAGE_SIZE }),
    enabled: open && productId !== null,
  });

  const logs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setPage(0);
          onClose();
        }
      }}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-zinc-900">
            <ClipboardList className="h-4 w-4 text-teal-500" />
            Lịch sử thay đổi —{" "}
            <span className="text-teal-600">{productName ?? `Sản phẩm #${productId}`}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-2 font-medium text-gray-500">Thời gian</th>
                  <th className="px-4 py-2 font-medium text-gray-500">Hành động</th>
                  <th className="px-4 py-2 font-medium text-gray-500">Người thực hiện</th>
                  <th className="px-4 py-2 font-medium text-gray-500">Chi tiết thay đổi</th>
                </tr>
              </thead>
              <tbody>
                <ModalSkeleton />
              </tbody>
            </table>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
            <ClipboardList className="h-8 w-8 opacity-30" />
            <p className="text-sm">Chưa có lịch sử thay đổi.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500">
              Tổng cộng <span className="font-semibold text-zinc-700">{totalElements}</span> bản ghi
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50 text-left">
                    <th className="px-4 py-2 font-medium text-gray-500">Thời gian</th>
                    <th className="px-4 py-2 font-medium text-gray-500">Hành động</th>
                    <th className="px-4 py-2 font-medium text-gray-500">Người thực hiện</th>
                    <th className="px-4 py-2 font-medium text-gray-500">Chi tiết thay đổi</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <AuditLogRow key={log.id} log={log} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-xs text-gray-500">
                  Trang {page + 1} / {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}>
                    Trước
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                    const pageNum = start + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        size="icon"
                        className={`h-8 w-8 text-xs ${pageNum === page ? "bg-teal-500 hover:bg-teal-600" : ""}`}
                        onClick={() => setPage(pageNum)}>
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
