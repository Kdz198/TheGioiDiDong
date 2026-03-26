import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Blog } from "@/interfaces/product.types";
import { ROUTES } from "@/router/routes.const";
import { blogService } from "@/services/blogService";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Globe2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function BlogPage() {
  const [page, setPage] = useState(0);
  const size = 10;
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["blogs", page, size],
    queryFn: () => blogService.getBlogs({ page, size }),
  });

  const blogs = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header Section */}
      <div className="mb-8 border-b border-zinc-200 bg-white pt-12 pb-10">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="mb-4 flex items-center gap-3 text-sm font-bold tracking-wider text-teal-600 uppercase">
            <TrendingUp className="h-5 w-5" />
            <span>Cộng đồng chia sẻ kiến thức</span>
          </div>
          <h1 className="text-4xl leading-tight font-black text-zinc-900">Bài viết mới nhất</h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-500">
            Cập nhật những tin tức công nghệ, hướng dẫn và kinh nghiệm mua sắm mới nhất từ TechGear.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8">
          {/* Main List */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              {isLoading ? (
                <div className="divide-y divide-zinc-100">
                  {[...Array(size)].map((_, i) => (
                    <div key={i} className="p-6">
                      <div className="mb-4 h-4 w-1/4 animate-pulse rounded bg-zinc-100" />
                      <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-zinc-100" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
                    </div>
                  ))}
                </div>
              ) : blogs.length > 0 ? (
                <div className="divide-y divide-zinc-100">
                  {blogs.map((blog) => (
                    <BlogCard
                      key={blog.id}
                      blog={blog}
                      onClick={() =>
                        navigate(ROUTES.BLOG_DETAIL.replace(":blogId", blog.id.toString()), {
                          state: { blog },
                        })
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[400px] flex-col items-center justify-center p-12 text-center">
                  <h3 className="text-xl font-bold text-zinc-900">Không có bài viết nào</h3>
                  <p className="mt-2 text-zinc-500">Hãy là người đầu tiên chia sẻ nội dung!</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent className="rounded-xl border bg-white p-1 shadow-sm">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 0) setPage(page - 1);
                        }}
                        className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(i);
                          }}
                          isActive={page === i}
                          className={
                            page === i
                              ? "bg-teal-600 text-white hover:bg-teal-700 hover:text-white"
                              : ""
                          }>
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages - 1) setPage(page + 1);
                        }}
                        className={
                          page === totalPages - 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>

          {/* Sidebar - Optional but adds to Viblo look */}
          <div className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-zinc-900">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  Chủ đề phổ biến
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Phụ kiện", "MacBook", "iPhone", "Review", "Hướng dẫn", "Bảo trì"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="cursor-pointer rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100">
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 p-6 text-white shadow-md">
                <h3 className="mb-2 text-lg font-bold">Đăng ký bản tin</h3>
                <p className="mb-4 text-sm text-teal-50">
                  Nhận thông báo về bài viết mới nhất định kỳ.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="w-full rounded-lg border border-white/20 bg-white/20 px-3 py-2 text-sm placeholder:text-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ blog, onClick }: { blog: Blog; onClick: () => void }) {
  const readTime = Math.ceil((blog.content?.length || 0) / 1000) || 5;

  return (
    <div
      className="group cursor-pointer p-6 transition-colors hover:bg-zinc-50/50"
      onClick={onClick}>
      {/* Author & Meta */}
      <div className="mb-3 flex items-center gap-3 text-sm">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-700">
          {blog.author.charAt(0).toUpperCase()}
        </div>
        <span className="font-semibold text-zinc-700 transition-colors hover:text-teal-600">
          {blog.author.split("@")[0]}
        </span>
        <span className="text-zinc-400">•</span>
        <span className="text-zinc-400">{format(new Date(blog.createdAt), "dd/MM/yyyy")}</span>
        <span className="text-zinc-400">•</span>
        <span className="flex items-center gap-1 text-zinc-400">
          {readTime} phút đọc <Globe2 className="h-3 w-3" />
        </span>
      </div>

      {/* Title */}
      <h2 className="text-xl leading-tight font-bold text-zinc-900 transition-colors group-hover:text-teal-600">
        {blog.title}
      </h2>
    </div>
  );
}
