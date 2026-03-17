import { PaginationControl } from "@/components/shared/PaginationControl";
import { SortButton, type SortDirection } from "@/components/shared/SortButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagination } from "@/hooks/usePagination";
import type { ProductAuditLog } from "@/interfaces/product.types";
import { productService } from "@/services/productService";
import { formatDateTime } from "@/utils/formatDate";
import { formatValue } from "@/utils/formatValue";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowDownUp,
  ArrowRight,
  ClipboardList,
  Eye,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

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

const ALL_ACTIONS_VALUE = "ALL";
const ACTION_OPTIONS = [ALL_ACTIONS_VALUE, "CREATE", "UPDATE", "DELETE", "ACTIVATE", "DEACTIVATE"];

// ── Change Details Dialog ──────────────────────────────────────────────────

interface ChangeDetailsDialogProps {
  log: ProductAuditLog;
  open: boolean;
  onClose: () => void;
}

function ChangeDetailsDialog({ log, open, onClose }: ChangeDetailsDialogProps) {
  const entries = Object.entries(log.changes ?? {});
  const actionLabel = ACTION_LABELS[log.action] ?? log.action;
  const actionColor = ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-zinc-900">
            <ClipboardList className="h-4 w-4 text-teal-500" />
            Chi tiết thay đổi
          </DialogTitle>
        </DialogHeader>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-xs">
          <div>
            <span className="text-gray-400">Mã sản phẩm</span>
            <p className="mt-0.5 font-semibold text-zinc-700">#{log.productId}</p>
          </div>
          <div>
            <span className="text-gray-400">Hành động</span>
            <p className="mt-0.5">
              <Badge className={actionColor}>{actionLabel}</Badge>
            </p>
          </div>
          <div>
            <span className="text-gray-400">Người thực hiện</span>
            <p className="mt-0.5 font-medium text-zinc-700">{log.actorEmail || "—"}</p>
          </div>
          <div>
            <span className="text-gray-400">Thời gian</span>
            <p className="mt-0.5 font-medium text-zinc-700">{formatDateTime(log.createdAt)}</p>
          </div>
        </div>

        <Separator />

        {/* Change entries */}
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

// ── Table Row ──────────────────────────────────────────────────────────────

function AuditTableRow({ log }: { log: ProductAuditLog }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const actionLabel = ACTION_LABELS[log.action] ?? log.action;
  const actionColor = ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600";
  const hasChanges = log.changes && Object.keys(log.changes).length > 0;

  return (
    <>
      <tr className="border-b transition-colors last:border-0 hover:bg-gray-50/80">
        <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-500">
          {formatDateTime(log.createdAt)}
        </td>
        <td className="px-4 py-3 text-sm font-medium text-zinc-700">#{log.productId}</td>
        <td className="px-4 py-3">
          <Badge className={actionColor}>{actionLabel}</Badge>
        </td>
        <td className="px-4 py-3 text-sm text-zinc-600">{log.actorEmail || "—"}</td>
        <td className="px-4 py-3">
          {hasChanges ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs text-teal-600 hover:bg-teal-50 hover:text-teal-700"
              onClick={() => setDialogOpen(true)}>
              <Eye className="h-3 w-3" />
              Xem chi tiết ({Object.keys(log.changes).length})
            </Button>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </td>
      </tr>
      {hasChanges && (
        <ChangeDetailsDialog log={log} open={dialogOpen} onClose={() => setDialogOpen(false)} />
      )}
    </>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b last:border-0">
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-32" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-12" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-5 w-20 rounded-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-40" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-7 w-28 rounded-md" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ── Filters ────────────────────────────────────────────────────────────────

interface Filters {
  productId: string;
  accountId: string;
  action: string;
  fromDate: Date | undefined;
  toDate: Date | undefined;
}

const EMPTY_FILTERS: Filters = {
  productId: "",
  accountId: "",
  action: ALL_ACTIONS_VALUE,
  fromDate: undefined,
  toDate: undefined,
};

export function AdminAuditLogPage() {
  const [draftFilters, setDraftFilters] = useState<Filters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortDir, setSortDir] = useState<SortDirection>("none");

  function buildQueryFilters(f: Filters) {
    return {
      productId: f.productId ? Number(f.productId) : undefined,
      accountId: f.accountId || undefined,
      action: f.action !== ALL_ACTIONS_VALUE ? f.action : undefined,
      fromDate: f.fromDate ? format(f.fromDate, "yyyy-MM-dd") : undefined,
      toDate: f.toDate ? format(f.toDate, "yyyy-MM-dd") : undefined,
    };
  }

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["audit-log", "master", appliedFilters, page, pageSize],
    queryFn: () =>
      productService.getMasterAuditLogs(buildQueryFilters(appliedFilters), {
        page,
        size: pageSize,
      }),
  });

  const totalElements = data?.totalElements ?? 0;

  // Client-side sort on current page (server already returns sorted data)
  const sortedLogs = useMemo(() => {
    const logs = data?.content ?? [];
    if (sortDir === "none") return logs;
    return [...logs].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === "asc" ? diff : -diff;
    });
  }, [data, sortDir]);

  const pagination = usePagination({
    totalCount: totalElements,
    pageSize,
    initialPage: page + 1,
    onPageChange: (p) => setPage(p - 1),
  });

  const hasActiveFilters =
    !!appliedFilters.productId ||
    !!appliedFilters.accountId ||
    appliedFilters.action !== ALL_ACTIONS_VALUE ||
    !!appliedFilters.fromDate ||
    !!appliedFilters.toDate;

  function handleApply() {
    setPage(0);
    setAppliedFilters({ ...draftFilters });
  }

  function handleReset() {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(0);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-900">
            <ArrowDownUp className="h-6 w-6 text-teal-500" />
            Nhật ký thay đổi sản phẩm
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi toàn bộ lịch sử thêm, sửa, xóa sản phẩm trong hệ thống
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2">
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Làm mới
        </Button>
      </div>

      {/* Filter panel */}
      <Card>
        <CardHeader className="pt-4 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <Filter className="h-4 w-4 text-teal-500" />
            Bộ lọc tìm kiếm
            {hasActiveFilters && (
              <Badge className="ml-1 bg-teal-100 text-teal-700 hover:bg-teal-100">Đang lọc</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500">Mã sản phẩm</Label>
              <Input
                placeholder="VD: 123"
                value={draftFilters.productId}
                onChange={(e) => setDraftFilters((f) => ({ ...f, productId: e.target.value }))}
                type="number"
                min={0}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500">Email người thực hiện</Label>
              <Input
                placeholder="Nhập email..."
                value={draftFilters.accountId}
                onChange={(e) => setDraftFilters((f) => ({ ...f, accountId: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500">Loại hành động</Label>
              <Select
                value={draftFilters.action}
                onValueChange={(v) => setDraftFilters((f) => ({ ...f, action: v }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt === ALL_ACTIONS_VALUE ? "Tất cả hành động" : (ACTION_LABELS[opt] ?? opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500">Từ ngày</Label>
              <DatePicker
                value={draftFilters.fromDate}
                onChange={(d) => setDraftFilters((f) => ({ ...f, fromDate: d }))}
                placeholder="Chọn ngày bắt đầu"
                maxDate={draftFilters.toDate}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500">Đến ngày</Label>
              <DatePicker
                value={draftFilters.toDate}
                onChange={(d) => setDraftFilters((f) => ({ ...f, toDate: d }))}
                placeholder="Chọn ngày kết thúc"
                minDate={draftFilters.fromDate}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="h-9 bg-teal-500 hover:bg-teal-600" onClick={handleApply}>
              <Search className="mr-2 h-4 w-4" /> Tìm kiếm
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" className="h-9 gap-1.5" onClick={handleReset}>
                <X className="h-4 w-4" /> Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium text-gray-500">Thời gian</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Mã SP</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Hành động</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Người thực hiện</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Chi tiết thay đổi</th>
                  </tr>
                </thead>
                <tbody>
                  <TableSkeleton />
                </tbody>
              </table>
            </div>
          ) : sortedLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
              <ClipboardList className="h-10 w-10 opacity-30" />
              <p className="text-sm">Không tìm thấy bản ghi nào.</p>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 text-teal-600"
                  onClick={handleReset}>
                  Xóa bộ lọc để xem tất cả
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="text-xs text-gray-500">
                  Tìm thấy <span className="font-semibold text-zinc-700">{totalElements}</span> bản
                  ghi
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/50 text-left">
                      <th className="px-4 py-3">
                        <SortButton direction={sortDir} onChange={(dir) => setSortDir(dir)}>
                          Thời gian
                        </SortButton>
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-500">Mã SP</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Hành động</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Người thực hiện</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Chi tiết thay đổi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLogs.map((log) => (
                      <AuditTableRow key={log.id} log={log} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && totalElements > 0 && (
        <PaginationControl
          pagination={pagination}
          pageSizeOptions={[10, 20, 50, 100]}
          showPageSizeSelector
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
        />
      )}
    </div>
  );
}
