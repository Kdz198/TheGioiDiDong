# GitHub Copilot Instructions — mss301_web

## Project Overview

**TechGear** is an e-commerce platform for technology accessories targeting Vietnamese users.

- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **State management**: Zustand / React Context
- **Form**: React Hook Form + Zod
- **Data fetching**: TanStack React Query + Axios
- **Testing**: Vitest + Testing Library
- **Linting/Formatting**: ESLint + Prettier

---

## Language & Content

- **UI text**: Vietnamese — all user-visible text must be written in Vietnamese
- **Code**: Variables, functions, and component names must be written in English (following coding standards)
- **Comments**: Written in English, only when necessary (see comment rules below)
- **Currency format**: `xxx.000đ` (dot as thousands separator, `đ` as unit)

---

## Architecture & Directory Structure

```
src/
├── assets/                     # Images, fonts, icons, videos
├── components/
│   ├── ui/                     # Atomic UI — Button, Input, Modal, Badge...
│   ├── layouts/                # Header, Footer, Sidebar, DashboardLayout
│   └── common/                 # Shared business components
├── pages/
│   ├── auth/                   # Login, Register, ForgotPassword
│   ├── customer/               # Home, ProductList, ProductDetail, Cart, Checkout, OrderHistory, Profile, Wishlist
│   ├── admin/                  # Dashboard, ProductManager, OrderManager, UserManager, CategoryManager, BrandManager, PromotionManager, Reports
│   ├── staff/                  # StaffDashboard, OrderManager, FeedbackManager, PaymentManager
│   └── Error/                  # NotFound, ServerError, Unauthorized, Forbidden, etc.
├── router/
│   ├── index.tsx
│   ├── ProtectedRoute.tsx
│   └── routes.const.ts
├── contexts/                   # QueryProvider
├── hooks/                      # useAuth, useCart, useFetchData...
├── services/                   # productService, orderService, authService, userService...
├── interfaces/                 # TypeScript interfaces & types
│   ├── product.types.ts
│   ├── order.types.ts
│   ├── user.types.ts
│   └── index.ts
├── constants/
│   ├── api.config.ts           # BASE_URL, API endpoints
│   └── app.const.ts            # App name, pagination size...
├── utils/                      # formatPrice, formatDate, formatVND...
├── stores/                     # Zustand stores (authStore, cartStore, wishlistStore, etc.)
├── validations/                # Zod schemas for form validation
├── mocks/                      # Mock data for development
├── lib/                        # api.ts, queryClient.ts, transforms.ts, utils.ts
├── App.tsx
└── main.tsx
```

---

## Naming Conventions

| Type            | Convention              | Example                            |
| --------------- | ----------------------- | ---------------------------------- |
| Component       | `PascalCase`            | `ProductCard.tsx`, `CartItem.tsx`  |
| Hook            | `camelCase` + `use`     | `useAuth.ts`, `useCart.ts`         |
| Service         | `camelCase` + `Service` | `productService.ts`                |
| Type/Interface  | `PascalCase`            | `Product`, `OrderResponse`         |
| Props interface | suffix `Props`          | `ProductCardProps`                 |
| Store           | `camelCase` + `Store`   | `cartStore.ts`                     |
| Constant file   | `camelCase` + `.const`  | `app.const.ts`                     |
| Enum value      | `UPPER_CASE`            | `OrderStatus.PENDING`              |
| CSS class       | Tailwind utility class  | `className="bg-teal-500 ..."`      |

---

## Color System (Tailwind Classes)

> Full reference available in `color.md` at the repository root.

### Primary Colors

| Role                  | Tailwind Class         | Hex       |
| --------------------- | ---------------------- | --------- |
| CTA button / Primary  | `bg-teal-500`          | `#14b8a6` |
| CTA button hover      | `hover:bg-teal-600`    | `#0d9488` |
| Link / active text    | `text-teal-500`        | `#14b8a6` |
| Accent (sale/badge)   | `bg-red-400`           | `#f87171` |
| Sale price            | `text-red-400`         | `#f87171` |
| Secondary accent (admin) | `bg-orange-500`     | `#f97316` |
| Rating stars          | `text-yellow-500`      | `#eab308` |
| Discount              | `text-green-600`       | `#16a34a` |

### Background & Text Colors

| Role                  | Tailwind Class         |
| --------------------- | ---------------------- |
| Page background       | `bg-stone-50`          |
| Card / panel          | `bg-white`             |
| Heading text          | `text-zinc-900`        |
| Body text             | `text-gray-500`        |
| Border                | `border-gray-100`      |

### Typography

- Customer & staff font: **Epilogue** — `font-['Epilogue']`
- Admin font: **Manrope** — `font-['Manrope']`

---

## Component Patterns

### Primary CTA Button

```tsx
<button className="bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl px-6 py-3 shadow-[0px_10px_15px_-3px_rgba(20,170,184,0.20)] transition-colors">
  Khám phá ngay
</button>
```

