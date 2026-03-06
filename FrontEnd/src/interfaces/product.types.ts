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
  shortDescription: string;
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
  isFlashSale: boolean;
  flashSaleEndAt?: string;
  isActive: boolean;
  tags: string[];
  specifications: Record<string, string>;
  createdAt: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
