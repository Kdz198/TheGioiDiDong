import type { AppProduct, Product, ProductVariant } from "./product.types";
import type { Voucher } from "./promotion.types";

export interface CartItem {
  id: number;
  productId: number;
  variantId: number;
  product: Pick<Product, "id" | "slug" | "name" | "thumbnailUrl">;
  appProduct: Pick<AppProduct, "id" | "name" | "imgUrl">;
  variant: Pick<
    ProductVariant,
    "id" | "sku" | "color" | "size" | "price" | "originalPrice" | "stockQuantity"
  >;
  quantity: number;
  subtotal: number;
  /**
   * Inside Product interface, we have isService field to indicate if the product is a service 
   * If it is a service, then when adding to cart, we will set type to "gift", otherwise it is "buy".
   */
  type: "gift" | "buy";
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  appliedVoucher?: Voucher;
}
