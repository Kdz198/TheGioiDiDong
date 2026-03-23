import { PaginationControl } from "@/components/shared/PaginationControl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/usePagination";
import type { BlogStatus, PageBlogResponse } from "@/interfaces/product.types";
import { ROUTES } from "@/router/routes.const";
import { blogService } from "@/services/blogService";
import { formatDateTime } from "@/utils/formatDate";
import { useQuery } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const BLOG_FETCH_SIZE = 500;

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

export function BlogManagerPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | BlogStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState("createdAt,desc");

  const isAdminPath = location.pathname.startsWith("/admin");
  const createRoute = isAdminPath ? ROUTES.ADMIN_BLOG_CREATE : ROUTES.STAFF_BLOG_CREATE;
  const editRouteTemplate = isAdminPath ? ROUTES.ADMIN_BLOG_EDIT : ROUTES.STAFF_BLOG_EDIT;
  const previewRouteTemplate = isAdminPath ? ROUTES.ADMIN_BLOG_PREVIEW : ROUTES.STAFF_BLOG_PREVIEW;

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

  const hasActiveFilters = statusFilter !== "ALL" || searchTerm.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý bài viết</h1>
        <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => navigate(createRoute)}>
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

              {hasActiveFilters ? (
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
              ) : null}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Hiển thị {filteredBlogs.length} kết quả
            {searchTerm.trim() ? ` cho từ khóa "${searchTerm.trim()}"` : ""}
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
                              onClick={() =>
                                navigate(previewRouteTemplate.replace(":blogId", String(blog.id)), {
                                  state: { blog },
                                })
                              }>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-teal-600 hover:text-teal-700"
                              onClick={() =>
                                navigate(editRouteTemplate.replace(":blogId", String(blog.id)), {
                                  state: { blog },
                                })
                              }>
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
    </div>
  );
}
