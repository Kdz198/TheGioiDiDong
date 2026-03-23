import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { Blog, BlogPayload, BlogStatus } from "@/interfaces/product.types";
import { ROUTES } from "@/router/routes.const";
import { blogService } from "@/services/blogService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileUp, Loader2 } from "lucide-react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const STATUS_OPTIONS: Array<{ value: BlogStatus; label: string }> = [
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

function stripHtml(content: string): string {
  return content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHtml(content: string): string {
  const normalized = content.trim();
  if (normalized === "<p><br></p>") return "";
  return normalized;
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

function buildDraftKey(isAdminPath: boolean, blogId?: string): string {
  const rolePrefix = isAdminPath ? "admin" : "staff";
  return `${rolePrefix}-blog-form-draft-${blogId ?? "create"}`;
}

interface BlogContentEditorProps {
  value: string;
  onChange: (_value: string) => void;
}

function BlogContentEditor({ value, onChange }: BlogContentEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const lastEditorHtmlRef = useRef("");

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ header: [1, 2, 3, false] }],
          ["image", "link"],
          ["clean"],
        ],
      },
    });

    const toolbar = quill.getModule("toolbar");
    toolbar.addHandler("image", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.click();

      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          const imageBase64 = typeof reader.result === "string" ? reader.result : "";
          if (!imageBase64) return;

          const range = quill.getSelection(true);
          quill.insertEmbed(range?.index ?? quill.getLength(), "image", imageBase64, "user");
        };
        reader.onerror = () => {
          toast.error("Không thể đọc tệp ảnh trong trình soạn thảo");
        };
        reader.readAsDataURL(file);
      };
    });

    quill.on("text-change", () => {
      const normalized = normalizeHtml(quill.root.innerHTML);
      lastEditorHtmlRef.current = normalized;
      onChange(normalized);
    });

    const initialHtml = normalizeHtml(value);
    quill.clipboard.dangerouslyPasteHTML(initialHtml || "<p><br></p>");
    lastEditorHtmlRef.current = normalizeHtml(quill.root.innerHTML);

    quillRef.current = quill;
  }, [onChange, value]);

  useEffect(() => {
    if (!quillRef.current) return;

    const nextHtml = normalizeHtml(value);
    if (lastEditorHtmlRef.current === nextHtml) return;

    quillRef.current.clipboard.dangerouslyPasteHTML(nextHtml || "<p><br></p>");
    lastEditorHtmlRef.current = normalizeHtml(quillRef.current.root.innerHTML);
  }, [value]);

  return <div ref={editorRef} className="min-h-72 bg-white" />;
}

