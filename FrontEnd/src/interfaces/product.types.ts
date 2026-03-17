export interface Category {
  id: number;
  name: string;
  slug: string; // Frontend-only
  icon: string; // Frontend-only
  description?: string;
  parentId?: number;
  productCount: number; // Frontend-only
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
}

// Frontend-only
export interface ProductVersion {
  id: number;
  versionName: string;
}

// Frontend-only
export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  order: number;
}

// Frontend-only
export interface ProductVariant {
  id: number;
  sku: string;
  color?: string;
  size?: string;
  price: number;
  originalPrice: number;
  stockQuantity: number;
  images: ProductImage[];
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  categoryId: number;
  category: Category;
  brandId: number;
  brand: Brand;
  variants: ProductVariant[];
  defaultPrice: number;
  defaultOriginalPrice: number;
  thumbnailUrl: string;
  /** Additional images from imgUrls array */
  extraImages?: string[];
  rating: number;
  reviewCount: number;
  soldCount: number;
  flashSaleEndAt?: string;
  isActive: boolean;
  /** true = product bình thường, false = dịch vụ */
  isService?: boolean;
  /** Số lượng đang được giữ/đặt trước */
  reserve?: number;
  specifications: Record<string, string>;
  createdAt: string;
  stockQuantity?: number;
  versionName?: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AppProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  reserve: number;
  imgUrl: string;
  active: boolean;
  versionName: string;
  brandName: string;
  categoryName: string;
  type?: boolean;
}

export interface AppProductListResponse {
  items: AppProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Raw category shape returned by BE GET /api/products/categories */
export interface BackendCategory {
  id: number;
  name: string;
  description?: string;
}

/** Raw product shape returned by BE GET /api/products/product */
export interface BackendProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  reserve: number;
  /** Array of up to 5 image URLs; entries may be null when no image was uploaded for that slot */
  imgUrls?: (string | null)[];
  active: boolean;
  /** true = product bình thường, false = dịch vụ */
  type?: boolean;
  versionName: string;
  brandName: string;
  categoryName: string;
}

/** Audit log entry for a product change event */
export interface ProductAuditLog {
  id: number;
  productId: number;
  action: string;
  accountId: number;
  actorEmail: string;
  changes: Record<string, unknown>;
  createdAt: string;
}

/** Paginated wrapper for ProductAuditLog */
export interface PageProductAuditLog {
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  size: number;
  content: ProductAuditLog[];
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/** Map BackendProduct to the FE Product interface for display */
export function mapBackendProduct(p: BackendProduct): Product {
  const urls = p.imgUrls ?? [];
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    slug: p.name.toLowerCase().replace(/\s+/g, "-"),
    categoryId: 0,
    category: { id: 0, name: p.categoryName, slug: "", icon: "", productCount: 0 },
    brandId: 0,
    brand: { id: 0, name: p.brandName },
    variants: [],
    defaultPrice: p.price,
    defaultOriginalPrice: p.price,
    thumbnailUrl: urls.find((u) => u != null) ?? "",
    extraImages: urls.filter(Boolean) as string[],
    rating: 0,
    reviewCount: 0,
    soldCount: 0,
    isActive: p.active,
    isService: p.type === false,
    reserve: p.reserve,
    specifications: {},
    createdAt: new Date().toISOString(),
    stockQuantity: p.quantity,
    versionName: p.versionName,
  };
}
