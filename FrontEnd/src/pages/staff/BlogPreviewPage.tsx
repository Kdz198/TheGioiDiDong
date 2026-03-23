import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Blog, BlogStatus } from "@/interfaces/product.types";
import { ROUTES } from "@/router/routes.const";
import { blogService } from "@/services/blogService";
import { formatDateTime } from "@/utils/formatDate";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import { useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

const STATUS_OPTIONS: Array<{ value: BlogStatus; label: string; className: string }> = [
  { value: "DRAFT", label: "Nháp", className: "bg-gray-100 text-gray-700" },
  { value: "PUBLISHED", label: "Đã xuất bản", className: "bg-green-100 text-green-700" },
  { value: "ARCHIVED", label: "Đã lưu trữ", className: "bg-orange-100 text-orange-700" },
];

function getStatusMeta(status: BlogStatus) {
  return STATUS_OPTIONS.find((item) => item.value === status) ?? STATUS_OPTIONS[0];
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

export function BlogPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { blogId } = useParams<{ blogId: string }>();
  const routeState = location.state as { blog?: Blog } | null;
  const blogIdNumber = Number(blogId);
  const hasValidBlogId = Number.isFinite(blogIdNumber) && blogIdNumber > 0;

  const isAdminPath = location.pathname.startsWith("/admin");
  const listRoute = isAdminPath ? ROUTES.ADMIN_BLOGS : ROUTES.STAFF_BLOGS;
  const editRouteTemplate = isAdminPath ? ROUTES.ADMIN_BLOG_EDIT : ROUTES.STAFF_BLOG_EDIT;

  const routeBlog = useMemo(() => {
    if (!routeState?.blog || !hasValidBlogId) return null;
    return routeState.blog.id === blogIdNumber ? routeState.blog : null;
  }, [blogIdNumber, hasValidBlogId, routeState?.blog]);

  const blogQuery = useQuery({
    queryKey: ["blogs", "detail", blogIdNumber],
    enabled: hasValidBlogId,
    queryFn: () => blogService.getBlogById(blogIdNumber),
    initialData: routeBlog ?? undefined,
  });

  const blog = blogQuery.data ?? routeBlog;
  const safeHtml = useMemo(() => sanitizeHtml(blog?.content ?? ""), [blog?.content]);

  if (blogQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
        Đang tải nội dung preview...
      </div>
    );
  }

  if (!blog) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <p className="text-sm text-amber-700">Không tìm thấy bài viết để preview.</p>
          <Button
            className="w-fit bg-teal-500 hover:bg-teal-600"
            onClick={() => navigate(listRoute)}>
            Quay lại danh sách
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusMeta = getStatusMeta(blog.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Button variant="ghost" size="icon" asChild>
              <Link to={listRoute}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span>{isAdminPath ? "Admin" : "Staff"}</span>
            <span>•</span>
            <span>Preview bài viết</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Xem trước bài viết</h1>
        </div>

        <Button className="bg-teal-500 hover:bg-teal-600" asChild>
          <Link to={editRouteTemplate.replace(":blogId", String(blog.id))}>
            <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
          </Link>
        </Button>
      </div>

      <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {blog.thumbnailUrl ? (
          <div className="relative h-72 w-full overflow-hidden bg-stone-100">
            <img src={blog.thumbnailUrl} alt={blog.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/15 to-transparent" />
            <div className="absolute right-6 bottom-6 left-6 text-white">
              <Badge variant="secondary" className={`${statusMeta.className} border-0`}>
                {statusMeta.label}
              </Badge>
              <h2 className="mt-3 text-3xl leading-tight font-bold">{blog.title}</h2>
              <p className="mt-2 max-w-3xl text-sm text-white/90">{blog.summary}</p>
            </div>
          </div>
        ) : (
          <header className="bg-linear-to-r from-teal-700 to-emerald-600 px-8 py-10 text-white">
            <Badge variant="secondary" className={`${statusMeta.className} border-0`}>
              {statusMeta.label}
            </Badge>
            <h2 className="mt-3 text-3xl leading-tight font-bold">{blog.title}</h2>
            <p className="mt-2 max-w-3xl text-sm text-white/90">{blog.summary}</p>
          </header>
        )}

        <div className="border-b border-gray-100 px-8 py-4 text-sm text-gray-500">
          <p>
            Tác giả: <span className="font-medium text-zinc-700">{blog.author || "Không rõ"}</span>
            <span className="mx-2">•</span>
            {formatDateTime(blog.createdAt)}
          </p>
        </div>

        <div className="px-8 py-8">
          <div
            className="prose prose-zinc prose-headings:font-semibold prose-img:rounded-xl max-w-none"
            dangerouslySetInnerHTML={{ __html: safeHtml || "<p>Không có nội dung.</p>" }}
          />
        </div>
      </article>
    </div>
  );
}
