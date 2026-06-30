import { useEffect, useState } from "react";
import ProductCard, { type Product } from "./ProductCard";
import apiClient from "../lib/api-client";

interface ProductsResponse {
  data?: Product[];
  products?: Product[];
  recommendations?: Product[];
  recommended_products?: Product[];
}

function extractProducts(response: ProductsResponse) {
  return response.data ?? response.products ?? response.recommendations ?? response.recommended_products ?? [];
}

function AiRecommendations() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendations() {
      setIsLoading(true);
      setError(null);

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

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Gợi ý dành riêng cho bạn
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Dựa trên lịch sử tìm kiếm và mua sắm của bạn.
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
          Chưa có gợi ý phù hợp. Hãy khám phá thêm sản phẩm để DUT Shop hiểu bạn hơn.
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