import { API_ENDPOINTS } from "@/constants/api.config";
import { USE_MOCK_API } from "@/constants/app.const";
import type { BackendBlog, BlogPayload, PageBlogResponse } from "@/interfaces/product.types";
import { mapBackendBlog } from "@/interfaces/product.types";
import { apiClient } from "@/lib/api";

interface GetBlogsParams {
  page?: number;
  size?: number;
  sort?: string;
}

const mockBlogs: BackendBlog[] = [
  {
    id: 1,
    title: "Mẹo kéo dài tuổi thọ pin sạc dự phòng",
    author: "TechGear Team",
    summary: "5 mẹo đơn giản giúp sạc dự phòng bền hơn trong quá trình sử dụng hằng ngày.",
    content:
      "Không để pin cạn hoàn toàn, dùng đúng củ sạc và tránh nhiệt độ cao sẽ giúp pin bền hơn đáng kể.",
    thumbnailUrl: "",
    createdAt: new Date().toISOString(),
    status: "PUBLISHED",
  },
];

export const blogService = {
  getBlogs: async (params: GetBlogsParams = {}): Promise<PageBlogResponse> => {
    const { page = 0, size = 10, sort = "createdAt,desc" } = params;

    if (USE_MOCK_API) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const sorted = [...mockBlogs].sort((a, b) => {
        const aTime = new Date(a.createdAt ?? "").getTime();
        const bTime = new Date(b.createdAt ?? "").getTime();
        return sort.endsWith("desc") ? bTime - aTime : aTime - bTime;
      });

      const start = page * size;
      const paged = sorted.slice(start, start + size).map(mapBackendBlog);
      const totalElements = sorted.length;
      const totalPages = Math.max(1, Math.ceil(totalElements / size));

      return {
        totalElements,
        totalPages,
        numberOfElements: paged.length,
        size,
        content: paged,
        number: page,
        first: page === 0,
        last: page + 1 >= totalPages,
        empty: paged.length === 0,
      };
    }

    const response = await apiClient.get<PageBlogResponse>(API_ENDPOINTS.BLOGS.LIST, {
      params: { page, size, sort },
    });

    return {
      ...response.data,
      content: (response.data.content ?? []).map((item) => mapBackendBlog(item as BackendBlog)),
    };
  },

  createBlog: async (payload: BlogPayload): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      mockBlogs.unshift({
        id: Date.now(),
        author: "TechGear Team",
        createdAt: new Date().toISOString(),
        ...payload,
      });
      return;
    }

    await apiClient.post(API_ENDPOINTS.BLOGS.CREATE, payload);
  },

  getBlogById: async (id: number): Promise<ReturnType<typeof mapBackendBlog>> => {
    if (USE_MOCK_API) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const found = mockBlogs.find((item) => item.id === id);
      if (!found) throw new Error("Không tìm thấy bài viết");
      return mapBackendBlog(found);
    }

    // Prefer list pagination scan because detail endpoint may be unstable in some environments.
    let page = 0;
    const size = 100;

    while (true) {
      const response = await apiClient.get<PageBlogResponse>(API_ENDPOINTS.BLOGS.LIST, {
        params: { page, size, sort: "createdAt,desc" },
      });

      const mapped = (response.data.content ?? []).map((item) =>
        mapBackendBlog(item as BackendBlog)
      );
      const found = mapped.find((blog) => blog.id === id);
      if (found) return found;

      if (response.data.last || mapped.length === 0) {
        break;
      }
      page += 1;
    }

    throw new Error("Không tìm thấy bài viết");
  },

  updateBlog: async (id: number, payload: BlogPayload): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = mockBlogs.findIndex((item) => item.id === id);
      if (index !== -1) {
        mockBlogs[index] = { ...mockBlogs[index], ...payload };
      }
      return;
    }

    await apiClient.put(API_ENDPOINTS.BLOGS.UPDATE(id), payload);
  },
};
