export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  parentId?: number;
  productCount: number;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface ProductVersion {
  id: number;
  versionName: string;
}

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  order: number;
}

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
  rating: number;
  reviewCount: number;
  soldCount: number;
  flashSaleEndAt?: string;
  isActive: boolean;
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
  imgUrl: string;
  active: boolean;
  versionName: string;
  brandName: string;
  categoryName: string;
}

/** Map BackendProduct to the FE Product interface for display */
export function mapBackendProduct(p: BackendProduct): Product {
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
    thumbnailUrl: p.imgUrl,
    rating: 0,
    reviewCount: 0,
    soldCount: 0,
    isActive: p.active,
    specifications: {},
    createdAt: new Date().toISOString(),
    stockQuantity: p.quantity,
    versionName: p.versionName,
  };
}
