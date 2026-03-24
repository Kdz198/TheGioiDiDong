import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/router/routes.const";

export function BlogDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const blog = location.state?.blog;

  if (!blog) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">Không tìm thấy bài viết</h2>
        <Button 
          className="mt-4" 
          onClick={() => navigate(ROUTES.BLOGS)}
        >
          Quay lại trang Blog
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="container mx-auto max-w-4xl px-6 pt-10">
        <Button
          variant="ghost"
          className="mb-8 gap-2 text-zinc-500 hover:text-teal-600 pl-0"
          onClick={() => navigate(ROUTES.BLOGS)}
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Button>

        <header className="mb-10">
          <div className="flex items-center gap-3 text-sm text-zinc-500 mb-6 font-medium">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" /> {blog.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {format(new Date(blog.createdAt), "dd/MM/yyyy")}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {Math.ceil(blog.content.length / 1000) || 5} phút đọc
            </span>
          </div>

          <h1 className="text-4xl font-extrabold text-zinc-900 leading-[1.2] tracking-tight mb-8">
            {blog.title}
          </h1>

          {blog.summary && (
            <div className="bg-zinc-50 border-l-4 border-teal-500 p-6 rounded-r-xl italic text-lg text-zinc-600 leading-relaxed mb-10">
              {blog.summary}
            </div>
          )}
        </header>

        <article className="prose prose-zinc max-w-none">
          <div 
            className="blog-content-body text-[18px] leading-[1.8] text-zinc-800 
            [&_img]:w-full [&_img]:h-auto [&_img]:rounded-2xl [&_img]:my-10 
            [&_p]:mb-6 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-6
            [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-10 [&_h3]:mb-4
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6
            [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-200 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-zinc-500"
            dangerouslySetInnerHTML={{ __html: blog.content }} 
          />
        </article>
      </div>
    </div>
  );
}
