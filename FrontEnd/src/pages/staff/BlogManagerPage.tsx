import { PaginationControl } from "@/components/shared/PaginationControl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePagination } from "@/hooks/usePagination";
import type { Blog, BlogPayload, BlogStatus, PageBlogResponse } from "@/interfaces/product.types";
import { blogService } from "@/services/blogService";
import { formatDateTime } from "@/utils/formatDate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Eye, FileUp, Loader2, Pencil, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const BLOG_FETCH_SIZE = 500;
const BLOG_DRAFT_KEY = "blog-manager-form-draft";

const STATUS_OPTIONS: Array<{ value: BlogStatus; label: string; className: string }> = [
  { value: "DRAFT", label: "Nháp", className: "bg-gray-100 text-gray-700" },
  { value: "PUBLISHED", label: "Đã xuất bản", className: "bg-green-100 text-green-700" },
  { value: "ARCHIVED", label: "Đã lưu trữ", className: "bg-orange-100 text-orange-700" },
];

const STATUS_FILTER_OPTIONS: Array<{ value: "ALL" | BlogStatus; label: string }> = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLISHED", label: "Đã xuất bản" },
  { value: "ARCHIVED", label: "Đã lưu trữ" },
];

const emptyForm: BlogPayload = {
  title: "",
  summary: "",
  content: "",
  thumbnailUrl: "",
  status: "DRAFT",
};

const getStatusMeta = (status: BlogStatus) =>
  STATUS_OPTIONS.find((item) => item.value === status) ?? STATUS_OPTIONS[0];

