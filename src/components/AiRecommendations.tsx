import { useEffect, useState } from "react";
import ProductCard, { type Product } from "./ProductCard";
import apiClient from "../lib/api-client";

interface ProductsResponse {
  products?: Product[];
  recommendations?: Product[];
  recommended_products?: Product[];
}

function extractProducts(response: ProductsResponse) {
  return response.products ?? response.recommendations ?? response.recommended_products ?? [];
}

function AiRecommendations() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendations() {
      try {
        const response = await apiClient.get<ProductsResponse>("/products/recommendations");

        if (isMounted) {
          setProducts(extractProducts(response.data).slice(0, 4));
        }
      } catch {
        if (isMounted) {
          setError("Chưa thể tải gợi ý cá nhân hóa.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
            AI Shopping
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            ✨ Gợi ý riêng cho bạn
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-500">
          Sản phẩm được chọn dựa trên hành vi xem, giỏ hàng và lịch sử mua sắm.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-md border border-slate-100 bg-slate-50" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </p>
      )}

      {!isLoading && !error && products.length === 0 && (
        <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Chưa có gợi ý phù hợp. Hãy khám phá thêm sản phẩm để ShopAI hiểu bạn hơn.
        </p>
      )}

      {products.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default AiRecommendations;
