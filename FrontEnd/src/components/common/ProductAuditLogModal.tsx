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
  const isCreateAction = log.action === "CREATE";

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

        {/* Meta Information Card */}
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm md:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              Hành động
            </span>
            <Badge className={`w-fit ${actionColor}`}>{actionLabel}</Badge>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              Thời gian
            </span>
            <p className="text-sm font-semibold text-zinc-800">{formatDateTime(log.createdAt)}</p>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-1">
            <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              Người thực hiện
            </span>
            <p className="text-sm font-semibold text-zinc-800">{log.actorEmail || "—"}</p>
          </div>
        </div>

        <Separator />

        {formattedEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-gray-50 py-12">
            <ClipboardList className="h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">Không có dữ liệu thay đổi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {isCreateAction ? (
                  <>
                    Đã tạo <span className="text-teal-600">{formattedEntries.length}</span> trường
                  </>
                ) : (
                  <>
                    Đã thay đổi <span className="text-teal-600">{formattedEntries.length}</span>{" "}
                    trường
                  </>
                )}
              </p>
              {isCreateAction && (
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                  Tạo mới
                </Badge>
              )}
            </div>

            {/* Different layout for CREATE vs UPDATE/DELETE */}
            {isCreateAction ? (
              // Single column layout for CREATE action
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="grid grid-cols-[minmax(180px,1fr)_2fr] border-b bg-gradient-to-r from-teal-50 to-green-50 text-xs font-semibold tracking-wide text-zinc-700 uppercase">
                  <div className="px-4 py-3">Trường dữ liệu</div>
                  <div className="border-l border-gray-200 px-4 py-3 text-teal-700">Giá trị</div>
                </div>

                {formattedEntries.map((entry, idx) => (
                  <div
                    key={entry.key}
                    className={`grid grid-cols-[minmax(180px,1fr)_2fr] border-b border-gray-100 text-sm transition-colors last:border-0 hover:bg-gray-50/50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}>
                    <div className="flex items-center gap-2 px-4 py-3.5 font-semibold text-zinc-800">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                      {entry.fieldLabel}
                    </div>

                    <div className="border-l border-gray-200 px-4 py-3.5">
                      <p className="font-medium break-all whitespace-pre-wrap text-zinc-700">
                        {entry.after}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Three column layout for UPDATE/DELETE actions
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="grid grid-cols-[minmax(160px,1fr)_1.2fr_1.2fr] border-b bg-gradient-to-r from-gray-50 to-zinc-50 text-xs font-semibold tracking-wide text-zinc-700 uppercase">
                  <div className="px-4 py-3">Trường dữ liệu</div>
                  <div className="border-l border-gray-200 px-4 py-3 text-red-700">Giá trị cũ</div>
                  <div className="border-l border-gray-200 px-4 py-3 text-green-700">
                    Giá trị mới
                  </div>
                </div>

                {formattedEntries.map((entry, idx) => (
                  <div
                    key={entry.key}
                    className={`grid grid-cols-[minmax(160px,1fr)_1.2fr_1.2fr] border-b border-gray-100 text-sm transition-colors last:border-0 hover:bg-gray-50/30 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                    }`}>
                    <div className="flex items-center gap-2 px-4 py-3.5 font-semibold text-zinc-800">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                      {entry.fieldLabel}
                    </div>

                    <div className="border-l border-gray-200 bg-red-50/40 px-4 py-3.5">
                      <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-red-700 uppercase">
                        <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                        Trước
                      </span>
                      <p className="mt-1 break-all whitespace-pre-wrap text-red-800 line-through decoration-red-400/60 decoration-2">
                        {entry.before}
                      </p>
                    </div>

                    <div className="border-l border-gray-200 bg-green-50/40 px-4 py-3.5">
                      <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-green-700 uppercase">
                        <span className="inline-block h-1 w-1 rounded-full bg-green-500"></span>
                        Sau
                      </span>
                      <p className="mt-1 font-semibold break-all whitespace-pre-wrap text-green-900">
                        {entry.after}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose} className="min-w-24">
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
