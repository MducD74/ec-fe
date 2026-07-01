import { useEffect, useState } from "react";
import ProductCard, { type Product } from "./ProductCard";
import apiClient from "../lib/api-client";
import { Sparkles } from "lucide-react";

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
    <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#f0f4ff_0%,#f8f6ff_40%,#fdf4ff_100%)]" />
        {/* Decorative blobs */}
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          {/* Section eyebrow */}
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
              <Sparkles className="h-4 w-4 text-violet-600" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
              Được tạo riêng cho bạn
            </span>
          </div>
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
      </div>
    </section>
  );
}

export default AiRecommendations;