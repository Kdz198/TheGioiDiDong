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
import { ClipboardList, Eye } from "lucide-react";
import { useState } from "react";

// Map English field names to Vietnamese (synchronized with Product Management page)
const FIELD_NAME_MAP: Record<string, string> = {
  // Basic info
  name: "Tên sản phẩm",
  description: "Mô tả",
  price: "Giá bán",
  stockQuantity: "Số lượng tồn kho",
  quantity: "Số lượng tồn kho",
  reserve: "Số lượng dự trữ",
  active: "Trạng thái hiển thị",
  type: "Loại",

  // Relations
  categoryId: "Danh mục",
  categoryName: "Tên danh mục",
  brandId: "Thương hiệu",
  brandName: "Tên thương hiệu",
  versionId: "Phiên bản",
  versionName: "Tên phiên bản",

  // Images
  imgUrl: "Ảnh chính",
  imgUrl2: "Ảnh 2",
  imgUrl3: "Ảnh 3",
  imgUrl4: "Ảnh 4",
  imgUrl5: "Ảnh 5",
  imgUrls: "Hình ảnh",

  // Metadata
  id: "Mã sản phẩm",
  createdAt: "Ngày tạo",
  updatedAt: "Ngày cập nhật",
};

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
  const formattedEntries = entries.map(([key, val]) => {
    const fieldLabel = FIELD_NAME_MAP[key] || key;

    if (val !== null && typeof val === "object") {
      const row = val as { before?: unknown; after?: unknown; old?: unknown; new?: unknown };
      const beforeValue = row.before ?? row.old ?? null;
      const afterValue = row.after ?? row.new ?? null;

      return {
        key,
        fieldLabel,
        before: beforeValue === null ? "—" : formatValue(beforeValue),
        after: afterValue === null ? "—" : formatValue(afterValue),
      };
    }

    return {
      key,
      fieldLabel,
      before: "—",
      after: formatValue(val),
    };
  });
  const actionLabel = ACTION_LABELS[log.action] ?? log.action;
  const actionColor = ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[88vh] w-[96vw] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
            <ClipboardList className="h-5 w-5 text-teal-500" />
            Chi tiết thay đổi
          </DialogTitle>
        </DialogHeader>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4 text-sm">
          <div>
            <span className="text-gray-500">Hành động</span>
            <p className="mt-1">
              <Badge className={actionColor}>{actionLabel}</Badge>
            </p>
          </div>
          <div>
            <span className="text-gray-500">Thời gian</span>
            <p className="mt-1 font-medium text-zinc-700">{formatDateTime(log.createdAt)}</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Người thực hiện</span>
            <p className="mt-1 font-medium text-zinc-700">{log.actorEmail || "—"}</p>
          </div>
        </div>

        <Separator />

        {formattedEntries.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Không có dữ liệu thay đổi.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">
              {formattedEntries.length} trường đã thay đổi
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="grid grid-cols-[minmax(160px,0.9fr)_1fr_1fr] border-b bg-zinc-50 text-xs font-semibold tracking-wide text-zinc-600 uppercase">
                <div className="px-3 py-2.5">Trường thay đổi</div>
                <div className="border-l border-gray-200 px-3 py-2.5 text-red-700">Giá trị cũ</div>
                <div className="border-l border-gray-200 px-3 py-2.5 text-green-700">
                  Giá trị mới
                </div>
              </div>

              {formattedEntries.map((entry) => (
                <div
                  key={entry.key}
                  className="grid grid-cols-[minmax(160px,0.9fr)_1fr_1fr] border-b border-gray-100 text-sm last:border-0">
                  <div className="min-w-0 bg-zinc-50/70 px-3 py-3 font-semibold wrap-break-word text-zinc-800">
                    {entry.fieldLabel}
                  </div>

                  <div className="min-w-0 border-l border-gray-100 bg-red-50/60 px-3 py-3">
                    <span className="mb-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                      Cũ
                    </span>
                    <p className="break-all whitespace-pre-wrap text-red-700 line-through decoration-1">
                      {entry.before}
                    </p>
                  </div>

                  <div className="min-w-0 border-l border-gray-100 bg-green-50/60 px-3 py-3">
                    <span className="mb-1 inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                      Mới
                    </span>
                    <p className="font-medium break-all whitespace-pre-wrap text-green-800">
                      {entry.after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ProductAuditChangeDetailsModalProps {
  log: ProductAuditLog | null;
  open: boolean;
  onClose: () => void;
}

export function ProductAuditChangeDetailsModal({
  log,
  open,
  onClose,
}: ProductAuditChangeDetailsModalProps) {
  if (!log) return null;
  return <ChangeDetailsPanel log={log} open={open} onClose={onClose} />;
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
      <DialogContent className="max-h-[92vh] w-[60vw] overflow-y-auto">
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
            <div className="overflow-x-auto pb-1">
              <table className="w-full min-w-190 table-fixed text-sm">
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