### Flash Sale Badge

```tsx
<span className="bg-red-400 text-white text-sm font-bold font-['Epilogue'] px-3 py-1 rounded">
  SIÊU SALE
</span>
```

### Product Price Display

```tsx
<div className="flex items-center gap-2">
  <span className="text-red-400 text-lg font-bold font-['Epilogue']">
    {formatVND(salePrice)}
  </span>
  <span className="text-gray-400 text-sm line-through font-['Epilogue']">
    {formatVND(originalPrice)}
  </span>
</div>
```

### Star Rating

```tsx
{Array.from({ length: 5 }).map((_, i) => (
  <StarIcon key={i} className={i < rating ? "text-yellow-500" : "text-gray-300"} />
))}
```

---

## Features & Business Rules

### Roles & Permissions

| Role          | Access                                                                     |
| ------------- | -------------------------------------------------------------------------- |
| Guest         | Browse products, search, filter, add to cart, checkout, register           |
| Customer      | All Guest capabilities + order history, wishlist, membership points, redeem|
| Staff         | Order management, status updates, feedback handling, payment management     |
| Admin         | Full access: products, categories, brands, users, promotions, reports       |

### Product Categories

- Mobile Accessories (Power banks, Chargers, Cables, Phone cases, Screen protectors)
- Laptop & PC Accessories (Hubs, Mice, Keyboards, Laptop bags, USB drives)
- Audio Devices (Headphones, Bluetooth headsets, Speakers, Microphones)
- Smart Home Devices (Cameras, Routers, Smart lights)
- Gaming Accessories (Gaming mice, Gaming keyboards, Controllers)
- Storage Devices (Portable hard drives, Memory cards)

### Payment Methods

- MoMo, VNPay, COD (Cash on Delivery)
- Voucher/promo code applicable at checkout

### Membership Program

- Earn points per purchase
- Redeem points for discounts

### Order Status Flow

```
pending → confirmed → processing → shipping → delivered
                    ↘ cancelled
delivered → return_requested → returned
```

### API Schema Summary

**Products Service** (`/api/products/`):
- `Product`: id, name, description, price, stockQuantity, imgUrl, active, versionName, brandName, categoryName
- `Category`: id, name, description
- `Brand`: id, name, description, logoUrl
- `ProductVersion`: id, versionName

**Orders Service** (`/api/orders/`):
- `Order`: id, userId, status (PENDING/PAID/CANCELED), totalPrice, basePrice, discount, orderDetails
- `Promotion`: id, code, description, type (MONEY/PERCENTAGE/BOGO), discountValue, minOrderAmount, startDate, endDate, active
- `Payment`: id, order, paymentMethod, amount, date, status (PENDING/COMPLETED/FAILED/REFUNDED)
- `Feedback`: id, userId, productId, rating, comment, date

**Users Service** (`/api/users/`):
- Basic health/welcome endpoints (user management via mock data for now)

---

## Code Rules

### TypeScript

```ts
// ✅ Always use specific types
const fetchProduct = async (id: number): Promise<Product> => { ... }

// ✅ Interface for Props, Response, Model
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
}

// ✅ Type for union/alias
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

// ❌ Never use any
const data: any = fetchData(); // ❌
```

### Import Order

```ts
// 1. External libraries
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 2. Internal components
import ProductCard from "@/components/common/ProductCard";
import Button from "@/components/ui/Button";

// 3. Services, hooks, utils
import { productService } from "@/services/productService";
import { useAuth } from "@/hooks/useAuth";
import { formatVND } from "@/utils/formatPrice";

// 4. Types
import type { Product } from "@/interfaces/product.types";
```

### When to Write Comments

```ts
// ✅ Complex logic
// Calculate price after applying tiered discount:
// - Below 500,000đ: 5% off
// - 500,000đ – 2,000,000đ: 10% off
// - Above 2,000,000đ: 15% off
const finalPrice = calculateTieredDiscount(subtotal);

// ❌ Redundant — code is self-explanatory
const isLoggedIn = !!token; // check login status
```

### Vietnamese Currency Formatting

```ts
// utils/formatPrice.ts
export function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}
// Result: 850000 → "850.000đ"
```

---

## Testing

- Use **Vitest** + **@testing-library/react**
- Test files: placed next to the tested file, named `*.test.tsx` / `*.test.ts`
- Focus on business logic testing (services, utils, hooks)
- Do not test UI implementation details

---

## Important Notes

1. **No hardcoded English text** in UI — all displayed content must be in Vietnamese
2. **Responsive mobile-first** — always design for small screens first
3. **No `any`** in TypeScript
4. **One component per file** — do not merge multiple components into one file
5. **Protected routes** — always check access permissions via `ProtectedRoute`
6. **Error handling** — every API call must have try/catch; show user-friendly error messages in Vietnamese
7. **Loading states** — show skeleton/spinner while fetching data
8. **Unused parameters** starting with `_` (e.g., `_data`) are acceptable to suppress lint warnings

