import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "../lib/api-client";

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
  inventory?: Array<{
    id: number;
    status?: string;
  }>;
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

function getAvailableCount(product: Product) {
  if (!product.inventory) {
    return undefined;
  }

  return product.inventory.filter((item) => item.status !== "SOLD").length;
}

function ProductCard({ product }: ProductCardProps) {
  const availableCount = getAvailableCount(product);

  const handleAddToCart = async () => {
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
    <article className="overflow-hidden rounded-md border border-slate-200 bg-white transition-shadow hover:shadow-sm">
      <Link
        to={`/catalog/${product.id}`}
        className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-sm font-medium text-slate-500"
      >
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
            <p className="text-base font-semibold text-slate-950">
              {formatPrice(product.price)}
            </p>
            {typeof availableCount === "number" && (
              <p className="mt-1 text-xs text-slate-500">Con lai {availableCount}</p>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white transition-colors hover:bg-slate-800"
            aria-label={`Them ${product.name} vao gio hang`}
            title="Them vao gio"
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
