import { useEffect, useState } from "react";
import ProductCard, { type Product } from "./ProductCard";
import { fetchProducts } from "../lib/api-client";

function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const response = await fetchProducts({ page: 1, limit: 8 });

        if (isMounted) {
          setProducts(response.data);
        }
      } catch {
        if (isMounted) {
          setError("Chưa thể tải sản phẩm bán chạy.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section>
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
            Đang thịnh hành
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Sản phẩm bán chạy nhất
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-6 text-slate-500 sm:text-right">
          Những lựa chọn được nhiều khách hàng yêu thích trong tuần này.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-md border border-slate-100 bg-slate-50" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!isLoading && !error && products.length === 0 && (
        <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Chưa có sản phẩm bán chạy để hiển thị.
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

export default TrendingProducts;