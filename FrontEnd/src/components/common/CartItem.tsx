import type { CartItem as CartItemType } from "@/interfaces/cart.types";
import { formatVND } from "@/utils/formatPrice";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { QuantityStepper } from "./QuantityStepper";

interface CartItemProps {
  item: CartItemType;
  onUpdateQty: (itemId: number, qty: number) => void;
  onRemove: (itemId: number) => void;
}

export function CartItemRow({ item, onUpdateQty, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-100 py-4">
      <Link to={`/products/${item.product.slug}`} className="shrink-0">
        <img
          src={item.product.thumbnailUrl}
          alt={item.product.name}
          className="h-20 w-20 rounded-lg object-cover"
        />
      </Link>

      <div className="flex-1 space-y-1">
        <Link
          to={`/products/${item.product.id}`}
          className="text-sm font-medium text-zinc-900 hover:text-teal-500">
          {item.product.name}
        </Link>
        {(item.variant.color || item.variant.size) && (
          <p className="text-xs text-gray-400">
            {[item.variant.color, item.variant.size].filter(Boolean).join(" - ")}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-red-400">{formatVND(item.variant.price)}</span>
          {item.variant.originalPrice > item.variant.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatVND(item.variant.originalPrice)}
            </span>
          )}
        </div>
      </div>

      <QuantityStepper
        value={item.quantity}
        max={item.variant.stockQuantity}
        onChange={(qty) => onUpdateQty(item.id, qty)}
      />

      <div className="w-24 text-right">
        <span className="text-sm font-bold text-zinc-900">{formatVND(item.subtotal)}</span>
      </div>

      <button
        onClick={() => onRemove(item.id)}
        className="text-gray-400 hover:text-red-400"
        aria-label="Xóa sản phẩm">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
