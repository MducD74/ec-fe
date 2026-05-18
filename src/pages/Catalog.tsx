import { useEffect, useState } from "react";
import ProductCard, { type Product } from "../components/ProductCard";
import apiClient from "../lib/api-client";

interface ProductsResponse {
  products?: Product[];
  recommendations?: Product[];
  recommended_products?: Product[];
}

function extractProducts(response: ProductsResponse) {
  return response.products ?? response.recommendations ?? response.recommended_products ?? [];
}

function Catalog() {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendations() {
      try {
        const response = await apiClient.get<ProductsResponse>("/products/recommendations");

        if (!isMounted) {
          return;
        }

        setRecommendedProducts(extractProducts(response.data).slice(0, 4));
      } catch {
        if (isMounted) {
          setRecommendationsError("Chua the tai goi y san pham.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingRecommendations(false);
        }
      }
    }

    async function loadProducts() {
      try {
        const response = await apiClient.get<ProductsResponse>("/products");

        if (!isMounted) {
          return;
        }

        setProducts(extractProducts(response.data));
      } catch {
        if (isMounted) {
          setProductsError("Chua the tai danh sach san pham.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    }

    loadRecommendations();
    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-12 py-8">
      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
              ✨ Gợi ý cho bạn
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              San pham duoc chon dua tren hanh vi va gio hang cua ban.
            </p>
          </div>
        </div>

        {isLoadingRecommendations && (
          <p className="text-sm text-slate-500">Dang tai goi y...</p>
        )}

        {!isLoadingRecommendations && recommendationsError && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {recommendationsError}
          </p>
        )}

        {!isLoadingRecommendations && !recommendationsError && recommendedProducts.length === 0 && (
          <p className="rounded-md border border-slate-200 px-4 py-3 text-sm text-slate-600">
            Chua co goi y phu hop.
          </p>
        )}

        {recommendedProducts.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
            Tất cả sản phẩm
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Duyet toan bo danh muc san pham hien co.
          </p>
        </div>

        {isLoadingProducts && <p className="text-sm text-slate-500">Dang tai san pham...</p>}

        {!isLoadingProducts && productsError && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {productsError}
          </p>
        )}

        {!isLoadingProducts && !productsError && products.length === 0 && (
          <p className="rounded-md border border-slate-200 px-4 py-3 text-sm text-slate-600">
            Chua co san pham nao.
          </p>
        )}

        {products.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Catalog;
