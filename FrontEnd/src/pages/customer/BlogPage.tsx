import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { Globe2, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes.const";

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
      <div className="bg-white border-b border-zinc-200 mb-8 pt-12 pb-10">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex items-center gap-3 text-teal-600 mb-4 font-bold tracking-wider uppercase text-sm">
            <TrendingUp className="h-5 w-5" />
            <span>Cộng đồng chia sẻ kiến thức</span>
          </div>
          <h1 className="text-4xl font-black text-zinc-900 leading-tight">
            Bài viết mới nhất
          </h1>
          <p className="mt-3 text-zinc-500 text-lg max-w-2xl">
            Cập nhật những tin tức công nghệ, hướng dẫn và kinh nghiệm mua sắm mới nhất từ TechGear.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8">
          {/* Main List */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
              {isLoading ? (
                <div className="divide-y divide-zinc-100">
                  {[...Array(size)].map((_, i) => (
                    <div key={i} className="p-6">
                      <div className="h-4 w-1/4 animate-pulse rounded bg-zinc-100 mb-4" />
                      <div className="h-6 w-3/4 animate-pulse rounded bg-zinc-100 mb-2" />
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
                      onClick={() => navigate(ROUTES.BLOG_DETAIL.replace(":blogId", blog.id.toString()), { state: { blog } })}
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

          {/* Sidebar - Optional but adds to Viblo look */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  Chủ đề phổ biến
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Phụ kiện", "MacBook", "iPhone", "Review", "Hướng dẫn", "Bảo trì"].map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-lg text-sm cursor-pointer transition-colors border border-zinc-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-6 text-white shadow-md">
                <h3 className="font-bold text-lg mb-2">Đăng ký bản tin</h3>
                <p className="text-teal-50 text-sm mb-4">Nhận thông báo về bài viết mới nhất định kỳ.</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="Email của bạn" className="bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-sm placeholder:text-white/50 w-full focus:outline-none focus:ring-2 focus:ring-white/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ blog, onClick }: { blog: any; onClick: () => void }) {
  const readTime = Math.ceil((blog.content?.length || 0) / 1000) || 5;

  return (
    <div 
      className="p-6 hover:bg-zinc-50/50 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      {/* Author & Meta */}
      <div className="flex items-center gap-3 mb-3 text-sm">
        <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-[10px]">
          {blog.author.charAt(0).toUpperCase()}
        </div>
        <span className="font-semibold text-zinc-700 hover:text-teal-600 transition-colors">
          {blog.author.split("@")[0]}
        </span>
        <span className="text-zinc-400">•</span>
        <span className="text-zinc-400">
          {format(new Date(blog.createdAt), "dd/MM/yyyy")}
        </span>
        <span className="text-zinc-400">•</span>
        <span className="text-zinc-400 flex items-center gap-1">
          {readTime} phút đọc <Globe2 className="h-3 w-3" />
        </span>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-zinc-900 leading-tight group-hover:text-teal-600 transition-colors">
        {blog.title}
      </h2>
    </div>
  );
}
