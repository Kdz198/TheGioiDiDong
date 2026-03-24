import { useQuery } from "@tanstack/react-query";
import { blogService } from "@/services/blogService";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { Globe2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

export function BlogPage() {
  const [page, setPage] = useState(0);
  const size = 5;

  const { data, isLoading } = useQuery({
    queryKey: ["blogs", page, size],
    queryFn: () => blogService.getBlogs({ page, size }),
  });

  const blogs = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="min-h-screen bg-zinc-100 py-10">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-900">Bài viết mới</h1>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(size)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-2xl bg-white border border-zinc-200" />
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="space-y-6">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
              >
                {/* Facebook Style Header */}
                <div className="flex items-center justify-between p-5 pb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white text-lg font-bold shadow-sm">
                      {blog.author.trim().charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 hover:underline cursor-pointer text-base">
                        {blog.author.split("@")[0]}
                      </div>
                      <div className="text-[13px] text-zinc-500 flex items-center gap-1 font-medium mt-0.5">
                        {format(new Date(blog.createdAt), "dd/MM/yyyy HH:mm")} • <Globe2 className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                    <MoreHorizontal className="h-6 w-6" />
                  </button>
                </div>

                {/* Content Text */}
                <div className="px-6 pb-4">
                  <h2 className="mb-3 text-xl font-extrabold text-zinc-900 leading-tight">{blog.title}</h2>
                  {blog.summary && (
                    <p className="mb-4 text-zinc-600 text-[16px] leading-relaxed italic border-l-4 border-teal-500 pl-4 bg-teal-50/30 py-2 rounded-r-lg">
                      {blog.summary}
                    </p>
                  )}
                </div>

                {/* Main Content (Images/HTML) */}
                <div
                  className="prose prose-zinc max-w-none text-zinc-800"
                >
                   <div 
                    className="blog-content-body text-[16px] leading-relaxed [&_img]:w-full [&_img]:h-auto [&_p]:px-6 [&_p]:mb-4 [&_h2]:px-6 [&_h3]:px-6 [&_ul]:px-10 [&_ol]:px-10"
                    dangerouslySetInnerHTML={{ __html: blog.content }} 
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white p-12 text-center shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900">Không có bài viết nào</h3>
            <p className="mt-2 text-zinc-500">Hãy là người đầu tiên chia sẻ nội dung!</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent className="bg-white rounded-xl border shadow-sm p-1">
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
                      className={page === i ? "bg-teal-600 text-white hover:bg-teal-700 hover:text-white" : ""}
                    >
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
                    className={page === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
