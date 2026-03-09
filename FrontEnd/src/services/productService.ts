import { API_ENDPOINTS } from "@/constants/api.config";
import { PAGINATION, USE_MOCK_API } from "@/constants/app.const";
import type {
  BackendProduct,
  Brand,
  Product,
  ProductListResponse,
  ProductVersion,
} from "@/interfaces/product.types";
import { mapBackendProduct } from "@/interfaces/product.types";
import { apiClient } from "@/lib/api";

const mockBrands: Brand[] = [
  { id: 1, name: "Logitech", description: "Gaming & office accessories", logoUrl: "" },
  { id: 2, name: "Apple", description: "Premium consumer electronics", logoUrl: "" },
  { id: 3, name: "Samsung", description: "Consumer electronics", logoUrl: "" },
  { id: 4, name: "Sony", description: "Audio & electronics", logoUrl: "" },
];

const mockProductVersions: ProductVersion[] = [
  { id: 1, versionName: "Standard" },
  { id: 2, versionName: "Pro" },
  { id: 3, versionName: "Plus" },
];

const mockProducts: any[] = [];

interface GetProductsParams {
  page?: number;
  pageSize?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  search?: string;
  activeFilter?: "all" | "active" | "inactive";
}

export const productService = {
  getProducts: async (params: GetProductsParams = {}): Promise<ProductListResponse> => {
    let allProducts: Product[];

    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      allProducts = [...mockProducts].filter((p) => p.active);
    } else {
      const response = await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.LIST);
      allProducts = response.data;
    }

    let filtered = [...allProducts];

    // Lọc theo trạng thái active
    if (params.activeFilter === "active") {
      filtered = filtered.filter((p) => p.active);
    } else if (params.activeFilter === "inactive") {
      filtered = filtered.filter((p) => !p.active);
    }

    // Lọc theo tìm kiếm tên
    if (params.search) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query));
    }
    if (params.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= params.minPrice!); // Sửa thành price
    }
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= params.maxPrice!); // Sửa thành price
    }
    if (params.sortBy) {
      switch (params.sortBy) {
        case "price_asc":
          filtered.sort((a, b) => a.price - b.price); // Sửa thành price
          break;
        case "price_desc":
          filtered.sort((a, b) => b.price - a.price); // Sửa thành price
          break;
      }
    }

    // 3. Xử lý Phân trang (Pagination) ở Frontend
    const page = params.page || 1;
    const pageSize = params.pageSize || PAGINATION.DEFAULT_PAGE_SIZE;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    // Trả về đúng cấu trúc mà các trang danh sách đang đợi
    return {
      items,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  },

  getProductById: async (id: string | number): Promise<Product> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const product = mockProducts.find((p) => p.id === Number(id));
      if (!product) throw new Error("Sản phẩm không tồn tại");
      return product as unknown as Product;
    }
    const response = await apiClient.get<BackendProduct>(API_ENDPOINTS.PRODUCTS.DETAIL(String(id)));
    return mapBackendProduct(response.data);
  },

  getFlashSaleProducts: async (): Promise<Product[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockProducts.filter((p) => p.active);
    }
    const response = await apiClient.get<BackendProduct[]>(API_ENDPOINTS.PRODUCTS.FLASH_SALE);
    return response.data.map(mapBackendProduct);
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockProducts.filter((p) => p.active).slice(0, 8);
    }
    const response = await apiClient.get<BackendProduct[]>(API_ENDPOINTS.PRODUCTS.FEATURED);
    return response.data.map(mapBackendProduct).slice(0, 8);
  },

  createProduct: async (data: FormData): Promise<Product> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 800));
      return mockProducts[0] as unknown as Product;
    }
    const response = await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.CREATE, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateProduct: async (data: FormData): Promise<Product> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 800));
      return mockProducts[0] as unknown as Product;
    }
    const response = await apiClient.put<Product>(API_ENDPOINTS.PRODUCTS.UPDATE, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      return;
    }
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  },

  // Brand methods
  getBrands: async (): Promise<Brand[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockBrands;
    }
    const response = await apiClient.get(API_ENDPOINTS.BRANDS.LIST);
    return response.data;
  },

  getBrandById: async (id: number): Promise<Brand> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 200));
      const brand = mockBrands.find((b) => b.id === id);
      if (!brand) throw new Error("Thương hiệu không tồn tại");
      return brand;
    }
    const response = await apiClient.get(API_ENDPOINTS.BRANDS.DETAIL(id));
    return response.data;
  },

  createBrand: async (data: FormData): Promise<Brand> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const newBrand: Brand = {
        id: Date.now(),
        name: (data.get("name") as string) ?? "",
        description: (data.get("description") as string) ?? "",
        logoUrl: "",
      };
      mockBrands.push(newBrand);
      return newBrand;
    }
    const response = await apiClient.post<Brand>(API_ENDPOINTS.BRANDS.CREATE, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateBrand: async (data: {
    id: number;
    name: string;
    description?: string;
    logoUrl?: string;
  }): Promise<Brand> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const idx = mockBrands.findIndex((b) => b.id === data.id);
      if (idx === -1) throw new Error("Thương hiệu không tồn tại");
      mockBrands[idx] = {
        ...mockBrands[idx],
        name: data.name ?? mockBrands[idx].name,
        description: data.description ?? mockBrands[idx].description,
      };
      return mockBrands[idx];
    }
    const response = await apiClient.put(API_ENDPOINTS.BRANDS.UPDATE, data);
    return response.data;
  },

  deleteBrand: async (id: number): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const idx = mockBrands.findIndex((b) => b.id === id);
      if (idx !== -1) mockBrands.splice(idx, 1);
      return;
    }
    await apiClient.delete(API_ENDPOINTS.BRANDS.DELETE(id));
  },

  // Product Version methods
  getProductVersions: async (): Promise<ProductVersion[]> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return mockProductVersions;
    }
    const response = await apiClient.get(API_ENDPOINTS.PRODUCT_VERSIONS.LIST);
    return response.data;
  },

  createProductVersion: async (data: { versionName: string }): Promise<ProductVersion> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const newVersion: ProductVersion = { id: Date.now(), versionName: data.versionName };
      mockProductVersions.push(newVersion);
      return newVersion;
    }
    const response = await apiClient.post(API_ENDPOINTS.PRODUCT_VERSIONS.CREATE, data);
    return response.data;
  },

  updateProductVersion: async (data: {
    id: number;
    versionName: string;
  }): Promise<ProductVersion> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const idx = mockProductVersions.findIndex((v) => v.id === data.id);
      if (idx === -1) throw new Error("Phiên bản không tồn tại");
      mockProductVersions[idx] = { ...mockProductVersions[idx], ...data };
      return mockProductVersions[idx];
    }
    const response = await apiClient.put(API_ENDPOINTS.PRODUCT_VERSIONS.UPDATE, data);
    return response.data;
  },

  deleteProductVersion: async (id: number): Promise<void> => {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const idx = mockProductVersions.findIndex((v) => v.id === id);
      if (idx !== -1) mockProductVersions.splice(idx, 1);
      return;
    }
    await apiClient.delete(API_ENDPOINTS.PRODUCT_VERSIONS.DELETE(id));
  },
};