function stripHtml(content: string): string {
  return content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

function isDataImageUrl(value: string): boolean {
  return /^data:image\//i.test(value.trim());
}

function getDataImageSummary(dataUrl: string): string {
  const safeValue = dataUrl.trim();
  const meta = safeValue.split(",", 1)[0] ?? "data:image";
  const bytes = Math.floor((safeValue.length * 3) / 4);
  const kb = Math.max(1, Math.round(bytes / 1024));
  return `${meta},... (${kb}KB)`;
}

function sanitizeHtml(content: string): string {
  if (typeof window === "undefined") return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");

  doc.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach((node) => {
    node.remove();
  });

  doc.querySelectorAll("*").forEach((node) => {
    for (const attr of Array.from(node.attributes)) {
      const attrName = attr.name.toLowerCase();
      const attrValue = attr.value.trim().toLowerCase();
      if (attrName.startsWith("on")) {
        node.removeAttribute(attr.name);
      }
      if ((attrName === "href" || attrName === "src") && attrValue.startsWith("javascript:")) {
        node.removeAttribute(attr.name);
      }
    }
  });

  return doc.body.innerHTML;
}

function estimateReadTimeMinutes(content: string): number {
  const plainText = stripHtml(content);
  if (!plainText) return 0;
  const words = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function BlogManagerPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [showRawHtmlSource, setShowRawHtmlSource] = useState(false);
  const [formData, setFormData] = useState<BlogPayload>(emptyForm);
  const [initialFormSnapshot, setInitialFormSnapshot] = useState(JSON.stringify(emptyForm));
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | BlogStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState("createdAt,desc");
  const [showContentEditor, setShowContentEditor] = useState(true);
  const [showRawThumbnailValue, setShowRawThumbnailValue] = useState(false);
  const [previewImageError, setPreviewImageError] = useState(false);
  const [editPreviewImageError, setEditPreviewImageError] = useState(false);

  const emptyPagedData: PageBlogResponse = {
    totalElements: 0,
    totalPages: 1,
    numberOfElements: 0,
    size: pageSize,
    content: [],
    number: 0,
    first: true,
    last: true,
    empty: true,
  };

  const blogsQuery = useQuery({
    queryKey: ["blogs", sortOrder],
    queryFn: () =>
      blogService.getBlogs({
        page: 0,
        size: BLOG_FETCH_SIZE,
        sort: sortOrder,
      }),
  });

  const pagedData = blogsQuery.data ?? emptyPagedData;
  const filteredBlogs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return pagedData.content.filter((blog) => {
      const matchStatus = statusFilter === "ALL" || blog.status === statusFilter;
      if (!matchStatus) return false;
      if (!normalizedSearch) return true;

      const searchable = [blog.title, blog.summary, blog.author, stripHtml(blog.content)]
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalizedSearch);
    });
  }, [pagedData.content, searchTerm, statusFilter]);

  const pagination = usePagination({
    initialPage: currentPage,
    totalCount: filteredBlogs.length,
    pageSize,
    onPageChange: setCurrentPage,
  });

  const visibleBlogs = useMemo(() => {
    if (filteredBlogs.length === 0) return [];
    return filteredBlogs.slice(pagination.startIndex, pagination.endIndex + 1);
  }, [filteredBlogs, pagination.endIndex, pagination.startIndex]);

  const stats = useMemo(
    () => ({
      all: pagedData.content.length,
      draft: pagedData.content.filter((blog) => blog.status === "DRAFT").length,
      published: pagedData.content.filter((blog) => blog.status === "PUBLISHED").length,
      archived: pagedData.content.filter((blog) => blog.status === "ARCHIVED").length,
    }),
    [pagedData.content]
  );

  const contentWords = useMemo(() => {
    const plain = stripHtml(formData.content ?? "");
    if (!plain) return 0;
    return plain.split(/\s+/).filter(Boolean).length;
  }, [formData.content]);

  const estimatedReadMinutes = useMemo(
    () => estimateReadTimeMinutes(formData.content ?? ""),
    [formData.content]
  );

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!formData.title.trim()) errors.push("Tiêu đề không được để trống");
    if (formData.title.trim().length > 150) errors.push("Tiêu đề không vượt quá 150 ký tự");
    if (!formData.summary.trim()) errors.push("Tóm tắt không được để trống");
    if (formData.summary.trim().length > 300) errors.push("Tóm tắt không vượt quá 300 ký tự");
    if (!formData.content.trim()) errors.push("Nội dung không được để trống");
    return errors;
  }, [formData.content, formData.summary, formData.title]);

  const currentFormSnapshot = useMemo(() => JSON.stringify(formData), [formData]);
  const hasUnsavedChanges = dialogOpen && currentFormSnapshot !== initialFormSnapshot;

  const updateFormData = useCallback((updater: (_previous: BlogPayload) => BlogPayload) => {
    setFormData((previous) => updater(previous));
  }, []);

  const insertSnippet = useCallback(
    (snippet: string) => {
      updateFormData((previous) => ({
        ...previous,
        content: `${previous.content}\n${snippet}`.trim(),
      }));
    },
    [updateFormData]
  );

  const { mutate: createBlog, isPending: isCreating } = useMutation({
    mutationFn: (payload: BlogPayload) => blogService.createBlog(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Tạo bài viết thành công");
      setDialogOpen(false);
      setFormData(emptyForm);
      setInitialFormSnapshot(JSON.stringify(emptyForm));
      setEditingBlog(null);
      setShowContentEditor(true);
      setShowRawThumbnailValue(false);
      localStorage.removeItem(BLOG_DRAFT_KEY);
    },
    onError: () => toast.error("Không thể tạo bài viết"),
  });

  const { mutate: updateBlog, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BlogPayload }) =>
      blogService.updateBlog(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Cập nhật bài viết thành công");
      setDialogOpen(false);
      setFormData(emptyForm);
      setInitialFormSnapshot(JSON.stringify(emptyForm));
      setEditingBlog(null);
      setShowContentEditor(true);
      setShowRawThumbnailValue(false);
      localStorage.removeItem(BLOG_DRAFT_KEY);
    },
    onError: () => toast.error("Không thể cập nhật bài viết"),
  });

  const isSubmitting = isCreating || isUpdating;

  const openCreate = () => {
    const savedDraft = localStorage.getItem(BLOG_DRAFT_KEY);
    let nextForm = emptyForm;

    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as BlogPayload;
        if (
          parsed?.title !== undefined &&
          parsed?.summary !== undefined &&
          parsed?.content !== undefined
        ) {
          nextForm = {
            ...emptyForm,
            ...parsed,
          };
        }
      } catch {
        localStorage.removeItem(BLOG_DRAFT_KEY);
      }
    }

    setEditingBlog(null);
    setFormData(nextForm);
    setInitialFormSnapshot(JSON.stringify(nextForm));
    setShowContentEditor(true);
    setShowRawThumbnailValue(false);
    setEditPreviewImageError(false);
    setDialogOpen(true);
  };

  const openEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      summary: blog.summary,
      content: blog.content,
      thumbnailUrl: blog.thumbnailUrl,
      status: blog.status,
    });
    setInitialFormSnapshot(
      JSON.stringify({
        title: blog.title,
        summary: blog.summary,
        content: blog.content,
        thumbnailUrl: blog.thumbnailUrl,
        status: blog.status,
      })
    );
    setShowContentEditor(false);
    setShowRawThumbnailValue(false);
    setEditPreviewImageError(false);
    setDialogOpen(true);
  };

  const isFormValid = validationErrors.length === 0;

  const handleSave = useCallback(() => {
    if (!isFormValid || isSubmitting) return;

    if (editingBlog) {
      updateBlog({ id: editingBlog.id, payload: formData });
      return;
    }

    createBlog(formData);
  }, [createBlog, editingBlog, formData, isFormValid, isSubmitting, updateBlog]);

  const openPreview = (blog: Blog) => {
    setPreviewBlog(blog);
    setShowRawHtmlSource(false);
    setPreviewImageError(false);
    setPreviewDialogOpen(true);
  };

  const hasActiveFilters = statusFilter !== "ALL" || searchTerm.trim().length > 0;

  const contentPlainPreview = useMemo(
    () => truncateText(stripHtml(formData.content ?? ""), 260),
    [formData.content]
  );
  const thumbnailValue = formData.thumbnailUrl ?? "";
  const hasThumbnail = thumbnailValue.trim().length > 0;
  const isThumbnailDataImage = hasThumbnail && isDataImageUrl(thumbnailValue);
  const visibleThumbnailInputValue =
    isThumbnailDataImage && !showRawThumbnailValue
      ? getDataImageSummary(thumbnailValue)
      : thumbnailValue;
  const sanitizedPreviewHtml = useMemo(
    () => sanitizeHtml(previewBlog?.content ?? ""),
    [previewBlog?.content]
  );

  useEffect(() => {
    if (!dialogOpen || editingBlog) return;
    localStorage.setItem(BLOG_DRAFT_KEY, JSON.stringify(formData));
  }, [dialogOpen, editingBlog, formData]);

  useEffect(() => {
    if (!dialogOpen || !hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dialogOpen, hasUnsavedChanges]);

  useEffect(() => {
    const handleKeyboardSave = (event: KeyboardEvent) => {
      if (!dialogOpen) return;
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      if (isFormValid && !isSubmitting) {
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyboardSave);
    return () => window.removeEventListener("keydown", handleKeyboardSave);
  }, [dialogOpen, handleSave, isFormValid, isSubmitting]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    maxFiles: 1,
    accept: {
      "image/*": [],
    },
    onDropAccepted: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        updateFormData((previous) => ({ ...previous, thumbnailUrl: result }));
        setEditPreviewImageError(false);
      };
      reader.onerror = () => {
        toast.error("Không thể đọc tệp ảnh");
      };
      reader.readAsDataURL(file);
    },
    onDropRejected: () => {
      toast.error("Chỉ hỗ trợ tải lên 1 ảnh hợp lệ");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý bài viết</h1>
        <Button className="bg-teal-500 hover:bg-teal-600" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Thêm bài viết
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Tổng bài viết</p>
            <p className="mt-1 text-xl font-semibold text-zinc-900">{stats.all}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Nháp</p>
            <p className="mt-1 text-xl font-semibold text-gray-700">{stats.draft}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Đã xuất bản</p>
            <p className="mt-1 text-xl font-semibold text-green-700">{stats.published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Lưu trữ</p>
            <p className="mt-1 text-xl font-semibold text-orange-700">{stats.archived}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                  pagination.setPage(1);
                }}
                placeholder="Tìm theo tiêu đề, tóm tắt, tác giả"
                className="pl-10"
              />
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
              <Select
                value={statusFilter}
                onValueChange={(value: "ALL" | BlogStatus) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                  pagination.setPage(1);
                }}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortOrder}
                onValueChange={(value) => {
                  setSortOrder(value);
                  setCurrentPage(1);
                  pagination.setPage(1);
                }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt,desc">Mới nhất trước</SelectItem>
                  <SelectItem value="createdAt,asc">Cũ nhất trước</SelectItem>
                  <SelectItem value="title,asc">Tiêu đề A-Z</SelectItem>
                  <SelectItem value="title,desc">Tiêu đề Z-A</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                    setCurrentPage(1);
                    pagination.setPage(1);
                  }}>
                  Xóa lọc
                </Button>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Hiển thị {filteredBlogs.length} kết quả
            {searchTerm.trim() && ` cho từ khóa "${searchTerm.trim()}"`}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-3 py-3 font-medium text-gray-500">Bài viết</th>
                  <th className="px-3 py-3 font-medium text-gray-500">Tác giả</th>
                  <th className="px-3 py-3 font-medium text-gray-500">Trạng thái</th>
                  <th className="px-3 py-3 font-medium text-gray-500">Ngày tạo</th>
                  <th className="px-3 py-3 text-right font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {blogsQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={5} className="px-3 py-3">
                        <div className="h-8 animate-pulse rounded bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : visibleBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                      {searchTerm.trim() || statusFilter !== "ALL"
                        ? "Không tìm thấy bài viết phù hợp"
                        : "Chưa có bài viết nào"}
                    </td>
                  </tr>
                ) : (
                  visibleBlogs.map((blog) => {
                    const statusMeta = getStatusMeta(blog.status);
                    return (
                      <tr key={blog.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="flex items-start gap-3">
                            {blog.thumbnailUrl ? (
                              <img
                                src={blog.thumbnailUrl}
                                alt={blog.title}
                                className="h-12 w-12 rounded-md border border-gray-100 object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-md border border-dashed border-gray-200 bg-gray-50" />
                            )}
                            <div className="min-w-0 space-y-1">
                              <p className="line-clamp-1 font-medium text-zinc-900">{blog.title}</p>
                              <p className="line-clamp-1 text-xs text-gray-500">{blog.summary}</p>
                              <p className="line-clamp-1 text-xs text-gray-400">
                                {truncateText(stripHtml(blog.content), 90)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-600">{blog.author || "Không rõ"}</td>
                        <td className="px-3 py-3">
                          <Badge variant="secondary" className={statusMeta.className}>
                            {statusMeta.label}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {formatDateTime(blog.createdAt)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-600 hover:text-gray-800"
                              onClick={() => openPreview(blog)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-teal-600 hover:text-teal-700"
                              onClick={() => openEdit(blog)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <PaginationControl
            pagination={pagination}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            showPageSizeSelector
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
              pagination.setPage(1);
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewBlog?.title ?? "Xem nhanh bài viết"}</DialogTitle>
          </DialogHeader>

          {previewBlog ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>Tác giả: {previewBlog.author || "Không rõ"}</span>
                <span>•</span>
                <span>{formatDateTime(previewBlog.createdAt)}</span>
                <Badge variant="secondary" className={getStatusMeta(previewBlog.status).className}>
                  {getStatusMeta(previewBlog.status).label}
                </Badge>
              </div>

              {previewBlog.thumbnailUrl ? (
                <div className="overflow-hidden rounded-md border border-gray-100 bg-stone-100">
                  {!previewImageError ? (
                    <img
                      src={previewBlog.thumbnailUrl}
                      alt={previewBlog.title}
                      className="h-56 w-full object-contain"
                      onError={() => setPreviewImageError(true)}
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center px-4 text-center text-sm text-gray-500">
                      Không thể hiển thị ảnh đại diện từ nguồn hiện tại
                    </div>
                  )}
                </div>
              ) : null}

              <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                <p className="mb-1 text-xs font-medium text-gray-500">Tóm tắt</p>
                <p className="text-sm text-gray-700">{previewBlog.summary || "Không có tóm tắt"}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">Nội dung (xem như bài đăng)</p>
                <div className="max-h-64 overflow-y-auto rounded-md border border-gray-100 bg-white p-3 text-sm text-gray-700">
                  {sanitizedPreviewHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: sanitizedPreviewHtml }} />
                  ) : (
                    "Không có nội dung"
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium text-gray-500">Nội dung gốc (HTML)</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRawHtmlSource((prev) => !prev)}>
                      {showRawHtmlSource ? "Ẩn mã nguồn" : "Xem mã nguồn"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(previewBlog.content || "");
                          toast.success("Đã sao chép nội dung HTML");
                        } catch {
                          toast.error("Không thể sao chép nội dung HTML");
                        }
                      }}>
                      Sao chép mã
                    </Button>
                  </div>
                </div>
                {showRawHtmlSource && (
                  <pre className="max-h-48 overflow-auto rounded-md border border-gray-100 bg-zinc-950/95 p-3 text-xs text-zinc-200">
                    {previewBlog.content || ""}
                  </pre>
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Đóng
            </Button>
            {previewBlog ? (
              <Button
                className="bg-teal-500 hover:bg-teal-600"
                onClick={() => {
                  setPreviewDialogOpen(false);
                  openEdit(previewBlog);
                }}>
                Chỉnh sửa
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && hasUnsavedChanges) {
            const shouldDiscard = window.confirm(
              "Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng?"
            );
            if (!shouldDiscard) return;
          }
          setDialogOpen(nextOpen);
        }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBlog ? "Chỉnh sửa bài viết" : "Thêm bài viết"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-teal-100 bg-teal-50 px-3 py-2 text-xs text-teal-700">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>{contentWords} từ</span>
                <span>•</span>
                <span>{estimatedReadMinutes} phút đọc</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{hasUnsavedChanges ? "Có thay đổi chưa lưu" : "Đã đồng bộ"}</span>
                <span className="font-medium">Ctrl/Cmd + S để lưu</span>
              </div>
            </div>

            {validationErrors.length > 0 ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                {validationErrors.map((error) => (
                  <p key={error}>• {error}</p>
                ))}
              </div>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input
                    id="title"
                    maxLength={150}
                    value={formData.title}
                    onChange={(event) =>
                      updateFormData((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Nhập tiêu đề bài viết"
                  />
                  <p className="text-right text-xs text-gray-400">{formData.title.length}/150</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Tóm tắt</Label>
                  <Textarea
                    id="summary"
                    rows={3}
                    maxLength={300}
                    value={formData.summary}
                    onChange={(event) =>
                      updateFormData((prev) => ({ ...prev, summary: event.target.value }))
                    }
                    placeholder="Nhập tóm tắt ngắn"
                  />
                  <p className="text-right text-xs text-gray-400">{formData.summary.length}/300</p>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="content">Nội dung</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowContentEditor((prev) => !prev)}>
                      {showContentEditor ? "Thu gọn trình chỉnh sửa" : "Mở trình chỉnh sửa"}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => insertSnippet("<h2>Tiêu đề phụ</h2>")}>
                      Tiêu đề phụ
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => insertSnippet("<p><strong>Nội dung nhấn mạnh</strong></p>")}>
                      Nhấn mạnh
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => insertSnippet("<ul>\n  <li>Ý 1</li>\n  <li>Ý 2</li>\n</ul>")}>
                      Danh sách
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => insertSnippet("<blockquote>Trích dẫn nổi bật</blockquote>")}>
                      Trích dẫn
                    </Button>
                  </div>
                  <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                    <p className="mb-1 text-xs font-medium text-gray-500">Xem nhanh nội dung</p>
                    <p className="line-clamp-4 text-sm text-gray-600">
                      {contentPlainPreview || "Chưa có nội dung"}
                    </p>
                  </div>
                  {showContentEditor && (
                    <>
                      <Textarea
                        id="content"
                        rows={12}
                        value={formData.content}
                        onChange={(event) =>
                          updateFormData((prev) => ({ ...prev, content: event.target.value }))
                        }
                        placeholder="Nhập nội dung bài viết (HTML hoặc văn bản thường)"
                        className="font-mono text-xs leading-5"
                      />
                      <p className="text-right text-xs text-gray-400">
                        {formData.content.length} ký tự
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={formData.status ?? "DRAFT"}
                    onValueChange={(value: BlogStatus) =>
                      updateFormData((prev) => ({ ...prev, status: value }))
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">Ảnh đại diện (URL hoặc kéo thả)</Label>
                  <Input
                    id="thumbnailUrl"
                    value={visibleThumbnailInputValue}
                    readOnly={isThumbnailDataImage && !showRawThumbnailValue}
                    onChange={(event) =>
                      updateFormData((prev) => ({ ...prev, thumbnailUrl: event.target.value }))
                    }
                    placeholder="https://... hoặc data:image/..."
                  />

                  <div
                    {...getRootProps()}
                    className={`cursor-pointer rounded-md border border-dashed px-3 py-5 text-center text-xs transition-colors ${
                      isDragActive
                        ? "border-teal-400 bg-teal-50 text-teal-700"
                        : "border-gray-200 bg-gray-50 text-gray-500"
                    }`}>
                    <input {...getInputProps()} />
                    <FileUp className="mx-auto mb-1 h-4 w-4" />
                    {isDragActive ? "Thả ảnh vào đây" : "Kéo thả ảnh hoặc bấm để chọn tệp"}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isThumbnailDataImage && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowRawThumbnailValue((prev) => !prev)}>
                        {showRawThumbnailValue ? "Ẩn chuỗi gốc" : "Hiện chuỗi gốc"}
                      </Button>
                    )}
                    {hasThumbnail && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateFormData((prev) => ({ ...prev, thumbnailUrl: "" }));
                          setShowRawThumbnailValue(false);
                        }}>
                        Xóa ảnh
                      </Button>
                    )}
                  </div>

                  {isThumbnailDataImage && !showRawThumbnailValue && (
                    <p className="text-xs text-gray-500">
                      Chuỗi data:image đã được rút gọn để dễ nhìn.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Xem trước ảnh đại diện</Label>
                  {hasThumbnail ? (
                    <div className="overflow-hidden rounded-md border border-gray-100 bg-stone-100">
                      {!editPreviewImageError ? (
                        <img
                          src={thumbnailValue}
                          alt="Ảnh đại diện bài viết"
                          className="h-44 w-full object-contain"
                          onError={() => setEditPreviewImageError(true)}
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center text-sm text-gray-500">
                          Không thể hiển thị ảnh từ nguồn hiện tại
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                      Chưa có ảnh đại diện
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-teal-500 hover:bg-teal-600"
              onClick={handleSave}
              disabled={!isFormValid || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
