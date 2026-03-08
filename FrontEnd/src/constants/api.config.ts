export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://tgdd-api.kdz.asia";

export const API_ENDPOINTS = {
  // ─── Users Service (/api/users) ───────────────────────────────────────────
  AUTH: {
    LOGIN: "/api/users/auth/login",
  },
  USERS: {
    LIST: "/api/users",
    CREATE: "/api/users",
    DETAIL: (id: number) => `/api/users/${id}`,
    UPDATE: (id: number) => `/api/users/${id}`,
    DELETE: (id: number) => `/api/users/${id}`,
  },
  ROLES: {
    LIST: "/api/users/roles",
    CREATE: "/api/users/roles",
    UPDATE: (roleId: number) => `/api/users/roles/${roleId}`,
    DELETE: (roleId: number) => `/api/users/roles/${roleId}`,
    PERMISSIONS: "/api/users/roles/permissions",
  },

  // ─── Products Service (/api/products) ─────────────────────────────────────
  PRODUCTS: {
    /** Active products only (default listing) */
    LIST: "/api/products/product/active",
    /** All products including inactive (admin) */
    LIST_ALL: "/api/products/product",
    LIST_INACTIVE: "/api/products/product/inactive",
    DETAIL: (id: string | number) => `/api/products/product/${id}`,
    CREATE: "/api/products/product",
    UPDATE: "/api/products/product",
    DELETE: (id: number) => `/api/products/product/${id}`,
    BY_CATEGORY: (categoryId: number) => `/api/products/product/category/${categoryId}`,
    BY_BRAND: (brandId: number) => `/api/products/product/brand/${brandId}`,
    CHECK_AVAILABLE: "/api/products/product/check-available",
    /** Aliases used by existing productService calls */
    FLASH_SALE: "/api/products/product/active",
    FEATURED: "/api/products/product/active",
  },
  PRODUCT_VERSIONS: {
    LIST: "/api/products/product-versions",
    DETAIL: (id: number) => `/api/products/product-versions/${id}`,
    CREATE: "/api/products/product-versions",
    UPDATE: "/api/products/product-versions",
    DELETE: (id: number) => `/api/products/product-versions/${id}`,
  },
  CATEGORIES: {
    LIST: "/api/products/categories",
    DETAIL: (id: number) => `/api/products/categories/${id}`,
    CREATE: "/api/products/categories",
    UPDATE: "/api/products/categories",
    DELETE: (id: number) => `/api/products/categories/${id}`,
  },
  BRANDS: {
    LIST: "/api/products/brands",
    DETAIL: (id: number) => `/api/products/brands/${id}`,
    CREATE: "/api/products/brands",
    UPDATE: "/api/products/brands",
    DELETE: (id: number) => `/api/products/brands/${id}`,
  },

  // ─── Orders Service (/api/orders) ─────────────────────────────────────────
  ORDERS: {
    LIST: "/api/orders",
    /** Alias used by admin views */
    ALL: "/api/orders",
    CREATE: "/api/orders",
    DETAIL: (id: number) => `/api/orders/${id}`,
    UPDATE: "/api/orders",
    /** Alias kept for orderService.updateOrderStatus */
    UPDATE_STATUS: "/api/orders",
    DELETE: (id: number) => `/api/orders/${id}`,
    BY_USER: (userId: number) => `/api/orders/user/${userId}`,
    BY_STATUS: (status: string) => `/api/orders/status/${status}`,
  },
  PAYMENTS: {
    LIST: "/api/orders/payments",
    /** Alias kept for paymentService.getAllPayments */
    ALL: "/api/orders/payments",
    MAKE_PAYMENT: "/api/orders/payments/make-payment",
    DETAIL: (id: number) => `/api/orders/payments/${id}`,
    DELETE: (id: number) => `/api/orders/payments/${id}`,
    UPDATE: "/api/orders/payments",
    BY_STATUS: (status: string) => `/api/orders/payments/status/${status}`,
    BY_ORDER: (orderId: number) => `/api/orders/payments/order/${orderId}`,
  },
  PROMOTIONS: {
    LIST: "/api/orders/promotions",
    ACTIVE: "/api/orders/promotions/active",
    DETAIL: (id: number) => `/api/orders/promotions/${id}`,
    /** Look up a promotion by code — replaces the old VALIDATE_VOUCHER */
    BY_CODE: (code: string) => `/api/orders/promotions/code/${code}`,
    CREATE: "/api/orders/promotions",
    UPDATE: "/api/orders/promotions",
    DELETE: (id: number) => `/api/orders/promotions/${id}`,
  },
  FEEDBACKS: {
    LIST: "/api/orders/feedbacks",
    DETAIL: (id: number) => `/api/orders/feedbacks/${id}`,
    CREATE: "/api/orders/feedbacks",
    UPDATE: "/api/orders/feedbacks",
    DELETE: (id: number) => `/api/orders/feedbacks/${id}`,
    BY_USER: (userId: number) => `/api/orders/feedbacks/user/${userId}`,
    BY_PRODUCT: (productId: number) => `/api/orders/feedbacks/product/${productId}`,
  },
};
