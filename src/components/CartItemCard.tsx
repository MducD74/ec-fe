import { Minus, Plus, Trash2 } from "lucide-react";
import type { Product } from "./ProductCard";

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface CartItemCardProps {
  item: CartItem;
  isUpdating?: boolean;
  onIncrease: (item: CartItem) => void;
  onDecrease: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
}

function formatPrice(price: string | number) {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return String(price);
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

function CartItemCard({
  item,
  isUpdating = false,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemCardProps) {
  const lineTotal = Number(item.product.price) * item.quantity;

  return (
    <article className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-medium text-slate-500">
        <img src={item.product.imageUrl || "/placeholder.jpg"} alt={item.product.name} className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-slate-950">{item.product.name}</h3>
        {item.product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
            {item.product.description}
          </p>
        )}
        <p className="mt-2 text-sm font-medium text-slate-950">
          {formatPrice(item.product.price)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center rounded-md border border-slate-200">
          <button
            type="button"
            onClick={() => onDecrease(item)}
            disabled={isUpdating}
            className="inline-flex h-9 w-9 items-center justify-center text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            aria-label="Giam so luong"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-10 text-center text-sm font-medium text-slate-950">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onIncrease(item)}
            disabled={isUpdating}
            className="inline-flex h-9 w-9 items-center justify-center text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            aria-label="Tang so luong"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="w-28 text-right">
          <p className="text-sm font-semibold text-slate-950">{formatPrice(lineTotal)}</p>
          <button
            type="button"
            onClick={() => onRemove(item)}
            disabled={isUpdating}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Xoa
          </button>
        </div>
      </div>
    </article>
  );
}

export default CartItemCard;
