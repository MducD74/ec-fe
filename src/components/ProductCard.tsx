import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "../lib/api-client";

interface ProductInventory {
  id: number;
  status?: string;
  quantity?: number;
  stock?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  specifications?: Record<string, string | number | boolean | null> | null;
  price: string | number;
  sku?: string;
  imageUrl?: string | null;
  category?: {
    id: number;
    name: string;
  } | null;
  brand?: {
    id: number;
    name: string;
    logoUrl?: string | null;
  } | null;
  inventory?: ProductInventory[];
  productInventories?: ProductInventory[];
}

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

interface ProductCardProps {
  product: Product;
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

function getInventoryQuantity(product: Product) {
  const inventories = product.productInventories ?? product.inventory;

  if (!inventories) {
    return 0;
  }

  return inventories.reduce((total, item) => {
    if (typeof item.quantity === "number") {
      return total + item.quantity;
    }

    if (typeof item.stock === "number") {
      return total + item.stock;
    }

    return item.status !== "SOLD" ? total + 1 : total;
  }, 0);
}

function ProductCard({ product }: ProductCardProps) {
  const inventoryQuantity = getInventoryQuantity(product);
  const isInStock = inventoryQuantity > 0;

  const handleAddToCart = async () => {
    if (!isInStock) {
      return;
    }

    try {
      await apiClient.post("/cart/items", {
        productId: product.id,
        quantity: 1,
      });

      toast.success("Đã thêm vào giỏ hàng!");
    } catch {
      toast.error("Không thể thêm vào giỏ hàng.");
    }
  };

  return (
    <article
      className={`overflow-hidden rounded-md border border-slate-200 bg-white transition-shadow hover:shadow-sm ${
        isInStock ? "" : "opacity-75"
      }`}
    >
      <Link
        to={`/catalog/${product.id}`}
        className="relative flex aspect-[4/3] items-center justify-center bg-slate-100 text-sm font-medium text-slate-500"
      >
        <span
          className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
            isInStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-primary-700"
          }`}
        >
          {isInStock ? "Còn hàng" : "Hết hàng"}
        </span>
        <img src={product.imageUrl || "/placeholder.jpg"} alt={product.name} className="object-cover" />
      </Link>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-base font-semibold tracking-normal text-slate-950">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-primary-600">
              {formatPrice(product.price)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Còn lại {inventoryQuantity}</p>
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary-500 text-white transition-colors duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
            title="Thêm vào giỏ"
            disabled={!isInStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