export function BlogFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { blogId } = useParams<{ blogId: string }>();
  const routeState = location.state as { blog?: Blog } | null;

  const isAdminPath = location.pathname.startsWith("/admin");
  const isEditMode = Boolean(blogId);
  const listRoute = isAdminPath ? ROUTES.ADMIN_BLOGS : ROUTES.STAFF_BLOGS;
  const previewRouteTemplate = isAdminPath ? ROUTES.ADMIN_BLOG_PREVIEW : ROUTES.STAFF_BLOG_PREVIEW;
  const draftKey = buildDraftKey(isAdminPath, blogId);
  const blogIdNumber = Number(blogId);
  const hasValidBlogId = Number.isFinite(blogIdNumber) && blogIdNumber > 0;

  const initialCreateForm = useMemo(() => {
    if (isEditMode) return emptyForm;
    const savedDraft = localStorage.getItem(draftKey);
    if (!savedDraft) return emptyForm;

    try {
      const parsed = JSON.parse(savedDraft) as BlogPayload;
      return { ...emptyForm, ...parsed };
    } catch {
      localStorage.removeItem(draftKey);
      return emptyForm;
    }
  }, [draftKey, isEditMode]);

  const [showRawThumbnailValue, setShowRawThumbnailValue] = useState(false);
  const [previewImageError, setPreviewImageError] = useState(false);
  const [formOverridesByKey, setFormOverridesByKey] = useState<
    Record<string, Partial<BlogPayload>>
  >({});

  const routeBlog =
    routeState?.blog && hasValidBlogId && routeState.blog.id === blogIdNumber
      ? routeState.blog
      : null;

  const blogDetailQuery = useQuery({
    queryKey: ["blogs", "edit-source", blogIdNumber],
    enabled: isEditMode && hasValidBlogId,
    queryFn: () => blogService.getBlogById(blogIdNumber),
    initialData: routeBlog ?? undefined,
  });

  const editingBlog = useMemo(() => {
    if (!isEditMode) return null;
    return blogDetailQuery.data ?? routeBlog;
  }, [blogDetailQuery.data, isEditMode, routeBlog]);

  const editBaseForm = useMemo(() => {
    if (!isEditMode) return null;
    if (!editingBlog) return null;

    return {
      title: editingBlog.title,
      summary: editingBlog.summary,
      content: editingBlog.content,
      thumbnailUrl: editingBlog.thumbnailUrl,
      status: editingBlog.status,
    };
  }, [editingBlog, isEditMode]);

  const formScopeKey = useMemo(
    () => `${isAdminPath ? "admin" : "staff"}-${isEditMode ? `edit-${blogIdNumber}` : "create"}`,
    [blogIdNumber, isAdminPath, isEditMode]
  );

  const baseFormData = useMemo(
    () => (isEditMode ? (editBaseForm ?? emptyForm) : initialCreateForm),
    [editBaseForm, initialCreateForm, isEditMode]
  );

  const formData = useMemo(
    () => ({ ...emptyForm, ...baseFormData, ...(formOverridesByKey[formScopeKey] ?? {}) }),
    [baseFormData, formOverridesByKey, formScopeKey]
  );

  const updateFormData = useCallback(
    (updater: (_previous: BlogPayload) => BlogPayload) => {
      setFormOverridesByKey((previousByKey) => {
        const currentScopedValue = {
          ...emptyForm,
          ...baseFormData,
          ...(previousByKey[formScopeKey] ?? {}),
        };
        const nextValue = updater(currentScopedValue);
        return {
          ...previousByKey,
          [formScopeKey]: { ...emptyForm, ...nextValue },
        };
      });
    },
    [baseFormData, formScopeKey]
  );

  const handleContentChange = useCallback(
    (nextHtml: string) => {
      updateFormData((prev) => ({
        ...prev,
        content: nextHtml,
      }));
    },
    [updateFormData]
  );

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!formData.title.trim()) errors.push("Tiêu đề không được để trống");
    if (formData.title.trim().length > 150) errors.push("Tiêu đề không vượt quá 150 ký tự");
    if (!formData.summary.trim()) errors.push("Tóm tắt không được để trống");
    if (formData.summary.trim().length > 300) errors.push("Tóm tắt không vượt quá 300 ký tự");
    if (!stripHtml(formData.content).trim()) errors.push("Nội dung không được để trống");
    return errors;
  }, [formData.content, formData.summary, formData.title]);

  const contentWords = useMemo(() => {
    const plain = stripHtml(formData.content ?? "");
    if (!plain) return 0;
    return plain.split(/\s+/).filter(Boolean).length;
  }, [formData.content]);

  const baselineSnapshot = useMemo(() => {
    if (isEditMode) {
      return JSON.stringify(editBaseForm ?? emptyForm);
    }
    return JSON.stringify(initialCreateForm);
  }, [editBaseForm, initialCreateForm, isEditMode]);
  const currentSnapshot = useMemo(() => JSON.stringify(formData), [formData]);
  const hasUnsavedChanges = currentSnapshot !== baselineSnapshot;
  const isFormValid = validationErrors.length === 0;

  const { mutate: createBlog, isPending: isCreating } = useMutation({
    mutationFn: (payload: BlogPayload) => blogService.createBlog(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blogs"] });
      localStorage.removeItem(draftKey);
      toast.success("Tạo bài viết thành công");
      navigate(listRoute);
    },
    onError: () => toast.error("Không thể tạo bài viết"),
  });

  const { mutate: updateBlog, isPending: isUpdating } = useMutation({
    mutationFn: (payload: BlogPayload) => blogService.updateBlog(Number(blogId), payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blogs"] });
      localStorage.removeItem(draftKey);
      toast.success("Cập nhật bài viết thành công");
      navigate(listRoute);
    },
    onError: () => toast.error("Không thể cập nhật bài viết"),
  });

  const isSubmitting = isCreating || isUpdating;

  const handleSave = useCallback(() => {
    if (!isFormValid || isSubmitting || !hasUnsavedChanges) return;

    if (isEditMode) {
      updateBlog(formData);
      return;
    }

    createBlog(formData);
  }, [createBlog, formData, hasUnsavedChanges, isEditMode, isFormValid, isSubmitting, updateBlog]);

  useEffect(() => {
    if (isEditMode) return;
    localStorage.setItem(draftKey, JSON.stringify(formData));
  }, [draftKey, formData, isEditMode]);

  useEffect(() => {
    if (!isEditMode) return;
    localStorage.removeItem(draftKey);
  }, [draftKey, isEditMode]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      handleSave();
    };

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [handleSave]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    maxFiles: 1,
    accept: { "image/*": [] },
    onDropAccepted: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        updateFormData((previous) => ({ ...previous, thumbnailUrl: result }));
        setPreviewImageError(false);
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

  const thumbnailValue = formData.thumbnailUrl ?? "";
  const hasThumbnail = thumbnailValue.trim().length > 0;
  const isThumbnailDataImage = hasThumbnail && isDataImageUrl(thumbnailValue);
  const visibleThumbnailInputValue =
    isThumbnailDataImage && !showRawThumbnailValue
      ? getDataImageSummary(thumbnailValue)
      : thumbnailValue;

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const shouldLeave = window.confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?");
      if (!shouldLeave) return;
    }
    navigate(listRoute);
  };

  if (isEditMode && blogDetailQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (isEditMode && !editingBlog && !blogDetailQuery.isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <p className="text-sm text-amber-700">Không tìm thấy bài viết để chỉnh sửa.</p>
          <Button
            className="w-fit bg-teal-500 hover:bg-teal-600"
            onClick={() => navigate(listRoute)}>
            Quay lại danh sách
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Button variant="ghost" size="icon" asChild>
              <Link to={listRoute}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span>{isAdminPath ? "Admin" : "Staff"}</span>
            <span>•</span>
            <span>{isEditMode ? "Cập nhật bài viết" : "Tạo bài viết mới"}</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {isEditMode ? "Cập nhật bài viết" : "Tạo bài viết mới"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <Button variant="outline" asChild>
              <Link to={previewRouteTemplate.replace(":blogId", String(blogId))}>Xem preview</Link>
            </Button>
          ) : null}
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button
            className="bg-teal-500 hover:bg-teal-600"
            onClick={handleSave}
            disabled={!isFormValid || isSubmitting || !hasUnsavedChanges}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu bài viết
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-teal-100 bg-teal-50 p-3 text-xs text-teal-700">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-white text-teal-700">
            {contentWords} từ
          </Badge>
          <span>{hasUnsavedChanges ? "Có thay đổi chưa lưu" : "Đã đồng bộ"}</span>
          <span>•</span>
          <span>Ctrl/Cmd + S để lưu nhanh</span>
        </div>
      </div>

      {validationErrors.length > 0 ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {validationErrors.map((error) => (
            <p key={error}>• {error}</p>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nội dung bài viết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label>Nội dung (Content)</Label>
                <BlogContentEditor value={formData.content} onChange={handleContentChange} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thiết lập bài viết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label htmlFor="thumbnailUrl">Ảnh đại diện</Label>
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
                  {isThumbnailDataImage ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowRawThumbnailValue((prev) => !prev)}>
                      {showRawThumbnailValue ? "Ẩn chuỗi gốc" : "Hiện chuỗi gốc"}
                    </Button>
                  ) : null}
                  {hasThumbnail ? (
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
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Xem trước ảnh đại diện</Label>
                {hasThumbnail ? (
                  <div className="overflow-hidden rounded-md border border-gray-100 bg-stone-100">
                    {!previewImageError ? (
                      <img
                        src={thumbnailValue}
                        alt="Ảnh đại diện bài viết"
                        className="h-44 w-full object-contain"
                        onError={() => setPreviewImageError(true)}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
